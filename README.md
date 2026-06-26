<div align="center">

# 🔍 Verdade

### *Truth in Every Word.*

**AI-powered Urdu fake news detection platform built on fine-tuned XLM-RoBERTa**

![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138+-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=flat-square&logo=next.js&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.12+-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![XLM-RoBERTa](https://img.shields.io/badge/XLM--RoBERTa-base-4285F4?style=flat-square&logo=huggingface&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

---

## What Is Verdade

Verdade is an NLP-powered fake news detection system specifically built for Urdu language content. It uses a fine-tuned XLM-RoBERTa model trained on a curated Urdu news dataset to classify articles as **REAL**, **FAKE**, or **UNCERTAIN** — with confidence scores, credibility breakdowns, and human-readable verdicts.

Pakistan is among the world's most affected countries by misinformation spread through social media in Urdu. Existing fact-checking tools are either English-only or rely on manual review. Verdade solves this by providing instant, automated, language-native detection that anyone can use.

---

## How It Works

```
User pastes Urdu news text
          ↓
Tokenization (XLM-RoBERTa tokenizer, max 256 tokens)
          ↓
Fine-tuned XLM-RoBERTa forward pass
          ↓
Softmax → conf_real (label 0) + conf_fake (label 1)
          ↓
  ┌───────────────────────────────────┐
  │  Post-processing pipeline         │
  │                                   │
  │  Step 1: Confidence threshold     │
  │  max(conf) < 0.65 → UNCERTAIN     │
  │                                   │
  │  Step 2: Heuristic override       │
  │  conspiracy/miracle-cure patterns │
  │  → force FAKE (≥ 80% confidence)  │
  └───────────────────────────────────┘
          ↓
Structured response — prediction, confidence,
confidence_real, confidence_fake, verdict_text
          ↓
Persisted to history.json with UUID + timestamp
          ↓
Next.js frontend renders result with
animated credibility meter + confidence bars
```

---

## Key Features

- **Fine-tuned XLM-RoBERTa** — multilingual transformer trained specifically on Urdu news data
- **Three-state output** — REAL, FAKE, or UNCERTAIN (no forced binary when model isn't confident)
- **Confidence threshold** — predictions below 65% return UNCERTAIN instead of a wrong label
- **Heuristic override layer** — 24 Urdu conspiracy/miracle-cure patterns catch sophisticated misinformation the model misses
- **Batch analysis** — analyze up to 50 articles at once with aggregate summary stats
- **Prediction history** — all analyses persisted to JSON with UUID, timestamp, and text preview
- **RTL Urdu rendering** — native right-to-left text display with proper Urdu font support
- **Sample articles** — three built-in samples (real, fake, real) to test the detector instantly
- **Animated result UI** — circular credibility meter, animated confidence bars, color-coded verdict cards
- **Structured backend** — clean separation into config / models / schemas / services / routers

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16.2.9 + Tailwind CSS 3.4 | UI, detector, batch analyzer, history page |
| Frontend State | React 19.2.4 | Component state management |
| HTTP Client | Axios 1.18 | Frontend → backend API calls |
| Backend | FastAPI 0.138 (Python 3.13) | REST API, request validation, CORS |
| Model | XLM-RoBERTa base (fine-tuned) | Urdu fake news classification |
| ML Framework | PyTorch 2.12 | Model inference |
| Transformers | HuggingFace Transformers 5.12 | Tokenizer + model architecture |
| Tokenizer | SentencePiece 0.2 | XLM-RoBERTa subword tokenization |
| Config | python-dotenv 1.0 | Environment variable management |
| Server | Uvicorn 0.49 | ASGI server |
| Package Manager | `uv` | Python dependency management |
| History | JSON file | Lightweight prediction persistence |

---

## Project Structure

```
Verdade/
├── README.md
├── .gitignore
│
├── backend/
│   ├── main.py                        # App factory, lifespan, CORS, router registration
│   ├── pyproject.toml                 # Python dependencies (managed by uv)
│   ├── .env                           # HOST, PORT, ALLOWED_ORIGINS
│   ├── .python-version                # Pins Python 3.13
│   ├── xlmroberta_urdu_best.pt        # Fine-tuned model checkpoint (~1.1 GB)
│   │
│   ├── app/
│   │   ├── config.py                  # All constants, paths, device, reads .env
│   │   │
│   │   ├── models/
│   │   │   └── loader.py              # Loads .pt checkpoint (handles 3 save formats)
│   │   │
│   │   ├── schemas/
│   │   │   ├── predict.py             # PredictRequest, PredictResponse, BatchRequest/Response
│   │   │   └── history.py             # HistoryItem schema
│   │   │
│   │   ├── services/
│   │   │   ├── inference.py           # Tokenize → forward pass → heuristics → verdict
│   │   │   └── history.py             # load / save / append / delete history.json
│   │   │
│   │   └── routers/
│   │       ├── predict.py             # POST /api/predict, POST /api/predict/batch
│   │       └── history.py             # GET/DELETE /api/history, DELETE /api/history/{id}
│   │
│   └── data/
│       └── history.json               # Auto-created on first prediction
│
└── frontend/
    ├── package.json
    ├── next.config.ts                 # API rewrites → localhost:8000
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── .env / .env.local              # NEXT_PUBLIC_API_URL
    │
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout, global fonts
        │   ├── page.tsx               # Landing page — assembles all sections
        │   └── history/
        │       └── page.tsx           # Prediction history page
        │
        ├── components/
        │   ├── Navbar.tsx             # Top navigation bar
        │   ├── HeroSection.tsx        # Landing hero with tagline
        │   ├── DetectorSection.tsx    # Main detector — input, result, meter, bars
        │   ├── BatchAnalyzer.tsx      # Multi-article batch analysis
        │   ├── FeaturesSection.tsx    # Feature highlights
        │   ├── HowItWorks.tsx         # Pipeline explanation
        │   ├── StatsSection.tsx       # Model accuracy stats
        │   ├── MarqueeSection.tsx     # Scrolling news ticker
        │   ├── CTASection.tsx         # Call to action
        │   └── Footer.tsx             # Site footer
        │
        └── lib/
            └── api.ts                 # Typed API client (axios wrappers)
```

---

## Prerequisites

- Python 3.13+
- Node.js 18+
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/) — Python package manager
- The trained model file `xlmroberta_urdu_best.pt` placed in `backend/`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `HOST` | `localhost` | Server bind host |
| `PORT` | `8000` | Server bind port |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL |

---

## Running the Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Create .env
echo "HOST=localhost" > .env
echo "PORT=8000" >> .env
echo "ALLOWED_ORIGINS=http://localhost:3000" >> .env

# 3. Install dependencies
uv sync

# 4. Start the server
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**

On first startup the tokenizer is downloaded from HuggingFace (~1 MB) and cached.
The model checkpoint loads from `xlmroberta_urdu_best.pt` — takes ~15–30s on CPU.

---

## Running the Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/` | — | `{ status, model, device }` |
| `POST` | `/api/predict` | `{ text }` | `PredictResponse` |
| `POST` | `/api/predict/batch` | `{ texts[] }` | `BatchResponse` |
| `GET` | `/api/history` | — | `HistoryItem[]` |
| `DELETE` | `/api/history/{id}` | — | `{ deleted: id }` |
| `DELETE` | `/api/history` | — | `{ cleared: true }` |

### PredictResponse

```json
{
  "prediction":      "FAKE",
  "confidence":      0.8312,
  "confidence_real": 0.1688,
  "confidence_fake": 0.8312,
  "verdict_text":    "High likelihood of misinformation detected (83% confidence). Do not share without verification.",
  "prediction_id":   "a3f1c2d4-...",
  "timestamp":       "2026-06-26T10:45:00+00:00"
}
```

### BatchResponse

```json
{
  "results": [ ...PredictResponse[] ],
  "summary": {
    "total": 3,
    "fake":  2,
    "real":  1,
    "fake_percentage": 66.7
  }
}
```

---

## Model Details

| Property | Value |
|---|---|
| Base model | `xlm-roberta-base` (FacebookAI) |
| Fine-tuning task | Binary sequence classification |
| Classes | `0 → REAL`, `1 → FAKE` |
| Max token length | 256 |
| Training data | Urdu news dataset (`combined_urdu_news.csv`) |
| Checkpoint size | ~1.1 GB |
| Inference device | CUDA if available, else CPU |

---

## Evaluation Results

> Results on the **test portion** of the Urdu news dataset — 400 stratified samples (200 REAL + 200 FAKE) drawn from `test.csv` using `evaluate.py`.

### Overall Metrics

| Metric | Score |
|---|---|
| **Accuracy** | **98.00%** |
| **ROC-AUC** | **0.9976** |
| **MCC (Matthews Corr. Coef.)** | **0.9600** |
| **F1 — Macro Average** | **0.9800** |

### Per-Class Report

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| REAL (0) | 0.9800 | 0.9800 | 0.9800 | 200 |
| FAKE (1) | 0.9800 | 0.9800 | 0.9800 | 200 |
| **Macro avg** | **0.9800** | **0.9800** | **0.9800** | 400 |

### Confusion Matrix

```
               Pred REAL   Pred FAKE
True REAL          196           4
True FAKE            4         196
```

Only **8 misclassifications out of 400** samples — perfectly balanced errors across both classes (4 false positives, 4 false negatives).

---

## Post-Processing Pipeline

### Confidence Threshold (Option 3)

If the model's max confidence is below **65%**, the prediction is returned as `UNCERTAIN` instead of forcing a potentially wrong label. The UI renders this in amber with a manual verification prompt.

| Confidence | Outcome |
|---|---|
| ≥ 65% | REAL or FAKE |
| < 65% | UNCERTAIN |

### Heuristic Override Layer (Option 1)

24 Urdu regex patterns catch sophisticated misinformation the model may miss — formally-written conspiracy claims, miracle-cure pseudoscience, and government-suppression framing. When matched, the prediction is forced to **FAKE** with at least 80% confidence and both `confidence_real`/`confidence_fake` are adjusted to stay consistent with the verdict.

Pattern categories:
- **Suppression / cover-up** — e.g. حکومت چھپا رہی, میڈیا چھپا رہا
- **Miracle cures / pseudoscience** — e.g. تمام بیماریاں ٹھیک, کینسر ختم
- **Unverifiable sensational claims** — e.g. معجزاتی علاج, جادوئی دوا
- **Conspiracy framing** — e.g. بڑا انکشاف, سازش کا انکشاف

---

## Checkpoint Loading

The `loader.py` handles three common PyTorch save formats automatically:

| Format | How saved | How loaded |
|---|---|---|
| Full model | `torch.save(model)` | Used directly |
| Bare state dict | `torch.save(model.state_dict())` | Wrapped in XLM-RoBERTa architecture |
| Wrapped dict | `torch.save({"model_state_dict": ...})` | Extracted and wrapped |

`AutoConfig.from_pretrained` is used instead of `from_pretrained` to avoid re-downloading the 1 GB base weights — only the ~1 KB config JSON is fetched, then the architecture is built in memory before loading your weights.

---

*Verdade is an academic NLP project for course demonstration purposes. Model accuracy depends on training data distribution. Always verify important news through trusted, authoritative sources before sharing.*

## Developer
**Shahrina Khan**  
Computer Science Student — UMT Sialkot  
GitHub: [@Shahrina447](https://github.com/Shahrina447)
