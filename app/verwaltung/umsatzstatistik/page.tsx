'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
  FiCreditCard,
  FiCalendar,
  FiDownload,
  FiBarChart2,
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { TimeInterval } from '@/types/revenue';
import {
  generateMockRevenueData,
  filterRevenueByDateRange,
  aggregateRevenueByInterval,
  calculateRevenueSummary,
  formatDateByInterval,
} from '@/lib/mockRevenue';

export default function UmsatzstatistikPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [interval, setInterval] = useState<TimeInterval>('day');

  const allData = useMemo(() => generateMockRevenueData(90), []);

  const filteredData = useMemo(() => {
    const filtered = filterRevenueByDateRange(allData, startDate, endDate);
    return aggregateRevenueByInterval(filtered, interval);
  }, [allData, startDate, endDate, interval]);

  const summary = useMemo(() => calculateRevenueSummary(filteredData), [filteredData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const chartData = filteredData.map(stat => ({
    date: formatDateByInterval(stat.date, interval),
    'Gesamtumsatz': stat.totalRevenue,
    'Artikel': stat.articleRevenue,
    'Gutscheine': stat.voucherRevenue,
    'Tickets': stat.totalRevenue - stat.articleRevenue - stat.voucherRevenue,
  }));

  const paymentMethodData = [
    { name: 'Visa/Master', value: summary.totalCardRevenue, color: 'hsl(var(--chart-1))' },
    { name: 'PayPal', value: summary.totalPaypalRevenue, color: 'hsl(var(--chart-2))' },
    { name: 'Gutscheine', value: summary.totalVoucherPayments, color: 'hsl(var(--chart-3))' },
  ];

  const revenueSourceData = [
    { name: 'Tickets', value: summary.totalRevenue - summary.totalArticleRevenue - summary.totalVoucherRevenue, color: 'hsl(var(--chart-1))' },
    { name: 'Artikel', value: summary.totalArticleRevenue, color: 'hsl(var(--chart-2))' },
    { name: 'Gutscheine', value: summary.totalVoucherRevenue, color: 'hsl(var(--chart-3))' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Umsatzstatistik</h1>
          <p className="text-sm text-muted-foreground">
            Detaillierte Übersicht über Umsätze und Einnahmen
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <FiDownload size={16} />
          Export
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <FiCalendar className="text-primary mt-1" size={20} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">Filtereinstellungen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Von</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Bis</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={today}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Zeitintervall</Label>
                <Select value={interval} onValueChange={(value) => setInterval(value as TimeInterval)}>
                  <SelectTrigger id="interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Pro Tag</SelectItem>
                    <SelectItem value="week">Pro Woche</SelectItem>
                    <SelectItem value="month">Pro Monat</SelectItem>
                    <SelectItem value="year">Pro Jahr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {filteredData.length} Einträge im gewählten Zeitraum
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gesamtumsatz</p>
              <p className="text-2xl font-bold text-chart-1">{formatCurrency(summary.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ø {formatCurrency(summary.averageDailyRevenue)}/Tag
              </p>
            </div>
            <div className="p-2 bg-chart-1/20 rounded-lg">
              <FiDollarSign className="text-chart-1" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Verkaufte Tickets</p>
              <p className="text-2xl font-bold text-chart-2">{summary.totalSoldTickets.toLocaleString('de-DE')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ø {formatCurrency(summary.averageTicketPrice)}/Ticket
              </p>
            </div>
            <div className="p-2 bg-chart-2/20 rounded-lg">
              <FiTrendingUp className="text-chart-2" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Umsatz Artikel</p>
              <p className="text-2xl font-bold text-chart-3">{formatCurrency(summary.totalArticleRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((summary.totalArticleRevenue / summary.totalRevenue) * 100).toFixed(1)}% vom Gesamtumsatz
              </p>
            </div>
            <div className="p-2 bg-chart-3/20 rounded-lg">
              <FiShoppingCart className="text-chart-3" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reservierte Tickets</p>
              <p className="text-2xl font-bold text-chart-4">{summary.totalReservedTickets.toLocaleString('de-DE')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Noch nicht abgeholt
              </p>
            </div>
            <div className="p-2 bg-chart-4/20 rounded-lg">
              <FiCalendar className="text-chart-4" size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Umsatzentwicklung</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Gesamtumsatz"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Umsatz nach Quelle</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueSourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiCreditCard className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Einnahmen nach Zahlungsmethode</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Umsatz nach Kategorie</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="Tickets" fill="hsl(var(--chart-1))" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Artikel" fill="hsl(var(--chart-2))" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Gutscheine" fill="hsl(var(--chart-3))" stackId="a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detaillierte Datenübersicht</h2>
          <Badge variant="secondary">{filteredData.length} Einträge</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Zeitraum</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Verkaufte Tickets</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Reservierte Tickets</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Gesamtumsatz</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Umsatz Artikel</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Umsatz Gutscheine</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">PayPal</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Visa/Master</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Gutscheine</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((stat, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-foreground">
                      {formatDateByInterval(stat.date, interval)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">{stat.soldTickets.toLocaleString('de-DE')}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-muted-foreground">{stat.reservedTickets.toLocaleString('de-DE')}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm font-semibold text-chart-1">
                      {formatCurrency(stat.totalRevenue)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">{formatCurrency(stat.articleRevenue)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">{formatCurrency(stat.voucherRevenue)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">{formatCurrency(stat.paypalRevenue)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">{formatCurrency(stat.cardRevenue)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">{formatCurrency(stat.voucherPayments)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/50">
                <td className="py-3 px-4">
                  <div className="text-sm font-bold text-foreground">Gesamt</div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {summary.totalSoldTickets.toLocaleString('de-DE')}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-muted-foreground">
                    {summary.totalReservedTickets.toLocaleString('de-DE')}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-chart-1">
                    {formatCurrency(summary.totalRevenue)}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {formatCurrency(summary.totalArticleRevenue)}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {formatCurrency(summary.totalVoucherRevenue)}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {formatCurrency(summary.totalPaypalRevenue)}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {formatCurrency(summary.totalCardRevenue)}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {formatCurrency(summary.totalVoucherPayments)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
