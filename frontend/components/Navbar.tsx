'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Brain, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SachAI</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/#detector" className="hover:text-white transition-colors">Detector</Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/history" className="hover:text-white transition-colors">History</Link>
          </div>

          {/* Status badge + mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-slate-300">
              <span className="pulse-dot" />
              <span>Live</span>
            </div>
            <button
              className="md:hidden p-2 rounded-lg glass"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-white/5 flex flex-col gap-3 text-sm text-slate-400">
            <Link href="/#detector" onClick={() => setOpen(false)} className="hover:text-white transition-colors px-2">Detector</Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)} className="hover:text-white transition-colors px-2">How It Works</Link>
            <Link href="/#features" onClick={() => setOpen(false)} className="hover:text-white transition-colors px-2">Features</Link>
            <Link href="/history" onClick={() => setOpen(false)} className="hover:text-white transition-colors px-2">History</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
