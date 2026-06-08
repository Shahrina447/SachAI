"""
SachAI — xlm-RoBERTa Training Script (CPU-Only)
================================================
Run: python ml/train_cpu.py

CPU-ONLY: fp16=False, bf16=False, no_cuda=True, use_cpu=True
          DEVICE = torch.device("cpu") — hardcoded
"""

import os
import re
import sys
import json
import random
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ── FORCE CPU — NEVER CUDA ────────────────────────────────────────────────────
import torch
DEVICE = torch.device("cpu")  # hardcoded — never "cuda"
assert str(DEVICE) == "cpu", "Must run on CPU only"
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)
print(f"✓ Device: {DEVICE}")

# ── Hyperparameters — CPU Optimised ──────────────────────────────────────────
MODEL_NAME    = "xlm-roberta-base"
MAX_LENGTH    = 128
BATCH_SIZE    = 4
EVAL_BATCH    = 8
LEARNING_RATE = 2e-5
EPOCHS        = 3
WEIGHT_DECAY  = 0.01
WARMUP_RATIO  = 0.1
SEED          = 42
SAVE_DIR      = "./backend/saved_model"
RESULTS_DIR   = "./ml/results"

os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1 — Urdu Text Preprocessing
# ─────────────────────────────────────────────────────────────────────────────
URDU_NORM = {"ي": "ی", "ك": "ک", "ه": "ہ", "\u200c": "", "\u200d": "", "\u200b": ""}

def normalize_urdu(text: str) -> str:
    for k, v in URDU_NORM.items():
        text = text.replace(k, v)
    return text

def clean_urdu_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = normalize_urdu(text)
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2 — Dataset Loading
# ─────────────────────────────────────────────────────────────────────────────
def load_dataset_hf():
    """Try to load Ax-to-Grind Urdu from HuggingFace Hub."""
    from datasets import load_dataset
    # Try known dataset paths
    candidates = [
        ("harris/ax-to-grind-urdu", None),
        ("msarwar/urdu-fake-news", None),
    ]
    for path, split in candidates:
        try:
            ds = load_dataset(path, trust_remote_code=True)
            print(f"✓ Loaded dataset from HuggingFace: {path}")
            train_split = ds.get("train", list(ds.values())[0])
            df = train_split.to_pandas()
            # Normalise column names
            if "label" not in df.columns:
                for col in df.columns:
                    if col.lower() in ["labels", "class", "category"]:
                        df = df.rename(columns={col: "label"})
                        break
            if "text" not in df.columns:
                for col in df.columns:
                    if col.lower() in ["content", "news", "article", "body"]:
                        df = df.rename(columns={col: "text"})
                        break
            df = df[["text", "label"]].dropna()
            df["label"] = df["label"].astype(int)
            return df
        except Exception as e:
            print(f"  ✗ {path}: {e}")
    return None


