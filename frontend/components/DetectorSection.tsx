'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, Zap, Info } from 'lucide-react'
import { analyzeNews, PredictResponse } from '@/lib/api'

const SAMPLES: Record<number, string> = {
  1: 'وفاقی حکومت نے اعلان کیا ہے کہ آئندہ مالی سال میں تعلیم کے بجٹ میں 25 فیصد اضافہ کیا جائے گا تاکہ تعلیمی معیار کو بہتر بنایا جا سکے۔',
  2: 'سائنسدانوں نے دعویٰ کیا ہے کہ صرف ایک گلاس گرم پانی میں لیموں نچوڑ کر پینے سے کینسر مکمل طور پر ختم ہو جاتا ہے اور یہ راز حکومت چھپا رہی ہے!',
  3: 'موسمیاتی تبدیلیوں کے باعث پاکستان میں موسمِ گرما کا دورانیہ بڑھنے کا امکان ہے، محکمہ موسمیات نے انتباہ جاری کر دیا ہے۔',
}

function badgeClass(p: string) {
  return p === 'REAL' ? 'badge-real' : p === 'FAKE' ? 'badge-fake' : 'badge-mixed'
}
function VerdictIcon({ p }: { p: string }) {
  if (p === 'REAL') return <CheckCircle className="w-7 h-7 text-emerald-600" />
  if (p === 'FAKE') return <AlertTriangle className="w-7 h-7 text-red-500" />
  return <HelpCircle className="w-7 h-7 text-amber-500" />
}
function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(Math.round(value * 100)), 350); return () => clearTimeout(t) }, [value])
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  )
}

