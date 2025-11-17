# main.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from typing import List
import aiofiles, os, sys
from firebase_config import db  # Firestore client
from app.routers.test_router import router as test_router
from utils.extract_text import extract_text_from_file
from utils.rank_resumes import rank_resumes
from utils.extract_candidate_info import extract_candidate_info, extract_name_from_filename
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# Load environment variables
load_dotenv(dotenv_path='.env')
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")

# Firebase setup
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("firebase_key.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase app initialized successfully.")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        raise

# Firestore client
db = firestore.client()

# FastAPI app
app = FastAPI()
app.include_router(test_router, prefix="/api")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local storage for resumes
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------- Endpoints -------------------- #

# 1️⃣ Post Job
@app.post("/post-job/")
async def post_job(title: str = Form(...), description: str = Form(...)):
    if not title.strip() or not description.strip():
        raise HTTPException(status_code=400, detail="Title and description cannot be empty")
    doc_ref = db.collection("jobs").add({"title": title.strip(), "description": description.strip()})
    job_id = doc_ref[1].id
    return {"message": "Job posted successfully", "job_id": job_id}

# 2️⃣ Upload Multiple Resumes with Name & Email Extraction
@app.post("/upload-resumes/")
async def upload_resumes(job_id: str = Form(...), files: List[UploadFile] = File(...)):
    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        raise HTTPException(status_code=404, detail=f"Job not found with ID: {job_id}")

    results = []

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        try:
            # Extract text from resume
            extracted_text = extract_text_from_file(file_path)
            
            # Extract candidate info (name, email, etc.)
            candidate_info = extract_candidate_info(extracted_text, file.filename)
            name = candidate_info.get('name')
            email = candidate_info.get('email')
            
            print(f"📄 File: {file.filename}")
            print(f"✉️  Extracted email: {email}")
            print(f"👤 Extracted name: {name}")
            print(f"📝 First 200 chars of text: {extracted_text[:200]}...")

            # Save to Firestore
            db.collection("resumes").add({
                "job_id": job_id,
                "filename": file.filename,
                "name": name,
                "email": email,
                "extracted_text": extracted_text,
                "preview_text": extracted_text[:1000]
            })

            results.append({
                "filename": file.filename,
                "name": name,
                "email": email,
                "message": "Uploaded & processed successfully"
            })

        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            results.append({"filename": file.filename, "error": f"Failed: {str(e)}"})

    return {"results": results}

# 3️⃣ Shortlist Resumes for a Job
@app.get("/shortlist/{job_id}")
async def shortlist(job_id: str):
    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        raise HTTPException(status_code=404, detail=f"Job not found with ID: {job_id}")

    job = job_doc.to_dict()
    resumes_query = db.collection("resumes").where(filter=FieldFilter("job_id", "==", job_id)).stream()
    resume_data = [r.to_dict() for r in resumes_query]

    if not resume_data:
        return {"shortlisted": []}

    ranked = rank_resumes(job["description"], resume_data)
    
    # Save shortlisted candidates to Firestore for persistence
    try:
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted")
        # Clear existing shortlisted data for this job
        existing_docs = shortlisted_ref.stream()
        for doc in existing_docs:
            doc.reference.delete()
            
        # Save new shortlisted candidates
        for idx, resume in enumerate(ranked):
            candidate_info = extract_candidate_info(
                resume.get("extracted_text", ""), 
                resume.get("filename", "")
                    
            )
            shortlisted_data = {
                "candidate_id": resume.get("filename", "").split(".")[0],  # Remove file extension
                "candidate_name": candidate_info.get("name") or extract_name_from_filename(resume.get("filename", "")) or resume.get("filename", "").split(".")[0].replace("_", " ").title(),
                "candidate_email": candidate_info.get("email", ""),
                "filename": resume.get("filename", ""),
                "match_score": resume.get("match_score", 0),
                "experience_years": resume.get("experience_years", 0),
                "education_level": resume.get("education_level", "Not Specified"),
                "extracted_text": resume.get("extracted_text", ""),
                "rank": idx + 1,
                "status": "shortlisted",
                "created_at": firestore.SERVER_TIMESTAMP
            }
            shortlisted_ref.document(resume.get("filename", f"candidate_{idx}")).set(shortlisted_data)
    except Exception as e:
        print(f"Warning: Could not save shortlisted candidates to Firestore: {e}")
    
    return {"shortlisted": ranked}

