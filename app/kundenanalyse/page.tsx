'use client';

import { FiUsers, FiPieChart, FiMapPin } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const customerTypeData = [
  { name: "Stammkunden", value: 680, color: "hsl(var(--chart-1))" },
  { name: "Neukunden", value: 320, color: "hsl(var(--chart-2))" },
  { name: "Gelegenheitskunden", value: 450, color: "hsl(var(--chart-3))" },
];

const ageGroupData = [
  { age: "16-24", count: 420 },
  { age: "25-34", count: 580 },
  { age: "35-44", count: 380 },
  { age: "45-54", count: 240 },
  { age: "55+", count: 180 },
];

const locationData = [
  { city: "Berlin", customers: 520 },
  { city: "Hamburg", customers: 380 },
  { city: "München", customers: 290 },
  { city: "Köln", customers: 220 },
  { city: "Frankfurt", customers: 180 },
];

export default function Kundenanalyse() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <FiUsers className="text-xl text-foreground" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Kundenanalyse</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Gesamt Kunden</div>
          <div className="text-2xl font-semibold">1.450</div>
          <div className="text-xs text-chart-1 mt-1">+15% vs. Vormonat</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Neukunden</div>
          <div className="text-2xl font-semibold">320</div>
          <div className="text-xs text-chart-2 mt-1">+22% vs. Vormonat</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Stammkunden</div>
          <div className="text-2xl font-semibold">680</div>
          <div className="text-xs text-chart-1 mt-1">47% Anteil</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Ø Besuche/Kunde</div>
          <div className="text-2xl font-semibold">3.8</div>
          <div className="text-xs text-chart-1 mt-1">+0.3 vs. Vormonat</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiPieChart className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Kundentypen</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {customerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiUsers className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Altersgruppen</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="age"
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
              />
              <Bar
                dataKey="count"
                name="Kunden"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiMapPin className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Top Städte</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="city"
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
            />
            <Bar
              dataKey="customers"
              name="Kunden"
              fill="hsl(var(--chart-4))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
