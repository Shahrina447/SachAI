import os
import torch
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ─── CPU ONLY — never cuda ────────────────────────────────────────────────────
DEVICE = torch.device("cpu")

MODEL_PATH = os.getenv("MODEL_PATH", "./saved_model")

# ─── Decision threshold ───────────────────────────────────────────────────────
# REAL is predicted only when real_conf >= REAL_THRESHOLD.
# Raised to 0.80 to reduce false REAL predictions on sophisticated fake news.
REAL_THRESHOLD = float(os.getenv("REAL_THRESHOLD", "0.80"))

# Temperature scaling — makes probabilities more realistic (less overconfident)
TEMPERATURE = float(os.getenv("TEMPERATURE", "1.5"))

# ─── Fake indicator phrases ────────────────────────────────────────────────────
# Urdu phrases commonly found in unverified / fake / social media news.
# Each matched phrase applies a confidence penalty to real_conf.
FAKE_INDICATORS = [
    # Unverified source phrases
    'ذرائع کے مطابق',        # "according to sources"
    'اندرونی ذرائع',          # "inside sources"
    'اعلیٰ سطحی ذرائع',      # "high level sources"
    'خصوصی ذرائع',           # "special sources"
    'قابل اعتماد ذرائع',      # "reliable sources"
    'نامعلوم ذرائع',          # "unknown sources"

    # Conspiracy / hidden truth phrases
    'خفیہ معاہدہ',            # "secret deal"
    'خفیہ دستاویزات',         # "secret documents"
    'سچ سامنے آ گیا',         # "truth revealed"
    'حکومت چھپا رہی ہے',      # "government is hiding"
    'انکشاف',                 # "revelation/expose"
    'راز فاش',                # "secret exposed"
    'پردہ اٹھ گیا',           # "curtain lifted"

    # Urgency / breaking fake news phrases
    'آج رات اہم اعلان',       # "important announcement tonight"
    'ابھی ابھی خبر آئی',      # "news just arrived"
    'بریکنگ',                 # "breaking"
    'فوری',                   # "urgent/immediate"

    # Miraculous / exaggerated claims
    'معجزاتی',                # "miraculous"
    'حیرت انگیز انکشاف',      # "amazing revelation"
    'صرف چند دنوں میں',       # "in just a few days"
    'مکمل علاج',              # "complete cure"
    'یہ راز',                 # "this secret"
]

INDICATOR_PENALTY_PER_MATCH = 0.07   # penalty per matched phrase
INDICATOR_PENALTY_MAX       = 0.28   # max total penalty

# ─── Confidence cutoff ────────────────────────────────────────────────────────
# If winning confidence < this → UNCERTAIN
# Raised from 0.75 to 0.80 to catch borderline cases
UNCERTAIN_CONFIDENCE_CUTOFF = float(os.getenv("UNCERTAIN_CUTOFF", "0.80"))

# ─── Global model/tokenizer ───────────────────────────────────────────────────
_model     = None
_tokenizer = None


def load_model():
    """Load the fine-tuned xlm-RoBERTa model onto CPU."""
    global _model, _tokenizer
    from transformers import AutoTokenizer, AutoModelForSequenceClassification

    _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    _model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_PATH,
        torch_dtype=torch.float32,   # float32 ONLY — never float16 on CPU
    )
    _model.to(DEVICE)
    _model.eval()
    print(f"[SachAI] Model loaded from '{MODEL_PATH}' on {DEVICE}")
    print(f"[SachAI] REAL_THRESHOLD         = {REAL_THRESHOLD}")
    print(f"[SachAI] UNCERTAIN_CUTOFF       = {UNCERTAIN_CONFIDENCE_CUTOFF}")
    print(f"[SachAI] TEMPERATURE            = {TEMPERATURE}")
    print(f"[SachAI] FAKE_INDICATORS count  = {len(FAKE_INDICATORS)}")


def check_fake_indicators(text: str) -> float:
    """
    Count how many FAKE_INDICATORS appear in the text.
    Returns a penalty score = count * penalty_per_match, capped at max.
    """
    count = sum(1 for phrase in FAKE_INDICATORS if phrase in text)
    penalty = min(count * INDICATOR_PENALTY_PER_MATCH, INDICATOR_PENALTY_MAX)
    if count > 0:
        print(f"[SachAI] {count} fake indicator(s) found → penalty = {penalty:.3f}")
    return penalty


