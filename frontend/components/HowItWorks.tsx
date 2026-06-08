import { ClipboardList, Cpu, BarChart3, ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Paste Urdu Text',
    desc: 'Enter any Urdu news article or headline. The system accepts up to 1000 characters.',
    step: '01',
  },
  {
    icon: Cpu,
    title: 'AI Processing',
    desc: 'xlm-RoBERTa tokenizes and analyzes the text using multilingual contextual embeddings.',
    step: '02',
  },
  {
    icon: BarChart3,
    title: 'Score Breakdown',
    desc: 'Four scores are calculated: Linguistic Authenticity, Source Credibility, Sentiment & Bias, Fact Cross-Reference.',
    step: '03',
  },
  {
    icon: ShieldCheck,
    title: 'Verdict Delivered',
    desc: 'A REAL, FAKE, or MIXED verdict is returned with confidence percentage and explanation.',
    step: '04',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How <span className="gradient-text">SachAI</span> Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Four-step AI pipeline powered by multilingual transformers
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="glass feature-card rounded-2xl p-6 relative overflow-hidden">
              {/* Step number watermark */}
              <span className="absolute top-4 right-4 text-6xl font-extrabold text-white/[0.03] select-none">
                {s.step}
              </span>
              <div className="step-circle w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Architecture note */}
        <div className="mt-10 glass rounded-xl p-5 flex flex-wrap gap-4 items-center justify-center text-xs text-slate-500">
          {[
            'xlm-roberta-base',
            '768-dim embeddings',
            '12 attention layers',
            'CPU inference',
            'Float32 precision',
            'HuggingFace Transformers',
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full border border-white/10 text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
