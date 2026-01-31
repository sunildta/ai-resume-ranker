import firebase_admin
from firebase_admin import credentials, firestore, auth

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("=" * 60)
print("FIREBASE AUTH USERS:")
print("=" * 60)

# Get all users from Firebase Auth
page = auth.list_users()
users_count = 0

while page:
    for user in page.users:
        users_count += 1
        print(f"\n{users_count}. UID: {user.uid}")
        print(f"   Email: {user.email}")
        print(f"   Display Name: {user.display_name or 'Not set'}")
        print(f"   Email Verified: {user.email_verified}")
        print(f"   Provider: {user.provider_data[0].provider_id if user.provider_data else 'N/A'}")
        print(f"   Created: {user.user_metadata.creation_timestamp}")
        print(f"   Last Sign-in: {user.user_metadata.last_sign_in_timestamp}")
        print(f"   Disabled: {user.disabled}")
    
    # Get next batch of users
    page = page.get_next_page()

print(f"\n{'=' * 60}")
print(f"Total users: {users_count}")
print("=" * 60)

# Check if there's a users collection in Firestore
print("\n\nCHECKING FIRESTORE 'users' COLLECTION:")
print("=" * 60)
users_ref = db.collection("users")
users_docs = list(users_ref.stream())

if users_docs:
    print(f"Found {len(users_docs)} users in Firestore:\n")
    for doc in users_docs:
        data = doc.to_dict()
        print(f"User ID: {doc.id}")
        print(f"  Data: {data}")
        print()
else:
    print("No 'users' collection found in Firestore.")
    print("User data is only stored in Firebase Authentication.")
