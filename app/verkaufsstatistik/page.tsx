'use client';

import { FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: "Jan", umsatz: 45000, tickets: 1200, snacks: 8000 },
  { month: "Feb", umsatz: 52000, tickets: 1450, snacks: 9200 },
  { month: "Mär", umsatz: 48000, tickets: 1320, snacks: 8500 },
  { month: "Apr", umsatz: 61000, tickets: 1680, snacks: 10500 },
  { month: "Mai", umsatz: 58000, tickets: 1580, snacks: 9800 },
  { month: "Jun", umsatz: 67000, tickets: 1820, snacks: 11200 },
];

const dailySalesData = [
  { day: "Mo", verkaufe: 320, revenue: 8500 },
  { day: "Di", verkaufe: 280, revenue: 7200 },
  { day: "Mi", verkaufe: 340, revenue: 9100 },
  { day: "Do", verkaufe: 390, revenue: 10200 },
  { day: "Fr", verkaufe: 520, revenue: 14800 },
  { day: "Sa", verkaufe: 680, revenue: 19500 },
  { day: "So", verkaufe: 590, revenue: 16200 },
];

export default function Verkaufsstatistik() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <FiTrendingUp className="text-xl text-foreground" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Verkaufsstatistik</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Gesamt Umsatz</div>
          <div className="text-2xl font-semibold">67.000 €</div>
          <div className="text-xs text-chart-1 mt-1">+12% vs. Vormonat</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Tickets verkauft</div>
          <div className="text-2xl font-semibold">1.820</div>
          <div className="text-xs text-chart-1 mt-1">+8% vs. Vormonat</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Ø Bestellwert</div>
          <div className="text-2xl font-semibold">36.80 €</div>
          <div className="text-xs text-chart-1 mt-1">+3% vs. Vormonat</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiCalendar className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Umsatz Entwicklung (6 Monate)</h2>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="umsatz"
              name="Gesamt Umsatz"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="snacks"
              name="Snacks & Getränke"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiTrendingUp className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Wochenumsatz</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar
              dataKey="revenue"
              name="Umsatz (€)"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
