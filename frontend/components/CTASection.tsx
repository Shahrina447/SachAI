import { ArrowRight, Github, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-28 px-4 section-soft">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-white rounded-3xl p-10 sm:p-16 border border-purple-100 shadow-2xl shadow-purple-100/40 overflow-hidden text-center">
          {/* Inner gradient blobs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.05) 0%, transparent 70%)' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 mb-6">
              <span className="pulse-dot" />
              Ready to use · Free · No sign-up
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">
              Stop Sharing <span className="gradient-text-warm">Fake News</span>
            </h2>

            <p className="urdu text-xl font-bold text-purple-600 mb-6">
              ابھی شروع کریں — مفت، فوری، درست
            </p>

            <p className="text-slate-500 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
              Paste any Urdu article and get an instant AI-powered verdict. Takes less than 3 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#detector"
                className="btn-primary px-9 py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-purple-200"
              >
                <Sparkles className="w-4 h-4" />
                Analyze News Now
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/MaazAmjad/Datasets-for-Urdu-news"
                target="_blank"
                rel="noopener noreferrer"
                className="px-9 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-2.5 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all"
              >
                <Github className="w-4 h-4" />
                View Dataset
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
