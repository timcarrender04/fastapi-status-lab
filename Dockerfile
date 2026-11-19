# FastAPI and the page run only inside this image.
# Do not start uvicorn on the host.

# Small Python 3.12 image. The laptop does not need Python installed.
FROM python:3.12-slim

# Later paths are /app inside the image, not a folder on the laptop.
WORKDIR /app

# Copy the dependency list first, then install.
# A one-line edit to app.py does not reinstall FastAPI.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# The API and the web page both go into the image.
COPY app.py .
COPY ui ./ui

# The port uvicorn listens on inside the container. This does not publish it.
EXPOSE 8000

# 0.0.0.0 is required. 127.0.0.1 would answer only inside the container,
# and Compose's published port could not reach the process.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
