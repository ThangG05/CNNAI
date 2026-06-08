import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

MODEL_PATH = "model/best_model.keras"

UPLOAD_FOLDER = "uploads"

IMAGE_SIZE = (48, 48)