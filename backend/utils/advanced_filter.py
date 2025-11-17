import re
from typing import List, Dict, Any

def extract_experience_years(text: str) -> int:
    """
    Extract years of experience from resume text.
    Returns 0 if no experience found.
    """
    if not text:
        return 0
    
    text_lower = text.lower()
    max_experience = 0

    # Unified regex pattern with optional prefixes and contexts
    pattern = re.compile(
        r'(?:over|more than|about|around)?\s*'      # optional prefixes
        r'(\d{1,2})\+?\s*'                          # number with optional +
        r'(?:year|years|yr|yrs)\b'                  # years, yr, yrs
        r'(?:\s*(?:of|in|with|experience|exp|working|professional))?', # optional context
        re.IGNORECASE
    )
    
    for match in pattern.finditer(text_lower):
        try:
            years = int(match.group(1))
            if 0 < years <= 50 and years > max_experience:  # Reasonable cap
                max_experience = years
        except ValueError:
            continue
    
    return max_experience

def extract_education_level(text: str) -> str:
    """
    Extract highest education level from resume text.
    Returns the highest degree found if multiple are present.
    """
    if not text:
        return "Not Specified"
    
    text_lower = text.lower()
    
    # Priority order: PhD > Master's > Bachelor's > Diploma > High School
    education_patterns = [
        ("PhD/Doctorate", [
            r'\bph\.?d\b', r'\bdoctorate\b', r'\bdoctoral\b', r'doctor of philosophy'
        ]),
        ("Master's", [
            r'\bmasters?\b', r'\bm\.s\.?\b', r'\bm\.a\.?\b', r'\bmba\b', 
            r'\bm\.tech\b', r'\bm\.sc\b', r'\bmp\.?ed\b',
            r'\bmaster of (arts|science|technology|engineering|commerce)\b'
        ]),
        ("Bachelor's", [
            r'\bbachelors?\b', r'\bb\.s\.?\b', r'\bb\.a\.?\b', r'\bb\.tech\b', 
            r'\bb\.sc\b', r'\bb\.e\.?\b', r'\bb\.com\b',
            r'\bbachelor of (arts|science|technology|engineering|commerce)\b'
        ]),
        ("Diploma", [
            r'\bdiploma\b', r'\bpolytechnic\b', r'\bcertificate\b', r'\bassociate degree\b'
        ]),
        ("High School", [
            r'\bhigh school\b', r'\bsecondary\b', r'\b12th\b', r'\bhsc\b', 
            r'\bssc\b', r'\bintermediate\b'
        ])
    ]
    
    for level, patterns in education_patterns:
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return level
    
    return "Not Specified"

def check_required_skills(text: str, required_skills: List[str]) -> bool:
    """
    Check if resume contains all required skills.
    """
    if not required_skills:
        return True
    
    text_lower = text.lower()
    found_skills = 0
    
    for skill in required_skills:
        skill_lower = skill.lower()
        if re.search(r'\b' + re.escape(skill_lower) + r'\b', text_lower):
            found_skills += 1
    
    return found_skills >= len(required_skills) * 0.7

def contains_keywords(text: str, keywords: List[str]) -> bool:
    """
    Check if text contains any of the specified keywords.
    """
    if not keywords:
        return True
    
    text_lower = text.lower()
    for keyword in keywords:
        if keyword.lower() in text_lower:
            return True
    return False

def contains_exclude_keywords(text: str, exclude_keywords: List[str]) -> bool:
    """
    Check if text contains any excluded keywords.
    """
    if not exclude_keywords:
        return False
    
    text_lower = text.lower()
    for keyword in exclude_keywords:
        if keyword.lower() in text_lower:
            return True
    return False

def apply_advanced_filters(resumes: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Apply advanced filters to the ranked resume list.
    """
    filtered_resumes = []
    
    for resume in resumes:
        full_text = resume.get("extracted_text", resume.get("extracted_preview", ""))
        
        experience_years = extract_experience_years(full_text)
        education_level = extract_education_level(full_text)
        
        resume["experience_years"] = experience_years
        resume["education_level"] = education_level
        
        score = resume.get("match_score", 0)
        if score < filters["min_score"] or score > filters["max_score"]:
            continue
        
        if experience_years < filters["min_experience"] or experience_years > filters["max_experience"]:
            continue
        
        if filters["keywords"] and not contains_keywords(full_text, filters["keywords"]):
            continue
        
        if contains_exclude_keywords(full_text, filters["exclude_keywords"]):
            continue
        
        if filters["required_skills"] and not check_required_skills(full_text, filters["required_skills"]):
            continue
        
        if filters["education_level"] and filters["education_level"] != "Any":
            if education_level != filters["education_level"]:
                continue
        
        filtered_resumes.append(resume)
    
    sort_key = filters.get("sort_by", "score")
    if sort_key == "score":
        filtered_resumes.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    elif sort_key == "experience":
        filtered_resumes.sort(key=lambda x: x.get("experience_years", 0), reverse=True)
    elif sort_key == "filename":
        filtered_resumes.sort(key=lambda x: x.get("filename", ""))
    
    return filtered_resumes
