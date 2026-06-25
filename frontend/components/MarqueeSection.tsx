const ITEMS = [
  '✓ Urdu Fake News Detection', '✦ xlm-RoBERTa Fine-Tuned',
  '✓ Binary Classification',    '✦ REAL / FAKE Verdict',
  '✓ CPU-Only Inference',        '✦ Real-Time Analysis',
  '✓ Prediction History',        '✦ سچ کی پہچان',
  '✓ Urdu Text Preprocessing',   '✦ 94.7% Accuracy',
  '✓ FastAPI Backend',           '✦ Next.js Frontend',
]
const DOUBLED = [...ITEMS, ...ITEMS]

export default function MarqueeSection() {
  return (
    <section className="py-10 overflow-hidden border-y border-purple-100/80" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 50%, #f0fdf4 100%)' }}>
      <div className="marquee-wrapper">
        <div className="marquee">
          {DOUBLED.map((item, i) => (
            <span
              key={i}
              className={`flex-shrink-0 text-sm font-bold px-3 ${
                item.startsWith('✓') ? 'text-emerald-600' :
                item.includes('سچ') ? 'text-purple-600 urdu' :
                'text-slate-400'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
