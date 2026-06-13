'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Trash2, RotateCcw, ArrowLeft, Brain, AlertTriangle } from 'lucide-react'
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem } from '@/lib/api'

function badgeClass(prediction: string) {
  if (prediction === 'REAL') return 'badge-real'
  if (prediction === 'FAKE') return 'badge-fake'
  return 'badge-mixed'
}

function formatDate(ts: string) {
  try {
    return format(new Date(ts), 'dd MMM yyyy, HH:mm')
  } catch {
    return ts
  }
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory()
      setItems(data)
    } catch {
      setError('Could not connect to backend. Make sure the FastAPI server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await deleteHistoryItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      // silently ignore
    } finally {
      setDeleting(null)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Clear all prediction history? This cannot be undone.')) return
    setClearing(true)
    try {
      await clearHistory()
      setItems([])
    } catch {
   
    } finally {
      setClearing(false)
    }
  }

  // Stats derived from items
  const realCount = items.filter((i) => i.prediction === 'REAL').length
  const fakeCount = items.filter((i) => i.prediction === 'FAKE').length
  const mixedCount = items.filter((i) => i.prediction === 'MIXED').length
  const avgConf = items.length
    ? Math.round((items.reduce((s, i) => s + i.confidence, 0) / items.length) * 100)
    : 0

  return (
    <div className="relative min-h-screen">
      {/* Background orbs */}
      <div className="orb" style={{ width: '350px', height: '350px', background: '#7c3aed', top: '-80px', left: '-80px' }} />
      <div className="orb" style={{ width: '300px', height: '300px', background: '#06b6d4', top: '200px', right: '-100px' }} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg btn-primary flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold gradient-text">SachAI</span>
            </div>
          </div>
          <h1 className="text-sm font-semibold text-slate-300">Prediction History</h1>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: items.length, color: '#a78bfa' },
            { label: 'Real', value: realCount, color: '#34d399' },
            { label: 'Fake', value: fakeCount, color: '#f87171' },
            { label: 'Avg Conf.', value: `${avgConf}%`, color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold mb-1" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            Past Analyses{' '}
            {!loading && (
              <span className="text-sm text-slate-500 font-normal">({items.length} records)</span>
            )}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refresh
            </button>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearing ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="loader" />
          </div>
        )}

        {!loading && error && (
          <div className="glass rounded-2xl p-8 text-center border border-amber-500/20">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-2">Backend Unavailable</p>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            >
              Go to Detector
            </Link>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-2">No predictions yet</p>
            <p className="text-slate-600 text-sm mb-6">Analyze an Urdu article to see results here.</p>
            <Link
              href="/#detector"
              className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
            >
              Analyze Now
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-white/5 hover:border-purple-500/20 transition-colors"
              >
                {/* Prediction badge */}
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${badgeClass(item.prediction)}`}
                >
                  {item.prediction}
                </span>

                {/* Text preview */}
                <p className="urdu flex-1 text-slate-300 text-sm line-clamp-1 min-w-0">
                  {item.text_preview}
                </p>

                {/* Confidence */}
                <span className="shrink-0 text-xs text-slate-500">
                  {Math.round(item.confidence * 100)}% conf.
                </span>

                {/* Timestamp */}
                <span className="shrink-0 text-xs text-slate-600">
                  {formatDate(item.timestamp)}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  aria-label="Delete"
                >
                  {deleting === item.id ? (
                    <div className="loader !w-4 !h-4 !border-2" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
