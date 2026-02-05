# File: MangaFYP/ai_service/Dockerfile

# Use Python 3.9 (stable for ML libraries)
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies required for OpenCV and EasyOCR
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
# --no-cache-dir keeps the image smaller
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Start the server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]