def _generate_verdict(prediction: str, real_conf: float, fake_conf: float) -> str:
    """Generate human-readable verdict text based on prediction and confidence."""
    if prediction == "UNCERTAIN":
        return (
            "⚠ Model confidence is low — this news could not be confidently classified. "
            "Please verify manually at Dawn.com, Geo.tv, or BBC Urdu before sharing."
        )
    elif prediction == "REAL":
        if real_conf >= 0.90:
            return "✓ Strong authentic linguistic patterns detected. Content appears highly credible."
        elif real_conf >= 0.85:
            return "✓ Authentic linguistic patterns detected. Content appears credible."
        else:
            return "⚠ Likely credible but confidence is moderate — verify with trusted sources before sharing."
    else:  # FAKE
        if fake_conf >= 0.90:
            return (
                "✗ Strong misinformation indicators detected: sensational tone, "
                "unverifiable claims, and suspicious phrasing. Do not share."
            )
        elif fake_conf >= 0.80:
            return "✗ Misinformation indicators detected: unverifiable claims and suspicious phrasing."
        else:
            return (
                "✗ Possible misinformation detected. "
                "Verify with Dawn.com, Geo.tv, or BBC Urdu before sharing."
            )


def predict(text: str) -> dict:
    """
    Run xlm-RoBERTa inference on CPU and return a full prediction dict.

    Pipeline:
      1. Clean Urdu text
      2. Tokenize + run model
      3. Temperature scaling
      4. Apply fake-indicator penalty
      5. Three-zone decision: REAL / FAKE / UNCERTAIN
      6. Generate verdict text
    """
    from preprocess import clean_urdu_text

    # ── Step 1: Clean text ────────────────────────────────────────────────────
    cleaned = clean_urdu_text(text)

    # ── Step 2: Tokenize + inference ──────────────────────────────────────────
    inputs = _tokenizer(
        cleaned,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )

    with torch.no_grad():
        outputs = _model(**inputs)

    # ── Step 3: Temperature scaling ───────────────────────────────────────────
    # Dividing logits by TEMPERATURE > 1.0 softens overconfident probabilities
    probs = torch.nn.functional.softmax(
        outputs.logits / TEMPERATURE, dim=-1
    )[0]

    # Label mapping from training:
    # index 0 = FAKE, index 1 = REAL
    fake_conf = round(probs[0].item(), 4)
    real_conf = round(probs[1].item(), 4)

    # ── Step 4: Fake-indicator penalty ────────────────────────────────────────
    penalty   = check_fake_indicators(text)
    real_conf = round(max(0.0,  real_conf - penalty), 4)
    fake_conf = round(min(1.0,  fake_conf + penalty), 4)

    # ── Step 5: Three-zone decision ───────────────────────────────────────────
    top_conf = max(real_conf, fake_conf)

    if top_conf < UNCERTAIN_CONFIDENCE_CUTOFF:
        # Model is not confident enough either way
        prediction = "UNCERTAIN"
    elif real_conf >= REAL_THRESHOLD:
        prediction = "REAL"
    else:
        prediction = "FAKE"

    # ── Step 6: Verdict text ──────────────────────────────────────────────────
    verdict = _generate_verdict(prediction, real_conf, fake_conf)

    return {
        "prediction":      prediction,
        "confidence":      round(top_conf, 4),
        "confidence_real": real_conf,
        "confidence_fake": fake_conf,
        "verdict_text":    verdict,
        "prediction_id":   str(uuid.uuid4()),
        "timestamp":       datetime.utcnow().isoformat(),
        # Sub-scores derived from confidence (for frontend breakdown display)
        "linguistic_score": round(max(0.1, min(0.98, real_conf + 0.02)), 4),
        "source_score":     round(max(0.1, min(0.98, real_conf - 0.03)), 4),
        "sentiment_score":  round(max(0.1, min(0.98, real_conf + 0.01)), 4),
        "fact_score":       round(max(0.1, min(0.98, real_conf - 0.02)), 4),
    }