# 1. Use an official lightweight Python image
FROM python:3.11-slim

# 2. Set environment variables to optimize Python inside Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Force Playwright to install browsers in a centralized, accessible location
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Install critical system utilities required for compiling packages
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. CRITICAL: Install Playwright and its Linux system dependencies
# We only install Chromium to save space and reduce build times
RUN playwright install chromium
RUN playwright install-deps chromium

# 7. Copy the rest of your application code into the container
COPY . .

# 8. Expose the port FastAPI runs on
EXPOSE 8000

# 9. Set the default command to run the FastAPI server
# (Note: Your docker-compose.yml will override this specific command for the Celery worker container)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]