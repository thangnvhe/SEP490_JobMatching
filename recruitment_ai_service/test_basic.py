print("Testing basic imports...")

try:
    from fastapi import FastAPI
    print("✅ FastAPI - OK")
except ImportError as e:
    print(f"❌ FastAPI - Error: {e}")

try:
    from pydantic_settings import BaseSettings
    print("✅ Pydantic Settings - OK")
except ImportError as e:
    print(f"❌ Pydantic Settings - Error: {e}")

try:
    from app.core.config import settings
    print("✅ Config - OK")
    print(f"📱 App name: {settings.app_name}")
except ImportError as e:
    print(f"❌ Config - Error: {e}")

print("Basic test completed!")