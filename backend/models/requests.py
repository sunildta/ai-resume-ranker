"""
Pydantic models for API request/response validation.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional


class JobPostRequest(BaseModel):
    """Request model for creating a job posting."""
    
    title: str = Field(..., min_length=3, max_length=200, description="Job title")
    description: str = Field(..., min_length=10, max_length=5000, description="Job description")
    
    @validator('title', 'description')
    def strip_whitespace(cls, v):
        """Strip leading/trailing whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or only whitespace")
        return v.strip()


class FilterRequest(BaseModel):
    """Request model for filtering shortlisted candidates."""
    
    min_score: float = Field(default=0.0, ge=0.0, le=100.0)
    max_score: float = Field(default=100.0, ge=0.0, le=100.0)
    keywords: str = Field(default="", description="Comma-separated keywords to search for")
    exclude_keywords: str = Field(default="", description="Comma-separated keywords to exclude")
    min_experience: int = Field(default=0, ge=0, le=50)
    max_experience: int = Field(default=50, ge=0, le=50)
    required_skills: str = Field(default="", description="Comma-separated required skills")
    education_level: str = Field(default="", description="Required education level")
    sort_by: str = Field(default="score", description="Field to sort by (score, experience, filename)")
    
    @validator('max_score')
    def validate_score_range(cls, v, values):
        """Ensure max_score >= min_score."""
        if 'min_score' in values and v < values['min_score']:
            raise ValueError("max_score must be greater than or equal to min_score")
        return v
    
    @validator('max_experience')
    def validate_experience_range(cls, v, values):
        """Ensure max_experience >= min_experience."""
        if 'min_experience' in values and v < values['min_experience']:
            raise ValueError("max_experience must be greater than or equal to min_experience")
        return v
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        """Validate sort_by field."""
        allowed_values = ['score', 'experience', 'filename']
        if v not in allowed_values:
            raise ValueError(f"sort_by must be one of: {', '.join(allowed_values)}")
        return v


class CandidateSelectionRequest(BaseModel):
    """Request model for selecting candidates."""
    
    selected_filenames: List[str] = Field(..., min_items=1, description="List of selected candidate filenames")
    
    @validator('selected_filenames')
    def validate_filenames(cls, v):
        """Validate that all filenames are non-empty."""
        if not all(filename.strip() for filename in v):
            raise ValueError("All filenames must be non-empty")
        return [filename.strip() for filename in v]


class JobResponse(BaseModel):
    """Response model for job creation."""
    
    message: str
    job_id: str


class ResumeUploadResult(BaseModel):
    """Result model for a single resume upload."""
    
    filename: str
    name: Optional[str] = None
    email: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


class ResumeUploadResponse(BaseModel):
    """Response model for resume uploads."""
    
    results: List[ResumeUploadResult]


class ShortlistResponse(BaseModel):
    """Response model for shortlist endpoint."""
    
    shortlisted: List[dict]
    total_before_filter: Optional[int] = None
    total_after_filter: Optional[int] = None


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    detail: str
    error_code: Optional[str] = None
