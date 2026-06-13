'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, Zap } from 'lucide-react'
import { analyzeNews, PredictResponse } from '@/lib/api'

// ── Sample texts ──────────────────────────────────────────────────────────────
const SAMPLES: Record<number, string> = {
  1: 'وفاقی حکومت نے اعلان کیا ہے کہ آئندہ مالی سال میں تعلیم کے بجٹ میں 25 فیصد اضافہ کیا جائے گا تاکہ تعلیمی معیار کو بہتر بنایا جا سکے۔',
  2: 'سائنسدانوں نے دعویٰ کیا ہے کہ صرف ایک گلاس گرم پانی میں لیموں نچوڑ کر پینے سے کینسر مکمل طور پر ختم ہو جاتا ہے اور یہ راز حکومت چھپا رہی ہے!',
  3: 'موسمیاتی تبدیلیوں کے باعث پاکستان میں موسمِ گرما کا دورانیہ بڑھنے کا امکان ہے، محکمہ موسمیات نے انتباہ جاری کر دیا ہے۔',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function badgeClass(prediction: string) {
  if (prediction === 'REAL') return 'badge-real'
  if (prediction === 'FAKE') return 'badge-fake'
  return 'badge-mixed'
}

function verdictIcon(prediction: string) {
  if (prediction === 'REAL') return <CheckCircle className="w-5 h-5 text-emerald-400" />
  if (prediction === 'FAKE') return <AlertTriangle className="w-5 h-5 text-red-400" />
  return <HelpCircle className="w-5 h-5 text-amber-400" />
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.round(value * 100)), 300)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold" style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DetectorSection() {
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'result'>('idle')
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const meterRef = useRef<HTMLDivElement>(null)

  // Animate conic-gradient meter when result arrives
  useEffect(() => {
    if (state === 'result' && result && meterRef.current) {
      const pct = Math.round(result.confidence_real * 100)
      const color =
        result.prediction === 'REAL'
          ? '#10b981'
          : result.prediction === 'MIXED'
          ? '#f59e0b'
          : '#ef4444'
      // Small delay so CSS transition fires
      setTimeout(() => {
        if (meterRef.current) {
          meterRef.current.style.setProperty('--p', String(pct))
          meterRef.current.style.setProperty('--meter-color', color)
        }
      }, 100)
    }
  }, [state, result])

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 10) return
    setState('loading')
    setError(null)

    // Minimum 2.2 s loading for UX polish
    const [apiResult] = await Promise.allSettled([
      analyzeNews(text),
      new Promise((r) => setTimeout(r, 2200)),
    ])

    if (apiResult.status === 'fulfilled') {
      setResult(apiResult.value)
      setState('result')
    } else {
      setError('Backend unreachable. Please ensure the server is running on port 8000.')
      setState('idle')
    }
  }

  const handleReset = () => {
    setState('idle')
    setResult(null)
    setError(null)
    setText('')
  }

  const charCount = text.length

  return (
    <section id="detector" className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-purple-300 mb-4 border border-purple-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>AI-Powered Detection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Detect Fake <span className="gradient-text">Urdu News</span>
          </h2>
          <p className="urdu text-slate-400 text-xl">اردو خبر یہاں پیسٹ کریں</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 glow">
          {/* ── IDLE / INPUT STATE ── */}
          {state !== 'result' && (
            <>
              {/* Sample text buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-slate-500 self-center">Samples:</span>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setText(SAMPLES[n])}
                    className="px-3 py-1 rounded-lg glass text-xs text-slate-300 hover:border-purple-500/40 border border-white/5 transition-colors"
                  >
                    Sample {n}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  dir="rtl"
                  placeholder="یہاں اردو خبر کا متن پیسٹ کریں..."
                  className="w-full urdu bg-transparent border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 text-lg resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <div className="absolute bottom-3 left-3 text-xs text-slate-600">
                  {charCount}/1000
                </div>
              </div>

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={state === 'loading' || charCount < 10}
                className="mt-4 w-full btn-primary px-6 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? (
                  <>
                    <div className="loader !w-5 !h-5 !border-2" />
                    <span>Analyzing…</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze News</span>
                  </>
                )}
              </button>

              {/* Loading overlay with scan line */}
              {state === 'loading' && (
                <div className="relative mt-6 glass rounded-xl h-20 overflow-hidden flex items-center justify-center">
                  <div className="scan-line" />
                  <p className="text-xs text-slate-500 z-10">
                    Running xlm-RoBERTa inference…
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── RESULT STATE ── */}
          {state === 'result' && result && (
            <div className="space-y-8">

              {/* Top row: meter + verdict */}
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Circular credibility meter */}
                <div className="flex-shrink-0 relative">
                  <div
                    ref={meterRef}
                    id="credibility-meter"
                    className="meter-bg w-36 h-36 rounded-full flex items-center justify-center"
                    style={{ '--p': '0', '--meter-color': '#10b981' } as React.CSSProperties}
                  >
                    <div className="w-24 h-24 rounded-full bg-[#0b1020] flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-white">
                        {Math.round(result.confidence_real * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Credibility</span>
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    {verdictIcon(result.prediction)}
                    <span
                      className={`text-2xl font-extrabold ${
                        result.prediction === 'REAL'
                          ? 'text-emerald-400'
                          : result.prediction === 'FAKE'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {result.prediction}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(result.prediction)}`}>
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.verdict_text}</p>
                  <div className="flex gap-6 text-xs text-slate-500">
                    <span>Real: <span className="text-emerald-400 font-semibold">{Math.round(result.confidence_real * 100)}%</span></span>
                    <span>Fake: <span className="text-red-400 font-semibold">{Math.round(result.confidence_fake * 100)}%</span></span>
                  </div>
                </div>
              </div>

              {/* 4 breakdown scores */}
              <div className="glass rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Breakdown Analysis
                </h4>
                <ProgressBar
                  label="Linguistic Authenticity"
                  value={result.linguistic_score}
                  color="#a78bfa"
                />
                <ProgressBar
                  label="Source Credibility"
                  value={result.source_score}
                  color="#22d3ee"
                />
                <ProgressBar
                  label="Sentiment & Bias"
                  value={result.sentiment_score}
                  color="#34d399"
                />
                <ProgressBar
                  label="Fact Cross-Reference"
                  value={result.fact_score}
                  color="#fbbf24"
                />
              </div>

              {/* Analyzed text preview */}
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Analyzed text:</p>
                <p className="urdu text-slate-300 text-sm line-clamp-3">{text}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass border border-white/10 text-slate-300 text-sm font-medium hover:border-purple-500/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze Another
                </button>
                <a
                  href="/history"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-primary text-white text-sm font-medium"
                >
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
