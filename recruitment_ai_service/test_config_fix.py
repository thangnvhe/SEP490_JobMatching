print("Testing config after fix...")

try:
    from pydantic_settings import BaseSettings
    print("✅ pydantic_settings - OK")
except ImportError as e:
    print(f"❌ pydantic_settings - Error: {e}")

try:
    from app.core.config import settings
    print("✅ Config loaded successfully!")
    print(f"📱 App: {settings.app_name}")
    print(f"🔧 API Version: {settings.api_version}")
    print(f"📁 Extensions: {settings.allowed_extensions}")
    print(f"💾 Max file size: {settings.max_file_size}")
except Exception as e:
    print(f"❌ Config error: {e}")