def load_synthetic_dataset(n: int = 2000) -> pd.DataFrame:
    """
    Synthetic Urdu fake/real news dataset for local CPU training demo.
    Replace with real Ax-to-Grind dataset for production accuracy.
    n=2000 gives ~3-5 min training on CPU.
    """
    print(f"⚠  Using synthetic dataset ({n} samples). Replace with real data for best results.")

    REAL = [
        "وفاقی حکومت نے اعلان کیا کہ آئندہ مالی سال میں تعلیم کے بجٹ میں {p} فیصد اضافہ کیا جائے گا۔",
        "سپریم کورٹ نے {subj} کے خلاف درخواست پر فیصلہ محفوظ کر لیا۔",
        "پاکستان اور {country} کے درمیان {topic} پر مذاکرات کا آغاز ہو گیا۔",
        "محکمہ موسمیات نے موسمِ گرما میں {temp} درجے تک درجہ حرارت بڑھنے کا انتباہ جاری کر دیا۔",
        "قومی اسمبلی نے {bill} بل کثرتِ رائے سے منظور کر لیا۔",
        "اسٹیٹ بینک نے شرحِ سود میں {bp} بنیادی پوائنٹس کمی کا اعلان کیا۔",
        "وزیرِ اعظم نے {city} میں نئے {project} منصوبے کا افتتاح کیا۔",
        "پاکستان میں گندم کی پیداوار اس سال {pct} فیصد بڑھنے کا تخمینہ لگایا گیا ہے۔",
        "سی پیک منصوبوں پر {amount} ارب روپے کی سرمایہ کاری کی منظوری دی گئی۔",
        "ہائی کورٹ نے {party} کی درخواست مسترد کرتے ہوئے {ruling} کا حکم دیا۔",
        "{uni} نے نئے داخلہ فارم جاری کر دیے، آخری تاریخ {date} ہے۔",
        "پی ایس ایل کے {season} سیزن کے شیڈول کا اعلان کر دیا گیا۔",
        "پاکستان نے {sport} میں {opponent} کو {score} سے شکست دے دی۔",
        "نگران حکومت نے مہنگائی کنٹرول کے لیے {policy} پالیسی متعارف کروائی۔",
        "وزارتِ صحت نے {disease} سے بچاؤ کے لیے قومی مہم شروع کی۔",
    ]

    FAKE = [
        "سائنسدانوں نے دعویٰ کیا کہ {item} پینے سے {disease} مکمل طور پر ختم ہو جاتا ہے — یہ راز حکومت چھپا رہی ہے!",
        "حیرت انگیز! صرف {days} دن میں {kg} کلو وزن کم کریں — یہ نسخہ ڈاکٹر نہیں بتاتے",
        "{person} نے اعلان کیا کہ پاکستان {date} کو {country} میں ضم ہو جائے گا!",
        "خفیہ دستاویزات سے انکشاف: حکومت {year} سے عوام سے {item} چھپا رہی ہے",
        "معجزہ! {item} کا استعمال کریں اور {days} گھنٹوں میں {disease} سے نجات پائیں",
        "بریکنگ: {city} میں زلزلے کی وجہ سے {number} افراد ہلاک — حکومت اعداد چھپا رہی ہے!",
        "{celebrity} نے کہا کہ تمام مسلمانوں کو {country} چھوڑنا ہوگا — یہ اصلی ویڈیو",
        "شاکنگ ویڈیو: {politician} رات کو {place} میں {act} کرتے پکڑے گئے",
        "چاند پر {object} ملا! ناسا نے سچ چھپایا — یہ تصویر دیکھیں",
        "بڑا انکشاف: {product} کھانے سے کینسر ہوتا ہے — کمپنیاں جانتی تھیں!",
        "{country} نے پاکستان پر {type} حملے کی تیاری کر لی — فوری جنگ کا خطرہ!",
        "وائرل ویڈیو: {area} میں جن کا ظہور — لوگ گھر چھوڑ کر بھاگ گئے!",
        "ایکسکلوزیو: {politician} کے بینک اکاؤنٹ میں {amount} کروڑ روپے — ثبوت آ گئے",
        "خبردار! {product} استعمال کرنے سے {days} افراد ہلاک — فوری ہٹا لیں",
        "الرٹ: {date} کو پورے پاکستان میں بجلی {duration} گھنٹے بند رہے گی — تیاری کریں",
    ]

    REAL_FILL = {
        "p": ["15", "20", "25", "10", "30"],
        "subj": ["حکومت", "وزیرِ اعلیٰ", "ملزم", "کمپنی"],
        "country": ["چین", "سعودی عرب", "ترکی", "ایران"],
        "topic": ["تجارت", "سلامتی", "توانائی", "زراعت"],
        "temp": ["42", "45", "38", "40"],
        "bill": ["مالیاتی", "تعلیمی", "صحت", "توانائی"],
        "bp": ["50", "100", "150", "200"],
        "city": ["کراچی", "لاہور", "اسلام آباد", "پشاور"],
        "project": ["پانی", "بجلی", "سڑک", "اسپتال"],
        "pct": ["5", "8", "12", "15"],
        "amount": ["20", "50", "100", "200"],
        "party": ["درخواست گزار", "مدعی", "حکومت"],
        "ruling": ["رہائی", "ضمانت", "سماعت جاری"],
        "uni": ["پنجاب یونیورسٹی", "کراچی یونیورسٹی", "QAU"],
        "date": ["30 جون", "15 جولائی", "1 اگست"],
        "season": ["دسویں", "گیارہویں", "نویں"],
        "sport": ["کرکٹ", "ہاکی", "فٹبال"],
        "opponent": ["بھارت", "آسٹریلیا", "انگلینڈ"],
        "score": ["5 وکٹ", "10 رنز", "3-1"],
        "policy": ["قیمت کنٹرول", "سبسڈی", "ٹیکس چھوٹ"],
        "disease": ["ڈینگی", "کووڈ", "ہیپاٹائٹس"],
    }

    FAKE_FILL = {
        "item": ["گرم پانی", "لہسن", "شہد", "سرکہ"],
        "disease": ["کینسر", "ذیابطیس", "بلڈ پریشر"],
        "days": ["3", "7", "10", "5"],
        "kg": ["5", "10", "15", "20"],
        "person": ["عمران خان", "وزیرِ اعظم", "چیف جسٹس"],
        "date": ["اگلے ماہ", "2025 میں", "دسمبر"],
        "country": ["بھارت", "اسرائیل", "امریکہ"],
        "year": ["2010", "2015", "2020"],
        "number": ["500", "1000", "200"],
        "celebrity": ["ملالہ", "عمران خان", "ایک بڑا لیڈر"],
        "politician": ["وزیرِ اعظم", "وزیرِ خزانہ", "گورنر"],
        "place": ["لاہور", "کراچی", "پاکستان"],
        "act": ["رشوت لیتے", "غلط کام کرتے", "دھوکہ دیتے"],
        "object": ["اجنبی مخلوق", "پرانی تہذیب", "انجانا پتھر"],
        "product": ["چپس", "کولا", "فاسٹ فوڈ"],
        "type": ["میزائل", "سائبر", "فوجی"],
        "area": ["لاہور", "کراچی", "ملتان"],
        "amount": ["50", "100", "500"],
        "duration": ["12", "24", "48"],
    }

    def fill(template, fill_dict):
        result = template
        for k, v in fill_dict.items():
            if "{" + k + "}" in result:
                result = result.replace("{" + k + "}", random.choice(v))
        return result

    texts, labels = [], []
    per_class = n // 2

    for _ in range(per_class):
        t = fill(random.choice(REAL), REAL_FILL)
        texts.append(t)
        labels.append(0)  # REAL

    for _ in range(per_class):
        t = fill(random.choice(FAKE), FAKE_FILL)
        texts.append(t)
        labels.append(1)  # FAKE

    df = pd.DataFrame({"text": texts, "label": labels})
    df = df.sample(frac=1, random_state=SEED).reset_index(drop=True)
    return df


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3 — Load + Split Data
# ─────────────────────────────────────────────────────────────────────────────
print("\n📥 Loading dataset...")
df = load_dataset_hf()
if df is None:
    df = load_synthetic_dataset(n=2000)

