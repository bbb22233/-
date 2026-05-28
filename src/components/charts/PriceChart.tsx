'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { PricePoint } from '@/types'

interface PriceChartProps {
  data: PricePoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-emerald-400">YES: {payload[0]?.value}%</p>
        <p className="text-red-400">NO: {payload[1]?.value}%</p>
      </div>
    )
  }
  return null
}

export function PriceChart({ data }: PriceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="yesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="noGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="yes" stroke="#10b981" strokeWidth={2} fill="url(#yesGradient)" dot={false} />
        <Area type="monotone" dataKey="no" stroke="#ef4444" strokeWidth={2} fill="url(#noGradient)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
