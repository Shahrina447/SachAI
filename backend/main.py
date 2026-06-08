from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import PredictRequest, PredictResponse, HistoryItem
from model import load_model, predict
from database import init_db, save_prediction, get_history, delete_prediction, clear_all_predictions
from preprocess import clean_urdu_text


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    load_model()  # loads on CPU (or skips in DEMO_MODE)
    yield


app = FastAPI(
    title="SachAI API",
    description="Urdu Fake News Detection — CPU-only xlm-RoBERTa",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "device": "cpu"}


@app.post("/api/predict", response_model=PredictResponse)
async def predict_endpoint(req: PredictRequest):
    if len(req.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short (min 10 characters)")
    if len(req.text) > 1000:
        raise HTTPException(status_code=400, detail="Text too long (max 1000 characters)")

    result = predict(clean_urdu_text(req.text))
    await save_prediction({**result, "full_text": req.text, "text_preview": req.text[:50]})
    return result


@app.get("/api/history")
async def history_endpoint():
    return await get_history()


@app.delete("/api/history/{prediction_id}")
async def delete_endpoint(prediction_id: str):
    deleted = await delete_prediction(prediction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {"deleted": True}


@app.delete("/api/history")
async def clear_endpoint():
    await clear_all_predictions()
    return {"cleared": True}
