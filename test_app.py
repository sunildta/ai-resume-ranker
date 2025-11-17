#!/usr/bin/env python3
import sys
sys.path.append('backend')

try:
    from backend.main import app
    print("✅ App imported successfully!")
    print(f"✅ API key loaded: {'Yes' if app else 'Unknown'}")
except Exception as e:
    print(f"❌ Error importing app: {e}")
    import traceback
    traceback.print_exc()
