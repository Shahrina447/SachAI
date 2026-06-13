import os
import aiosqlite
from typing import List
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DB_PATH", "./predictions.db")


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                text_preview TEXT,
                prediction TEXT,
                confidence REAL,
                linguistic_score REAL,
                source_score REAL,
                sentiment_score REAL,
                fact_score REAL,
                full_text TEXT,
                timestamp TEXT
            )
        """)
        await db.commit()


async def save_prediction(data: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT OR REPLACE INTO predictions
            VALUES (?,?,?,?,?,?,?,?,?,?)
            """,
            (
                data["prediction_id"],
                data["text_preview"],
                data["prediction"],
                data["confidence"],
                data["linguistic_score"],
                data["source_score"],
                data["sentiment_score"],
                data["fact_score"],
                data["full_text"],
                data["timestamp"],
            ),
        )
        await db.commit()


async def get_history(limit: int = 50) -> List[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, text_preview, prediction, confidence, timestamp "
            "FROM predictions ORDER BY timestamp DESC LIMIT ?",
            (limit,),
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def delete_prediction(id: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("DELETE FROM predictions WHERE id=?", (id,))
        await db.commit()
        return cursor.rowcount > 0


async def clear_all_predictions():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM predictions")
        await db.commit()
