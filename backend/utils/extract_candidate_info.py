# utils/extract_candidate_info.py

import re
import os
from typing import Dict, Optional

def extract_email_from_text(text: str) -> Optional[str]:
    """
    Extracts email address from resume text using regex patterns.
    Returns the first valid email found, or None if no email is found.
    """
    # Common email regex pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    
    if emails:
        # Return the first email found
        return emails[0].lower()
    return None

def extract_name_from_text(text: str) -> Optional[str]:
    """
    Extracts candidate name from resume text.
    Uses multiple strategies to find the name.
    """
    # Handle both newlines and 'n' separators
    lines = text.replace(' n ', '\n').split('\n')
    
    # Strategy 1: Look for name patterns at the beginning of the resume
    for i, line in enumerate(lines[:8]):  # Check first 8 lines
        line = line.strip()
        if not line:
            continue
            
        # Skip lines that contain contact info or common resume elements
        skip_patterns = [
            r'resume|cv|curriculum vitae',
            r'phone|mobile|tel|call|\+\d+',
            r'address|location|city|india',
            r'@|email',
            r'linkedin|github|portfolio|www\.|http',
            r'objective|summary|profile',
            r'experience|education|skills'
        ]
        
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in skip_patterns):
            continue
        
        # Clean the line of special characters and numbers
        clean_line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
        
        # Look for name patterns (1-4 words, letters only)
        words = clean_line.split()
        if 1 <= len(words) <= 4 and all(len(word) >= 2 and word.isalpha() for word in words):
            # Check if it looks like a proper name (starts with capital letters)
            if all(word[0].isupper() for word in words):
                return ' '.join(words)
    
    # Strategy 2: Look for "Name:" or similar labels
    name_label_pattern = r'(?:name|candidate|applicant):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})'
    for line in lines[:15]:
        match = re.search(name_label_pattern, line, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None

def extract_name_from_filename(filename: str) -> Optional[str]:
    """
    Extracts candidate name from filename.
    Handles common filename patterns like "John_Doe_Resume.pdf"
    """
    # Remove file extension
    name_part = os.path.splitext(filename)[0]
    
    # Remove common resume-related words (more comprehensive)
    resume_words = ['resume', 'cv', 'curriculum', 'vitae', 'application', 'doc', 'document']
    for word in resume_words:
        name_part = re.sub(rf'\b{word}\b', '', name_part, flags=re.IGNORECASE)
    
    # Replace underscores and hyphens with spaces
    name_part = re.sub(r'[_-]', ' ', name_part)
    
    # Clean up extra spaces
    name_part = ' '.join(name_part.split())
    
    # Check if it looks like a name (1-4 words, allow single names too)
    words = name_part.split()
    if 1 <= len(words) <= 4 and all(word.isalpha() for word in words):
        return ' '.join(word.capitalize() for word in words)
    
    return None

def extract_candidate_info(text: str, filename: str = "") -> Dict[str, Optional[str]]:
    """
    Extracts both email and name from resume text and filename.
    Returns a dictionary with 'email' and 'name' keys.
    """
    email = extract_email_from_text(text)
    name = extract_name_from_text(text)
    
    # If name not found in text, try extracting from filename
    if not name and filename:
        name = extract_name_from_filename(filename)
    
    return {
        'email': email,
        'name': name
    }
