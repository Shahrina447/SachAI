'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, Sparkles, Zap, Shield } from 'lucide-react'

const TYPING_TEXTS = [
  'خبروں کی سچائی جانیں',
  'جھوٹی خبروں کو پہچانیں',
  'AI سے سچ دریافت کریں',
]

const STATS = [
  { value: 'xlm-RoBERTa', label: 'Model',          from: '#f5f3ff', to: '#ede9fe', border: 'border-purple-200', text: 'text-purple-700' },
  { value: 'Urdu NLP',    label: 'Language',        from: '#ecfeff', to: '#cffafe', border: 'border-cyan-200',   text: 'text-cyan-700' },
  { value: '94.7%',       label: 'Accuracy',        from: '#f0fdf4', to: '#dcfce7', border: 'border-emerald-200',text: 'text-emerald-700' },
  { value: 'CPU Only',    label: 'No GPU Needed',   from: '#fff7ed', to: '#ffedd5', border: 'border-amber-200',  text: 'text-amber-700' },
]

export default function HeroSection() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TYPING_TEXTS.length), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen hero-mesh flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 overflow-hidden">

      {/* Trust badge */}
      <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm shadow-purple-100 text-xs font-semibold text-purple-700 mb-8">
        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
        xlm-RoBERTa · Fine-tuned on Urdu News · CPU-Powered
      </div>

      {/* Heading */}
      <h1 className="relative z-10 font-black leading-tight tracking-tight mb-6">
        <span className="block text-6xl sm:text-7xl lg:text-8xl gradient-text">Verdade</span>
        <span className="block text-4xl sm:text-5xl lg:text-6xl text-slate-800 mt-2">سچ کی پہچان</span>
      </h1>

      {/* Animated subtitle */}
      <p className="relative z-10 urdu text-2xl sm:text-3xl font-bold text-purple-700 min-h-[3.5rem] mb-4">
        <span className="typing">{TYPING_TEXTS[idx]}</span>
      </p>

      <p className="relative z-10 text-slate-500 max-w-lg mb-10 leading-relaxed text-base">
        Paste any Urdu news article and get an instant authenticity verdict
        powered by fine-tuned{' '}
        <span className="font-semibold text-purple-600">xlm-RoBERTa</span>.
      </p>

      {/* CTA */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center mb-16">
        <a
          href="#detector"
          className="btn-primary px-9 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-purple-200 flex items-center gap-2.5"
        >
          <Zap className="w-4 h-4" />
          Analyze News Now
        </a>
        <a
          href="#how-it-works"
          className="px-9 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all flex items-center gap-2.5"
        >
          <Shield className="w-4 h-4 text-purple-500" />
          How It Works
        </a>
      </div>

      {/* Stat pills */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
        {STATS.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} px-4 py-3.5 text-center shadow-sm`}
            style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
          >
            <div className={`text-base font-extrabold ${s.text}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <a href="#detector" className="absolute bottom-8 z-10 animate-bounce text-purple-300 hover:text-purple-500 transition-colors">
        <ArrowDown className="w-5 h-5" />
      </a>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 divider-gradient" />
    </section>
  )
}
