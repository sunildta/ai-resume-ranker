# app/services/firestore_service.py

from firebase_config import db
from firebase_admin import firestore

def save_test_to_firestore(job_id: str, candidate_id: str, candidate_name: str,candidate_email: str, questions: list) -> str:
    """
    Saves a new test document to Firestore and returns its ID.
    """
    try:
        test_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "questions": questions,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("tests").document()
        doc_ref.set(test_data)
        
        return doc_ref.id
    except Exception as e:
        print(f"Error saving test to Firestore: {e}")
        return None


    


def get_test_from_firestore(test_id: str):
    """
    Retrieves a test document from Firestore.
    """
    try:
        doc_ref = db.collection("tests").document(test_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            return None
    except Exception as e:
        print(f"Error retrieving test from Firestore: {e}")
        return None


def update_test_metadata(test_id: str, data: dict) -> bool:
    """
    Updates metadata (candidate info, difficulty, email status, etc.) for a given test.
    """
    try:
        doc_ref = db.collection("tests").document(test_id)
        doc_ref.update(data)
        return True
    except Exception as e:
        print(f"Error updating test metadata in Firestore: {e}")
        return False
