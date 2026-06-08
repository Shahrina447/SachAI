import { Brain } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">SachAI</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-500 justify-center">
            <a href="#detector" className="hover:text-slate-300 transition-colors">Detector</a>
            <a href="#how-it-works" className="hover:text-slate-300 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="/history" className="hover:text-slate-300 transition-colors">History</a>
            <a
              href="https://arxiv.org/abs/2403.14037"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Dataset Paper
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-600 text-center sm:text-right">
            SachAI · Semester Project
            <br />
            xlm-RoBERTa · CPU-Only · Urdu NLP
          </p>
        </div>

        {/* Bottom note */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-700">
          Built with Next.js 14 · FastAPI · HuggingFace Transformers · PyTorch CPU
          <br />
          Dataset: Ax-to-Grind Urdu (arXiv:2403.14037) · Bend the Truth (MaazAmjad/GitHub)
        </div>
      </div>
    </footer>
  )
}
