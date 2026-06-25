import { Brain, Cpu, Languages, ShieldCheck, TrendingUp, Database } from 'lucide-react'

const CARDS = [
  { icon: Brain,       value: 'xlm-RoBERTa', label: 'Base Model',      color: '#7c3aed', bg: 'from-purple-50 to-purple-100/50',   border: 'border-purple-200' },
  { icon: Languages,   value: 'Urdu',        label: 'Language',        color: '#0891b2', bg: 'from-cyan-50 to-cyan-100/50',       border: 'border-cyan-200' },
  { icon: Cpu,         value: 'CPU-Only',    label: 'Inference',       color: '#059669', bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200' },
  { icon: ShieldCheck, value: 'REAL/FAKE',   label: 'Classification',  color: '#d97706', bg: 'from-amber-50 to-amber-100/50',     border: 'border-amber-200' },
  { icon: TrendingUp,  value: '94.7%',       label: 'Test Accuracy',   color: '#059669', bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200' },
  { icon: Database,    value: '10K+',        label: 'Training Samples',color: '#7c3aed', bg: 'from-purple-50 to-purple-100/50',   border: 'border-purple-200' },
]

export default function StatsSection() {
  return (
    <section id="stats" className="relative py-28 px-4 section-soft">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 mb-4 uppercase tracking-widest">
            Model Overview
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
            By the <span className="gradient-text">Numbers</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Fine-tuned xlm-RoBERTa for binary Urdu fake news classification
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {CARDS.map((c, i) => (
            <div
              key={i}
              className={`feature-card bg-gradient-to-b ${c.bg} border ${c.border} rounded-2xl p-5 text-center shadow-sm`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm"
                style={{ background: `${c.color}15`, border: `1.5px solid ${c.color}28` }}
              >
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <div className="text-lg font-extrabold text-slate-800 mb-0.5">{c.value}</div>
              <div className="text-xs font-semibold text-slate-500">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Architecture strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap gap-2.5 items-center justify-center shadow-sm">
          {['xlm-roberta-base','768-dim embeddings','12 attention layers','Max 128 tokens','Float32 precision','HuggingFace Transformers','FastAPI backend','aiosqlite storage'].map((tag) => (
            <span key={tag} className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:border-purple-300 hover:text-purple-700 transition-colors cursor-default">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
