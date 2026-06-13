import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface PredictResponse {
  prediction: 'FAKE' | 'REAL' | 'MIXED'
  confidence: number
  confidence_real: number
  confidence_fake: number
  linguistic_score: number
  source_score: number
  sentiment_score: number
  fact_score: number
  verdict_text: string
  prediction_id: string
  timestamp: string
}

export interface HistoryItem {
  id: string
  text_preview: string
  prediction: string
  confidence: number
  timestamp: string
}

export async function analyzeNews(text: string): Promise<PredictResponse> {
  const { data } = await axios.post<PredictResponse>(`${BASE}/api/predict`, { text })
  return data
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await axios.get<HistoryItem[]>(`${BASE}/api/history`)
  return data
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await axios.delete(`${BASE}/api/history/${id}`)
}

export async function clearHistory(): Promise<void> {
  await axios.delete(`${BASE}/api/history`)
}
