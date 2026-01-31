# app/services/gemini_service.py

import os
import json
import random
import string
import asyncio
from concurrent.futures import ThreadPoolExecutor

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")

genai.configure(api_key=API_KEY)

# Thread executor for parallel Gemini calls
executor = ThreadPoolExecutor()


def generate_mcqs(job_title: str, skills: list, level: str, candidate_name: str = None) -> dict:
    """
    Generates multiple-choice questions for an aptitude test using the Gemini API.
    Ensures uniqueness with a random seed so tests differ even for same job/skills.
    """
    # Uniqueness factor
    unique_seed = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    skills_instruction = ""
    if skills:
        skills_instruction = f"The questions must be highly relevant to these skills: {', '.join(skills)}."

    prompt = f"""
    You are an expert technical interviewer creating aptitude test questions for hiring.
    
    **Job Role**: {job_title}
    **Required Skills**: {', '.join(skills)}
    **Difficulty Level**: {level}
    **Candidate**: {candidate_name or "Anonymous"}
    **Unique Seed**: {unique_seed}

    **IMPORTANT INSTRUCTIONS**:
    1. Generate EXACTLY 5 multiple-choice questions
    2. ALL questions MUST be directly relevant to the "{job_title}" role
    3. Focus heavily on the required skills: {', '.join(skills)}
    4. Questions should test:
       - Technical knowledge specific to {job_title}
       - Problem-solving in the context of {', '.join(skills[:3]) if len(skills) >= 3 else ', '.join(skills)}
       - Practical application of skills for this role
    5. Each question must have EXACTLY 4 options (A, B, C, D)
    6. Make questions unique for each candidate
    7. Difficulty: {level}

    **Example Question Types**:
    - "In {job_title}, when working with {skills[0] if skills else 'the technology stack'}, which approach is best for..."
    - "A {job_title} needs to {f'implement {skills[0]}' if skills else 'solve a problem'}. What is the most efficient method?"
    
    **Output ONLY valid JSON** in this exact format:
    {{
      "questions": [
        {{
          "question": "Specific question about {job_title} and {skills[0] if skills else 'required skills'}",
          "options": [
            "A) First option",
            "B) Second option", 
            "C) Third option",
            "D) Fourth option"
          ],
          "correct_answer": "B"
        }}
      ]
    }}
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )

        questions_json_str = response.text

        # Debug print
        print(f"🔍 Raw Gemini response: {questions_json_str[:500]}...")

        # Clean up response
        if questions_json_str.startswith("```json"):
            questions_json_str = questions_json_str.replace("```json", "").replace("```", "")
        elif questions_json_str.startswith("```"):
            questions_json_str = questions_json_str.replace("```", "")

        questions_json_str = questions_json_str.strip()

        questions_data = json.loads(questions_json_str)

        # Validation
        if "questions" not in questions_data:
            raise ValueError("Response missing 'questions' key")
        if not isinstance(questions_data["questions"], list):
            raise ValueError("'questions' must be an array")

        for i, q in enumerate(questions_data["questions"]):
            if not all(key in q for key in ["question", "options", "correct_answer"]):
                raise ValueError(f"Question {i+1} missing required fields")
            if len(q["options"]) != 4:
                raise ValueError(f"Question {i+1} must have exactly 4 options")

        print(f"✅ Successfully parsed {len(questions_data['questions'])} questions")
        return questions_data

    except json.JSONDecodeError as json_err:
        print(f"❌ JSON Parse Error: {json_err}")
        print(f"🔍 Problematic JSON: {questions_json_str}")
        return {"error": f"Invalid JSON response from AI: {str(json_err)}"}

    except ValueError as val_err:
        print(f"❌ Validation Error: {val_err}")
        return {"error": f"AI response validation failed: {str(val_err)}"}

    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        return {"error": f"Failed to generate questions: {str(e)}"}


async def async_generate_mcqs(job_title, skills, level, candidate_name):
    """Async wrapper to run generate_mcqs in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor, generate_mcqs, job_title, skills, level, candidate_name
    )


async def generate_tests_for_candidates(candidates: list, level: str):
    """
    Generate tests for multiple candidates concurrently.
    candidates = [
      {"name": "Alice", "job_title": "Data Analyst", "skills": ["SQL", "Python"]},
      {"name": "Bob", "job_title": "Backend Developer", "skills": ["Java", "Spring Boot"]}
    ]
    """
    tasks = [
        async_generate_mcqs(c["job_title"], c["skills"], level, c["name"])
        for c in candidates
    ]
    results = await asyncio.gather(*tasks)

    return [
        {"name": c["name"], "questions": r.get("questions", [])}
        for c, r in zip(candidates, results)
    ]


def generate_email_content(candidate_name: str, test_link: str, job_title: str) -> str:
    """
    Generates a professional email draft with a unique test link using the Gemini API.
    """
    prompt = f"""
    You are an expert HR assistant. Draft a concise and professional email to a job candidate.

    Requirements:
    - Subject Line: Clear & professional.
    - Greeting: Use candidate name.
    - Body: Thank them for applying for {job_title}. Ask them to complete an aptitude test.
    - Test Link: {test_link}
    - Closing: Signed by 'The Hiring Team'

    Output: plain text only.
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error generating email content: {e}")
        return f"""
Subject: Aptitude Test for {job_title} Position

Dear {candidate_name},

Thank you for your interest in the {job_title} position.

Your aptitude test is ready. Please click the link below to take the test:
{test_link}

Good luck!

Regards,  
The Hiring Team
"""
