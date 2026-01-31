from sentence_transformers import SentenceTransformer, util

# Global model variable - will be initialized on server startup
model = None

def initialize_model():
    """Initialize the Sentence Transformer model. Call this on server startup."""
    global model
    if model is None:
        print("🔄 Loading Sentence Transformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Model loaded successfully!")
    return model

def rank_resumes(job_description: str, resumes: list):
    global model
    if model is None:
        raise RuntimeError("Model not initialized! Call initialize_model() first.")
    
    job_embedding = model.encode(job_description, convert_to_tensor=True)
    ranked_resumes = []

    for resume in resumes:
        resume_text = resume.get("extracted_text", "") if isinstance(resume, dict) else ""

        if not resume_text.strip():
            score = 0.0
        else:
            resume_embedding = model.encode(resume_text, convert_to_tensor=True)
            score = util.pytorch_cos_sim(job_embedding, resume_embedding).item()

        match_percentage = round(score * 100, 2)

        ranked_resumes.append({
            "filename": resume.get("filename", "Unknown"),
            "match_score": match_percentage,
            "extracted_text": resume_text,  # Keep full text for filtering
            "extracted_preview": (resume.get("preview_text", resume_text))[:200] if resume_text else "No preview available"
        })

    ranked_resumes.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked_resumes
