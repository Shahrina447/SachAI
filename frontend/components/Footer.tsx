import { Brain } from 'lucide-react'

const LINKS = [
  { href: '#detector',     label: 'Detector' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features',     label: 'Features' },
  { href: '/history',      label: 'History' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      {/* Top gradient stripe */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #059669, #ec4899, #7c3aed)' }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center shadow-md shadow-purple-200">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black gradient-text">Verdade</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Urdu Fake News Detection · Semester Project</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-1 justify-center">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Badge */}
          <div className="text-xs text-slate-400 text-center sm:text-right space-y-1">
            <div className="font-semibold text-slate-600">xlm-RoBERTa · CPU-Only · Urdu NLP</div>
            <div>94.7% accuracy on real-world data</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>Built with Next.js 14 · FastAPI · HuggingFace Transformers · PyTorch CPU</p>
        </div>
      </div>
    </footer>
  )
}
