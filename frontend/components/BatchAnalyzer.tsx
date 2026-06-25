'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Layers, RefreshCw, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { analyzeNewsBatch, PredictResponse, BatchSummary } from '@/lib/api'

interface ArticleRow { id: string; text: string }
interface BatchResult { results: PredictResponse[]; summary: BatchSummary }

const makeRow = (text = ''): ArticleRow => ({ id: crypto.randomUUID(), text })

function Badge({ p }: { p: 'FAKE' | 'REAL' }) {
  return p === 'REAL'
    ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-real"><CheckCircle className="w-3.5 h-3.5" />REAL</span>
    : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-fake"><AlertTriangle className="w-3.5 h-3.5" />FAKE</span>
}

function SummaryCard({ label, value, sublabel, color, bg, border }: { label: string; value: number | string; sublabel?: string; color: string; bg: string; border: string }) {
  return (
    <div className={`rounded-2xl border ${border} p-5 text-center`} style={{ background: bg }}>
      <div className="text-3xl font-black mb-0.5" style={{ color }}>{value}</div>
      <div className="text-sm font-bold text-slate-700">{label}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-0.5">{sublabel}</div>}
    </div>
  )
}

export default function BatchAnalyzer() {
  const [rows, setRows] = useState<ArticleRow[]>(() => [makeRow(), makeRow()])
  const [state, setState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const MAX = 10

  const addRow    = useCallback(() => setRows(p => p.length < MAX ? [...p, makeRow()] : p), [])
  const deleteRow = useCallback((id: string) => setRows(p => p.length <= 1 ? p : p.filter(r => r.id !== id)), [])
  const updateRow = useCallback((id: string, text: string) => setRows(p => p.map(r => r.id === id ? { ...r, text } : r)), [])

  const handleAnalyze = async () => {
    const texts = rows.map(r => r.text.trim()).filter(t => t.length >= 10)
    if (!texts.length) { setError('Please enter at least one article with 10+ characters.'); return }
    setState('loading'); setError(null)
    try {
      setBatchResult(await analyzeNewsBatch(texts))
      setState('result')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Backend unreachable. Ensure server is running on port 8000.')
      setState('idle')
    }
  }
  const handleReset = () => { setState('idle'); setBatchResult(null); setError(null); setRows([makeRow(), makeRow()]) }
  const filled = rows.filter(r => r.text.trim().length >= 10).length

  return (
    <section id="batch" className="relative py-28 px-4 section-sky">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 mb-4">
            <Layers className="w-3.5 h-3.5" /> Batch Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3">
            Analyze Multiple <span className="gradient-text">Articles at Once</span>
          </h2>
          <p className="urdu text-slate-500 text-xl">ایک ساتھ کئی خبروں کا تجزیہ کریں</p>
        </div>

        <div className="bg-white rounded-3xl p-7 sm:p-10 border border-cyan-100" style={{ boxShadow: '0 8px 40px rgba(6,182,212,0.1), 0 0 0 1px rgba(6,182,212,0.07)' }}>

          {/* ── INPUT ── */}
          {state !== 'result' && (
            <>
              <div className="space-y-3 mb-5">
                {rows.map((row, idx) => (
                  <div key={row.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 mt-2">
                      {idx + 1}
                    </div>
                    <textarea
                      value={row.text} onChange={e => updateRow(row.id, e.target.value)}
                      rows={2} dir="rtl" lang="ur"
                      placeholder={`یہاں خبر ${idx + 1} پیسٹ کریں...`}
                      className="urdu flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder:text-slate-400 text-base resize-none focus:border-cyan-400 focus:bg-white transition-all leading-loose"
                    />
                    <button onClick={() => deleteRow(row.id)} disabled={rows.length <= 1}
                      className="flex-shrink-0 mt-2 p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label={`Remove article ${idx + 1}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {rows.length < MAX && (
                <button onClick={addRow}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all mb-5">
                  <Plus className="w-4 h-4" /> Add Article
                  <span className="text-xs opacity-60">({rows.length}/{MAX})</span>
                </button>
              )}

              {error && (
                <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                </div>
              )}

              <button onClick={handleAnalyze} disabled={state === 'loading' || !filled}
                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}>
                {state === 'loading'
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing {filled} articles…</>
                  : <><Layers className="w-4.5 h-4.5" /> Analyze All {filled > 0 && <span className="text-sm opacity-80">({filled} article{filled !== 1 ? 's' : ''})</span>}</>}
              </button>

              {state === 'loading' && (
                <div className="relative mt-5 bg-cyan-50 border border-cyan-100 rounded-2xl h-14 overflow-hidden flex items-center justify-center">
                  <div className="scan-line" style={{ background: 'linear-gradient(90deg,transparent,#0891b2,transparent)' }} />
                  <p className="text-xs font-semibold text-cyan-600 z-10">Running batch xlm-RoBERTa inference…</p>
                </div>
              )}
            </>
          )}

          {/* ── RESULT ── */}
          {state === 'result' && batchResult && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Batch Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <SummaryCard label="Total" value={batchResult.summary.total} sublabel="articles"
                    color="#7c3aed" bg="linear-gradient(135deg,#f5f3ff,#ede9fe)" border="border-purple-200" />
                  <SummaryCard label="Real"  value={batchResult.summary.real}
                    sublabel={`${(100 - batchResult.summary.fake_percentage).toFixed(1)}%`}
                    color="#059669" bg="linear-gradient(135deg,#f0fdf4,#dcfce7)" border="border-emerald-200" />
                  <SummaryCard label="Fake"  value={batchResult.summary.fake}
                    sublabel={`${batchResult.summary.fake_percentage.toFixed(1)}%`}
                    color="#dc2626" bg="linear-gradient(135deg,#fff1f2,#ffe4e6)" border="border-red-200" />
                </div>

                {/* Real/Fake bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-600">Real — {(100 - batchResult.summary.fake_percentage).toFixed(1)}%</span>
                    <span className="text-red-500">Fake — {batchResult.summary.fake_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-slate-100 flex shadow-inner">
                    <div className="h-full transition-all duration-1000" style={{ width: `${100 - batchResult.summary.fake_percentage}%`, background: 'linear-gradient(90deg,#059669,#34d399)' }} />
                    <div className="h-full" style={{ width: `${batchResult.summary.fake_percentage}%`, background: 'linear-gradient(90deg,#f87171,#dc2626)' }} />
                  </div>
                </div>
              </div>

              {/* Results table */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Individual Results</h3>
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-4 px-5 py-3 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-widest">
                    <span>#</span><span className="text-right">Preview</span><span>Verdict</span><span>Conf.</span>
                  </div>
                  {batchResult.results.map((res, idx) => {
                    const orig = rows[idx]?.text ?? ''
                    const preview = orig.trim().slice(0, 60) + (orig.trim().length > 60 ? '…' : '')
                    return (
                      <div key={res.prediction_id} className="grid grid-cols-[2rem_1fr_auto_auto] gap-4 px-5 py-4 border-t border-slate-100 items-center hover:bg-slate-50 transition-colors">
                        <span className="text-xs font-black text-slate-400 font-mono">{idx + 1}</span>
                        <p dir="rtl" lang="ur" className="urdu text-slate-600 text-sm text-right truncate" title={orig.trim()}>{preview}</p>
                        <Badge p={res.prediction as 'FAKE' | 'REAL'} />
                        <span className="text-sm font-extrabold" style={{ color: res.prediction === 'REAL' ? '#059669' : '#dc2626' }}>
                          {Math.round(res.confidence * 100)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:border-cyan-300 hover:text-cyan-700 transition-colors">
                  <RefreshCw className="w-4 h-4" /> New Batch
                </button>
                <a href="/history"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold shadow-md"
                  style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}>
                  View History
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
