'use client';

import { Invoice } from '@/types/invoices';
import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';
import { getMonthName } from '@/lib/mockInvoices';

interface InvoicePreviewProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoicePreview({ invoice, isOpen, onClose }: InvoicePreviewProps) {
  if (!isOpen || !invoice) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const period = new Date(invoice.periodFrom).getDate() === 1 ? 1 : 2;
  const invoiceNumber = `${invoice.year}${String(invoice.month).padStart(2, '0')}${period}-V${invoice.version}`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200 print:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none print:relative print:z-0 print:p-0">
        <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto print:max-w-none print:max-h-none print:shadow-none print:rounded-none">

          <div className="absolute top-4 right-4 z-10 flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-lg"
              title="Drucken"
            >
              <FiPrinter size={20} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2.5 bg-chart-1 text-white hover:bg-chart-1/90 rounded-xl transition-all shadow-lg"
              title="Als PDF speichern"
            >
              <FiDownload size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-background/80 hover:bg-background backdrop-blur-md rounded-xl transition-all border border-border shadow-lg"
            >
              <FiX size={20} className="text-foreground" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[95vh] p-8 sm:p-12 print:overflow-visible print:max-h-none">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Abrechnung</h1>
                  <div className="text-sm text-gray-600">
                    <div>Rechnungsnummer: <span className="font-mono font-semibold">{invoiceNumber}</span></div>
                    <div>Erstellt am: {formatDate(invoice.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2">Status</div>
                  {invoice.isActive ? (
                    <div className="inline-block px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                      Aktiv
                    </div>
                  ) : (
                    <div className="inline-block px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                      Veraltet
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Abrechnungszeitraum</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Zeitraum</div>
                    <div className="font-semibold text-gray-900">
                      {getMonthName(invoice.month)} {invoice.year} - Periode {period}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Datum</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(invoice.periodFrom)} bis {formatDate(invoice.periodTo)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Abrechnungsdetails</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Position</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Betrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-4 text-sm text-gray-900">Bruttobetrag</td>
                      <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(invoice.grossAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 px-4 text-sm text-gray-900">
                        Kundenanteil
                        <div className="text-xs text-gray-500 mt-1">
                          ({((invoice.customerShare / invoice.grossAmount) * 100).toFixed(2)}% vom Bruttobetrag)
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-semibold text-amber-600">
                        - {formatCurrency(invoice.customerShare)}
                      </td>
                    </tr>
                    <tr className="border-b-2 border-gray-300 bg-emerald-50">
                      <td className="py-4 px-4 text-base font-bold text-gray-900">Auszahlungsbetrag</td>
                      <td className="py-4 px-4 text-right text-lg font-bold text-emerald-600">
                        {formatCurrency(invoice.payoutAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {invoice.notes && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">Hinweise</h3>
                  <p className="text-sm text-amber-800">{invoice.notes}</p>
                </div>
              )}

              <div className="mt-12 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Version: {invoice.version}</div>
                  <div>Letzte Aktualisierung: {formatDate(invoice.updatedAt)}</div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    Dieses Dokument wurde automatisch erstellt und ist ohne Unterschrift gültig.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0.z-50 *,
          .fixed.inset-0.z-50 *::before,
          .fixed.inset-0.z-50 *::after {
            visibility: visible !important;
          }
          .fixed.inset-0.z-50 {
            position: static !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