df["text"] = df["text"].apply(clean_urdu_text)
df = df[df["text"].str.len() >= 10].reset_index(drop=True)

print(f"✓ Total samples : {len(df)}")
print(f"  REAL (0)      : {(df['label']==0).sum()}")
print(f"  FAKE (1)      : {(df['label']==1).sum()}")

from sklearn.model_selection import train_test_split

train_df, temp_df = train_test_split(df, test_size=0.2, random_state=SEED, stratify=df["label"])
val_df,  test_df  = train_test_split(temp_df, test_size=0.5, random_state=SEED, stratify=temp_df["label"])
print(f"✓ Split: train={len(train_df)}, val={len(val_df)}, test={len(test_df)}")

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4 — Tokenization
# ─────────────────────────────────────────────────────────────────────────────
from transformers import AutoTokenizer
from datasets import Dataset as HFDataset

print(f"\n🔤 Loading tokenizer: {MODEL_NAME}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
print("✓ Tokenizer loaded")

def tokenize_fn(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH,
    )

COLS = ["input_ids", "attention_mask", "label"]

def make_hf_dataset(df_slice):
    ds = HFDataset.from_pandas(df_slice[["text", "label"]].reset_index(drop=True))
    ds = ds.map(tokenize_fn, batched=True)
    ds.set_format(type="torch", columns=COLS)
    return ds

print("⚙  Tokenizing...")
train_dataset = make_hf_dataset(train_df)
val_dataset   = make_hf_dataset(val_df)
test_dataset  = make_hf_dataset(test_df)
print("✓ Tokenization complete")

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5 — Model on CPU
# ─────────────────────────────────────────────────────────────────────────────
from transformers import AutoModelForSequenceClassification

print(f"\n🤖 Loading model: {MODEL_NAME} on CPU...")
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=2,
    id2label={0: "REAL", 1: "FAKE"},
    label2id={"REAL": 0, "FAKE": 1},
    # NO torch_dtype=torch.float16 — float32 required for CPU
)
# No .to("cuda") — model stays on CPU by default
print(f"✓ Model loaded | params: {sum(p.numel() for p in model.parameters()):,}")
print(f"  Device check: {next(model.parameters()).device}")  # should print cpu

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6 — Training
# ─────────────────────────────────────────────────────────────────────────────
from transformers import TrainingArguments, Trainer, EarlyStoppingCallback
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, matthews_corrcoef

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy":  round(accuracy_score(labels, preds), 4),
        "f1":        round(f1_score(labels, preds, average="macro"), 4),
        "precision": round(precision_score(labels, preds, average="macro", zero_division=0), 4),
        "recall":    round(recall_score(labels, preds, average="macro", zero_division=0), 4),
        "mcc":       round(matthews_corrcoef(labels, preds), 4),
    }

