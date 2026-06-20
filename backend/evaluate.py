"""
evaluate.py — Test the trained model against a labeled CSV file.

Usage:
    source venv/bin/activate
    python evaluate.py --file path/to/test.csv --text-col text --label-col label

Expected CSV format:
    text,label
    "خبر کا متن",FAKE
    "خبر کا متن",REAL

    Labels can be: FAKE/REAL or 0/1 (0=FAKE, 1=REAL)
"""

import argparse
import csv
import os
import sys
import torch
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "saved_model"))
REAL_THRESHOLD = float(os.getenv("REAL_THRESHOLD", "0.55"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "1.5"))
DEVICE = torch.device("cpu")


def load_model():
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    print(f"Loading model from '{MODEL_PATH}'...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_PATH, torch_dtype=torch.float32
    )
    model.to(DEVICE)
    model.eval()
    print(f"Model loaded. REAL_THRESHOLD={REAL_THRESHOLD}, TEMPERATURE={TEMPERATURE}\n")
    return tokenizer, model


def predict_text(text: str, tokenizer, model) -> tuple[str, float, float]:
    from preprocess import clean_urdu_text
    cleaned = clean_urdu_text(text)
    inputs = tokenizer(
        cleaned, return_tensors="pt",
        truncation=True, padding=True, max_length=128
    )
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits / TEMPERATURE, dim=-1)[0]
    fake_conf = round(probs[0].item(), 4)
    real_conf = round(probs[1].item(), 4)
    prediction = "REAL" if real_conf >= REAL_THRESHOLD else "FAKE"
    return prediction, real_conf, fake_conf


def normalize_label(label: str) -> str:
    """Normalize label to REAL or FAKE regardless of input format."""
    label = label.strip().upper()
    if label in ("1", "REAL", "TRUE"):
        return "REAL"
    elif label in ("0", "FAKE"):
        return "FAKE"
    else:
        raise ValueError(f"Unknown label: '{label}'. Expected FAKE/TRUE, FAKE/REAL, or 0/1.")


def evaluate(file_path: str, text_col: str, label_col: str, sample: int = None, seed: int = 42):
    import random
    random.seed(seed)

    # ── Load CSV ──────────────────────────────────────────────────────────────
    all_rows = []
    with open(file_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if text_col not in row or label_col not in row:
                print(f"ERROR: Columns '{text_col}' or '{label_col}' not found.")
                print(f"Available columns: {list(row.keys())}")
                sys.exit(1)
            label = row[label_col].strip().upper()
            if label not in ("FAKE", "TRUE", "REAL", "0", "1"):
                continue  # skip blank/header rows
            all_rows.append(row)

    # ── Balanced sampling ─────────────────────────────────────────────────────
    if sample:
        fake_rows = [r for r in all_rows if r[label_col].strip().upper() in ("FAKE", "0")]
        true_rows = [r for r in all_rows if r[label_col].strip().upper() in ("TRUE", "REAL", "1")]

        n = min(sample, len(fake_rows), len(true_rows))
        rows = random.sample(fake_rows, n) + random.sample(true_rows, n)
        random.shuffle(rows)
        print(f"Sampled {n} FAKE + {n} TRUE = {len(rows)} rows (balanced, seed={seed})\n")
    else:
        rows = all_rows
        print(f"Loaded all {len(rows)} samples from '{file_path}'\n")

    # ── Load model ────────────────────────────────────────────────────────────
    tokenizer, model = load_model()

    # ── Run predictions ───────────────────────────────────────────────────────
    results = []
    tp = fp = tn = fn = 0  # FAKE = positive class

    print(f"{'#':<5} {'True':<6} {'Pred':<6} {'Real%':<8} {'Fake%':<8} {'Text preview'}")
    print("-" * 70)

    for i, row in enumerate(rows, 1):
        text = row[text_col].strip()
        true_label = normalize_label(row[label_col])

        if len(text) < 10:
            print(f"{i:<5} SKIP — text too short: '{text[:40]}'")
            continue

        pred_label, real_conf, fake_conf = predict_text(text, tokenizer, model)
        correct = "✓" if pred_label == true_label else "✗"

        print(f"{i:<5} {true_label:<6} {pred_label:<6} {real_conf:<8.3f} {fake_conf:<8.3f} {correct} {text[:40]}")

        # Confusion matrix counts (FAKE = positive)
        if true_label == "FAKE" and pred_label == "FAKE":
            tp += 1
        elif true_label == "REAL" and pred_label == "FAKE":
            fp += 1
        elif true_label == "REAL" and pred_label == "REAL":
            tn += 1
        elif true_label == "FAKE" and pred_label == "REAL":
            fn += 1

        results.append({
            "text": text[:80],
            "true_label": true_label,
            "predicted": pred_label,
            "confidence_real": real_conf,
            "confidence_fake": fake_conf,
            "correct": pred_label == true_label,
        })

    # ── Metrics ───────────────────────────────────────────────────────────────
    evaluated = tp + fp + tn + fn
    correct_count = tp + tn
    accuracy = correct_count / evaluated if evaluated > 0 else 0

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)
    print(f"Total samples evaluated : {evaluated}")
    print(f"Correct predictions     : {correct_count}")
    print(f"Accuracy                : {accuracy * 100:.2f}%")
    print()
    print("Confusion Matrix (FAKE = positive class):")
    print(f"  True Positive  (FAKE → FAKE) : {tp}")
    print(f"  False Positive (REAL → FAKE) : {fp}")
    print(f"  True Negative  (REAL → REAL) : {tn}")
    print(f"  False Negative (FAKE → REAL) : {fn}")
    print()
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print("=" * 70)

    # ── Save results CSV ──────────────────────────────────────────────────────
    out_path = Path(file_path).stem + "_results.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nDetailed results saved to: {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate SachAI model on a test CSV")
    parser.add_argument("--file",      required=True,   help="Path to test CSV file")
    parser.add_argument("--text-col",  default="text",   help="Column name for text (default: text)")
    parser.add_argument("--label-col", default="label",  help="Column name for label (default: label)")
    parser.add_argument("--sample",    type=int, default=None,
                        help="Randomly sample N rows per class (balanced). E.g. --sample 100 = 100 FAKE + 100 TRUE")
    parser.add_argument("--seed",      type=int, default=42, help="Random seed (default: 42)")
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"ERROR: File not found: {args.file}")
        sys.exit(1)

    evaluate(args.file, args.text_col, args.label_col, args.sample, args.seed)
