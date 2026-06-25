import { ClipboardList, Cpu, BarChart3, ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    icon: ClipboardList, step: '01', title: 'Paste Urdu Text',
    desc: 'Enter any Urdu news article or headline up to 1000 characters.',
    color: '#7c3aed', bg: 'from-purple-50 to-purple-100/60', border: 'border-purple-200',
  },
  {
    icon: Cpu, step: '02', title: 'AI Processing',
    desc: 'xlm-RoBERTa tokenizes and encodes the text using multilingual embeddings.',
    color: '#0891b2', bg: 'from-cyan-50 to-cyan-100/60', border: 'border-cyan-200',
  },
  {
    icon: BarChart3, step: '03', title: 'Probability Scores',
    desc: 'The classifier outputs real vs fake confidence probabilities.',
    color: '#d97706', bg: 'from-amber-50 to-amber-100/60', border: 'border-amber-200',
  },
  {
    icon: ShieldCheck, step: '04', title: 'Verdict Delivered',
    desc: 'A REAL or FAKE verdict is returned with confidence score and explanation.',
    color: '#059669', bg: 'from-emerald-50 to-emerald-100/60', border: 'border-emerald-200',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 px-4 section-mint">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-4 uppercase tracking-widest">
            Pipeline
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
            How <span className="gradient-text">Verdade</span> Works
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Four-step AI pipeline powered by multilingual transformers
          </p>
        </div>

        {/* Step cards with connector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-purple-200 via-cyan-200 via-amber-200 to-emerald-200 hidden lg:block" />

          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`feature-card bg-gradient-to-b ${s.bg} border ${s.border} rounded-3xl p-6 relative overflow-hidden shadow-sm`}
            >
              <span
                className="absolute top-3 right-4 text-7xl font-black select-none"
                style={{ color: `${s.color}08` }}
              >
                {s.step}
              </span>
              {/* Step number bubble */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-md"
                style={{ background: `linear-gradient(135deg, ${s.color}25, ${s.color}12)`, border: `1.5px solid ${s.color}30` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: s.color }}>
                Step {s.step}
              </p>
              <h3 className="font-extrabold text-slate-800 mb-2 text-base">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech tags */}
        <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap gap-2.5 items-center justify-center shadow-sm">
          {['xlm-roberta-base','768-dim embeddings','12 attention layers','CPU inference','Float32 precision','HuggingFace Transformers'].map((tag) => (
            <span key={tag} className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:border-purple-300 hover:text-purple-700 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
