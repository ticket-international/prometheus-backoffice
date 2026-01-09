'use client';

import { useState, useEffect } from 'react';
import { Dispute } from '@/types/disputes';
import PayPalDisputeList from '@/components/PayPalDisputeList';
import DisputeDetailOverlay from '@/components/DisputeDetailOverlay';
import PaymentTypeStats from '@/components/PaymentTypeStats';
import { mockPaymentStats } from '@/lib/mockPaymentStats';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';

export default function ZahlungenPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { session } = useAuth();
  const { selectedSiteId } = useSite();

  useEffect(() => {
    if (session && selectedSiteId !== null) {
      fetchDisputes();
    }
  }, [session, selectedSiteId]);

  const fetchDisputes = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        apikey: session.apiKey,
      });

      if (selectedSiteId !== null && selectedSiteId !== 0) {
        params.append('siteid', selectedSiteId.toString());
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-paypal-disputes?${params}`;
      const headers = {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }

      const data = await response.json();
      setDisputes(data.items || []);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setError('Fehler beim Laden der PayPal-Konfliktfälle');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeDetails = async (disputeId: string) => {
    if (!session) return;

    try {
      setLoadingDetails(true);

      const params = new URLSearchParams({
        apikey: session.apiKey,
        disputeId: disputeId,
      });

      if (selectedSiteId !== null && selectedSiteId !== 0) {
        params.append('siteid', selectedSiteId.toString());
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-dispute-details?${params}`;
      const headers = {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch dispute details');
      }

      const data = await response.json();
      setSelectedDispute(data);
    } catch (err) {
      console.error('Error fetching dispute details:', err);
      setError('Fehler beim Laden der Dispute-Details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDisputeClick = (dispute: Dispute) => {
    fetchDisputeDetails(dispute.dispute_id);
  };

  const stats = {
    total: disputes.length,
    requiresAction: disputes.filter(d => d.status === 'WAITING_FOR_SELLER_RESPONSE').length,
    won: disputes.filter(d => d.outcome === 'WON').length,
    lost: disputes.filter(d => d.outcome === 'LOST').length,
    totalAmount: disputes.reduce((sum, d) => sum + parseFloat(d.dispute_amount.value), 0),
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Zahlungen
        </h1>
        <p className="text-muted-foreground mt-2">
          Übersicht aller PayPal-Konfliktfälle und Zahlungsstreitigkeiten
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Lade Daten...</div>
        </div>
      ) : error ? (
        <div className="card p-6 border-destructive/50">
          <div className="flex items-center gap-3 text-destructive">
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="card p-4 sm:p-5 space-y-3">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Gesamt
                </h3>
              </header>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {stats.total}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Konfliktfälle
              </p>
            </div>

            <div className="card p-4 sm:p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Aktion erforderlich
                </h3>
                <FiAlertCircle className="text-amber-500" size={16} />
              </header>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight text-amber-500">
                  {stats.requiresAction}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Warte auf Antwort
              </p>
            </div>

            <div className="card p-4 sm:p-5 space-y-3 border-emerald-500/30 bg-emerald-500/5">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Gewonnen
                </h3>
                <FiCheckCircle className="text-emerald-500" size={16} />
              </header>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight text-emerald-500">
                  {stats.won}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Erfolgreiche Fälle
              </p>
            </div>

            <div className="card p-4 sm:p-5 space-y-3 border-red-500/30 bg-red-500/5">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Verloren
                </h3>
                <FiXCircle className="text-red-500" size={16} />
              </header>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight text-red-500">
                  {stats.lost}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Verlorene Fälle
              </p>
            </div>

            <div className="card p-4 sm:p-5 space-y-3">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Gesamtbetrag
                </h3>
              </header>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {stats.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Streitwert
              </p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  PayPal-Konfliktfälle
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Alle Zahlungsstreitigkeiten im Überblick
                </p>
              </div>
            </div>

            <PayPalDisputeList
              disputes={disputes}
              onDisputeClick={handleDisputeClick}
            />
          </div>

          <PaymentTypeStats stats={mockPaymentStats} />
        </>
      )}

      <DisputeDetailOverlay
        dispute={selectedDispute}
        isOpen={!!selectedDispute}
        onClose={() => setSelectedDispute(null)}
      />
    </div>
  );
}
