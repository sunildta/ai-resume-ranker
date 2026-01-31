import requests
import json

response = requests.get("http://127.0.0.1:8000/api/test/results/React%20Developer")
data = response.json()

print(f"Total candidates: {len(data['candidates'])}")
print("=" * 60)

for i, candidate in enumerate(data['candidates'], 1):
    print(f"\n{i}. {candidate['candidate_name']}")
    print(f"   Email: {candidate['candidate_email']}")
    print(f"   Candidate ID: {candidate['candidate_id']}")
    print(f"   Status: {candidate['status']}")
    if candidate['status'] == 'Submitted':
        print(f"   Score: {candidate['test_score']}/{candidate['total_questions']}")
        print(f"   Percentage: {candidate['percentage']}%")
