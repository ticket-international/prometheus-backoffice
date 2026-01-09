'use client';

import { useState } from 'react';
import { Dispute } from '@/types/disputes';
import { FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight, FiClock, FiXCircle } from 'react-icons/fi';

interface PayPalDisputeListProps {
  disputes: Dispute[];
  onDisputeClick: (dispute: Dispute) => void;
}

const ITEMS_PER_PAGE = 10;

export default function PayPalDisputeList({ disputes, onDisputeClick }: PayPalDisputeListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedDisputes = [...disputes].sort((a, b) => {
    return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
  });

  const totalPages = Math.ceil(sortedDisputes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDisputes = sortedDisputes.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (date.getFullYear() === 1899) return '-';
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (date.getFullYear() === 1899) return '-';
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (dispute: Dispute) => {
    if (dispute.status === 'WAITING_FOR_SELLER_RESPONSE') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-500/15 text-amber-400 border-amber-500/30 flex items-center gap-1.5">
          <FiAlertCircle size={12} />
          Aktion erforderlich
        </span>
      );
    }
    if (dispute.status === 'WAITING_FOR_BUYER_RESPONSE') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/30 flex items-center gap-1.5">
          <FiClock size={12} />
          Warte auf Käufer
        </span>
      );
    }
    if (dispute.status === 'RESOLVED') {
      if (dispute.outcome === 'WON') {
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
            <FiCheckCircle size={12} />
            Gewonnen
          </span>
        );
      }
      if (dispute.outcome === 'LOST') {
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-500/15 text-red-400 border-red-500/30 flex items-center gap-1.5">
            <FiXCircle size={12} />
            Verloren
          </span>
        );
      }
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-muted text-muted-foreground border-border">
          Gelöst
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-muted text-muted-foreground border-border">
        {dispute.status}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'MERCHANDISE_OR_SERVICE_NOT_RECEIVED': 'Ware nicht erhalten',
      'UNAUTHORISED': 'Nicht autorisiert',
      'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED': 'Nicht wie beschrieben',
      'CREDIT_NOT_PROCESSED': 'Gutschrift nicht verarbeitet'
    };
    return labels[reason] || reason;
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Dispute ID
              </th>
              <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Erstellt
              </th>
              <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Grund
              </th>
              <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Betrag
              </th>
              <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Frist
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentDisputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Keine Dispute-Fälle gefunden
                </td>
              </tr>
            ) : (
              currentDisputes.map((dispute) => (
                <tr
                  key={dispute.dispute_id}
                  onClick={() => onDisputeClick(dispute)}
                  className="hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-xs font-mono text-foreground">
                      {dispute.dispute_id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-foreground">
                      {formatDate(dispute.create_time)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-foreground">
                      {getReasonLabel(dispute.reason)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-foreground">
                      {dispute.dispute_amount.value} {dispute.dispute_amount.currency_code}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(dispute)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-foreground">
                      {formatDate(dispute.seller_response_due_date)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Seite {currentPage} von {totalPages} ({sortedDisputes.length} Einträge gesamt)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              <FiChevronLeft size={14} />
              Zurück
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
            >
              Weiter
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
