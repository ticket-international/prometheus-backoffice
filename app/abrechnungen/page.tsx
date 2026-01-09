'use client';

import { FiDollarSign, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyRevenueData = [
  { month: "Jan", revenue: 48200, costs: 18500, profit: 29700 },
  { month: "Feb", revenue: 52800, costs: 19200, profit: 33600 },
  { month: "Mär", revenue: 49500, costs: 18900, profit: 30600 },
  { month: "Apr", revenue: 63200, costs: 21200, profit: 42000 },
  { month: "Mai", revenue: 58900, costs: 20100, profit: 38800 },
  { month: "Jun", revenue: 71500, costs: 23400, profit: 48100 },
];

const paymentMethodData = [
  { method: "Kreditkarte", value: 58, color: "hsl(var(--chart-1))" },
  { method: "PayPal", value: 24, color: "hsl(var(--chart-2))" },
  { method: "Sofortüberweisung", value: 12, color: "hsl(var(--chart-3))" },
  { method: "Gutschein", value: 6, color: "hsl(var(--chart-4))" },
];

const invoiceStatusData = [
  { status: "Bezahlt", count: 1820 },
  { status: "Offen", count: 145 },
  { status: "Überfällig", count: 32 },
  { status: "Storniert", count: 89 },
];

export default function Abrechnungen() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <FiDollarSign className="text-xl text-foreground" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Abrechnungen</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiDollarSign className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Gesamt Umsatz</div>
          </div>
          <div className="text-2xl font-semibold">71.500 €</div>
          <div className="text-xs text-chart-1 mt-1">+21% vs. Mai</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted-foreground mb-1">Profit</div>
          <div className="text-2xl font-semibold">48.100 €</div>
          <div className="text-xs text-chart-1 mt-1">67.3% Marge</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiCheckCircle className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Bezahlte Rechnungen</div>
          </div>
          <div className="text-2xl font-semibold">1.820</div>
          <div className="text-xs text-chart-1 mt-1">87.2% Quote</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiAlertCircle className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Offene Rechnungen</div>
          </div>
          <div className="text-2xl font-semibold">177</div>
          <div className="text-xs text-chart-2 mt-1">8.5% Quote</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiDollarSign className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Umsatz & Profit Entwicklung</h2>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyRevenueData}>
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
              dataKey="revenue"
              name="Umsatz"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="costs"
              name="Kosten"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiCreditCard className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Zahlungsmethoden</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, value }) => `${method} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
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
            <FiCheckCircle className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Rechnungsstatus</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={invoiceStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="status"
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
                name="Anzahl"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