export default function DetectorSection() {
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const meterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state === 'result' && result && meterRef.current) {
      const pct   = Math.round(result.confidence_real * 100)
      const color = result.prediction === 'REAL' ? '#059669' : result.prediction === 'FAKE' ? '#dc2626' : '#d97706'
      setTimeout(() => {
        meterRef.current?.style.setProperty('--p', String(pct))
        meterRef.current?.style.setProperty('--meter-color', color)
      }, 120)
    }
  }, [state, result])

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 10) return
    setState('loading'); setError(null)
    const [res] = await Promise.allSettled([analyzeNews(text), new Promise(r => setTimeout(r, 800))])
    if (res.status === 'fulfilled') { setResult(res.value); setState('result') }
    else {
      setError(res.reason instanceof Error ? res.reason.message : 'Backend unreachable. Ensure server is running on port 8000.')
      setState('idle')
    }
  }
  const handleReset = () => { setState('idle'); setResult(null); setError(null); setText('') }
  const chars = text.length

  return (
    <section id="detector" className="relative py-28 px-4 section-soft">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 mb-4">
            <Zap className="w-3.5 h-3.5" /> AI-Powered Detection
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3">
            Detect Fake <span className="gradient-text">Urdu News</span>
          </h2>
          <p className="urdu text-slate-500 text-xl">اردو خبر یہاں پیسٹ کریں</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl p-7 sm:p-10 glow border border-purple-100">

          {/* ── INPUT / LOADING ── */}
          {state !== 'result' && (
            <>
              {/* Sample buttons */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs font-semibold text-slate-400 self-center mr-1">Try:</span>
                {([1, 2, 3] as const).map(n => (
                  <button key={n} onClick={() => setText(SAMPLES[n])}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all">
                    Sample {n}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative mb-1">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={6} dir="rtl"
                  placeholder="یہاں اردو خبر کا متن پیسٹ کریں..."
                  className="w-full urdu bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 text-lg resize-none focus:border-purple-400 focus:bg-white transition-all"
                />
                <span className={`absolute bottom-4 left-4 text-xs font-semibold transition-colors ${chars > 900 ? 'text-red-500' : 'text-slate-400'}`}>
                  {chars}/1000
                </span>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={state === 'loading' || chars < 10}
                className="mt-5 w-full btn-primary py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
              >
                {state === 'loading'
                  ? <><div className="loader !w-5 !h-5 !border-2 !border-white/30 !border-t-white" /> Analyzing…</>
                  : <><Search className="w-4.5 h-4.5" /> Analyze News</>}
              </button>

              {state === 'loading' && (
                <div className="relative mt-5 bg-purple-50 border border-purple-100 rounded-2xl h-14 overflow-hidden flex items-center justify-center">
                  <div className="scan-line" />
                  <p className="text-xs font-semibold text-purple-500 z-10">Running xlm-RoBERTa inference…</p>
                </div>
              )}
            </>
          )}

          {/* ── RESULT ── */}
          {state === 'result' && result && (
            <div className="space-y-6">

              {/* Verdict row */}
              <div className={`flex flex-col sm:flex-row items-center gap-7 p-6 rounded-2xl border ${
                result.prediction === 'REAL'      ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100' :
                result.prediction === 'FAKE'      ? 'bg-gradient-to-br from-red-50 to-white border-red-100' :
                                                    'bg-gradient-to-br from-amber-50 to-white border-amber-100'
              }`}>
                {/* Meter */}
                <div
                  ref={meterRef}
                  className="meter-bg w-36 h-36 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ '--p': '0', '--meter-color': '#059669' } as React.CSSProperties}
                >
                  <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-black text-slate-800">{Math.round(result.confidence_real * 100)}%</span>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Credibility</span>
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                    <VerdictIcon p={result.prediction} />
                    <span className={`text-3xl font-black ${
                      result.prediction === 'REAL' ? 'text-emerald-600' :
                      result.prediction === 'FAKE' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {result.prediction}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass(result.prediction)}`}>
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{result.verdict_text}</p>

                  {/* Warning for sophisticated fakes */}
                  {result.prediction === 'REAL' && result.confidence_real > 0.85 && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        <strong>Note:</strong> This model detects language patterns, not factual truth.
                        Formally-written misinformation may not be caught. Always verify with a trusted source.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-5 text-xs font-semibold">
                    <span className="text-slate-400">Real: <span className="text-emerald-600">{Math.round(result.confidence_real * 100)}%</span></span>
                    <span className="text-slate-400">Fake: <span className="text-red-500">{Math.round(result.confidence_fake * 100)}%</span></span>
                  </div>
                </div>
              </div>

              {/* Confidence bars */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Confidence Breakdown</h4>
                <Bar label="Real News Probability" value={result.confidence_real} color="#059669" />
                <Bar label="Fake News Probability" value={result.confidence_fake} color="#dc2626" />
              </div>

              {/* Model performance metrics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Model Performance</h4>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Evaluated on 400 samples
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Accuracy',  value: '94.5%', color: '#7c3aed', bg: 'from-purple-50 to-purple-100/40', border: 'border-purple-200', desc: '378 / 400 correct' },
                    { label: 'Precision', value: '97.3%', color: '#0891b2', bg: 'from-cyan-50 to-cyan-100/40',    border: 'border-cyan-200',   desc: 'Low false alarms' },
                    { label: 'Recall',    value: '91.5%', color: '#059669', bg: 'from-emerald-50 to-emerald-100/40', border: 'border-emerald-200', desc: 'Fake news caught' },
                    { label: 'F1 Score',  value: '94.3%', color: '#d97706', bg: 'from-amber-50 to-amber-100/40',  border: 'border-amber-200',  desc: 'Balanced score' },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className={`rounded-xl border ${m.border} px-3 py-3 text-center bg-gradient-to-b ${m.bg}`}
                    >
                      <div className="text-xl font-black mb-0.5" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-xs font-bold text-slate-700">{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model note */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>How it works:</strong> The model analyzes <em>writing style and language patterns</em> — not whether facts are true.
                  It excels at detecting sensational or clearly fabricated content. For formally-written misinformation, always cross-check.
                </p>
              </div>

              {/* Text preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Analyzed text</p>
                <p className="urdu text-slate-700 text-sm line-clamp-3">{text}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:border-purple-300 hover:text-purple-700 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Analyze Another
                </button>
                <a href="/history"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl btn-primary text-sm font-bold shadow-md shadow-purple-100">
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
