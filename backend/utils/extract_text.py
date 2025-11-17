import pdfplumber
import docx2txt
import os
import re

def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from PDF or DOCX resume.
    Returns extracted text as a string.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    extracted_text = ""

    if file_path.lower().endswith(".pdf"):
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            print(f"❌ Error extracting PDF: {e}")
            extracted_text = ""

    elif file_path.lower().endswith(".docx"):
        try:
            extracted_text = docx2txt.process(file_path)
        except Exception as e:
            print(f"❌ Error extracting DOCX: {e}")
            extracted_text = ""

    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are allowed.")

    return extracted_text.strip()


def extract_name_email_from_text(text: str):
    """
    Extract candidate name and email from resume text using improved logic.
    Returns a tuple: (name, email)
    """
    # Extract email using regex
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else None

    # Extract name using improved logic
    name = extract_name_from_text(text)
    
    return name, email

def extract_name_from_text(text: str):
    """
    Extracts candidate name from resume text using multiple strategies.
    """
    # Handle both newlines and 'n' separators
    lines = text.replace(' n ', '\n').split('\n')
    
    # Strategy 1: Look for name patterns at the beginning of the resume
    for i, line in enumerate(lines[:10]):  # Check first 10 lines
        line = line.strip()
        if not line:
            continue
            
        # Skip lines that contain contact info or common resume elements
        skip_patterns = [
            r'resume|cv|curriculum vitae',
            r'phone|mobile|tel|call|\+\d+',
            r'address|location|city|india|street|avenue|road',
            r'@|email',
            r'linkedin|github|portfolio|www\.|http|bit\.ly',
            r'objective|summary|profile|about',
            r'experience|education|skills|qualifications',
            r'\d{4}|\d{2}/\d{2}|january|february|march|april|may|june|july|august|september|october|november|december'
        ]
        
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in skip_patterns):
            continue
        
        # Clean the line of special characters and numbers
        clean_line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
        
        # Look for name patterns (1-4 words, letters only)
        words = clean_line.split()
        if 1 <= len(words) <= 4:
            # Filter out very short words (less than 2 characters) except common names like "Li"
            valid_words = [word for word in words if len(word) >= 2 and word.isalpha()]
            
            if valid_words and all(word[0].isupper() for word in valid_words):
                # Additional validation: avoid common non-name words
                non_name_words = ['THE', 'AND', 'FOR', 'WITH', 'FROM', 'DEAR', 'MR', 'MS', 'MRS', 'DR']
                if not any(word.upper() in non_name_words for word in valid_words):
                    return ' '.join(valid_words)
    
    # Strategy 2: Look for "Name:" or similar labels
    name_label_pattern = r'(?:name|candidate|applicant):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})'
    for line in lines[:15]:
        match = re.search(name_label_pattern, line, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    # Strategy 3: If no name found, return None instead of "Unknown"
    return None
