'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiRefreshCw, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp, FiAlertCircle, FiEye, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Invoice } from '@/types/invoices';
import { fetchInvoices } from '@/lib/api';
import { getMonthName } from '@/lib/mockInvoices';
import InvoicePreview from '@/components/InvoicePreview';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InvoicesByPeriod {
  year: number;
  month: number;
  period: number;
  invoices: Invoice[];
  activeInvoice: Invoice;
}

export default function AbrechnungenAnzeigenPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const groupInvoicesByPeriod = (invoices: Invoice[]): InvoicesByPeriod[] => {
    const grouped = new Map<string, InvoicesByPeriod>();

    invoices.forEach(invoice => {
      const period = new Date(invoice.periodFrom).getDate() === 1 ? 1 : 2;
      const key = `${invoice.year}-${invoice.month}-${period}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          year: invoice.year,
          month: invoice.month,
          period,
          invoices: [],
          activeInvoice: invoice
        });
      }

      const group = grouped.get(key)!;
      group.invoices.push(invoice);

      if (invoice.isActive) {
        group.activeInvoice = invoice;
      }
    });

    const result = Array.from(grouped.values());
    result.forEach(group => {
      group.invoices.sort((a, b) => b.version - a.version);
    });

    return result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return b.period - a.period;
    });
  };

  const togglePeriodExpansion = (year: number, month: number, period: number) => {
    const key = `${year}-${month}-${period}`;
    const newExpanded = new Set(expandedPeriods);

    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }

    setExpandedPeriods(newExpanded);
  };

  const isPeriodExpanded = (year: number, month: number, period: number) => {
    return expandedPeriods.has(`${year}-${month}-${period}`);
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewInvoice(null), 300);
  };

  const availableYears = Array.from(new Set(invoices.map(inv => inv.year))).sort((a, b) => b - a);
  const filteredInvoices = invoices.filter(inv => inv.year === selectedYear);
  const groupedInvoices = groupInvoicesByPeriod(filteredInvoices);

  const totalPages = Math.ceil(groupedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = groupedInvoices.slice(startIndex, endIndex);

  const chartData = useMemo(() => {
    const now = new Date();
    const last12Months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const monthInvoices = invoices.filter(inv =>
        inv.year === year && inv.month === month && inv.isActive
      );

      const grossAmount = monthInvoices.reduce((sum, inv) => sum + inv.grossAmount, 0);
      const payoutAmount = monthInvoices.reduce((sum, inv) => sum + inv.payoutAmount, 0);

      last12Months.push({
        name: `${getMonthName(month).substring(0, 3)} ${year.toString().substring(2)}`,
        Bruttobetrag: Math.round(grossAmount),
        Auszahlung: Math.round(payoutAmount)
      });
    }

    return last12Months;
  }, [invoices]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiFileText className="text-xl text-foreground" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Abrechnungen anzeigen</h1>
        </div>
        <button
          onClick={loadInvoices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          Aktualisieren
        </button>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <FiCalendar className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Filter</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Jahr:</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <FiDollarSign className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Übersicht der letzten 12 Monate</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number) => `${value.toLocaleString('de-DE')} €`}
            />
            <Legend
              wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="Bruttobetrag"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-3))' }}
            />
            <Line
              type="monotone"
              dataKey="Auszahlung"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <FiRefreshCw className="animate-spin inline-block mr-2" size={16} />
            Lade Abrechnungen...
          </div>
        ) : groupedInvoices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Keine Abrechnungen für das Jahr {selectedYear} gefunden
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedInvoices.map((group) => {
              const isExpanded = isPeriodExpanded(group.year, group.month, group.period);
              const hasMultipleVersions = group.invoices.length > 1;

              return (
                <div key={`${group.year}-${group.month}-${group.period}`} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-foreground">
                            {getMonthName(group.month)} {group.year}
                          </div>
                          <div className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium text-muted-foreground">
                            Periode {group.period}
                          </div>
                          {hasMultipleVersions && (
                            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-medium text-amber-400 flex items-center gap-1">
                              <FiAlertCircle size={10} />
                              {group.invoices.length} Versionen
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {formatDate(group.activeInvoice.periodFrom)} - {formatDate(group.activeInvoice.periodTo)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground mb-1">Bruttobetrag</div>
                        <div className="text-sm font-semibold text-foreground">
                          {formatCurrency(group.activeInvoice.grossAmount)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground mb-1">Kundenanteil</div>
                        <div className="text-sm font-semibold text-chart-4">
                          {formatCurrency(group.activeInvoice.customerShare)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground mb-1">Auszahlung</div>
                        <div className="text-sm font-bold text-chart-1">
                          {formatCurrency(group.activeInvoice.payoutAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewInvoice(group.activeInvoice)}
                        className="p-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
                        title="Rechnung anzeigen"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handlePreviewInvoice(group.activeInvoice)}
                        className="p-2 bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 border border-chart-1/20 rounded-lg transition-colors"
                        title="Als PDF herunterladen"
                      >
                        <FiDownload size={18} />
                      </button>
                      {hasMultipleVersions && (
                        <button
                          onClick={() => togglePeriodExpansion(group.year, group.month, group.period)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title={isExpanded ? 'Versionen ausblenden' : 'Versionen anzeigen'}
                        >
                          {isExpanded ? (
                            <FiChevronUp className="text-muted-foreground" size={18} />
                          ) : (
                            <FiChevronDown className="text-muted-foreground" size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && hasMultipleVersions && (
                    <div className="mt-4 ml-4 space-y-2 border-l-2 border-muted pl-4">
                      {group.invoices.filter(inv => !inv.isActive).map((invoice) => (
                        <div
                          key={invoice.id}
                          className="p-3 bg-muted/30 rounded-lg border border-border opacity-60"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium text-muted-foreground">
                                    Version {invoice.version}
                                  </span>
                                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-medium text-red-400">
                                    VERALTET
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  Erstellt: {formatDate(invoice.createdAt)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-muted-foreground">Brutto</div>
                                <div className="font-medium text-foreground">{formatCurrency(invoice.grossAmount)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-muted-foreground">Kunde</div>
                                <div className="font-medium text-chart-4">{formatCurrency(invoice.customerShare)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-muted-foreground">Auszahlung</div>
                                <div className="font-medium text-chart-1">{formatCurrency(invoice.payoutAmount)}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePreviewInvoice(invoice)}
                              className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors flex-shrink-0"
                              title="Rechnung anzeigen"
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && groupedInvoices.length > 0 && totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Seite {currentPage} von {totalPages} ({groupedInvoices.length} Abrechnungen gesamt)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <FiChevronLeft size={16} />
                Zurück
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Weiter
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground font-medium">Gesamt:</strong> {groupedInvoices.length} Abrechnungsperiode(n) im Jahr {selectedYear}
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-chart-1" size={14} />
              <span className="text-muted-foreground">Gesamtauszahlung:</span>
              <span className="font-bold text-foreground">
                {formatCurrency(groupedInvoices.reduce((sum, g) => sum + g.activeInvoice.payoutAmount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InvoicePreview
        invoice={previewInvoice}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
