from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=1000)


class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    confidence_real: float
    confidence_fake: float
    linguistic_score: float
    source_score: float
    sentiment_score: float
    fact_score: float
    verdict_text: str
    prediction_id: str
    timestamp: str
    demo_mode: Optional[bool] = False


class HistoryItem(BaseModel):
    id: str
    text_preview: str
    prediction: str
    confidence: float
    timestamp: str
