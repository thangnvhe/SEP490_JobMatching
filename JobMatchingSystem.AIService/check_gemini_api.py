#!/usr/bin/env python3
"""
Script để kiểm tra Google Gemini API Key và liệt kê các model khả dụng
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import google.genai as genai
    print("✅ google-genai library imported successfully")
    print(f"📦 google-genai version: {genai.__version__}")
except ImportError as e:
    print(f"❌ Failed to import google-genai: {e}")
    print("💡 Install with: pip install google-genai")
    sys.exit(1)

def check_api_key():
    """Kiểm tra API key"""
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ GOOGLE_API_KEY not found in environment variables")
        return None
    
    if api_key == "YOUR_API_KEY_HERE":
        print("❌ GOOGLE_API_KEY is still default placeholder")
        return None
    
    print(f"✅ API Key found: {api_key[:8]}...{api_key[-4:]}")
    return api_key

def test_api_connection(api_key):
    """Test kết nối API"""
    try:
        client = genai.Client(api_key=api_key)
        print("✅ Gemini client created successfully")
        return client
    except Exception as e:
        print(f"❌ Failed to create Gemini client: {e}")
        return None

def list_available_models(client):
    """Liệt kê các model khả dụng"""
    try:
        print("\n🔍 Fetching available models...")
        models = list(client.models.list())
        
        if not models:
            print("❌ No models found")
            return
        
        print(f"✅ Found {len(models)} available models:")
        print("-" * 80)
        
        for i, model in enumerate(models, 1):
            print(f"{i:2d}. {model.name}")
            if hasattr(model, 'display_name'):
                print(f"    Display Name: {model.display_name}")
            if hasattr(model, 'description'):
                print(f"    Description: {model.description[:100]}...")
            if hasattr(model, 'version'):
                print(f"    Version: {model.version}")
            if hasattr(model, 'supported_generation_methods'):
                print(f"    Methods: {', '.join(model.supported_generation_methods)}")
            print()
        
    except Exception as e:
        print(f"❌ Failed to list models: {e}")

def test_simple_generation(client, model_name="models/gemini-1.5-flash"):
    """Test generation với model cụ thể"""
    try:
        print(f"\n🧪 Testing content generation with {model_name}...")
        
        result = client.models.generate_content(
            model=model_name,
            contents="Hello! Please respond with 'API test successful' to confirm the connection."
        )
        
        print("✅ Generation successful!")
        print(f"Response: {result.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Generation failed: {e}")
        return False

def test_different_models(client):
    """Test các model khác nhau"""
    models_to_test = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro", 
        "models/gemini-2.0-flash-exp",
        "models/gemini-pro"
    ]
    
    print("\n🔧 Testing different models...")
    working_models = []
    
    for model in models_to_test:
        try:
            print(f"\nTesting {model}...")
            result = client.models.generate_content(
                model=model,
                contents="Test"
            )
            print(f"✅ {model} - WORKING")
            working_models.append(model)
        except Exception as e:
            print(f"❌ {model} - FAILED: {str(e)[:100]}...")
    
    print(f"\n📊 Summary: {len(working_models)} working models out of {len(models_to_test)} tested")
    if working_models:
        print("✅ Working models:")
        for model in working_models:
            print(f"   - {model}")
    
    return working_models

def main():
    print("🔍 Google Gemini API Key Checker")
    print("=" * 50)
    
    # 1. Check API key
    api_key = check_api_key()
    if not api_key:
        return
    
    # 2. Test connection
    client = test_api_connection(api_key)
    if not client:
        return
    
    # 3. List available models
    list_available_models(client)
    
    # 4. Test simple generation
    test_simple_generation(client)
    
    # 5. Test different models
    working_models = test_different_models(client)
    
    # 6. Recommendations
    print("\n💡 Recommendations:")
    if working_models:
        recommended_model = working_models[0]
        print(f"   - Use this model in your .env file: GEMINI_MODEL={recommended_model}")
        print(f"   - Update config.py if needed")
    else:
        print("   - Check your API key quota and permissions")
        print("   - Verify your Google Cloud project settings")
    
    print("\n🎉 Check complete!")

if __name__ == "__main__":
    main()