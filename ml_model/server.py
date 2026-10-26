"""
FastAPI Microservice for BodyCheck ML Model.
Exposes REST endpoints to identify bruises, injuries, and skin conditions from Reference vs Review photos.
Run with: uvicorn server:app --host 0.0.0.0 --port 8000
"""

import os
import io
import base64
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict

import tensorflow as tf
from tensorflow import keras

CLASSES = [
    "Normal / No Significant Visible Change",
    "Visible color change / contusion-like discoloration",
    "Localized erythema / skin appearance change",
    "Superficial skin-surface change",
    "Localized skin-color variation"
]

app = FastAPI(title="BodyCheck ML Inference API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = None
WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "weights", "bodycheck_diffnet.keras")

def get_model():
    global MODEL
    if MODEL is None:
        if os.path.exists(WEIGHTS_PATH):
            print(f"Loading trained model from {WEIGHTS_PATH}...")
            MODEL = keras.models.load_model(WEIGHTS_PATH)
        else:
            print("Trained model weights not found yet; initializing architecture...")
            from model import create_bodycheck_ml_model
            MODEL = create_bodycheck_ml_model()
    return MODEL

def preprocess_pil_image(img: Image.Image, target_size=(128, 128)) -> np.ndarray:
    img = img.convert("RGB").resize(target_size, Image.Resampling.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)

class Base64PredictRequest(BaseModel):
    reference_image: str  # data URL or raw base64 string
    review_image: str     # data URL or raw base64 string
    body_region: Optional[str] = "Skin"

def decode_base64_image(b64_str: str) -> Image.Image:
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    data = base64.b64decode(b64_str)
    return Image.open(io.BytesIO(data))

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "BodyCheck ML Model", "classes": CLASSES}

@app.post("/api/predict")
def predict_differential(req: Base64PredictRequest):
    try:
        ref_img = decode_base64_image(req.reference_image)
        rev_img = decode_base64_image(req.review_image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode base64 images: {str(e)}")

    ref_arr = preprocess_pil_image(ref_img)
    rev_arr = preprocess_pil_image(rev_img)

    model = get_model()
    preds = model.predict({"reference_image": ref_arr, "review_image": rev_arr}, verbose=0)
    cond_probs = preds[0][0]
    bbox = preds[1][0]

    top_idx = int(np.argmax(cond_probs))
    top_prob = float(cond_probs[top_idx])
    predicted_class = CLASSES[top_idx]

    is_detected = (top_idx != 0) and (top_prob > 0.40)

    class_probs_dict = {
        "normal": float(cond_probs[0]),
        "bruise": float(cond_probs[1]),
        "erythema": float(cond_probs[2]),
        "abrasion": float(cond_probs[3]),
        "resolving": float(cond_probs[4])
    }

    cx, cy, w, h = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])

    delta_region = None
    change_coords = None
    if is_detected:
        delta_region = {
            "x": round(cx, 3),
            "y": round(cy, 3),
            "width": max(0.12, round(w, 3)),
            "height": max(0.12, round(h, 3))
        }
        change_coords = {
            "xPercent": round(cx * 100, 1),
            "yPercent": round(cy * 100, 1),
            "radiusPercent": round(max(w, h) * 50, 1)
        }

    confidence_level = "High" if top_prob > 0.80 else ("Moderate" if top_prob > 0.60 else "Low")

    return {
        "detected": is_detected,
        "predictedChangeType": predicted_class,
        "finding": predicted_class if is_detected else "Normal/no significant visible change",
        "confidence": confidence_level,
        "confidenceScore": round(top_prob, 3),
        "classProbabilities": class_probs_dict,
        "deltaRegion": delta_region,
        "changeCoordinates": change_coords,
        "bodyRegion": req.body_region
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
