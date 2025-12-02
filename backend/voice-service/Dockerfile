FROM python:3.11-slim

# Métadonnées
LABEL maintainer="IAcompagnon <abebiregnaultdo@gmail.com>"
LABEL description="Voice Service with Piper TTS (Open Source) and Whisper STT"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies for audio processing + wget for downloading models
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create models directory
RUN mkdir -p /app/models

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download Piper TTS French model (fr_FR-siwis-medium)
WORKDIR /app/models
RUN wget -q https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx && \
    wget -q https://github.com/rhasspy/piper/releases/download/v1.2.0/fr_FR-siwis-medium.onnx.json && \
    echo "✅ Piper model downloaded:" && ls -lh

# Copy application code
WORKDIR /app
COPY app/ ./app/

# Expose port
EXPOSE 8003

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8003/health')" || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]

