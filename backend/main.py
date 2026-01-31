# main.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List
import aiofiles, os, sys, logging

# Import configuration
from config.settings import settings, get_max_file_size_bytes
from config.firebase_config import db

# Import routers
from app.routers.test_router import router as test_router
from app.routers import admin_router

# Import utilities
from utils.extract_text import extract_text_from_file
from utils.rank_resumes import rank_resumes
from utils.extract_candidate_info import extract_candidate_info, extract_name_from_filename

# Import middleware and models
from middleware.validation import validate_file_upload, validate_multiple_file_uploads, sanitize_filename
from models.requests import JobPostRequest, FilterRequest, CandidateSelectionRequest

# Firebase imports
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# Setup logging
logging.basicConfig(
    level=logging.INFO if settings.debug else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="AI Resume Ranker API",
    description="AI-powered resume ranking and candidate management system",
    version="1.0.0",
    debug=settings.debug
)

# Include API routers
app.include_router(test_router, prefix="/api")
app.include_router(admin_router.router)

# Startup event to pre-load the AI model
@app.on_event("startup")
async def startup_event():
    """Initialize the AI model on server startup to prevent first-request delays."""
    logger.info("🚀 Starting AI Resume Ranker API...")
    logger.info("📦 Pre-loading Sentence Transformer model (this may take 30-60 seconds on first run)...")
    
    try:
        from utils.rank_resumes import initialize_model
        initialize_model()
        logger.info("✅ Model loaded successfully! Server is ready to accept requests.")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.warning("⚠️  Server will start but ranking may fail!")

# Enable CORS with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),  # Use method to get list
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

logger.info(f"CORS enabled for origins: {settings.get_cors_origins_list()}")

# Local storage for resumes
UPLOAD_DIR = settings.upload_dir
os.makedirs(UPLOAD_DIR, exist_ok=True)
logger.info(f"Upload directory: {UPLOAD_DIR}")

# -------------------- Endpoints -------------------- #