training_args = TrainingArguments(
    output_dir=RESULTS_DIR,
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=EVAL_BATCH,
    learning_rate=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY,
    warmup_ratio=WARMUP_RATIO,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,
    fp16=False,                   # ← CPU: MUST be False
    bf16=False,                   # ← CPU: MUST be False
    no_cuda=True,                 # ← CPU: force CPU
    use_cpu=True,                 # ← CPU: HuggingFace 4.x flag
    dataloader_pin_memory=False,  # ← CPU: no pinned memory
    logging_steps=25,
    seed=SEED,
    report_to="none",
    save_total_limit=1,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
)

steps_per_epoch = len(train_dataset) // BATCH_SIZE
total_steps = steps_per_epoch * EPOCHS
print(f"\n🚀 Training on CPU — {total_steps} total steps")
print(f"   Estimated time: ~{total_steps * 2 // 60} min on CPU (varies by machine)")
print("─" * 60)

trainer.train()

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7 — Evaluation
# ─────────────────────────────────────────────────────────────────────────────
from sklearn.metrics import classification_report, confusion_matrix

print("\n📊 Evaluating on test set...")
pred_output = trainer.predict(test_dataset)
preds  = np.argmax(pred_output.predictions, axis=-1)
labels_arr = pred_output.label_ids

print("\n── Classification Report ──")
print(classification_report(labels_arr, preds, target_names=["REAL", "FAKE"]))

metrics = {
    "accuracy":  round(accuracy_score(labels_arr, preds), 4),
    "f1_macro":  round(f1_score(labels_arr, preds, average="macro"), 4),
    "precision": round(precision_score(labels_arr, preds, average="macro", zero_division=0), 4),
    "recall":    round(recall_score(labels_arr, preds, average="macro", zero_division=0), 4),
    "mcc":       round(matthews_corrcoef(labels_arr, preds), 4),
}
print("\n── Final Metrics ──")
for k, v in metrics.items():
    print(f"  {k:12s}: {v}")

# Save metrics JSON
with open(os.path.join(RESULTS_DIR, "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

# Confusion matrix (text)
cm = confusion_matrix(labels_arr, preds)
print(f"\n  Confusion Matrix:\n  {cm}")

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8 — Save Model
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n💾 Saving model to {SAVE_DIR}...")
model.save_pretrained(SAVE_DIR)
tokenizer.save_pretrained(SAVE_DIR)

print("✓ Saved files:")
total_size = 0
for f in sorted(os.listdir(SAVE_DIR)):
    size = os.path.getsize(os.path.join(SAVE_DIR, f))
    total_size += size
    print(f"   {f:45s}  {size/1e6:.1f} MB")
print(f"   Total: {total_size/1e6:.0f} MB")

# ─────────────────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("✅ Training complete!")
print(f"   Model saved  → {SAVE_DIR}")
print(f"   Metrics      → {RESULTS_DIR}/metrics.json")
print("\nNext steps:")
print("  1. Set DEMO_MODE = False in backend/model.py")
print("  2. Run: cd backend && uvicorn main:app --reload --port 8000")
print("=" * 60)
