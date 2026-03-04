from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Uploads a file and returns the local URL"""
    try:
        # Create unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return URL (assuming server is 127.0.0.1:8000)
        # Note: You need to mount 'static' in main.py
        return {"url": f"http://127.0.0.1:8000/static/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
