'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Brain, Menu, X, User, ChevronDown } from 'lucide-react'

const PROFILE = { name: 'Shahrina447', role: 'Developer', avatar: null as string | null }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100/80 shadow-sm shadow-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center shadow-md shadow-purple-200 group-hover:shadow-purple-300 transition-shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black gradient-text tracking-tight">Verdade</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/#detector',     label: 'Detector' },
              { href: '/#how-it-works', label: 'How It Works' },
              { href: '/#features',     label: 'Features' },
              { href: '/history',       label: 'History' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Live badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <span className="pulse-dot" />
              Live
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="w-7 h-7 rounded-full btn-primary flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-700">{PROFILE.name}</span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-purple-100/50 z-20 overflow-hidden">
                    <div className="px-4 py-3.5 bg-gradient-to-br from-purple-50 to-cyan-50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shadow-md">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{PROFILE.name}</p>
                          <p className="text-xs text-slate-500">{PROFILE.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      {[
                        { href: '/history',   label: 'My History' },
                        { href: '/#detector', label: 'New Analysis' },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-purple-300 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-3 border-t border-slate-100 flex flex-col gap-0.5">
            {[
              { href: '/#detector',     label: 'Detector' },
              { href: '/#how-it-works', label: 'How It Works' },
              { href: '/#features',     label: 'Features' },
              { href: '/history',       label: 'History' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
