import requests
import json

response = requests.get("http://127.0.0.1:8000/api/admin/users")
data = response.json()

print(f"✅ API Response: {response.status_code}")
print(f"Total users: {data['total_count']}")
print("\nUsers:")
for i, user in enumerate(data['users'], 1):
    print(f"{i}. {user['email']} - {user['display_name']}")
