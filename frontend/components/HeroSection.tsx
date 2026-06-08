'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, Sparkles } from 'lucide-react'

const TYPING_TEXTS = [
  'خبروں کی سچائی جانیں',
  'جھوٹی خبروں کو پہچانیں',
  'AI سے سچ دریافت کریں',
]

export default function HeroSection() {
  const [typedIndex, setTypedIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTypedIndex((i) => (i + 1) % TYPING_TEXTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden">
      {/* Trust badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-slate-300 mb-8 border border-purple-500/20">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span>xlm-RoBERTa · 10,083 Urdu Samples · CPU-Powered</span>
      </div>

      {/* Main heading */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
        <span className="gradient-text">SachAI</span>
        <br />
        <span className="text-white text-4xl sm:text-5xl lg:text-6xl">سچ کی پہچان</span>
      </h1>

      {/* Animated Urdu subheading */}
      <p className="urdu text-2xl sm:text-3xl text-slate-300 mb-4 min-h-[3rem]">
        <span className="typing">{TYPING_TEXTS[typedIndex]}</span>
      </p>

      <p className="text-slate-400 max-w-xl mb-10 leading-relaxed">
        AI-powered Urdu fake news detection. Paste any Urdu article and get an
        instant authenticity verdict powered by{' '}
        <span className="text-purple-400">xlm-RoBERTa</span>.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <a
          href="#detector"
          className="btn-primary px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg"
        >
          Analyze News Now
        </a>
        <a
          href="#how-it-works"
          className="px-8 py-3.5 rounded-xl glass border border-white/10 text-slate-300 font-semibold text-sm hover:border-purple-500/40 transition-colors"
        >
          How It Works
        </a>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-4 justify-center mt-14">
        {[
          { label: 'Accuracy', value: '91.2%' },
          { label: 'F1 Score', value: '0.908' },
          { label: 'Dataset', value: '10K+' },
          { label: 'Languages', value: 'Urdu' },
        ].map((s) => (
          <div key={s.label} className="glass px-5 py-3 rounded-xl text-center">
            <div className="text-lg font-bold gradient-text">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scroll arrow */}
      <a href="#detector" className="absolute bottom-8 animate-bounce text-slate-600">
        <ArrowDown className="w-5 h-5" />
      </a>
    </section>
  )
}
