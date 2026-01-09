'use client';

import { Dispute } from '@/types/disputes';
import { FiX, FiAlertCircle, FiDollarSign, FiClock, FiInfo, FiTag, FiCalendar, FiUser, FiFileText, FiTrendingDown, FiShoppingBag } from 'react-icons/fi';

interface DisputeDetailOverlayProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DisputeDetailOverlay({ dispute, isOpen, onClose }: DisputeDetailOverlayProps) {
  if (!isOpen || !dispute) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (date.getFullYear() === 1899) return 'Nicht verfügbar';
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, outcome: string) => {
    if (status === 'WAITING_FOR_SELLER_RESPONSE') {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (status === 'WAITING_FOR_BUYER_RESPONSE') {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    if (status === 'RESOLVED') {
      if (outcome === 'WON') {
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      }
      if (outcome === 'LOST') {
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      }
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  const getStatusLabel = (status: string, outcome: string) => {
    if (status === 'WAITING_FOR_SELLER_RESPONSE') return 'Aktion erforderlich';
    if (status === 'WAITING_FOR_BUYER_RESPONSE') return 'Warte auf Käufer';
    if (status === 'RESOLVED') {
      if (outcome === 'WON') return 'Gewonnen';
      if (outcome === 'LOST') return 'Verloren';
      return 'Gelöst';
    }
    return status;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'MERCHANDISE_OR_SERVICE_NOT_RECEIVED': 'Ware oder Dienstleistung nicht erhalten',
      'UNAUTHORISED': 'Nicht autorisierte Transaktion',
      'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED': 'Ware oder Dienstleistung nicht wie beschrieben',
      'CREDIT_NOT_PROCESSED': 'Gutschrift nicht verarbeitet'
    };
    return labels[reason] || reason;
  };

  const getLifeCycleLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'INQUIRY': 'Anfrage',
      'CHARGEBACK': 'Rückbuchung',
      'PRE_ARBITRATION': 'Vor-Schiedsverfahren',
      'ARBITRATION': 'Schiedsverfahren'
    };
    return labels[stage] || stage;
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      'INTERNAL': 'Intern',
      'EXTERNAL': 'Extern'
    };
    return labels[channel] || channel;
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CREDIT': 'Gutschrift',
      'DEBIT': 'Belastung'
    };
    return labels[type] || type;
  };

  const getMovementReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'DISPUTE_SETTLEMENT': 'Streitbeilegung',
      'DISPUTE_FEE': 'Streitgebühr',
      'REVERSED_TRANSACTION_FEE': 'Rückerstattete Transaktionsgebühr'
    };
    return labels[reason] || reason;
  };

  const getEvidenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PROOF_OF_FULFILLMENT': 'Erfüllungsnachweis',
      'CREATE': 'Erstellt',
      'PROOF_OF_DELIVERY_SIGNATURE': 'Zustellungsnachweis',
      'PROOF_OF_REFUND': 'Rückerstattungsnachweis'
    };
    return labels[type] || type;
  };

  const getAdjudicationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PAYOUT_TO_BUYER': 'Auszahlung an Käufer',
      'RECOVER_FROM_SELLER': 'Rückforderung vom Verkäufer',
      'REFUND_TO_BUYER': 'Rückerstattung an Käufer'
    };
    return labels[type] || type;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-4xl max-h-[95vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 bg-background/80 hover:bg-background backdrop-blur-md rounded-xl transition-all border border-border shadow-lg"
          >
            <FiX size={20} className="text-foreground" />
          </button>

          <div className="overflow-y-auto max-h-[95vh]">
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 border-b border-border">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">PayPal Dispute</h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <FiTag className="text-primary" size={16} />
                    <span className="font-mono text-xs">{dispute.dispute_id}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusBadge(dispute.status, dispute.outcome || '')}`}>
                  {getStatusLabel(dispute.status, dispute.outcome || '')}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiDollarSign className="text-primary" size={20} />
                    <span>Betragsinformationen</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Streitbetrag</div>
                      <div className="text-foreground font-semibold text-lg">
                        {dispute.dispute_amount.value} {dispute.dispute_amount.currency_code}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiClock className="text-primary" size={20} />
                    <span>Zeitinformationen</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Erstellt</div>
                      <div className="text-foreground font-medium">{formatDateTime(dispute.create_time)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Aktualisiert</div>
                      <div className="text-foreground font-medium">{formatDateTime(dispute.update_time)}</div>
                    </div>
                    {dispute.seller_response_due_date && new Date(dispute.seller_response_due_date).getFullYear() > 1900 && (
                      <div>
                        <div className="text-muted-foreground mb-1">Antwortfrist</div>
                        <div className="text-amber-400 font-medium">{formatDateTime(dispute.seller_response_due_date)}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiInfo className="text-primary" size={20} />
                    <span>Dispute-Details</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Grund</div>
                      <div className="text-foreground font-medium">{getReasonLabel(dispute.reason)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Status</div>
                      <div className="text-foreground font-medium">{dispute.dispute_state}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Lebenszyklus-Phase</div>
                      <div className="text-foreground font-medium">{getLifeCycleLabel(dispute.dispute_life_cycle_stage)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Kanal</div>
                      <div className="text-foreground font-medium">{getChannelLabel(dispute.dispute_channel)}</div>
                    </div>
                    {dispute.outcome && (
                      <div>
                        <div className="text-muted-foreground mb-1">Ergebnis</div>
                        <div className={`font-medium ${dispute.outcome === 'WON' ? 'text-emerald-400' : dispute.outcome === 'LOST' ? 'text-red-400' : 'text-foreground'}`}>
                          {dispute.outcome === 'WON' ? 'Gewonnen' : dispute.outcome === 'LOST' ? 'Verloren' : dispute.outcome}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiCalendar className="text-primary" size={20} />
                    <span>Transaktionsdetails</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    {dispute.disputed_transactions.map((transaction, idx) => (
                      <div key={idx}>
                        <div className="text-muted-foreground mb-1">Käufer-Transaktions-ID</div>
                        <div className="text-foreground font-mono text-xs break-all">
                          {transaction.buyer_transaction_id}
                        </div>
                        {transaction.seller_transaction_id && (
                          <>
                            <div className="text-muted-foreground mb-1 mt-2">Verkäufer-Transaktions-ID</div>
                            <div className="text-foreground font-mono text-xs break-all">
                              {transaction.seller_transaction_id}
                            </div>
                          </>
                        )}
                        {transaction.seller?.merchant_id && (
                          <>
                            <div className="text-muted-foreground mb-1 mt-2">Händler-ID</div>
                            <div className="text-foreground font-mono text-xs">
                              {transaction.seller.merchant_id}
                            </div>
                          </>
                        )}
                        {transaction.buyer && (
                          <>
                            <div className="text-muted-foreground mb-1 mt-2">Käufer</div>
                            <div className="text-foreground font-medium text-xs">
                              {transaction.buyer.name}
                            </div>
                            {transaction.buyer.email && (
                              <div className="text-muted-foreground text-xs">
                                {transaction.buyer.email}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {dispute.disputed_transactions.some(t => t.items && t.items.length > 0) && (
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiShoppingBag className="text-primary" size={20} />
                    <span>Gekaufte Artikel</span>
                  </div>
                  <div className="space-y-3">
                    {dispute.disputed_transactions.map((transaction, txIdx) => (
                      transaction.items?.map((item, itemIdx) => (
                        <div key={`${txIdx}-${itemIdx}`} className="p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="text-xs text-foreground">
                            {item.item_description || item.item_name || 'Keine Beschreibung'}
                          </div>
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              )}

              {dispute.money_movements && dispute.money_movements.length > 0 && (
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiTrendingDown className="text-primary" size={20} />
                    <span>Geldbewegungen</span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-muted text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Datum</th>
                          <th className="px-3 py-2 font-medium">Typ</th>
                          <th className="px-3 py-2 font-medium">Grund</th>
                          <th className="px-3 py-2 font-medium">Betroffen</th>
                          <th className="px-3 py-2 font-medium text-right">Betrag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dispute.money_movements.map((movement, idx) => (
                          <tr key={idx} className="hover:bg-muted/60">
                            <td className="px-3 py-2 text-muted-foreground">
                              {formatDateTime(movement.initiated_time)}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                movement.type === 'CREDIT' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                              }`}>
                                {getMovementTypeLabel(movement.type)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {getMovementReasonLabel(movement.reason)}
                            </td>
                            <td className="px-3 py-2 text-foreground">
                              {movement.affected_party === 'BUYER' ? 'Käufer' : movement.affected_party === 'SELLER' ? 'Verkäufer' : movement.affected_party}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {movement.amount.value} {movement.amount.currency_code}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {dispute.adjudications && dispute.adjudications.length > 0 && (
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiInfo className="text-primary" size={20} />
                    <span>Entscheidungen</span>
                  </div>
                  <div className="space-y-3">
                    {dispute.adjudications.map((adj, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="text-xs font-semibold text-foreground">
                            {getAdjudicationTypeLabel(adj.type)}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(adj.adjudication_time)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Phase: {getLifeCycleLabel(adj.dispute_life_cycle_stage)}
                        </div>
                        {adj.reason && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Grund: {adj.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dispute.evidences && dispute.evidences.length > 0 && (
                <div className="card p-5 space-y-4">
                  <div className="flex items-center gap-3 text-foreground font-semibold">
                    <FiFileText className="text-primary" size={20} />
                    <span>Beweise & Dokumente</span>
                  </div>
                  <div className="space-y-4">
                    {dispute.evidences.map((evidence, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="text-sm font-semibold text-foreground mb-1">
                              {getEvidenceTypeLabel(evidence.evidence_type)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(evidence.date)} • Phase: {getLifeCycleLabel(evidence.dispute_life_cycle_stage)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Quelle: {evidence.source === 'SUBMITTED_BY_BUYER' ? 'Käufer' : evidence.source === 'SUBMITTED_BY_SELLER' ? 'Verkäufer' : evidence.source}
                            </div>
                          </div>
                        </div>
                        {evidence.notes && (
                          <div className="mt-3 p-3 rounded bg-background/50 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Notizen:</div>
                            <div className="text-xs text-foreground whitespace-pre-wrap">
                              {evidence.notes}
                            </div>
                          </div>
                        )}
                        {evidence.documents && evidence.documents.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-muted-foreground mb-2">Dokumente:</div>
                            <div className="space-y-2">
                              {evidence.documents.map((doc, docIdx) => (
                                <a
                                  key={docIdx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border hover:bg-muted/50 transition-colors text-xs text-primary"
                                >
                                  <FiFileText size={14} />
                                  {doc.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dispute.status === 'WAITING_FOR_SELLER_RESPONSE' && (
                <div className="card border-amber-500/70 bg-amber-500/10 p-5 flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-amber-foreground text-sm font-semibold flex-shrink-0">
                    <FiAlertCircle />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Aktion erforderlich
                    </h3>
                    <p className="mt-1 text-xs text-amber-400">
                      Bitte antworten Sie auf diesen Dispute-Fall bis zum {formatDateTime(dispute.seller_response_due_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
