'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiAlertCircle, FiEye, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Invoice } from '@/types/invoices';
import { fetchInvoicesFromAPI, downloadInvoicePDF } from '@/lib/invoicesService';
import { getMonthName } from '@/lib/mockInvoices';
import InvoicePreview from '@/components/InvoicePreview';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';
import { toast } from 'sonner';

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
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const itemsPerPage = 6;
  const { session } = useAuth();
  const { selectedSiteId } = useSite();

  useEffect(() => {
    if (session && selectedSiteId) {
      loadInvoices();
    }
  }, [session, selectedSiteId]);

  const loadInvoices = async () => {
    if (!session || selectedSiteId === null || selectedSiteId === 0) {
      setError('Bitte wählen Sie einen Standort aus');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvoicesFromAPI(session.apiKey, selectedSiteId);
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Abrechnungen');
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

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (!session || selectedSiteId === null || selectedSiteId === 0) {
      toast.error('Bitte wählen Sie einen Standort aus');
      return;
    }

    setDownloadingInvoiceId(invoice.id);
    try {
      const fileName = `Rechnung_${getMonthName(invoice.month)}_${invoice.year}_V${invoice.version}.pdf`;
      await downloadInvoicePDF(session.apiKey, selectedSiteId, invoice.invoiceId, fileName);
      toast.success('Rechnung erfolgreich heruntergeladen');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Herunterladen der Rechnung');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearsFromInvoices = Array.from(new Set(invoices.map(inv => inv.year)));
  const allYears = Array.from(new Set([currentYear, ...yearsFromInvoices])).sort((a, b) => b - a);
  const availableYears = allYears;
  const filteredInvoices = invoices.filter(inv => inv.year === selectedYear);
  const groupedInvoices = groupInvoicesByPeriod(filteredInvoices);

  const totalPages = Math.ceil(groupedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = groupedInvoices.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Abrechnungen anzeigen
        </h1>
        <p className="text-muted-foreground mt-2">
          Übersicht aller Abrechnungen und Auszahlungen nach Perioden
        </p>
      </header>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiCalendar className="text-muted-foreground" size={18} />
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
        <button
          onClick={loadInvoices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          Aktualisieren
        </button>
      </div>

      {!loading && groupedInvoices.length > 0 && (
        <div className="card p-5 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Gesamt: <span className="font-semibold text-foreground">{groupedInvoices.length} Abrechnungsperiode(n)</span> im Jahr {selectedYear}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">Gesamtauszahlung:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(groupedInvoices.reduce((sum, g) => sum + g.activeInvoice.payoutAmount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <FiRefreshCw className="animate-spin inline-block mr-2" size={16} />
            Lade Abrechnungen...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              <FiAlertCircle size={16} />
              {error}
            </div>
          </div>
        ) : groupedInvoices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Keine Abrechnungen für das Jahr {selectedYear} gefunden
          </div>
        ) : (
          <div>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold tracking-tight">
                Abrechnungen {selectedYear}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Alle Abrechnungsperioden im Überblick
              </p>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full text-left">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Monat / Jahr
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                      Bruttobetrag
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                      Kundenanteil
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                      Auszahlung
                    </th>
                    <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-center">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
            {paginatedInvoices.map((group) => {
              const isExpanded = isPeriodExpanded(group.year, group.month, group.period);
              const hasMultipleVersions = group.invoices.length > 1;

              return (
                <>
                <tr key={`${group.year}-${group.month}-${group.period}`} className="hover:bg-muted/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {getMonthName(group.month)} {group.year}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-[11px] text-muted-foreground">
                            {formatDate(group.activeInvoice.periodFrom)} - {formatDate(group.activeInvoice.periodTo)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium text-muted-foreground">
                              P{group.period}
                            </div>
                            {hasMultipleVersions && (
                              <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-medium text-amber-400 flex items-center gap-1">
                                <FiAlertCircle size={10} />
                                {group.invoices.length}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {formatCurrency(group.activeInvoice.grossAmount)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-chart-4">
                      {formatCurrency(group.activeInvoice.customerShare)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-chart-1">
                      {formatCurrency(group.activeInvoice.payoutAmount)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreviewInvoice(group.activeInvoice)}
                          className="p-2 bg-muted hover:bg-muted/80 text-white border border-border rounded-lg transition-colors"
                          title="Rechnung anzeigen"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(group.activeInvoice)}
                          disabled={downloadingInvoiceId === group.activeInvoice.id}
                          className="p-2 bg-muted hover:bg-muted/80 text-white border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Als PDF herunterladen"
                        >
                          {downloadingInvoiceId === group.activeInvoice.id ? (
                            <FiRefreshCw size={16} className="animate-spin" />
                          ) : (
                            <FiDownload size={16} />
                          )}
                        </button>
                        {hasMultipleVersions && (
                          <button
                            onClick={() => togglePeriodExpansion(group.year, group.month, group.period)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title={isExpanded ? 'Versionen ausblenden' : 'Versionen anzeigen'}
                          >
                            {isExpanded ? (
                              <FiChevronUp className="text-muted-foreground" size={16} />
                            ) : (
                              <FiChevronDown className="text-muted-foreground" size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>

                  {isExpanded && hasMultipleVersions && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 bg-muted/30">
                        <div className="space-y-2">
                          {group.invoices.filter(inv => !inv.isActive).map((invoice) => (
                            <div
                              key={invoice.id}
                              className="p-3 bg-card rounded-lg border border-border opacity-70"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 grid grid-cols-5 gap-3 items-center text-xs">
                                  <div className="col-span-1">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium text-muted-foreground">
                                        V{invoice.version}
                                      </span>
                                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-medium text-red-400">
                                        VERALTET
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                      {formatDate(invoice.createdAt)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-foreground">{formatCurrency(invoice.grossAmount)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-chart-4">{formatCurrency(invoice.customerShare)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-chart-1">{formatCurrency(invoice.payoutAmount)}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handlePreviewInvoice(invoice)}
                                        className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
                                        title="Rechnung anzeigen"
                                      >
                                        <FiEye size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDownloadInvoice(invoice)}
                                        disabled={downloadingInvoiceId === invoice.id}
                                        className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Als PDF herunterladen"
                                      >
                                        {downloadingInvoiceId === invoice.id ? (
                                          <FiRefreshCw size={14} className="animate-spin" />
                                        ) : (
                                          <FiDownload size={14} />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {!loading && groupedInvoices.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Seite {currentPage} von {totalPages} ({groupedInvoices.length} Einträge gesamt)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              <FiChevronLeft size={14} />
              Zurück
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              Weiter
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <InvoicePreview
        invoice={previewInvoice}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
