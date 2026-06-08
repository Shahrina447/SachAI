import { ArrowRight, Github } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass rounded-3xl p-10 sm:p-14 glow border border-purple-500/10 relative overflow-hidden">
          {/* Background accent */}
          <div
            className="orb"
            style={{
              width: '300px',
              height: '300px',
              background: '#7c3aed',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0.15,
            }}
          />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 relative">
            Start Detecting{' '}
            <span className="gradient-text">Misinformation</span>
          </h2>
          <p className="urdu text-slate-300 text-xl mb-8 relative">ابھی شروع کریں — مفت، فوری، درست</p>
          <p className="text-slate-400 mb-8 max-w-md mx-auto relative text-sm">
            Paste any Urdu news article and get an instant AI-powered verdict.
            No sign-up required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <a
              href="#detector"
              className="btn-primary px-8 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              Analyze News Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/MaazAmjad/Datasets-for-Urdu-news"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl glass border border-white/10 text-slate-300 font-semibold flex items-center justify-center gap-2 hover:border-purple-500/30 transition-colors"
            >
              <Github className="w-4 h-4" />
              View Dataset
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
