"""
Evaluate xlmroberta_urdu_best.pt on 400 stratified samples from test.csv

Usage:
    uv run python evaluate.py

CSV label convention: 0 = REAL, 1 = FAKE
Model output logits:  auto-detected by probing a known FAKE/REAL sample
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

import pandas as pd
import torch
import torch.nn.functional as F
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    f1_score,
    matthews_corrcoef,
)

sys.path.insert(0, str(Path(__file__).parent))

from app.config import DEVICE, MAX_LEN
from app.models.loader import load_model

# ── Config ─────────────────────────────────────────────────────────────────────
CSV_PATH   = Path(__file__).parent / "test.csv"
N_SAMPLES  = 400      # 200 REAL + 200 FAKE, stratified
BATCH_SIZE = 16
SEED       = 42


def probe_label_order(df: pd.DataFrame, tokenizer, model) -> int:
    """
    Run one FAKE and one REAL sample through the model and return
    which output index (0 or 1) corresponds to FAKE.

    Returns:
        fake_idx — the logit index the model uses for FAKE news
    """
    # pick one clear FAKE and one clear REAL from the dataset
    fake_text = df[df["label"] == 1]["News Items"].iloc[0]
    real_text = df[df["label"] == 0]["News Items"].iloc[0]

    results = {}
    for name, text in [("fake", fake_text), ("real", real_text)]:
        inp = tokenizer(
            text, return_tensors="pt",
            truncation=True, max_length=MAX_LEN, padding=True
        ).to(DEVICE)
        with torch.no_grad():
            logits = model(**inp).logits
        probs = F.softmax(logits, dim=-1).squeeze()
        results[name] = probs.tolist()

    # whichever index is higher for the FAKE sample is the FAKE index
    fake_idx = int(results["fake"][1] > results["fake"][0])
    print(f"  Label probe → FAKE sample probs: {[round(p,3) for p in results['fake']]}")
    print(f"  Label probe → REAL sample probs: {[round(p,3) for p in results['real']]}")
    print(f"  Detected FAKE index: {fake_idx}  (REAL index: {1 - fake_idx})")
    return fake_idx


def predict_batch(
    texts: list[str],
    tokenizer,
    model,
    fake_idx: int,
) -> tuple[list[int], list[float]]:
    """
    Returns:
        y_pred  — list of ints, 1=FAKE 0=REAL  (matches CSV label)
        y_prob  — fake probability for each sample (for AUC)
    """
    all_preds: list[int]   = []
    all_probs: list[float] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        inputs = tokenizer(
            batch,
            return_tensors="pt",
            truncation=True,
            max_length=MAX_LEN,
            padding=True,
        ).to(DEVICE)

        with torch.no_grad():
            logits = model(**inputs).logits          # (B, 2)

        probs = F.softmax(logits, dim=-1)            # (B, 2)

        # Map model output → CSV label (0=REAL, 1=FAKE)
        raw_pred = torch.argmax(probs, dim=-1)       # model's raw index
        # if fake_idx==1: raw_pred is already in CSV space
        # if fake_idx==0: flip  (model 0 → CSV 1, model 1 → CSV 0)
        if fake_idx == 1:
            preds     = raw_pred.tolist()
            fake_prob = probs[:, 1].tolist()
        else:
            preds     = (1 - raw_pred).tolist()
            fake_prob = probs[:, 0].tolist()

        all_preds.extend(preds)
        all_probs.extend(fake_prob)

        done = min(i + BATCH_SIZE, len(texts))
        print(f"  Progress: [{done}/{len(texts)}]", end="\r", flush=True)

    print()
    return all_preds, all_probs


def main() -> None:
    print(f"\n{'='*62}")
    print("   SachAI  —  Model Evaluation on 400 Samples")
    print(f"{'='*62}")

    # ── Load & sample CSV ───────────────────────────────────────────────────
    df = pd.read_csv(CSV_PATH)
    per_class = N_SAMPLES // 2
    real_df   = df[df["label"] == 0].sample(n=per_class, random_state=SEED)
    fake_df   = df[df["label"] == 1].sample(n=per_class, random_state=SEED)
    sample    = pd.concat([real_df, fake_df]).sample(frac=1, random_state=SEED)

    texts  = sample["News Items"].astype(str).tolist()
    y_true = sample["label"].tolist()

    print(f"\n  Dataset  : {CSV_PATH.name}  ({len(df):,} total rows)")
    print(f"  Sampled  : {len(sample)} rows — 200 REAL + 200 FAKE (stratified)")
    print(f"  Device   : {DEVICE}")

    # ── Load model ──────────────────────────────────────────────────────────
    print(f"\n→ Loading model …")
    t0 = time.time()
    tokenizer, model = load_model()
    load_time = time.time() - t0
    print(f"  Loaded in {load_time:.1f}s")

    # ── Auto-detect label order ─────────────────────────────────────────────
    print(f"\n→ Probing label order …")
    fake_idx = probe_label_order(df, tokenizer, model)

    # ── Inference ───────────────────────────────────────────────────────────
    print(f"\n→ Running inference (batch_size={BATCH_SIZE}) …")
    t1 = time.time()
    y_pred, y_prob = predict_batch(texts, tokenizer, model, fake_idx)
    infer_time = time.time() - t1
    print(f"  Done in {infer_time:.1f}s  ({len(texts) / infer_time:.0f} samples/sec)")

    # ── Metrics ─────────────────────────────────────────────────────────────
    acc      = accuracy_score(y_true, y_pred)
    f1_macro = f1_score(y_true, y_pred, average="macro")
    f1_fake  = f1_score(y_true, y_pred, pos_label=1, average="binary")
    f1_real  = f1_score(y_true, y_pred, pos_label=0, average="binary")
    mcc      = matthews_corrcoef(y_true, y_pred)
    auc      = roc_auc_score(y_true, y_prob)
    cm       = confusion_matrix(y_true, y_pred)
    report   = classification_report(
        y_true, y_pred,
        target_names=["REAL (0)", "FAKE (1)"],
        digits=4,
    )
    tn, fp, fn, tp = cm.ravel()

    print(f"\n{'='*62}")
    print("   RESULTS")
    print(f"{'='*62}\n")
    print(f"  Accuracy          : {acc * 100:.2f}%")
    print(f"  ROC-AUC           : {auc:.4f}")
    print(f"  MCC               : {mcc:.4f}")
    print(f"  F1 (macro avg)    : {f1_macro:.4f}")
    print(f"  F1 — FAKE class   : {f1_fake:.4f}")
    print(f"  F1 — REAL class   : {f1_real:.4f}")
    print(f"\n  Confusion Matrix  (rows=true, cols=predicted):")
    print(f"                   Pred REAL   Pred FAKE")
    print(f"  True REAL        {tn:>9,}   {fp:>9,}")
    print(f"  True FAKE        {fn:>9,}   {tp:>9,}")
    print(f"\n  Per-class Report:\n")
    for line in report.splitlines():
        print(f"    {line}")
    print(f"\n{'='*62}")
    print(f"  Model load: {load_time:.1f}s  |  Inference: {infer_time:.1f}s  |  {len(texts)/infer_time:.0f} samples/sec")
    print(f"{'='*62}\n")


if __name__ == "__main__":
    main()
