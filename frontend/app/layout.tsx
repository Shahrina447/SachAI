import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SachAI — Urdu Fake News Detection System',
  description: 'AI-powered Urdu fake news detection using xlm-RoBERTa. سچ کی پہچان',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ur">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
