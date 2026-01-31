import requests

# Test 1: Check if /jobs endpoint exists
print("=" * 60)
print("TEST 1: Checking /jobs endpoint")
print("=" * 60)
try:
    response = requests.get("http://localhost:8000/jobs")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Jobs found: {len(data.get('jobs', []))}")
        for i, job in enumerate(data.get('jobs', [])[:3], 1):
            print(f"{i}. {job['title']}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Check test results endpoint
print("\n" + "=" * 60)
print("TEST 2: Checking test results endpoint")
print("=" * 60)
try:
    response = requests.get("http://localhost:8000/api/test/results/React Developer")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Candidates: {len(data.get('candidates', []))}")
        print(f"Job Title: {data.get('job_title')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")
