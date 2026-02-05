from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from pipeline import process_manga_image

app = FastAPI()

class ImageRequest(BaseModel):
    input_path: str
    output_path: str

@app.post("/process")
async def process_endpoint(req: ImageRequest):
    if not os.path.exists(req.input_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    success = process_manga_image(req.input_path, req.output_path)
    
    if success:
        return {"status": "done", "output": req.output_path}
    else:
        raise HTTPException(status_code=500, detail="Processing failed")