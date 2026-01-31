import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Check test results for job 20Eqq3NNl7kcwNerAMNe
job_id = "20Eqq3NNl7kcwNerAMNe"
print(f"Checking test results for job: {job_id}")
print("=" * 60)

tests_ref = db.collection("tests").where("job_id", "==", job_id).stream()

all_candidates = {}
for test_doc in tests_ref:
    test_id = test_doc.id
    test_data = test_doc.to_dict()
    
    print(f"\nTest ID: {test_id}")
    print(f"  Candidate ID: {test_data.get('candidate_id')}")
    
    # Check if there are results
    results_ref = db.collection("tests").document(test_id).collection("results").stream()
    results = list(results_ref)
    
    if results:
        for result_doc in results:
            result_data = result_doc.to_dict()
            print(f"  ✅ HAS RESULT:")
            print(f"     Score: {result_data.get('score')}/{result_data.get('total_questions')}")
            print(f"     Percentage: {result_data.get('percentage')}%")
            print(f"     Rank: {result_data.get('rank')}")
            
            candidate_key = result_data.get('candidate_email') or result_data.get('candidate_id')
            all_candidates[candidate_key] = result_data
    else:
        print(f"  ⏳ No result yet (test not taken)")

print(f"\n" + "=" * 60)
print(f"Total unique candidates with results: {len(all_candidates)}")
