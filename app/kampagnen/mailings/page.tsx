'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FiMail,
  FiSend,
  FiEdit3,
  FiClock,
  FiUsers,
  FiEye,
  FiAlertCircle,
  FiUserX,
  FiAlertTriangle,
} from 'react-icons/fi';
import { ApiMailing, ApiMailingsResponse } from '@/types/mailings';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';

type MailingStatus = 'sent' | 'scheduled' | 'draft';

export default function KampagnenMailingsPage() {
  const { session } = useAuth();
  const { selectedSiteId } = useSite();
  const [mailings, setMailings] = useState<ApiMailing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMailings();
  }, [selectedSiteId, session]);

  const loadMailings = async () => {
    if (!session?.apiKey || selectedSiteId === null) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-mailings?apikey=${encodeURIComponent(session.apiKey)}&siteID=${selectedSiteId}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.hTTPError || data.returnCode === 404) {
        setMailings([]);
        setError(null);
        return;
      }

      if (data.mailings && Array.isArray(data.mailings)) {
        setMailings(data.mailings);
      } else {
        setMailings([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mailings:', error);
      setError('Fehler beim Laden der Mailings');
    } finally {
      setIsLoading(false);
    }
  };

  const getMailingStatus = (mailing: ApiMailing): MailingStatus => {
    if (mailing.sentTime) {
      const sentDate = new Date(mailing.sentTime);
      const now = new Date();
      if (sentDate <= now) {
        return 'sent';
      }
    }

    if (mailing.startTime) {
      const startDate = new Date(mailing.startTime);
      const now = new Date();
      if (startDate > now) {
        return 'scheduled';
      }
    }

    return 'draft';
  };

  const getStatusBadge = (status: MailingStatus) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="default" className="bg-green-500 gap-1">
            <FiSend size={12} />
            Versendet
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="default" className="bg-blue-500 gap-1">
            <FiClock size={12} />
            Geplant
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary" className="gap-1">
            <FiEdit3 size={12} />
            In Arbeit
          </Badge>
        );
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sentMailings = mailings.filter(m => getMailingStatus(m) === 'sent');
  const scheduledMailings = mailings.filter(m => getMailingStatus(m) === 'scheduled');
  const draftMailings = mailings.filter(m => getMailingStatus(m) === 'draft');

  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <p className="text-center text-muted-foreground">Lade Mailings...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mailing-Kampagnen</h1>
          <p className="text-sm text-muted-foreground">
            Übersicht und Statistiken Ihrer Newsletter und E-Mail-Kampagnen
          </p>
        </div>
        <Button className="gap-2">
          <FiMail size={16} />
          Neues Mailing erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Versendet</p>
              <p className="text-2xl font-bold">{sentMailings.length}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FiSend size={20} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Geplant</p>
              <p className="text-2xl font-bold">{scheduledMailings.length}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FiClock size={20} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">In Arbeit</p>
              <p className="text-2xl font-bold">{draftMailings.length}</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <FiEdit3 size={20} className="text-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <FiAlertCircle size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {mailings.length === 0 && !error ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <FiMail size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Mailings vorhanden</p>
            <Button className="mt-4">
              Erstes Mailing erstellen
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {mailings.map((mailing) => {
            const status = getMailingStatus(mailing);
            const stats = mailing.statistics;
            const openRate = stats ? (stats.opensunique / stats.recipients) * 100 : 0;
            const clickRate = stats ? (stats.clicksunique / stats.recipients) * 100 : 0;
            const bounceRate = stats ? (stats.bounces / stats.recipients) * 100 : 0;
            const deliveryRate = stats ? ((stats.recipients - stats.bounces) / stats.recipients) * 100 : 0;

            return (
              <Card key={mailing.iD} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-6">
                  {/* Left side: Main info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">
                      {mailing.subject}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(status)}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{mailing.filterName}</span>
                      {selectedSiteId === 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <Badge variant="outline" className="text-xs">
                            {mailing.siteName}
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {stats && (
                        <>
                          <span>Empfänger: {stats.recipients.toLocaleString('de-DE')}</span>
                          <span>·</span>
                        </>
                      )}
                      {mailing.sentTime ? (
                        <span>Gesendet: {formatDateTime(mailing.sentTime)}</span>
                      ) : status === 'scheduled' && mailing.startTime ? (
                        <span>Geplant: {formatDateTime(mailing.startTime)}</span>
                      ) : mailing.created ? (
                        <span>Erstellt: {formatDateTime(mailing.created)}</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Right side: Stats boxes */}
                  {stats && status === 'sent' ? (
                    <div className="flex items-center gap-3">
                      {/* Versendet */}
                      <div className="relative overflow-hidden px-4 py-3 rounded-lg border border-border min-w-[110px] bg-card">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-500/5 transition-all"
                          style={{ width: `${Math.min(deliveryRate, 100)}%` }}
                        />
                        <div className="relative flex flex-col items-center justify-center">
                          <div className="text-xl font-bold text-foreground">
                            {deliveryRate.toFixed(2)} %
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            {(stats.recipients - stats.bounces).toLocaleString('de-DE')}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
                            Versendet
                          </div>
                        </div>
                      </div>

                      {/* Geöffnet */}
                      <div className="relative overflow-hidden px-4 py-3 rounded-lg border border-border min-w-[110px] bg-card">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 transition-all"
                          style={{ width: `${Math.min(openRate, 100)}%` }}
                        />
                        <div className="relative flex flex-col items-center justify-center">
                          <div className="text-xl font-bold text-foreground">
                            {openRate.toFixed(2)} %
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            {stats.opensunique.toLocaleString('de-DE')}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
                            Geöffnet
                          </div>
                        </div>
                      </div>

                      {/* Geklickt */}
                      <div className="relative overflow-hidden px-4 py-3 rounded-lg border border-border min-w-[110px] bg-card">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-500/5 transition-all"
                          style={{ width: `${Math.min(clickRate, 100)}%` }}
                        />
                        <div className="relative flex flex-col items-center justify-center">
                          <div className="text-xl font-bold text-foreground">
                            {clickRate.toFixed(2)} %
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            {stats.clicksunique.toLocaleString('de-DE')}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
                            Geklickt
                          </div>
                        </div>
                      </div>

                      {/* Gebounced */}
                      <div className="relative overflow-hidden px-4 py-3 rounded-lg border border-border min-w-[110px] bg-card">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-500/5 transition-all"
                          style={{ width: `${Math.min(bounceRate, 100)}%` }}
                        />
                        <div className="relative flex flex-col items-center justify-center">
                          <div className="text-xl font-bold text-foreground">
                            {bounceRate.toFixed(2)} %
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            {stats.bounces.toLocaleString('de-DE')}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wide">
                            Gebounced
                          </div>
                        </div>
                      </div>

                      {/* Edit button */}
                      <Button variant="ghost" size="sm" className="gap-2 ml-2">
                        <FiEdit3 size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground px-4">
                        Keine Statistiken verfügbar
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <FiEdit3 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
