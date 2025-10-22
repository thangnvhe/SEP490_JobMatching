from fastapi import FastAPI

app = FastAPI(title="Simple Test")

@app.get("/")
async def root():
    return {"message": "FastAPI is working!"}

@app.get("/test-config")
async def test_config():
    try:
        from app.core.config import settings
        return {
            "config_loaded": True,
            "app_name": settings.app_name,
            "extensions": settings.allowed_extensions
        }
    except Exception as e:
        return {"config_loaded": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)