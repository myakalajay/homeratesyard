# 1. Official Python slim image for a smaller production footprint
FROM python:3.11-slim

# 2. Environment Variables:
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files
# PYTHONUNBUFFERED: Ensures logs are sent to the console in real-time
# PYTHONPATH: Critically maps the /app directory so 'src' imports work
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# 3. Working Directory
WORKDIR /app

# 4. System Dependencies (Required for ReportLab & PDF generation)
# These are necessary for building certain Python packages on Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python dependencies
# We copy this first to leverage Docker's layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy Application Source
COPY . .

# 7. Runtime Directories
# Ensure Sarah has a place to save generated Rate Sheets
RUN mkdir -p downloads

# 8. Expose FastAPI Port
EXPOSE 8000

# 9. Startup Command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]