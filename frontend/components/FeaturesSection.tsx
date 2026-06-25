import { Brain, Languages, ShieldCheck, BarChart2, Clock, Database } from 'lucide-react'

const FEATURES = [
  { icon: Brain,       title: 'xlm-RoBERTa Model',      color: '#7c3aed', desc: 'State-of-the-art multilingual transformer fine-tuned on Urdu news for binary fake/real classification.' },
  { icon: Languages,   title: 'Native Urdu NLP',         color: '#0891b2', desc: 'Full RTL support, Noto Nastaliq Urdu font, character normalization, and Urdu-specific preprocessing.' },
  { icon: ShieldCheck, title: 'Instant Verdict',         color: '#059669', desc: 'Returns REAL or FAKE with confidence probability directly from the trained model — no external lookup.' },
  { icon: BarChart2,   title: 'Confidence Meter',        color: '#d97706', desc: 'Animated circular meter showing real vs fake probability with clear visual breakdown.' },
  { icon: Clock,       title: 'Prediction History',      color: '#dc2626', desc: 'All analyses are persisted in SQLite. Browse, search, and delete your past predictions anytime.' },
  { icon: Database,    title: 'CPU-Only Inference',      color: '#7c3aed', desc: 'Runs entirely on CPU with PyTorch float32. No GPU required — deploy anywhere.' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-4 section-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 mb-4 uppercase tracking-widest">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
            Powerful <span className="gradient-text">Capabilities</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Everything you need for rigorous Urdu fake news analysis
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-lg"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                style={{ background: `${f.color}12`, border: `1.5px solid ${f.color}22` }}
              >
                <f.icon className="w-5.5 h-5.5" style={{ color: f.color }} />
              </div>
              <h3 className="font-extrabold text-slate-800 mb-2 text-base">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
