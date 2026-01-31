import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

job_id = "20Eqq3NNl7kcwNerAMNe"
tests = db.collection("tests").where("job_id", "==", job_id).stream()

unique_candidates = set()
for test in tests:
    data = test.to_dict()
    unique_candidates.add(data.get("candidate_id"))

print(f"Tests for job {job_id}:")
print(f"Total tests: {len(list(db.collection('tests').where('job_id', '==', job_id).stream()))}")
print(f"Unique candidates: {len(unique_candidates)}")
print(f"Candidate IDs: {unique_candidates}")
