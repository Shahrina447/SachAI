'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Trash2, RotateCcw, ArrowLeft, Brain, AlertTriangle } from 'lucide-react'
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem } from '@/lib/api'

const badgeClass = (p: string) =>
  p === 'REAL' ? 'badge-real' : p === 'FAKE' ? 'badge-fake' : 'badge-mixed'

const fmtDate = (ts: string) => { try { return format(new Date(ts), 'dd MMM yyyy, HH:mm') } catch { return ts } }

export default function HistoryPage() {
  const [items,       setItems]       = useState<HistoryItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [clearing,    setClearing]    = useState(false)
  const [clearError,  setClearError]  = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError(null)
    try { setItems(await getHistory()) }
    catch { setError('Could not connect to backend. Make sure the FastAPI server is running on port 8000.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleDelete = async (id: string) => {
    setDeleting(id); setDeleteError(null)
    try { await deleteHistoryItem(id); setItems(p => p.filter(i => i.id !== id)) }
    catch { setDeleteError('Failed to delete. Please try again.') }
    finally { setDeleting(null) }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Clear all prediction history? This cannot be undone.')) return
    setClearing(true); setClearError(null)
    try { await clearHistory(); setItems([]) }
    catch { setClearError('Failed to clear history. Please try again.') }
    finally { setClearing(false) }
  }

  const realCount = items.filter(i => i.prediction === 'REAL').length
  const fakeCount = items.filter(i => i.prediction === 'FAKE').length
  const avgConf   = items.length ? Math.round(items.reduce((s, i) => s + i.confidence, 0) / items.length * 100) : 0

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf9ff 0%, #f3f4f6 100%)' }}>
      {/* Top gradient stripe */}
      <div className="h-1 w-full fixed top-0 z-50" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#059669,#ec4899,#7c3aed)' }} />

      {/* Navbar */}
      <nav className="fixed top-1 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-purple-700 transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg btn-primary flex items-center justify-center shadow-sm">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black gradient-text text-base">Verdade</span>
            </div>
          </div>
          <h1 className="text-sm font-bold text-slate-700">Prediction History</h1>
        </div>
      </nav>

      <main className="pt-28 pb-16 px-4 max-w-4xl mx-auto">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',     value: items.length, color: '#7c3aed', bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: 'border-purple-200' },
            { label: 'Real',      value: realCount,    color: '#059669', bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: 'border-emerald-200' },
            { label: 'Fake',      value: fakeCount,    color: '#dc2626', bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: 'border-red-200' },
            { label: 'Avg Conf.', value: `${avgConf}%`,color: '#d97706', bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: 'border-amber-200' },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl border ${s.border} p-4 text-center shadow-sm`} style={{ background: s.bg }}>
              <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Inline errors */}
        {(deleteError || clearError) && (
          <div className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{deleteError ?? clearError}</span>
            <button className="ml-auto text-red-500 hover:text-red-700 text-xs underline font-semibold"
              onClick={() => { setDeleteError(null); setClearError(null) }}>Dismiss</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-slate-800">
            Past Analyses{' '}
            {!loading && <span className="text-sm font-normal text-slate-400">({items.length} records)</span>}
          </h2>
          <div className="flex gap-2">
            <button onClick={fetchHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-purple-300 hover:text-purple-700 transition-colors shadow-sm">
              <RotateCcw className="w-3.5 h-3.5" /> Refresh
            </button>
            {items.length > 0 && (
              <button onClick={handleClearAll} disabled={clearing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />{clearing ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && <div className="flex justify-center py-20"><div className="loader" /></div>}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl p-10 text-center border border-amber-200 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-slate-800 font-extrabold mb-2">Backend Unavailable</p>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">{error}</p>
            <Link href="/" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-100">
              Go to Detector
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-700 font-extrabold mb-2">No predictions yet</p>
            <p className="text-slate-400 text-sm mb-6">Analyze an Urdu article to see results here.</p>
            <Link href="/#detector" className="inline-flex items-center gap-2 btn-primary px-7 py-3 rounded-xl text-sm font-bold shadow-md shadow-purple-100">
              Analyze Now
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id}
                className="bg-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-slate-200 hover:border-purple-200 hover:shadow-md transition-all">
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${badgeClass(item.prediction)}`}>
                  {item.prediction}
                </span>
                <p className="urdu flex-1 text-slate-600 text-sm line-clamp-1 min-w-0">{item.text_preview}</p>
                <span className="shrink-0 text-xs font-semibold text-slate-400">{Math.round(item.confidence * 100)}% conf.</span>
                <span className="shrink-0 text-xs text-slate-400">{fmtDate(item.timestamp)}</span>
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors disabled:opacity-40"
                  aria-label="Delete">
                  {deleting === item.id
                    ? <div className="loader !w-4 !h-4 !border-2" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
