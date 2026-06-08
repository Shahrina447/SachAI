'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUp, Database, Award, Globe } from 'lucide-react'

// Register Chart.js components — must be done before any <Line /> usage
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const chartData = {
  labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  datasets: [
    {
      label: 'Real News Verified',
      data: [3200, 4100, 4800, 5300, 6700, 7400],
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(167,139,250,0.08)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: '#a78bfa',
      pointRadius: 4,
    },
    {
      label: 'Fake News Detected',
      data: [1800, 2200, 2700, 3100, 3900, 4500],
      borderColor: '#f87171',
      backgroundColor: 'rgba(248,113,113,0.08)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: '#f87171',
      pointRadius: 4,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#cbd5e1',
        font: { size: 11 },
        boxWidth: 12,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15,21,48,0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
}

const STAT_CARDS = [
  { icon: Award, label: 'Model Accuracy', value: '91.2%', color: '#a78bfa' },
  { icon: Database, label: 'Training Samples', value: '10,083', color: '#22d3ee' },
  { icon: TrendingUp, label: 'F1 Score', value: '0.908', color: '#34d399' },
  { icon: Globe, label: 'Domains Covered', value: '15', color: '#fbbf24' },
]

export default function StatsSection() {
  return (
    <section id="stats" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Model <span className="gradient-text">Performance</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Fine-tuned on Ax-to-Grind Urdu dataset — expert-annotated across 15 domains
          </p>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center feature-card">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${s.color}22`, border: `1px solid ${s.color}33` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Line chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-6">
            Detection Trends (Simulated)
          </h3>
          <div style={{ height: '260px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </section>
  )
}
