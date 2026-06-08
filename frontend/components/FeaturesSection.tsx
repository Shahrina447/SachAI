import {
  Brain,
  Languages,
  ShieldCheck,
  BarChart2,
  Clock,
  Database,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'xlm-RoBERTa Model',
    desc: 'State-of-the-art multilingual transformer fine-tuned on 10K+ expert-annotated Urdu news samples.',
    color: '#a78bfa',
  },
  {
    icon: Languages,
    title: 'Native Urdu NLP',
    desc: 'Full RTL support with Noto Nastaliq Urdu font, character normalization, and Urdu-specific preprocessing.',
    color: '#22d3ee',
  },
  {
    icon: ShieldCheck,
    title: '4-Dimension Scoring',
    desc: 'Linguistic Authenticity, Source Credibility, Sentiment & Bias, and Fact Cross-Reference scores.',
    color: '#34d399',
  },
  {
    icon: BarChart2,
    title: 'Confidence Meter',
    desc: 'Visual conic-gradient circular meter with REAL / MIXED / FAKE classification and probability breakdown.',
    color: '#fbbf24',
  },
  {
    icon: Clock,
    title: 'Prediction History',
    desc: 'All analyses are persisted in SQLite. Browse, filter, and delete your past predictions anytime.',
    color: '#f87171',
  },
  {
    icon: Database,
    title: 'CPU-Only Inference',
    desc: 'Runs entirely on CPU with PyTorch float32. No GPU required — deployable on any machine.',
    color: '#c084fc',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Everything you need for rigorous Urdu fake news analysis
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass feature-card rounded-2xl p-6 border border-white/5"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
