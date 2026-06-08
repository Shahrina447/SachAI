"""
SachAI — Model Evaluation Script
Tests the trained xlm-RoBERTa model on diverse Urdu samples
"""

import sys
import torch
import numpy as np
sys.path.insert(0, '/home/shahrina-khan/NLP_project/backend')

from preprocess import clean_urdu_text

DEVICE = torch.device("cpu")
MODEL_PATH = "/home/shahrina-khan/NLP_project/backend/saved_model"

print("=" * 70)
print("  SachAI — Model Evaluation")
print("  xlm-RoBERTa fine-tuned on Ax-to-Grind Urdu (synthetic)")
print("=" * 70)

# ── Load model ────────────────────────────────────────────────────────────────
print("\n📦 Loading model from saved_model/...")
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float32,
)
model.to(DEVICE)
model.eval()
print(f"✓ Model loaded | device: {next(model.parameters()).device}")
print(f"  Architecture : xlm-roberta-base")
print(f"  Parameters   : {sum(p.numel() for p in model.parameters()):,}")
print(f"  Labels       : {model.config.id2label}")

# ── Inference function ────────────────────────────────────────────────────────
def predict(text: str) -> dict:
    cleaned = clean_urdu_text(text)
    inputs = tokenizer(
        cleaned,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
    real_p = round(probs[0].item() * 100, 1)
    fake_p = round(probs[1].item() * 100, 1)
    label  = "REAL" if real_p > fake_p else "FAKE"
    return {"label": label, "real": real_p, "fake": fake_p}

# ── Test Samples ──────────────────────────────────────────────────────────────
# Each sample has: text, expected label, category
SAMPLES = [
    # ── CLEARLY FAKE (misinformation patterns) ────────────────────────────────
    {
        "text": "سائنسدانوں نے دعویٰ کیا ہے کہ صرف ایک گلاس گرم پانی میں لیموں نچوڑ کر پینے سے کینسر مکمل طور پر ختم ہو جاتا ہے اور یہ راز حکومت چھپا رہی ہے!",
        "expected": "FAKE",
        "category": "Health misinformation"
    },
    {
        "text": "حیرت انگیز! صرف 3 دن میں 10 کلو وزن کم کریں — یہ نسخہ ڈاکٹر نہیں بتاتے اور کمپنیاں ہمیشہ سے چھپاتی آئی ہیں",
        "expected": "FAKE",
        "category": "Weight loss scam"
    },
    {
        "text": "خفیہ دستاویزات سے انکشاف: حکومت 2010 سے عوام سے پانی کا اصلی راز چھپا رہی ہے — مکمل طور پر جھوٹا بیانیہ",
        "expected": "FAKE",
        "category": "Conspiracy theory"
    },
    {
        "text": "شاکنگ ویڈیو: وزیرِ اعظم رات کو لاہور میں رشوت لیتے پکڑے گئے — یہ اصلی ویڈیو ابھی دیکھیں!",
        "expected": "FAKE",
        "category": "Political sensationalism"
    },
    {
        "text": "معجزہ! گھر میں موجود یہ پودا ذیابطیس کو مکمل طور پر ختم کر دیتا ہے — حیرت انگیز راز",
        "expected": "FAKE",
        "category": "Medical misinformation"
    },
    # ── CLEARLY REAL (journalistic / formal reporting patterns) ───────────────
    {
        "text": "وفاقی حکومت نے اعلان کیا ہے کہ آئندہ مالی سال میں تعلیم کے بجٹ میں 25 فیصد اضافہ کیا جائے گا تاکہ تعلیمی معیار کو بہتر بنایا جا سکے۔",
        "expected": "REAL",
        "category": "Government policy"
    },
    {
        "text": "موسمیاتی تبدیلیوں کے باعث پاکستان میں موسمِ گرما کا دورانیہ بڑھنے کا امکان ہے، محکمہ موسمیات نے انتباہ جاری کر دیا ہے۔",
        "expected": "REAL",
        "category": "Climate / official warning"
    },
    {
        "text": "سپریم کورٹ نے ملزم کی ضمانت درخواست مسترد کرتے ہوئے سماعت اگلے ہفتے تک ملتوی کر دی۔",
        "expected": "REAL",
        "category": "Legal / court reporting"
    },
    {
        "text": "اسٹیٹ بینک آف پاکستان نے شرحِ سود میں 50 بنیادی پوائنٹس کمی کا اعلان کیا، جس سے قرضوں کی سود کی شرح میں نمایاں کمی آئے گی۔",
        "expected": "REAL",
        "category": "Economic / banking news"
    },
    {
        "text": "پاکستان اور چین کے درمیان توانائی کے شعبے میں 20 ارب روپے کی سرمایہ کاری کے معاہدے پر دستخط ہو گئے۔",
        "expected": "REAL",
        "category": "International trade"
    },
    # ── MIXED / BORDERLINE ────────────────────────────────────────────────────
    {
        "text": "پاکستان میں مہنگائی کی شرح میں اضافہ ہو رہا ہے اور عوام مشکلات کا شکار ہیں — حکومت کو فوری اقدامات کرنے چاہئیں۔",
        "expected": "REAL",
        "category": "Economic opinion piece"
    },
    {
        "text": "نئی تحقیق سے پتہ چلا ہے کہ روزانہ 30 منٹ کی واک دل کی بیماریوں کا خطرہ کم کرتی ہے۔",
        "expected": "REAL",
        "category": "Health research (legitimate)"
    },
]

# ── Run inference ─────────────────────────────────────────────────────────────
print(f"\n{'─'*70}")
print(f"  Running inference on {len(SAMPLES)} test samples")
print(f"{'─'*70}\n")

correct = 0
results = []

for i, sample in enumerate(SAMPLES, 1):
    result = predict(sample["text"])
    match  = "✓" if result["label"] == sample["expected"] else "✗"
    if result["label"] == sample["expected"]:
        correct += 1
    results.append({**result, **sample, "match": match})

    print(f"[{i:02d}] {match} {result['label']:<5}  (expected: {sample['expected']:<5})")
    print(f"     REAL: {result['real']:5.1f}%  |  FAKE: {result['fake']:5.1f}%")
    print(f"     Category: {sample['category']}")
    # Show first 70 chars of text
    preview = sample["text"][:70] + ("…" if len(sample["text"]) > 70 else "")
    print(f"     Text: {preview}")
    print()

# ── Summary ───────────────────────────────────────────────────────────────────
accuracy = correct / len(SAMPLES) * 100
print("=" * 70)
print(f"  RESULTS SUMMARY")
print("=" * 70)
print(f"  Samples tested : {len(SAMPLES)}")
print(f"  Correct        : {correct}")
print(f"  Wrong          : {len(SAMPLES) - correct}")
print(f"  Accuracy       : {accuracy:.1f}%")

fake_samples  = [r for r in results if r["expected"] == "FAKE"]
real_samples  = [r for r in results if r["expected"] == "REAL"]
fake_correct  = sum(1 for r in fake_samples if r["label"] == "FAKE")
real_correct  = sum(1 for r in real_samples if r["label"] == "REAL")

print(f"\n  FAKE detection : {fake_correct}/{len(fake_samples)} correct ({fake_correct/len(fake_samples)*100:.0f}%)")
print(f"  REAL detection : {real_correct}/{len(real_samples)} correct ({real_correct/len(real_samples)*100:.0f}%)")

print("\n" + "=" * 70)
print("  DATASET INFORMATION")
print("=" * 70)
print("""
  Training Dataset: Ax-to-Grind Urdu (SYNTHETIC VERSION)
  ─────────────────────────────────────────────────────
  ⚠ IMPORTANT NOTE:
  The real Ax-to-Grind Urdu dataset (arXiv:2403.14037) was NOT available
  on HuggingFace Hub at training time. The script automatically fell back
  to a SYNTHETIC dataset generated from Urdu news templates.

  Synthetic Dataset Details:
  ├── Total samples    : 2,000
  ├── REAL samples     : 1,000  (formal govt/court/economic report patterns)
  ├── FAKE samples     : 1,000  (sensational/conspiracy/medical scam patterns)
  ├── Train split      : 1,600 (80%)
  ├── Validation split :   200 (10%)
  └── Test split       :   200 (10%)

  REAL pattern templates:
    - وفاقی حکومت نے اعلان کیا... (Government announcements)
    - سپریم کورٹ نے فیصلہ... (Court rulings)
    - اسٹیٹ بینک نے... (SBP/banking news)
    - محکمہ موسمیات نے... (Met Office warnings)

  FAKE pattern templates:
    - سائنسدانوں نے دعویٰ کیا کہ... (Fake health claims)
    - حیرت انگیز! صرف X دن میں... (Sensational weight/health scams)
    - خفیہ دستاویزات سے انکشاف... (Conspiracy theories)
    - حکومت یہ راز چھپا رہی ہے... (Government conspiracy)

  Why Metrics = 1.0 (100%):
  ─────────────────────────
  The model achieved perfect scores because:
  1. Synthetic data has very clear, distinct patterns
  2. FAKE texts always use specific words: دعویٰ, راز, چھپا, حیرت انگیز
  3. REAL texts always use formal patterns: نے اعلان کیا, نے فیصلہ دیا
  4. No ambiguous/borderline cases in training data
  5. Model essentially learned keyword detection, not true semantics

  For PRODUCTION quality on real Pakistani news:
  - Use actual Ax-to-Grind Urdu dataset (10,083 samples)
  - Request access: arXiv:2403.14037 / harris et al.
  - Expected real accuracy: ~85-91% (as reported in paper)
""")
print("=" * 70)
print("  MODEL ARCHITECTURE")
print("=" * 70)
print("""
  Base Model    : xlm-roberta-base (Facebook/Meta AI)
  Parameters    : 278,045,186 (~278M)
  Architecture  : XLMRobertaForSequenceClassification
    ├── Encoder : 12 transformer layers
    ├── Hidden  : 768 dimensions
    ├── Heads   : 12 attention heads
    ├── Vocab   : 250,002 tokens (SentencePiece BPE)
    └── Classif : Linear(768 → 2) → softmax

  Training Config:
    ├── Max length    : 128 tokens
    ├── Batch size    : 4
    ├── Epochs        : 1 (early stopping triggered at epoch 1)
    ├── Learning rate : 2e-5 with warmup
    ├── Optimizer     : AdamW (weight_decay=0.01)
    ├── Device        : CPU (float32)
    └── fp16/bf16     : DISABLED (CPU-only)

  Inference:
    ├── Input  : Raw Urdu text (cleaned by preprocess.py)
    ├── Output : P(REAL), P(FAKE) via softmax
    └── Device : CPU, torch.no_grad()
""")
