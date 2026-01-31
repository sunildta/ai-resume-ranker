# app/routers/test_router.py

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from firebase_config import db
from google.cloud.firestore_v1.base_query import FieldFilter

# Import your service functions
from app.services.gemini_service import generate_mcqs
from app.services.firestore_service import save_test_to_firestore, get_test_from_firestore, update_test_metadata
from app.services.email_service import send_test_email


# ----------------------------
# Models
# ----------------------------

class TestGenerationRequest(BaseModel):
    job_id: str
    candidate_name: str
    candidate_email: EmailStr
    candidate_id: str
    difficulty: str
    skills: List[str]
    job_title: str


class TestCreationResponse(BaseModel):
    test_id: str
    email_status: str


class MCQ(BaseModel):
    question: str
    options: List[str]
    correct_answer: str


class TestSubmissionRequest(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: EmailStr
    answers: List[str]


class TestResultResponse(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_email: str
    score: int
    total_questions: int
    percentage: float
    rank: Optional[int] = None
    submitted_at: str


class TestDetailsResponse(BaseModel):
    questions: List[MCQ]
    job_id: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    difficulty: str
    created_at: str
    email_status: str


# ----------------------------
# Router
# ----------------------------

router = APIRouter(
    prefix="/test",
    tags=["Test Management"],
    responses={404: {"description": "Not found"}},
)


# ----------------------------
# Create Test
# ----------------------------

@router.post("/create", response_model=TestCreationResponse)
async def create_test(request: TestGenerationRequest):
    """
    Generates an aptitude test with auto-extracted candidate info from resume.
    """
    try:
        # 1️⃣ Find resume
        resume_query = db.collection("resumes").where(
            filter=FieldFilter("job_id", "==", request.job_id)
        ).stream()
        resume_data = [r.to_dict() for r in resume_query]

        target_resume = None
        for resume in resume_data:
            filename_without_ext = resume.get("filename", "").split(".")[0]
            if (
                request.candidate_id == filename_without_ext
                or request.candidate_id == resume.get("filename")
            ):
                target_resume = resume
                break

        if not target_resume:
            raise HTTPException(
                status_code=404,
                detail=f"Resume not found for candidate_id: {request.candidate_id}",
            )

        # 2️⃣ Get stored candidate info (already extracted during upload)
        candidate_email = target_resume.get("email")
        candidate_name = target_resume.get("name")
        filename = target_resume.get("filename", "")

        if not candidate_email:
            raise HTTPException(
                status_code=400,
                detail="Could not find email for this candidate. Please ensure the resume was uploaded with valid email.",
            )

        # Use stored name or fallback to filename
        if not candidate_name:
            from utils.extract_candidate_info import extract_name_from_filename
            candidate_name = extract_name_from_filename(filename)
            if not candidate_name:
                candidate_name = filename.split(".")[0].replace("_", " ").replace("-", " ").title() or "Candidate"

        print(f"✅ Extracted candidate info - Name: {candidate_name}, Email: {candidate_email}")

        # 3️⃣ Generate questions
        questions_data = generate_mcqs(
            job_title=request.job_title,
            skills=request.skills,
            level=request.difficulty,
        )
        if "error" in questions_data:
            raise HTTPException(status_code=500, detail=questions_data["error"])

        # 4️⃣ Save test
        test_id = save_test_to_firestore(
            job_id=request.job_id,
            candidate_id=request.candidate_id,
            candidate_name=request.candidate_name,
            candidate_email=request.candidate_email,
            questions=questions_data["questions"],
        )
        if not test_id:
            raise HTTPException(status_code=500, detail="Failed to save test to database.")

        # 5️⃣ Send email
        email_sent = send_test_email(
            recipient_email=candidate_email,
            candidate_name=candidate_name,
            job_title=request.job_title,
            test_id=test_id,
        )
        email_status = "sent" if email_sent else "failed"

        # 6️⃣ Update metadata
        update_test_metadata(
            test_id=test_id,
            data={
                "candidate_email": candidate_email,
                "difficulty": request.difficulty,
                "job_title": request.job_title,
                "email_status": email_status,
                "created_at": datetime.utcnow().isoformat(),
            },
        )

        return {"test_id": test_id, "email_status": email_status}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in test creation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# Get Test Details
# ----------------------------

@router.get("/{test_id}", response_model=TestDetailsResponse)
async def get_test_details(test_id: str):
    test_details = get_test_from_firestore(test_id)
    if not test_details:
        raise HTTPException(status_code=404, detail="Test not found")
    return test_details


# ----------------------------
# Update Test
# ----------------------------

@router.put("/update/{test_id}")
async def update_test(test_id: str, data: dict = Body(...)):
    success = update_test_metadata(test_id, data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update test metadata.")
    return {"message": "Test metadata updated successfully", "test_id": test_id}


# ----------------------------
# Submit Test
# ----------------------------

@router.post("/submit/{test_id}", response_model=TestResultResponse)
async def submit_test(test_id: str, submission: TestSubmissionRequest):
    """
    Candidate submits answers + personal details -> backend calculates score and stores result.
    """
    try:
        # 1️⃣ Fetch test
        test_doc = db.collection("tests").document(test_id).get()
        if not test_doc.exists:
            raise HTTPException(status_code=404, detail="Test not found")

        test_data = test_doc.to_dict()
        questions = test_data.get("questions", [])
        if not questions:
            raise HTTPException(status_code=400, detail="No questions found for this test.")

        # 2️⃣ Score answers
        correct_answers = [q["correct_answer"] for q in questions]
        submitted_answers = submission.answers
        score =0
        for i, ans in enumerate(submitted_answers):
            if i < len(correct_answers):
                if ans.strip()[0].upper() == correct_answers[i].strip()[0].upper():
                    score += 1
        
        total_questions = len(correct_answers)
        percentage = (score / total_questions) * 100 if total_questions > 0 else 0.0

        # 3️⃣ Prepare result
        result_data = {
            "candidate_id": submission.candidate_id,
            "candidate_name": submission.candidate_name,
            "candidate_email": submission.candidate_email,
            "answers": submission.answers, 
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "submitted_at": datetime.utcnow().isoformat(),
        }

        # 4️⃣ Save result
        db.collection("tests").document(test_id).collection("results").document(
            submission.candidate_id
        ).set(result_data)

        # 5️⃣ Compute ranking
        results_ref = db.collection("tests").document(test_id).collection("results").stream()
        all_results = [r.to_dict() for r in results_ref]

        #Sort descending by score, then percentage
        all_results.sort(key=lambda x: (x["score"], x["percentage"]), reverse=True)

        # Apply competition ranking
        current_rank = 1
        prev_score = None
        prev_percentage = None
        
        for idx, res in enumerate(all_results, start=1):
            # Check if current result is different from previous (score or percentage)
            if (prev_score is None or 
                res["score"] < prev_score or 
                (res["score"] == prev_score and res["percentage"] < prev_percentage)):
                current_rank = idx
            
            res_doc_ref = db.collection("tests").document(test_id).collection("results").document(res["candidate_id"])
            res_doc_ref.update({"rank": current_rank})
            
            prev_score = res["score"]
            prev_percentage = res["percentage"]

        

        # 5️⃣ Return only the current candidate’s result (with rank)
        current_result = next((r for r in all_results if r["candidate_id"] == submission.candidate_id), None)

        if not current_result:
            raise HTTPException(status_code=500, detail="Result not found after submission.")

        return TestResultResponse(**current_result)

    except Exception as e:
        print(f"❌ Error in test submission: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit test.")


# ----------------------------
# Rankings
# ----------------------------

@router.get("/rankings/job/{job_id}")
async def get_job_rankings(job_id: str):
    """
    Get candidate rankings across all tests for the same job_id.
    """
    try:
        tests_ref = db.collection("tests")
        query = tests_ref.where(filter=FieldFilter("job_id", "==", job_id)).stream()

        candidates = []
        for test_doc in query:
            test_id = test_doc.id
            results_ref = (
                db.collection("tests").document(test_id).collection("results").stream()
            )
            for res_doc in results_ref:
                res = res_doc.to_dict()
                candidates.append({
                    "candidate_id": res.get("candidate_id", res_doc.id),
                    "candidate_name": res.get("candidate_name", "Unknown"),
                    "candidate_email": res.get("candidate_email", "Unknown"),
                    "score": res.get("score", 0),
                    "total_questions": res.get("total_questions", 0),
                    "percentage": res.get("percentage", 0),
                    "submitted_at": res.get("submitted_at"),
                    "test_id": test_id,
                })

        if not candidates:
            raise HTTPException(status_code=404, detail="No results found for this job")

        # Sort & rank
        candidates = sorted(candidates, key=lambda x: (x["score"], x["percentage"]), reverse=True)
        current_rank = 1
        prev_score = None
        prev_percentage = None
        
        for idx, cand in enumerate(candidates, start=1):
            # Check if current result is different from previous (score or percentage)
            if (prev_score is None or 
                cand["score"] < prev_score or 
                (cand["score"] == prev_score and cand["percentage"] < prev_percentage)):
                current_rank = idx
            
            cand["rank"] = current_rank
            prev_score = cand["score"]
            prev_percentage = cand["percentage"]

        return {
            "job_id": job_id,
            "total_candidates": len(candidates),
            "rankings": candidates,
        }

    except Exception as e:
        print(f"❌ Error in get_job_rankings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch rankings.")
    
@router.get("/results/{job_title}")
async def get_test_results(job_title: str):
    """
    Get shortlisted candidates with their test status and rankings.
    - Shows 'Test Pending' if candidate has not appeared.
    - Shows 'Submitted' with rank & score if candidate completed test.
    """
    try:
        # Find job by title
        jobs_ref = db.collection("jobs").where(filter=FieldFilter("title", "==", job_title)).stream()
        jobs = [j for j in jobs_ref]

        if not jobs:
            raise HTTPException(status_code=404, detail="Job not found")

        job_doc = jobs[0]
        job_id = job_doc.id
        job_data = job_doc.to_dict()

        # Fetch shortlisted candidates
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted").stream()
        # Fetch all test results for this job (from all tests created for this job)
        all_test_results = {}
        all_test_results_by_email = {}  # Also index by email for better matching
        all_candidates_from_tests = {}  # Track all candidates who have tests
        
        tests_ref = db.collection("tests").where(filter=FieldFilter("job_id", "==", job_id)).stream()
        
        for test_doc in tests_ref:
            test_id = test_doc.id
            test_data = test_doc.to_dict()
            
            # Store candidate info from test document
            candidate_id = test_data.get("candidate_id")
            candidate_email = test_data.get("candidate_email")
            
            if candidate_id:
                # Track candidate from test document
                if candidate_id not in all_candidates_from_tests:
                    all_candidates_from_tests[candidate_id] = {
                        "candidate_id": candidate_id,
                        "candidate_email": candidate_email,
                        "candidate_name": test_data.get("candidate_name", "Unknown"),
                        "test_created": True
                    }
            
            # Check for submitted results
            results_ref = db.collection("tests").document(test_id).collection("results").stream()
            for result_doc in results_ref:
                result_data = result_doc.to_dict()
                test_candidate_id = result_data.get("candidate_id")
                test_candidate_email = result_data.get("candidate_email")
                
                if test_candidate_id:
                    # Keep the best result for each candidate if multiple tests exist
                    if test_candidate_id not in all_test_results or result_data.get("score", 0) > all_test_results[test_candidate_id].get("score", 0):
                        all_test_results[test_candidate_id] = result_data
                
                # Also index by email for matching
                if test_candidate_email:
                    if test_candidate_email not in all_test_results_by_email or result_data.get("score", 0) > all_test_results_by_email[test_candidate_email].get("score", 0):
                        all_test_results_by_email[test_candidate_email] = result_data

        # Also fetch shortlisted candidates to get additional info if available
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted").stream()
        shortlisted = {c.id: c.to_dict() for c in shortlisted_ref}

        candidates = []

        # Build candidates from tests (primary source)
        for candidate_id, candidate_info in all_candidates_from_tests.items():
            candidate_email = candidate_info.get("candidate_email", "")
            candidate_name = candidate_info.get("candidate_name", "Unknown")
            
            # Try to get additional info from shortlisted collection
            shortlisted_data = None
            for doc_id, cand in shortlisted.items():
                if (cand.get("candidate_id") == candidate_id or 
                    cand.get("filename") == candidate_id or
                    cand.get("candidate_email") == candidate_email):
                    shortlisted_data = cand
                    break
            
            # Try to find test result
            result = None
            
            # 1. Try matching by candidate_id
            result = all_test_results.get(candidate_id)
            
            # 2. If no result, try matching by email
            if not result and candidate_email:
                result = all_test_results_by_email.get(candidate_email)
            
            base_candidate_data = {
                "candidate_id": candidate_id,
                "candidate_name": candidate_name,
                "candidate_email": candidate_email,
                "filename": shortlisted_data.get("filename", candidate_id) if shortlisted_data else candidate_id,
                "match_score": shortlisted_data.get("match_score", 0) if shortlisted_data else 0,
                "shortlist_rank": shortlisted_data.get("rank", 0) if shortlisted_data else 0,
                "experience_years": shortlisted_data.get("experience_years", 0) if shortlisted_data else 0,
                "education_level": shortlisted_data.get("education_level", "Not Specified") if shortlisted_data else "Not Specified",
            }
            
            if result:
                candidates.append({
                    **base_candidate_data,
                    "status": "Submitted",
                    "test_score": result.get("score", 0),
                    "total_questions": result.get("total_questions", 0),
                    "percentage": result.get("percentage", 0),
                    "test_rank": result.get("rank", None),
                    "submitted_at": result.get("submitted_at"),
                })
            else:
                candidates.append({
                    **base_candidate_data,
                    "status": "Test Pending",
                    "test_score": None,
                    "total_questions": None,
                    "percentage": None,
                    "test_rank": None,
                    "submitted_at": None,
                })

        # Recalculate rankings across all candidates for this job (not per individual test)
        submitted_candidates = [c for c in candidates if c["status"] == "Submitted"]
        pending_candidates = [c for c in candidates if c["status"] == "Test Pending"]
        
        # Sort submitted candidates by score and percentage (descending)
        submitted_candidates.sort(key=lambda x: (x["test_score"], x["percentage"]), reverse=True)
        
        # Apply competition ranking across all submitted candidates
        current_rank = 1
        prev_score = None
        prev_percentage = None
        
        for idx, candidate in enumerate(submitted_candidates, start=1):
            # Check if current result is different from previous (score or percentage)
            if (prev_score is None or 
                candidate["test_score"] < prev_score or 
                (candidate["test_score"] == prev_score and candidate["percentage"] < prev_percentage)):
                current_rank = idx
            
            candidate["test_rank"] = current_rank  # Update the rank
            prev_score = candidate["test_score"]
            prev_percentage = candidate["percentage"]
        
        # Sort pending candidates by shortlist rank
        pending_candidates.sort(key=lambda x: x.get("shortlist_rank", 9999))
        
        # Combine: submitted first (by test rank), then pending (by shortlist rank)
        candidates = submitted_candidates + pending_candidates

        return {
            "job_id": job_id,
            "job_title": job_title,
            "job_description": job_data.get("description", ""),
            "total_candidates": len(candidates),
            "submitted_count": len([c for c in candidates if c["status"] == "Submitted"]),
            "pending_count": len([c for c in candidates if c["status"] == "Test Pending"]),
            "candidates": candidates,
        }

    except Exception as e:
        print(f"❌ Error in get_test_results: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch test results")


@router.get("/debug/job/{job_title}")
async def debug_job_data(job_title: str):
    """
    Debug endpoint to see shortlisted candidates and test results for a job
    """
    try:
        # Find job by title
        jobs_ref = db.collection("jobs").where(filter=FieldFilter("title", "==", job_title)).stream()
        jobs = [j for j in jobs_ref]

        if not jobs:
            return {"error": "Job not found"}

        job_doc = jobs[0]
        job_id = job_doc.id

        # Get shortlisted candidates
        shortlisted_ref = db.collection("jobs").document(job_id).collection("shortlisted").stream()
        shortlisted = [{"doc_id": c.id, **c.to_dict()} for c in shortlisted_ref]

        # Get all test results
        all_test_results = []
        tests_ref = db.collection("tests").where(filter=FieldFilter("job_id", "==", job_id)).stream()
        
        for test_doc in tests_ref:
            test_id = test_doc.id
            results_ref = db.collection("tests").document(test_id).collection("results").stream()
            for result_doc in results_ref:
                result_data = result_doc.to_dict()
                result_data["test_id"] = test_id
                result_data["result_doc_id"] = result_doc.id
                all_test_results.append(result_data)

        return {
            "job_id": job_id,
            "job_title": job_title,
            "shortlisted_candidates": shortlisted,
            "test_results": all_test_results,
            "shortlisted_count": len(shortlisted),
            "test_results_count": len(all_test_results)
        }

    except Exception as e:
        return {"error": str(e)}