# 4️⃣ Advanced Filter
@app.post("/shortlist/{job_id}/filter")
async def filter_shortlist(
    job_id: str,
    min_score: float = Form(0.0),
    max_score: float = Form(100.0),
    keywords: str = Form(""),
    exclude_keywords: str = Form(""),
    min_experience: int = Form(0),
    max_experience: int = Form(50),
    required_skills: str = Form(""),
    education_level: str = Form(""),
    sort_by: str = Form("score")
):
    from utils.advanced_filter import apply_advanced_filters

    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    job = job_doc.to_dict()
    resumes = db.collection("resumes").where(filter=FieldFilter("job_id", "==", job_id)).stream()
    resume_data = [r.to_dict() for r in resumes]

    ranked = rank_resumes(job["description"], resume_data)

    filtered_results = apply_advanced_filters(
        ranked,
        {
            "min_score": min_score,
            "max_score": max_score,
            "keywords": [k.strip() for k in keywords.split(",") if k.strip()],
            "exclude_keywords": [k.strip() for k in exclude_keywords.split(",") if k.strip()],
            "min_experience": min_experience,
            "max_experience": max_experience,
            "required_skills": [s.strip() for s in required_skills.split(",") if s.strip()],
            "education_level": education_level,
            "sort_by": sort_by
        }
    )
    
    # Note: Don't automatically save filtered results to shortlisted collection
    # HR will manually select candidates from filtered results

    return {"shortlisted": filtered_results, "total_before_filter": len(ranked), "total_after_filter": len(filtered_results)}

# 5️⃣ View Resume
@app.get("/view-resume/{filename}")
async def view_resume(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    return FileResponse(file_path, filename=filename)

# 6️⃣ Save Selected Candidates (Final Shortlist)
@app.post("/shortlist/{job_id}/select")
async def save_selected_candidates(job_id: str, selected_filenames: List[str] = Body(...)):
    """
    Save HR's manually selected candidates as final shortlisted candidates.
    This happens after filtering and manual selection.
    """
    try:
        job_doc = db.collection("jobs").document(job_id).get()
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")

        job = job_doc.to_dict()
        
        # Get all resumes for this job
        resumes = db.collection("resumes").where(filter=FieldFilter("job_id", "==", job_id)).stream()
        resume_data = {r.to_dict()["filename"]: r.to_dict() for r in resumes}
        
        # Rank all resumes to get scores and other data
        all_ranked = rank_resumes(job["description"], list(resume_data.values()))
        ranked_by_filename = {r["filename"]: r for r in all_ranked}
        
        # Clear existing shortlisted data
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted")
        existing_docs = shortlisted_ref.stream()
        for doc in existing_docs:
            doc.reference.delete()
            
        # Save only the selected candidates
        for idx, filename in enumerate(selected_filenames):
            if filename in ranked_by_filename:
                resume = ranked_by_filename[filename]
                candidate_info = extract_candidate_info(
                    resume.get("extracted_text", ""), 
                    resume.get("filename", "")    
                )
                
                    
            
                shortlisted_data = {
                    "candidate_id": resume.get("filename", "").split(".")[0],
                    "candidate_name": candidate_info.get("name") or extract_name_from_filename(resume.get("filename", "")) or resume.get("filename", "").split(".")[0].replace("_", " ").title(),
                    "candidate_email": candidate_info.get("email", ""),
                    "filename": resume.get("filename", ""),
                    "match_score": resume.get("match_score", 0),
                    "experience_years": resume.get("experience_years", 0),
                    "education_level": resume.get("education_level", "Not Specified"),
                    "extracted_text": resume.get("extracted_text", ""),
                    "rank": idx + 1,  # Rank based on selection order
                    "status": "selected_for_test",
                    "selected_at": firestore.SERVER_TIMESTAMP,
                    "created_at": firestore.SERVER_TIMESTAMP
                }
                shortlisted_ref.document(filename).set(shortlisted_data)
        
        return {
            "message": "Selected candidates saved successfully",
            "job_id": job_id,
            "selected_count": len(selected_filenames)
        }
        
    except Exception as e:
        print(f"❌ Error saving selected candidates: {e}")
        raise HTTPException(status_code=500, detail="Failed to save selected candidates")

# 7️⃣ Get Selected Candidates (from Firestore)
@app.get("/shortlist/{job_id}/select")
async def get_selected_candidates(job_id: str):
    """
    Get the candidates that were saved using POST /shortlist/{job_id}/select.
    This reads from the Firestore subcollection where selected candidates are stored.
    """
    try:
        job_doc = db.collection("jobs").document(job_id).get()
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")

        # Get selected candidates from the shortlisted subcollection
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted")
        selected_docs = shortlisted_ref.stream()
        
        selected_candidates = []
        for doc in selected_docs:
            candidate_data = doc.to_dict()
            # Add preview text for display
            candidate_data["preview_text"] = candidate_data.get("extracted_text", "")[:1000] if candidate_data.get("extracted_text") else ""
            # Ensure we have name and email from the saved data
            candidate_data["name"] = candidate_data.get("candidate_name", "")
            candidate_data["email"] = candidate_data.get("candidate_email", "")
            selected_candidates.append(candidate_data)
        
        # Sort by rank
        selected_candidates.sort(key=lambda x: x.get("rank", 0))
        
        return {"shortlisted": selected_candidates}
        
    except Exception as e:
        print(f"❌ Error fetching selected candidates: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch selected candidates")

# 8️⃣ Debug Jobs
@app.get("/debug/jobs")
async def list_all_jobs():
    jobs = db.collection("jobs").stream()
    return {"jobs": [{"id": j.id, **j.to_dict()} for j in jobs]}

# Root
@app.get("/")
async def root():
    return {"message": "Welcome to the AI Resume Ranker API!"}