# 7️⃣ View/Download Resume File
@app.get("/view-resume/{filename}")
async def view_resume(filename: str):
    """Serve uploaded resume files."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    # Determine content type based on file extension
    content_type = "application/pdf" if filename.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )

# 8️⃣ Save Selected Candidates for Testing
@app.post("/shortlist/{job_id}/select")
async def save_selected_candidates(job_id: str, filenames: List[str] = Body(...)):
    """Save candidates selected by HR for testing phase."""
    try:
        # Verify job exists
        job_doc = db.collection("jobs").document(job_id).get()
        if not job_doc.exists:
            raise HTTPException(status_code=404, detail=f"Job not found with ID: {job_id}")
        
        # Get the shortlisted collection for this job
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted")
        
        # Update status for selected candidates
        selected_count = 0
        for filename in filenames:
            # Find the document by filename
            docs = shortlisted_ref.where(filter=FieldFilter("filename", "==", filename)).stream()
            for doc in docs:
                doc.reference.update({
                    "status": "selected_for_test",
                    "selected_at": firestore.SERVER_TIMESTAMP
                })
                selected_count += 1
        
        logger.info(f"Marked {selected_count} candidates as selected for testing in job {job_id}")
        return {
            "message": f"Successfully selected {selected_count} candidates for testing",
            "job_id": job_id,
            "selected_count": selected_count
        }
    except Exception as e:
        logger.error(f"Error saving selected candidates: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save selections: {str(e)}")

# 1️⃣ Post Job
@app.post(
    "/post-job/",
    summary="Create a new job posting",
    description="Create a new job posting with validated title and description",
    tags=["Jobs"]
)
async def post_job(job_data: JobPostRequest):
    """Create a new job posting."""
    try:
        doc_ref = db.collection("jobs").add({
            "title": job_data.title,
            "description": job_data.description
        })
        job_id = doc_ref[1].id
        logger.info(f"Job created: {job_id} - {job_data.title}")
        return {"message": "Job posted successfully", "job_id": job_id}
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job")

# Get all jobs
@app.get(
    "/jobs",
    summary="Get all job postings",
    description="Retrieve all job postings from the database",
    tags=["Jobs"]
)
async def get_all_jobs():
    """Get all job postings."""
    try:
        jobs_ref = db.collection("jobs").stream()
        jobs = []
        for job_doc in jobs_ref:
            job_data = job_doc.to_dict()
            jobs.append({
                "id": job_doc.id,
                "title": job_data.get("title"),
                "description": job_data.get("description")
            })
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")

# 2️⃣ Upload Multiple Resumes with Name & Email Extraction
@app.post(
    "/upload-resumes/",
    summary="Upload multiple resumes",
    description="Upload and process multiple resume files for a job",
    tags=["Resumes"]
)
async def upload_resumes(job_id: str = Form(...), files: List[UploadFile] = File(...)):
    """Upload and process multiple resume files."""
    # Verify job exists
    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        raise HTTPException(status_code=404, detail=f"Job not found with ID: {job_id}")
    
    # Validate all files first
    try:
        await validate_multiple_file_uploads(files)
    except HTTPException as e:
        logger.warning(f"File validation failed: {e.detail}")
        raise

    results = []
    logger.info(f"Processing {len(files)} resumes for job {job_id}")

    for file in files:
        # Sanitize filename for security
        safe_filename = sanitize_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
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
@app.post(
    "/shortlist/{job_id}/filter",
    summary="Filter shortlisted candidates",
    description="Apply advanced filters to shortlisted candidates",
    tags=["Shortlist"]
)
async def filter_shortlist(job_id: str, filter_data: FilterRequest):
    """Apply advanced filters to shortlisted candidates."""
    from utils.advanced_filter import apply_advanced_filters

    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    job = job_doc.to_dict()
    resumes = db.collection("resumes").where(filter=FieldFilter("job_id", "==", job_id)).stream()
    resume_data = [r.to_dict() for r in resumes]

    ranked = rank_resumes(job["description"], resume_data)

    # Parse comma-separated values
    keywords = [k.strip() for k in filter_data.keywords.split(",") if k.strip()]
    exclude_keywords = [k.strip() for k in filter_data.exclude_keywords.split(",") if k.strip()]
    required_skills = [s.strip() for s in filter_data.required_skills.split(",") if s.strip()]

    filtered_results = apply_advanced_filters(
        ranked,
        {
            "min_score": filter_data.min_score,
            "max_score": filter_data.max_score,
            "keywords": keywords,
            "exclude_keywords": exclude_keywords,
            "min_experience": filter_data.min_experience,
            "max_experience": filter_data.max_experience,
            "required_skills": required_skills,
            "education_level": filter_data.education_level,
            "sort_by": filter_data.sort_by
        }
    )
    
    logger.info(f"Filter applied to job {job_id}: {len(ranked)} -> {len(filtered_results)} candidates")

    return {
        "shortlisted": filtered_results,
        "total_before_filter": len(ranked),
        "total_after_filter": len(filtered_results)
    }

# 5️⃣ View Resume
@app.get("/view-resume/{filename}")
async def view_resume(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    return FileResponse(file_path, filename=filename)

# 6️⃣ Save Selected Candidates (Final Shortlist)
@app.post(
    "/shortlist/{job_id}/select",
    summary="Save selected candidates",
    description="Save HR's manually selected candidates as final shortlisted candidates",
    tags=["Shortlist"]
)
async def save_selected_candidates(job_id: str, selection: CandidateSelectionRequest):
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
        for idx, filename in enumerate(selection.selected_filenames):
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
        
        logger.info(f"Saved {len(selection.selected_filenames)} selected candidates for job {job_id}")
        return {
            "message": "Selected candidates saved successfully",
            "job_id": job_id,
            "selected_count": len(selection.selected_filenames)
        }
        
    except Exception as e:
        logger.error(f"❌ Error saving selected candidates: {e}")
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
        logger.error(f"Error fetching selected candidates: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch selected candidates")

# 🔟 Debug - List all jobs
@app.get("/debug/jobs")
async def list_all_jobs():
    jobs = db.collection("jobs").stream()
    return {"jobs": [{"id": j.id, **j.to_dict()} for j in jobs]}

# Root
@app.get("/")
async def root():
    return {"message": "Welcome to the AI Resume Ranker API!"}
