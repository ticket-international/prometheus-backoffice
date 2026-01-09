'use client';

import { FiMail, FiSend, FiMousePointer, FiShoppingCart } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mailings = [
  { name: "Premiere GALAXY WARS", openRate: 56, clickRate: 14, conversionRate: 4.2 },
  { name: "Family Sunday Aktion", openRate: 48, clickRate: 11, conversionRate: 3.6 },
  { name: "Montag 2für1", openRate: 37, clickRate: 8, conversionRate: 2.1 },
  { name: "Horror Night", openRate: 42, clickRate: 10, conversionRate: 3.0 },
];

const campaignsTable = [
  { name: "Premiere GALAXY WARS", period: "15.05 - 20.05", target: "Sci-Fi Fans", revenue: "8.450 €" },
  { name: "Family Sunday Aktion", period: "01.06 - 30.06", target: "Familien", revenue: "12.300 €" },
  { name: "Montag 2für1", period: "Jeden Montag", target: "Alle Kunden", revenue: "6.800 €" },
  { name: "Horror Night", period: "31.10 - 31.10", target: "Horror Fans", revenue: "5.200 €" },
  { name: "Student Special", period: "01.09 - 30.09", target: "Studenten", revenue: "4.900 €" },
  { name: "Sommer Festival", period: "15.07 - 31.08", target: "Alle Kunden", revenue: "15.600 €" },
];

export default function Mailings() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <FiMail className="text-xl text-foreground" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Mailings & Kampagnen</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiSend className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Gesendete Mailings</div>
          </div>
          <div className="text-2xl font-semibold">14</div>
          <div className="text-xs text-muted-foreground mt-1">letzten 30 Tage</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiMail className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Ø Öffnungsrate</div>
          </div>
          <div className="text-2xl font-semibold">41%</div>
          <div className="text-xs text-chart-1 mt-1">+3% vs. Vormonat</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiMousePointer className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Ø Klickrate (CTR)</div>
          </div>
          <div className="text-2xl font-semibold">9.5%</div>
          <div className="text-xs text-chart-1 mt-1">+1.2% vs. Vormonat</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiShoppingCart className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Conversion-Rate</div>
          </div>
          <div className="text-2xl font-semibold">3.2%</div>
          <div className="text-xs text-chart-1 mt-1">+0.4% vs. Vormonat</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiMail className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Kennzahlen je Mailing</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mailings}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar
              dataKey="openRate"
              name="Öffnungsrate"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="clickRate"
              name="Klickrate"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="conversionRate"
              name="Conversion-Rate"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiSend className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Letzte Kampagnen</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Kampagnenname</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Zeitraum</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Zielgruppe</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Umsatz</th>
              </tr>
            </thead>
            <tbody>
              {campaignsTable.map((campaign, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{campaign.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{campaign.period}</td>
                  <td className="py-3 px-2 text-muted-foreground">{campaign.target}</td>
                  <td className="py-3 px-2 text-right font-semibold">{campaign.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
