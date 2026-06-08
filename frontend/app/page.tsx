'use client'

import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import DetectorSection from '@/components/DetectorSection'
import HowItWorks from '@/components/HowItWorks'
import StatsSection from '@/components/StatsSection'
import FeaturesSection from '@/components/FeaturesSection'
import MarqueeSection from '@/components/MarqueeSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative">
      {/* 3 decorative background orbs */}
      <div
        className="orb"
        style={{ width: '400px', height: '400px', background: '#7c3aed', top: '-100px', left: '-100px' }}
      />
      <div
        className="orb"
        style={{ width: '500px', height: '500px', background: '#06b6d4', top: '300px', right: '-150px' }}
      />
      <div
        className="orb"
        style={{ width: '350px', height: '350px', background: '#ec4899', bottom: '0', left: '30%' }}
      />

      <Navbar />
      <HeroSection />
      <DetectorSection />
      <HowItWorks />
      <StatsSection />
      <FeaturesSection />
      <MarqueeSection />
      <CTASection />
      <Footer />
    </main>
  )
}
