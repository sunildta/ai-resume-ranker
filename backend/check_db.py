from config.firebase_config import db

# Check resumes collection
resumes = list(db.collection('resumes').limit(10).stream())
print(f"Total resumes in database: {len(resumes)}")

if resumes:
    for r in resumes:
        data = r.to_dict()
        print(f"  Job ID: {data.get('job_id')}")
        print(f"  Filename: {data.get('filename')}")
        print(f"  Name: {data.get('name')}")
        print(f"  Email: {data.get('email')}")
        print("  ---")
else:
    print("No resumes found!")

# Check jobs
jobs = list(db.collection('jobs').limit(3).stream())
print(f"\nTotal jobs: {len(jobs)}")
for job in jobs:
    print(f"  Job ID: {job.id} - Title: {job.to_dict().get('title')}")
