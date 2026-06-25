import Navbar        from '@/components/Navbar'
import HeroSection   from '@/components/HeroSection'
import DetectorSection from '@/components/DetectorSection'
import BatchAnalyzer from '@/components/BatchAnalyzer'
import HowItWorks    from '@/components/HowItWorks'
import StatsSection  from '@/components/StatsSection'
import FeaturesSection from '@/components/FeaturesSection'
import MarqueeSection from '@/components/MarqueeSection'
import CTASection    from '@/components/CTASection'
import Footer        from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      {/* Subtle page-level orbs — very low opacity on white */}
      <div className="orb" style={{ width: 600, height: 600, background: '#7c3aed', top: -180, left: -180 }} />
      <div className="orb" style={{ width: 500, height: 500, background: '#06b6d4', top: 400,  right: -160 }} />
      <div className="orb" style={{ width: 400, height: 400, background: '#ec4899', bottom: 300, left: '30%' }} />

      <Navbar />
      <HeroSection />
      <DetectorSection />
      <BatchAnalyzer />
      <HowItWorks />
      <StatsSection />
      <FeaturesSection />
      <MarqueeSection />
      <CTASection />
      <Footer />
    </main>
  )
}
