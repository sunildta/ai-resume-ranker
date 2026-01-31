import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Check tests collection
print("=" * 50)
print("TESTS COLLECTION:")
print("=" * 50)
tests_ref = db.collection("tests")
tests = list(tests_ref.stream())

if not tests:
    print("❌ No tests found in database")
else:
    print(f"✅ Found {len(tests)} test(s):\n")
    for test_doc in tests:
        test_data = test_doc.to_dict()
        print(f"Test ID: {test_doc.id}")
        print(f"  Job ID: {test_data.get('job_id')}")
        print(f"  Candidate ID: {test_data.get('candidate_id')}")
        print(f"  Candidate Email: {test_data.get('candidate_email')}")
        print(f"  Difficulty: {test_data.get('difficulty')}")
        print(f"  Email Status: {test_data.get('email_status')}")
        print(f"  Questions Count: {len(test_data.get('questions', []))}")
        print(f"  Created At: {test_data.get('created_at')}")
        print()
