import os
import uuid
import shutil
import cv2

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models import EmotionLog
from config import UPLOAD_FOLDER
from utils.face_detector import detect_face
from utils.image_processing import preprocess_image
from utils.metrics import calculate_confidence
from ai_model import predict_emotion
from fastapi import Query
router = APIRouter()

# 1. THÊM DÒNG NÀY: Bộ nhớ tạm (RAM) để găm lại kết quả khi điện thoại gửi về
ACTIVE_SESSIONS = {}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]



@router.post("/predict")
async def predict_image(
    file: UploadFile = File(...),
    detection_type: str = Query("upload"),
    session_id: str = None,
    db: Session = Depends(get_db)
):
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")

    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    img = cv2.imread(file_path)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    try:
        face = detect_face(img) # Đoạn trích xuất khuôn mặt của ông
    except Exception:
        raise HTTPException(status_code=400, detail="Face detection failed")

    if face is None:
        raise HTTPException(status_code=400, detail="No face detected")

    processed_image = preprocess_image(face)
    emotion, confidence, scores = predict_emotion(processed_image)
    confidence_percent = calculate_confidence(confidence)
    image_url = f"/uploads/{filename}"

    # Ghi log lịch sử vào Database
    log = EmotionLog(
    image_url=image_url,
    emotion=emotion,
    confidence=confidence_percent,
    angry_score=scores.get("angry_score"),
    disgust_score=scores.get("disgust_score"),
    fear_score=scores.get("fear_score"),
    happy_score=scores.get("happy_score"),
    neutral_score=scores.get("neutral_score"),
    sad_score=scores.get("sad_score"),
    surprised_score=scores.get("surprised_score"),
    detection_type=detection_type
    )
    try:
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")

    # Đóng gói dữ liệu trả về
    result_data = {
        "emotion": emotion,
        "confidence": confidence_percent,
        "scores": scores,
        "image_url": image_url
    }

    # 3. SỬA ĐOẠN RETURN: Nếu là điện thoại chụp (có session_id), ném data vào RAM rồi báo thành công
    if session_id:
        ACTIVE_SESSIONS[session_id] = {
            "status": "completed",
            "data": result_data
        }
        return {"status": "success", "message": "Đã truyền dữ liệu về PC thành công!"}

    # Nếu là PC upload/webcam trực tiếp (không có session_id) thì trả thẳng data về như cũ
    return result_data


# 4. THÊM MỚI ENDPOINT NÀY: Để PC gọi liên tục (Polling) hỏi thăm tình hình của điện thoại
@router.get("/session/{session_id}")
def check_session(session_id: str):
    if session_id in ACTIVE_SESSIONS:
        return ACTIVE_SESSIONS[session_id]
    return {"status": "pending", "data": None}


@router.get("/history")
def get_history(db: Session = Depends(get_db)):

    logs = (
        db.query(EmotionLog)
        .order_by(EmotionLog.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(log.id),
            "image_url": log.image_url,
            "emotion": log.emotion,
            "confidence": log.confidence,
            "detection_type": log.detection_type,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]