<div align="center">

<img src="https://img.shields.io/badge/سچ_کی_پہچان-Recognition_of_Truth-7c3aed?style=for-the-badge&labelColor=0b1020" alt="SachAI tagline"/>

# SachAI — Urdu Fake News Detection System

**AI-powered misinformation detection for the Urdu language.**

[![Python](https://img.shields.io/badge/Python-3.12-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2_CPU-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/🤗_Transformers-xlm--RoBERTa-FFD21E?style=flat-square)](https://huggingface.co/xlm-roberta-base)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

</div>

---

## Overview

SachAI is a full-stack NLP web application that detects misinformation in Urdu news articles using a fine-tuned **xlm-RoBERTa** transformer model. A user pastes any Urdu text and receives an instant verdict — **REAL** or **FAKE** — with a confidence percentage and a human-readable explanation.

The model is fine-tuned on the **Ax-to-Grind Urdu** corpus, an expert-annotated Pakistani news dataset covering 15 domains. The backend runs entirely on CPU using PyTorch float32 — no GPU required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| HTTP Client | Axios |
| Backend | FastAPI 0.111, Python 3.12, Uvicorn |
| Validation | Pydantic v2 |
| Database | SQLite via aiosqlite |
| ML Framework | PyTorch 2.2 (CPU-only) |
| NLP | HuggingFace Transformers 4.40 |
| Base Model | xlm-roberta-base (278M parameters) |

---

## Project Structure

```
SachAI/
├── .gitignore
├── README.md
│
├── backend/
│   ├── main.py               # FastAPI app, routes, CORS, lifespan
│   ├── model.py              # xlm-RoBERTa inference (CPU)
│   ├── preprocess.py         # Urdu text normalization and cleaning
│   ├── schemas.py            # Pydantic request/response models
│   ├── database.py           # SQLite CRUD for prediction history
│   ├── requirements.txt
│   ├── .env.example          # Environment variable template
│   └── saved_model/          # Trained model weights (not in git)
│       ├── config.json
│       ├── tokenizer.json
│       ├── tokenizer_config.json
│       ├── special_tokens_map.json
│       └── model.safetensors   # 1.1 GB — download separately
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── history/
    │       └── page.tsx
    ├── components/
    │   ├── Navbar.tsx
    │   ├── HeroSection.tsx
    │   ├── DetectorSection.tsx
    │   ├── BatchAnalyzer.tsx
    │   ├── HowItWorks.tsx
    │   ├── StatsSection.tsx
    │   ├── FeaturesSection.tsx
    │   ├── MarqueeSection.tsx
    │   ├── CTASection.tsx
    │   └── Footer.tsx
    ├── lib/
    │   └── api.ts
    ├── package.json
    └── tailwind.config.ts
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Python | 3.12 |
| Node.js | 18+ |
| npm | 9+ |

---

## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/Shahrina447/SachAI.git
cd SachAI
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install CPU-only PyTorch first
pip install torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Place your trained model in backend/saved_model/
# (config.json, tokenizer.json, tokenizer_config.json,
#  special_tokens_map.json, model.safetensors)

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend

# Copy environment file
cp .env.example .env.local

npm install
npm run dev
# → http://localhost:3000
```

### 4. Verify

```bash
# Health check
curl http://localhost:8000/api/health

# Test a prediction
curl -s -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "سائنسدانوں نے دعویٰ کیا کہ گرم پانی سے کینسر مکمل طور پر ختم ہو جاتا ہے!"}' \
  | python3 -m json.tool
```

---

## Environment Variables

**`backend/.env`**

```env
HOST=127.0.0.1
PORT=8000
MODEL_PATH=./saved_model
REAL_THRESHOLD=0.55
TEMPERATURE=1.5
DB_PATH=./predictions.db
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Model

**Base model:** `xlm-roberta-base` — a multilingual transformer pre-trained on 100 languages including Urdu.

**Fine-tuning:** The model was fine-tuned on the **Ax-to-Grind Urdu** dataset using Google Colab (T4 GPU). Training used the HuggingFace `Trainer` API with the following configuration:

| Parameter | Value |
|---|---|
| Base model | xlm-roberta-base |
| Max token length | 128 |
| Batch size | 16 |
| Epochs | 3 |
| Learning rate | 2e-5 |
| Precision | float32 (CPU inference) |

**Label encoding:** `0 = FAKE` · `1 = REAL`

**Inference settings:**
- Temperature scaling: `1.5` (prevents overconfident softmax)
- REAL threshold: `0.55` (model must be ≥55% confident to predict REAL)

The trained model weights (`model.safetensors`) are not stored in this repository due to file size (1.1 GB). Place the trained model files in `backend/saved_model/` before running.



The model was evaluated on a balanced held-out test set of 1000 samples (500 FAKE + 500 TRUE) from the combined dataset:

| Metric | Value |
|---|---|
| Accuracy | **94.40%** |
| Precision | 0.9784 |
| Recall | 0.9080 |
| F1 Score | 0.9419 |

**Confusion Matrix (FAKE = positive class):**

| | Predicted FAKE | Predicted TRUE |
|---|---|---|
| Actual FAKE | 454 (TP) | 46 (FN) |
| Actual TRUE | 10 (FP) | 490 (TN) |

The model correctly identifies 90.8% of fake news with very few false alarms on real news (precision 97.8%). The model was retrained on a combined dataset of Ax-to-Grind Urdu and Hook & Bait Urdu to improve cross-domain generalization, improving accuracy from 74.5% (single dataset) to 94.4%.

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/predict` | Analyze a single Urdu text |
| `POST` | `/api/predict/batch` | Analyze up to 10 texts |
| `GET` | `/api/history` | Fetch last 50 predictions |
| `DELETE` | `/api/history/{id}` | Delete a specific prediction |
| `DELETE` | `/api/history` | Clear all predictions |

### POST /api/predict

**Request:**
```json
{ "text": "اردو خبر کا متن یہاں — 10 سے 1000 حروف" }
```

**Response:**
```json
{
  "prediction": "FAKE",
  "confidence": 0.997,
  "confidence_real": 0.003,
  "confidence_fake": 0.997,
  "verdict_text": "✗ Strong misinformation indicators detected.",
  "prediction_id": "uuid-v4",
  "timestamp": "2025-06-19T10:00:00"
}
```

**Error codes:**

| Status | Reason |
|---|---|
| `400` | Text shorter than 10 characters |
| `400` | Text longer than 1000 characters |
| `422` | Malformed request body |

---

## Dataset

| Dataset | Samples | Role | Source |
|---|---|---|---|
| Ax-to-Grind Urdu | 10,083 | Training & validation | [arXiv:2403.14037](https://arxiv.org/abs/2403.14037) |
| Bend the Truth | 900 | Cross-domain testing | [GitHub/MaazAmjad](https://github.com/MaazAmjad/Datasets-for-Urdu-news) |

Dataset files are not included in this repository. Download them separately from the sources above.

---

## Features

- Paste any Urdu news text and get an instant REAL / FAKE verdict
- Confidence percentage shown with a visual credibility meter
- 3 pre-loaded sample texts for quick testing
- Batch analysis — test up to 10 articles at once
- Full prediction history with per-item delete and bulk clear
- Native RTL Urdu rendering using Noto Nastaliq Urdu font
- Urdu character normalization (`ي → ی`, `ك → ک`, `ه → ہ`)
- CPU-only inference — runs on any machine without a GPU
- SQLite database for persistent prediction history

---

## Developer

**Shahrina Khan** — Computer Science Student, UMT Sialkot  
GitHub: [@Shahrina447](https://github.com/Shahrina447)
