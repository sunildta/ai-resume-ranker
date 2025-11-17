import firebase_admin
from firebase_admin import credentials, firestore


# Check if the app is already initialized before calling initialize_app()
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("firebase_key.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase app initialized successfully.")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        raise

# Get the Firestore client
db = firestore.client()