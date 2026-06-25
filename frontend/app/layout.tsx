import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Verdade — Urdu Fake News Detection',
  description: 'AI-powered Urdu fake news detection using xlm-RoBERTa. سچ کی پہچان',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
