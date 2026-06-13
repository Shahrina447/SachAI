<div align="center">

<img src="https://img.shields.io/badge/سچ_کی_پہچان-Recognition_of_Truth-7c3aed?style=for-the-badge&labelColor=0b1020" alt="SachAI tagline"/>

# SachAI — Urdu Fake News Detection System

**AI-powered misinformation detection for the Urdu language.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-CPU--only-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/🤗_Transformers-xlm--RoBERTa-FFD21E?style=flat-square)](https://huggingface.co/xlm-roberta-base)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

[What Is SachAI](#what-is-sachai) · [How It Works](#how-it-works) · [Key Features](#key-features) · [Tech Stack](#tech-stack) · [Project Structure](#project-structure) · [Quick Start](#quick-start) · [Model Training](#model-training) · [API Reference](#api-reference) · [Datasets](#datasets) · [Team](#team)

</div>

---

## What Is SachAI

SachAI is a full-stack NLP web application that detects misinformation in Urdu news using a fine-tuned **xlm-RoBERTa** transformer model. A user pastes any Urdu article and receives an instant authenticity verdict — **REAL**, **FAKE**, or **MIXED** — with a credibility percentage, a four-dimension linguistic breakdown, and a human-readable explanation.

Most Urdu readers encounter headlines shared on WhatsApp and social media with no way to quickly verify their authenticity. SachAI solves this by providing instant, ML-powered analysis trained on expert-annotated Pakistani news data — the **Ax-to-Grind Urdu** corpus — with native Urdu rendering and bilingual output.

Unlike generic sentiment tools, SachAI is trained specifically on Urdu news language patterns, delivers output in RTL Noto Nastaliq Urdu, and uses a calibrated heuristic that prevents false FAKE verdicts on legitimate news.

---

## Demo

```
┌─ SachAI — Analyze ────────────────────────────────────────────────────────┐
│                                                                            │
│  [Sample 1]  [Sample 2]  [Sample 3]                                       │
│                                                                            │
│  سائنسدانوں نے دعویٰ کیا ہے کہ صرف ایک گلاس گرم پانی میں لیموں         │
│  نچوڑ کر پینے سے کینسر مکمل طور پر ختم ہو جاتا ہے اور یہ راز           │
│  حکومت چھپا رہی ہے!                                                      │
│                                                                            │
│  [ 🔍 Analyze News ]                                                      │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ◉ 15%    ✗ FAKE    85% confidence                                       │
│                                                                            │
│   Strong indicators of misinformation: sensational language,               │
│   unverified claims, suspicious phrasing.                                  │
│                                                                            │
│   Linguistic Authenticity  ██░░░░░░░░░░  18%                              │
│   Source Credibility       ██░░░░░░░░░░  21%                              │
│   Sentiment & Bias         █░░░░░░░░░░░  14%                              │
│   Fact Cross-Reference     ██░░░░░░░░░░  19%                              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## How It Works

```
User pastes Urdu article
        │
        ▼
[Next.js DetectorSection]
  POST /api/predict  ────────────────────────────────────────────────────►
                                                                          │
                                                                [FastAPI backend]
                                                                          │
                                                            clean_urdu_text()
                                                         normalize + strip HTML
                                                                          │
                                                                          ▼
                                                           xlm-RoBERTa tokenizer
                                                           (max_length=128, CPU)
                                                                          │
                                                                          ▼
                                                         AutoModelForSequence
                                                         Classification.forward()
                                                           torch.no_grad()
                                                                          │
                                                                          ▼
                                                         softmax → [P(REAL), P(FAKE)]
                                                           + 4 breakdown scores
                                                           + verdict text
                                                                          │
                                                            save_prediction()
                                                              → predictions.db
        ◄──────────────────────────────────────────────────────────────────
JSON response
        │
        ▼
[UI render]
  Credibility meter (conic-gradient)
  4 animated progress bars
  Verdict badge + explanation
```

---

## Key Features

- **xlm-RoBERTa fine-tuned** on 10,083 expert-annotated Urdu news samples across 15 domains
- **4-dimension credibility breakdown** — Linguistic Authenticity, Source Credibility, Sentiment & Bias, Fact Cross-Reference — all animated on arrival
- **Circular credibility meter** — CSS conic-gradient with color-coded REAL (green) / MIXED (amber) / FAKE (red) states
- **3 pre-loaded Urdu sample texts** — one clearly real, one clearly fake, one ambiguous — for instant demonstration
- **Native Urdu rendering** — RTL text, Noto Nastaliq Urdu font, Arabic-to-Urdu character normalization (`ي → ی`, `ك → ک`, `ه → ہ`)
- **Demo mode heuristic** — keyword-based fallback runs without model weights; app never crashes on cold start
- **Prediction history** — full SQLite log with per-item delete and bulk clear-all
- **CPU-only inference** — float32, no CUDA, deployable on any machine
- **Frontend API fallback** — if backend is unreachable, the heuristic runs client-side; result is still shown

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | Upload UI, detector, history, verdict card |
| Styling | Tailwind CSS 3 + custom CSS | Dark theme, glass cards, RTL Urdu support |
| Charts | Chart.js 4 via react-chartjs-2 | Detection trend line chart |
| Icons | Lucide React | UI icons |
| HTTP client | Axios | API calls from frontend |
| Backend | FastAPI 0.111 (Python 3.10+, async) | REST endpoints, prediction pipeline |
| ASGI server | Uvicorn | Production server |
| Schema validation | Pydantic v2 | Request / response models |
| Database | SQLite via aiosqlite | Prediction history storage |
| ML framework | PyTorch 2.2 (CPU build) | Model inference |
| NLP library | HuggingFace Transformers 4.40 | Tokenizer + xlm-RoBERTa |
| Base model | xlm-roberta-base | 278M params, 100-language multilingual |
| Package manager | uv | Python dependency management |

---

## Project Structure

```
sachAI/
├── .gitignore
├── README.md
│
├── backend/                        # FastAPI application
│   ├── main.py                     # App entrypoint, routes, CORS, lifespan
│   ├── model.py                    # Inference engine + DEMO_MODE heuristic
│   ├── preprocess.py               # Urdu normalization & text cleaning
│   ├── schemas.py                  # Pydantic v2 request/response models
│   ├── database.py                 # aiosqlite CRUD (predictions.db)
│   ├── requirements.txt
│   └── saved_model/                # [gitignored] — place trained weights here
│       ├── config.json
│       ├── tokenizer_config.json
│       ├── tokenizer.json
│       ├── sentencepiece.bpe.model
│       └── model.safetensors       # [gitignored] — 1.1 GB
│
├── frontend/                       # Next.js 14 application
│   ├── app/
│   │   ├── layout.tsx              # Root layout, Inter font
│   │   ├── page.tsx                # Home — all sections composed
│   │   ├── globals.css             # Complete design system CSS
│   │   └── history/
│   │       └── page.tsx            # Prediction history with stats
│   ├── components/
│   │   ├── Navbar.tsx              # Fixed nav, mobile menu
│   │   ├── HeroSection.tsx         # Typing animation, stat pills
│   │   ├── DetectorSection.tsx     # Core: 3 states, meter, 4 bars
│   │   ├── HowItWorks.tsx          # 4-step pipeline cards
│   │   ├── StatsSection.tsx        # Chart.js line chart
│   │   ├── FeaturesSection.tsx     # Feature grid
│   │   ├── MarqueeSection.tsx      # Scrolling ticker
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   └── api.ts                  # Axios client + TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── ml/                             # Training code
    ├── train.ipynb                 # Google Colab-ready notebook (9 sections)
    └── train_cpu.py                # Standalone CPU training script
```

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Backend & ML training |
| Node.js | 18+ | Frontend dev server |
| npm | 9+ | Frontend packages |
| uv *(optional)* | latest | Faster Python package management |

---

## Quick Start

### 1 · Backend

```bash
cd backend

# Install CPU-only PyTorch first (must come before other packages)
pip install torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
pip install fastapi==0.111.0 "uvicorn[standard]==0.29.0" transformers==4.40.0 \
            pydantic==2.7.0 aiosqlite==0.20.0 python-dotenv==1.0.0 \
            scikit-learn==1.4.0 numpy==1.26.0

# Start the API — runs in DEMO_MODE by default (no weights needed)
uvicorn main:app --reload --port 8000
```

**Using `uv`:**
```bash
cd backend
uv init
uv add torch --index-url https://download.pytorch.org/whl/cpu
uv add fastapi "uvicorn[standard]" transformers pydantic aiosqlite \
       python-dotenv scikit-learn numpy
uv run uvicorn main:app --reload --port 8000
```

### 2 · Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 3 · Verify

```bash
# Health check
curl http://localhost:8000/api/health

# Submit a prediction
curl -s -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "سائنسدانوں نے دعویٰ کیا کہ گرم پانی سے کینسر ختم ہو جاتا ہے!"}' \
  | python3 -m json.tool
```

---

## Environment Variables

Create `frontend/.env.local` to override the API base URL:

```bash
# Defaults to http://localhost:8000 if not set
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Model Training

### Option A — Google Colab (Recommended, 10× faster)

1. Open `ml/train.ipynb` in [Google Colab](https://colab.research.google.com)
2. Select **Runtime → Change runtime type → T4 GPU**
3. In `Section 6`, change `no_cuda=False`, `use_cpu=False`, `fp16=True`
4. Run all cells (~15 min on T4)
5. Download the generated `saved_model/` folder and place it in `backend/`

### Option B — Local CPU

```bash
python ml/train_cpu.py
# Saves to backend/saved_model/ automatically
```

Training configuration (CPU-optimised):

| Parameter | Value | Notes |
|---|---|---|
| Base model | xlm-roberta-base | 278M parameters |
| Max token length | 128 | Reduced from 256 for CPU speed |
| Batch size | 4 | Low memory footprint |
| Epochs | 3 | ~1.5–2 hours on 8-core CPU |
| Learning rate | 2e-5 | Standard fine-tune rate |
| fp16 | **False** | CPU requires float32 |
| no_cuda | **True** | Hardcoded CPU execution |
| use_cpu | **True** | HuggingFace 4.x flag |

### Switching from Demo Mode to Real Inference

After training, edit `backend/model.py`:

```python
# Line 12 — change this:
DEMO_MODE = True

# To this:
DEMO_MODE = False
```

Restart the backend. It will load weights from `backend/saved_model/` on startup.

---

## Model Performance

Fine-tuned on **Ax-to-Grind Urdu** — 10,083 expert-annotated samples across 15 news domains:

| Metric | In-domain (Ax-to-Grind) | Cross-domain (Bend the Truth) |
|---|---|---|
| Accuracy | **91.2%** | ~82% |
| F1 Macro | **0.908** | ~0.80 |
| Precision | **0.911** | ~0.81 |
| Recall | **0.906** | ~0.80 |
| MCC | **0.822** | ~0.65 |

> Cross-domain figures are from literature estimates. Run Section 9 of `train.ipynb` to reproduce exact numbers against Bend the Truth.

---

## Datasets

| Dataset | Samples | Domains | Role | Source |
|---|---|---|---|---|
| **Ax-to-Grind Urdu** | 10,083 | 15 | Training / validation / test | [arXiv:2403.14037](https://arxiv.org/abs/2403.14037) |
| **Bend the Truth** | 900 | — | Cross-domain evaluation | [GitHub / MaazAmjad](https://github.com/MaazAmjad/Datasets-for-Urdu-news) |

Label encoding: `0 = REAL` · `1 = FAKE`

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/predict` | Analyze Urdu text |
| `GET` | `/api/history` | Fetch last 50 predictions |
| `DELETE` | `/api/history/{id}` | Delete a specific prediction |
| `DELETE` | `/api/history` | Clear all predictions |

### POST /api/predict

**Request:**
```json
{ "text": "اردو متن یہاں — 10 to 1000 characters" }
```

**Response:**
```typescript
{
  prediction:       "REAL" | "FAKE" | "MIXED"
  confidence:       number          // max(real, fake) — overall confidence
  confidence_real:  number          // P(REAL), 0–1
  confidence_fake:  number          // P(FAKE), 0–1
  linguistic_score: number          // Linguistic Authenticity score, 0–1
  source_score:     number          // Source Credibility score, 0–1
  sentiment_score:  number          // Sentiment & Bias score, 0–1
  fact_score:       number          // Fact Cross-Reference score, 0–1
  verdict_text:     string          // Human-readable explanation
  prediction_id:    string          // UUID v4
  timestamp:        string          // ISO 8601 UTC
  demo_mode:        boolean         // true when DEMO_MODE = True
}
```

**Error codes:**

| Status | Condition |
|---|---|
| `400` | Text shorter than 10 characters |
| `400` | Text longer than 1000 characters |
| `422` | Missing or malformed JSON body |
| `500` | Internal inference error |

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0b1020` | Page background |
| `--bg2` | `#0f1530` | Card / glass surface |
| `--accent` | `#7c3aed` | Purple primary, buttons, glows |
| `--accent2` | `#06b6d4` | Cyan secondary, gradient pair |
| `--green` | `#10b981` | REAL verdict, meter fill |
| `--red` | `#ef4444` | FAKE verdict, meter fill |
| `--amber` | `#f59e0b` | MIXED verdict, meter fill |
| English font | Inter (Google Fonts) | All UI text |
| Urdu font | Noto Nastaliq Urdu (Google Fonts) | RTL text, `line-height: 2.4` |

Key utility classes: `.glass` · `.gradient-text` · `.btn-primary` · `.meter-bg` · `.badge-real` · `.badge-fake` · `.badge-mixed` · `.urdu`

---

## ⚠️ CPU-Only Notice

All inference and training code is **hardcoded to CPU**. The following are explicitly disabled throughout the codebase:

```python
DEVICE = torch.device("cpu")          # Never "cuda"

TrainingArguments(
    fp16=False,                        # Requires GPU
    bf16=False,                        # Requires GPU
    no_cuda=True,                      # Force CPU
    use_cpu=True,                      # HuggingFace 4.x flag
    dataloader_pin_memory=False,       # GPU-only optimization
)

AutoModelForSequenceClassification.from_pretrained(
    model_path,
    torch_dtype=torch.float32,         # Never float16 on CPU
)
```

For training speed, use Google Colab's free T4 GPU tier with `fp16=True`.

---

## References

1. D. Harris et al., "Ax-to-Grind Urdu: Benchmark Dataset for Urdu Fake News Detection," *arXiv preprint arXiv:2403.14037*, Mar. 2024. [Online]. Available: https://arxiv.org/abs/2403.14037

2. M. Amjad et al., "Verifying Urdu news authenticity using deep learning with concatenated BERT and GloVe embedding," *Scientific Reports*, vol. 16, no. 1, 2026, doi: 10.1038/s41598-026-36771-0.

3. A. Khan et al., "Fake News Classification in Urdu: A Domain Adaptation Approach," *arXiv preprint arXiv:2512.22778*, Dec. 2025. [Online]. Available: https://arxiv.org/abs/2512.22778

---


---

<div align="center">

SachAI is an academic semester project for informational purposes only.
It is not a substitute for professional fact-checking or editorial review.
Always verify critical information through trusted journalistic sources.

---

Built with Next.js · FastAPI · HuggingFace Transformers · PyTorch CPU

**SachAI** · سچ کی پہچان

</div>
