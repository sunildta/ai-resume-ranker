import os
from dotenv import load_dotenv

print("Testing environment variable loading...")
print(f"Current working directory: {os.getcwd()}")

# Try loading from current directory
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
print(f"API key from root .env: {api_key}")

# Try loading from backend directory
load_dotenv('backend/.env')
api_key2 = os.getenv('GEMINI_API_KEY')
print(f"API key from backend .env: {api_key2}")

if api_key or api_key2:
    print("✅ Environment variable loaded successfully!")
else:
    print("❌ Environment variable not found!")
