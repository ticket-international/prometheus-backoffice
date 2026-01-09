'use client';

import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import Image from 'next/image';
import PayPalDisputeList from '@/components/PayPalDisputeList';
import DisputeDetailOverlay from '@/components/DisputeDetailOverlay';
import { SiteSelector } from '@/components/SiteSelector';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useSite } from '@/lib/SiteContext';
import { useAuth } from '@/lib/AuthContext';
import { useDateRange } from '@/lib/DateRangeContext';
import { mockDisputes } from '@/lib/mockDisputes';
import { Dispute } from '@/types/disputes';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  date: string;
  value: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalRevenueYesterday: number;
  ticketRevenue: number;
  concessionRevenue: number;
  voucherRevenue: number;
  refunds: number;
  refundedTickets: number;
  last30Days: ChartData[];
  visitorsToday: number;
  visitorsYesterday: number;
  visitorsCurrentWeek: number;
  spp: number;
  sppYesterday: number;
  concessionsPerHead: number;
  onlineQuotaToday: number;
  onlineQuotaYesterday: number;
  onlineTicketsToday: number;
}

interface Movie {
  title: string;
  shows: number;
  revenue: string;
  occupancy: string;
  occupancyPercent: number;
  posterUrl: string;
}

const topMovies: Movie[] = [
  {
    title: 'Galactic Odyssey 2',
    shows: 6,
    revenue: '8.940 €',
    occupancy: '81 %',
    occupancyPercent: 81,
    posterUrl: 'https://images.pexels.com/photos/1164674/pexels-photo-1164674.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop'
  },
  {
    title: 'Midnight City',
    shows: 5,
    revenue: '6.320 €',
    occupancy: '72 %',
    occupancyPercent: 72,
    posterUrl: 'https://images.pexels.com/photos/417192/pexels-photo-417192.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop'
  },
  {
    title: "Ocean's Whisper",
    shows: 4,
    revenue: '5.110 €',
    occupancy: '64 %',
    occupancyPercent: 64,
    posterUrl: 'https://images.pexels.com/photos/1032662/pexels-photo-1032662.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop'
  },
  {
    title: 'Comedy Nights',
    shows: 3,
    revenue: '3.420 €',
    occupancy: '69 %',
    occupancyPercent: 69,
    posterUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop'
  },
  {
    title: 'Horror Night',
    shows: 2,
    revenue: '1.860 €',
    occupancy: '48 %',
    occupancyPercent: 48,
    posterUrl: 'https://images.pexels.com/photos/1724228/pexels-photo-1724228.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&fit=crop'
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'kinodaten' | 'filmdaten' | 'webstats' | 'mailings' | 'zahlungen'>('kinodaten');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [last30DaysData, setLast30DaysData] = useState<ChartData[]>([]);
  const [isLoadingLast30Days, setIsLoadingLast30Days] = useState(true);
  const [last30DaysTimeRange, setLast30DaysTimeRange] = useState<string>('1M');
  const { selectedSiteId, siteVersion } = useSite();
  const { session } = useAuth();
  const { dateRange } = useDateRange();

  const fromTimestamp = dateRange.from.getTime();
  const toTimestamp = dateRange.to.getTime();

  useEffect(() => {
    const fetchStats = async () => {
      if (selectedSiteId === null || !session) return;

      setIsLoading(true);
      try {
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const fromFormatted = formatDate(dateRange.from);
        const toFormatted = formatDate(dateRange.to);

        console.log('📊 Dashboard: Fetching stats', {
          from: fromFormatted,
          to: toFormatted,
          preset: dateRange.preset,
          fromTimestamp,
          toTimestamp
        });

        const params = new URLSearchParams({
          apikey: session.apiKey,
          from: fromFormatted,
          to: toFormatted,
        });

        if (selectedSiteId !== 0) {
          params.append('siteid', selectedSiteId.toString());
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/dashboard-stats?${params}`;

        console.log('📊 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Received stats:', data);
          setStats(data);
        } else {
          console.error('📊 Failed to fetch stats:', response.status);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Dashboard-Daten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedSiteId, siteVersion, session, fromTimestamp, toTimestamp]);

  useEffect(() => {
    const fetch30DaysData = async () => {
      if (selectedSiteId === null || !session) return;

      setIsLoadingLast30Days(true);
      try {
        const today = new Date();
        let from: Date;

        switch (last30DaysTimeRange) {
          case '1W':
            from = new Date(today);
            from.setDate(today.getDate() - 7);
            break;
          case '1M':
            from = new Date(today);
            from.setMonth(today.getMonth() - 1);
            break;
          case '3M':
            from = new Date(today);
            from.setMonth(today.getMonth() - 3);
            break;
          case '6M':
            from = new Date(today);
            from.setMonth(today.getMonth() - 6);
            break;
          case '1J':
            from = new Date(today);
            from.setFullYear(today.getFullYear() - 1);
            break;
          case '3J':
            from = new Date(today);
            from.setFullYear(today.getFullYear() - 3);
            break;
          default:
            from = new Date(today);
            from.setMonth(today.getMonth() - 1);
        }

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const params = new URLSearchParams({
          apikey: session.apiKey,
          from: formatDate(from),
          to: formatDate(today),
        });

        if (selectedSiteId !== 0) {
          params.append('siteid', selectedSiteId.toString());
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-gross-per-date?${params}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('30 Days API Response:', data);

          let dataArray: any[] = [];

          if (Array.isArray(data)) {
            dataArray = data;
          } else if (data.date && Array.isArray(data.date)) {
            dataArray = data.date;
          } else if (data.data && Array.isArray(data.data)) {
            dataArray = data.data;
          }

          if (dataArray.length > 0) {
            const formattedData: ChartData[] = dataArray.map((item: any) => ({
              date: item.date,
              value: item.gross - item.refundGross,
            }));
            setLast30DaysData(formattedData);
          } else {
            console.warn('No data array found in response:', data);
            setLast30DaysData([]);
          }
        } else {
          console.error('API request failed:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Fehler beim Laden der 30-Tage-Daten');
      } finally {
        setIsLoadingLast30Days(false);
      }
    };

    fetch30DaysData();
  }, [selectedSiteId, siteVersion, session, last30DaysTimeRange]);

  const openDisputesCount = mockDisputes.items.filter(
    dispute => dispute.status !== 'RESOLVED' && dispute.dispute_state !== 'RESOLVED'
  ).length;

  return (
    <div className="space-y-8 max-w-[1600px]">
      <header className="sticky top-0 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 backdrop-blur-sm bg-background/90 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-semibold tracking-tight">
              KD
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Kino Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Backoffice · Übersicht & Kennzahlen
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <SiteSelector />
            <DateRangePicker />
          </div>
        </div>
      </header>

      <nav className="border-b border-border -mx-6 lg:-mx-8 px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 pb-4">
          <button
            onClick={() => setActiveTab('kinodaten')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${activeTab === 'kinodaten'
                ? 'bg-secondary text-secondary-foreground border border-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/35 hover:text-foreground border border-transparent'
              }
            `}
          >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-chart-1"></span>
            <span>Kinodaten</span>
          </button>
          <button
            onClick={() => setActiveTab('filmdaten')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${activeTab === 'filmdaten'
                ? 'bg-secondary text-secondary-foreground border border-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/35 hover:text-foreground border border-transparent'
              }
            `}
          >
            <span>Filmdaten</span>
          </button>
          <button
            onClick={() => setActiveTab('webstats')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${activeTab === 'webstats'
                ? 'bg-secondary text-secondary-foreground border border-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/35 hover:text-foreground border border-transparent'
              }
            `}
          >
            <span>Webseitenstatistiken</span>
          </button>
          <button
            onClick={() => setActiveTab('mailings')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${activeTab === 'mailings'
                ? 'bg-secondary text-secondary-foreground border border-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/35 hover:text-foreground border border-transparent'
              }
            `}
          >
            <span>Mailings & Kampagnen</span>
          </button>
          <button
            onClick={() => setActiveTab('zahlungen')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium relative
              ${activeTab === 'zahlungen'
                ? 'bg-secondary text-secondary-foreground border border-primary shadow-sm'
                : 'text-muted-foreground hover:bg-muted/35 hover:text-foreground border border-transparent'
              }
            `}
          >
            <span>Zahlungen</span>
            {openDisputesCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
                {openDisputesCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {activeTab === 'kinodaten' && <KinodatenTab stats={stats} isLoading={isLoading} last30DaysData={last30DaysData} isLoadingLast30Days={isLoadingLast30Days} last30DaysTimeRange={last30DaysTimeRange} onTimeRangeChange30Days={setLast30DaysTimeRange} />}
      {activeTab === 'filmdaten' && <FilmdatenTab />}
      {activeTab === 'webstats' && <WebstatsTab />}
      {activeTab === 'mailings' && <MailingsTab />}
      {activeTab === 'zahlungen' && <ZahlungenTab />}
    </div>
  );
}

interface HourlyData {
  hour: number;
  gross: number;
  refundGross: number;
  tickets: number;
}

interface GrossPerHourResponse {
  dateFrom: string;
  dateTo: string;
  hours: HourlyData[];
}

interface KinodatenTabProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  last30DaysData: ChartData[];
  isLoadingLast30Days: boolean;
  last30DaysTimeRange: string;
  onTimeRangeChange30Days: (range: string) => void;
}

type TimeRange = 'Intraday' | '1W' | '1M' | '3M' | '1J' | '3J';

function KinodatenTab({ stats, isLoading, last30DaysData, isLoadingLast30Days, last30DaysTimeRange, onTimeRangeChange30Days }: KinodatenTabProps) {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [isLoadingHourly, setIsLoadingHourly] = useState(true);
  const [hourlyTimeRange, setHourlyTimeRange] = useState<TimeRange>('Intraday');
  const { selectedSiteId, siteVersion } = useSite();
  const { session } = useAuth();

  useEffect(() => {
    const fetchHourlyData = async () => {
      if (selectedSiteId === null || !session) return;

      setIsLoadingHourly(true);
      try {
        const today = new Date();
        let from: Date;
        let to: Date = today;

        switch (hourlyTimeRange) {
          case 'Intraday':
            from = today;
            break;
          case '1W':
            from = new Date(today);
            from.setDate(today.getDate() - 7);
            break;
          case '1M':
            from = new Date(today);
            from.setMonth(today.getMonth() - 1);
            break;
          case '3M':
            from = new Date(today);
            from.setMonth(today.getMonth() - 3);
            break;
          case '1J':
            from = new Date(today);
            from.setFullYear(today.getFullYear() - 1);
            break;
          case '3J':
            from = new Date(today);
            from.setFullYear(today.getFullYear() - 3);
            break;
          default:
            from = today;
        }

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const params = new URLSearchParams({
          apikey: session.apiKey,
          from: formatDate(from),
          to: formatDate(to),
        });

        if (selectedSiteId !== 0) {
          params.append('siteid', selectedSiteId.toString());
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-gross-per-hour?${params}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: GrossPerHourResponse = await response.json();
          setHourlyData(data.hours || []);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Stundendaten');
      } finally {
        setIsLoadingHourly(false);
      }
    };

    fetchHourlyData();
  }, [selectedSiteId, siteVersion, session, hourlyTimeRange]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { value: "-", positive: true };
    const trend = ((today - yesterday) / yesterday) * 100;
    return {
      value: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)} %`,
      positive: trend >= 0
    };
  };

  const totalRevenue = stats?.totalRevenue || 0;
  const totalRevenueYesterday = stats?.totalRevenueYesterday || 0;
  const ticketRevenue = stats?.ticketRevenue || 0;
  const concessionRevenue = stats?.concessionRevenue || 0;
  const voucherRevenue = stats?.voucherRevenue || 0;
  const refunds = stats?.refunds || 0;
  const refundedTickets = stats?.refundedTickets || 0;
  const visitorsToday = stats?.visitorsToday || 0;
  const visitorsYesterday = stats?.visitorsYesterday || 0;
  const visitorsCurrentWeek = stats?.visitorsCurrentWeek || 0;
  const spp = stats?.spp || 0;
  const sppYesterday = stats?.sppYesterday || 0;
  const concessionsPerHead = stats?.concessionsPerHead || 0;
  const onlineQuotaToday = stats?.onlineQuotaToday || 0;
  const onlineQuotaYesterday = stats?.onlineQuotaYesterday || 0;
  const trend = calculateTrend(totalRevenue, totalRevenueYesterday);
  const visitorsTrend = calculateTrend(visitorsToday, visitorsYesterday);
  const sppTrend = calculateTrend(spp, sppYesterday);
  const onlineQuotaTrend = calculateTrend(onlineQuotaToday, onlineQuotaYesterday);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
          Kinodaten
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tagesperformance & Kinokennzahlen
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Lade Daten...</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
              title="Gesamtumsatz heute"
              value={formatCurrency(totalRevenue)}
              badge="EUR"
              trend={{ value: trend.value, positive: trend.positive, label: "vs. Vortag" }}
              additionalData={[
                { label: "Ticketumsatz", value: formatCurrency(ticketRevenue) },
                { label: "Concessionumsatz", value: formatCurrency(concessionRevenue) },
                { label: "Verkaufte Gutscheine", value: formatCurrency(voucherRevenue) },
                { label: "Stornos", value: formatCurrency(refunds) },
                { label: "Stornierte Tickets", value: refundedTickets.toString() }
              ]}
            />
        <KPICard
          title="Besucherzahl heute"
          value={new Intl.NumberFormat('de-DE').format(visitorsToday)}
          badge="Besucher"
          trend={{ value: visitorsTrend.value, positive: visitorsTrend.positive, label: "vs. gestern" }}
          additionalData={[
            { label: "Besucherzahlen gestern", value: new Intl.NumberFormat('de-DE').format(visitorsYesterday) },
            { label: "Aktuelle Kinowoche", value: new Intl.NumberFormat('de-DE').format(visitorsCurrentWeek) }
          ]}
          footer="über alle Vorstellungen"
        />
        <KPICard
          title="SPP (Sales per Patron)"
          value={formatCurrency(spp)}
          badge="EUR / Gast"
          trend={{ value: sppTrend.value, positive: sppTrend.positive, label: "vs. gestern" }}
          additionalData={[
            { label: "Concessions pro Kopf", value: formatCurrency(concessionsPerHead) },
            { label: "SPP gestern", value: formatCurrency(sppYesterday) }
          ]}
          footer="Ticket + Concessions pro Besucher"
        />
        <KPICard
          title="Onlinequote heute"
          value={`${onlineQuotaToday.toFixed(1)} %`}
          badge="Online"
          trend={{ value: onlineQuotaTrend.value, positive: onlineQuotaTrend.positive, label: "vs. gestern" }}
          additionalData={[
            { label: "Online-Tickets heute", value: (stats?.onlineTicketsToday || 0).toString() },
            { label: "Onlinequote gestern", value: `${onlineQuotaYesterday.toFixed(1)} %` }
          ]}
          footer="Anteil der online verkauften Tickets"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-destructive/70 bg-destructive/10 p-4 flex gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-sm font-semibold flex-shrink-0">
            <FiAlertTriangle />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Warnung: Filmsortierung noch nicht bearbeitet
            </h3>
            <p className="mt-1 text-xs text-destructive-foreground/90">
              Für die neue Spielwoche wurden die Topfilme noch nicht markiert
            </p>
          </div>
        </div>

        <div className="card border-border bg-accent/30 p-4 flex gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-chart-4 text-accent-foreground text-sm flex-shrink-0">
            <FiInfo />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Hinweis: offene Kampagnen
            </h3>
            <p className="mt-1 text-xs text-accent-foreground/90">
              Es gibt noch Einladungen zu den Kampagnen für Avatar 3 und Wicked 2
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <header className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium tracking-tight">
                  Umsatz & Besucher über den Tag
                </h3>
                <p className="text-xs text-muted-foreground">
                  Stündliche Entwicklung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['Intraday', '1W', '1M', '3M', '1J', '3J'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setHourlyTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    hourlyTimeRange === range
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </header>
          <HourlyRevenueChart data={hourlyData} isLoading={isLoadingHourly} />
        </div>

        <div className="card p-4 sm:p-5">
          <header className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium tracking-tight">
                  Umsatz der letzten 30 Tage
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tägliche Entwicklung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {['1W', '1M', '3M', '6M', '1J', '3J'].map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange30Days(range)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                    last30DaysTimeRange === range
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </header>
          <Revenue30DaysChart data={last30DaysData} isLoading={isLoadingLast30Days} />
        </div>
      </div>
        </>
      )}
    </div>
  );
}

interface TopEvent {
  count: number;
  gross: number;
  name: string;
  iD: number;
}

interface ApiResponse {
  items: TopEvent[];
}

function FilmdatenTab() {
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedSiteId, siteVersion } = useSite();
  const { session } = useAuth();
  const { dateRange } = useDateRange();

  const fromTimestamp = dateRange.from.getTime();
  const toTimestamp = dateRange.to.getTime();

  useEffect(() => {
    const fetchTopEvents = async () => {
      if (selectedSiteId === null || !session) return;

      setLoading(true);
      try {
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };

        const params = new URLSearchParams({
          apikey: session.apiKey,
          from: formatDate(dateRange.from),
          to: formatDate(dateRange.to),
          topn: '8',
        });

        if (selectedSiteId !== 0) {
          params.append('siteid', selectedSiteId.toString());
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-top-events?${params}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        if (response.ok) {
          const data: ApiResponse = await response.json();
          setTopEvents(data.items || []);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Top-Events');
      } finally {
        setLoading(false);
      }
    };

    fetchTopEvents();
  }, [selectedSiteId, siteVersion, session, fromTimestamp, toTimestamp]);

  const topFilm = topEvents.length > 0 ? topEvents[0] : null;
  const totalFilms = topEvents.length;
  const totalRevenue = topEvents.reduce((sum, event) => sum + event.gross, 0);
  const totalTickets = topEvents.reduce((sum, event) => sum + event.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
          Filmdaten
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Umsatz, Vorstellungen & Auslastung nach Film
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Lade Daten...</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
            <div className="card p-4 sm:p-5 space-y-3">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Top-Film nach Umsatz
                </h3>
                <span className="badge bg-muted text-muted-foreground">
                  7 Tage
                </span>
              </header>
              <p className="mt-1 text-sm font-semibold">
                {topFilm ? `„${topFilm.name}"` : 'Keine Daten'}
              </p>
              <div className="flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {topFilm ? `${topFilm.gross.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '-'}
                </p>
                <div className="text-right space-y-1">
                  <p className="text-[11px] text-muted-foreground">
                    {topFilm ? `${topFilm.count.toLocaleString('de-DE')} Tickets` : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-5 space-y-3">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Gesamtumsatz
                </h3>
                <span className="badge bg-muted text-muted-foreground">
                  Top {totalFilms}
                </span>
              </header>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-2xl font-semibold tracking-tight">
                  {totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {totalTickets.toLocaleString('de-DE')} verkaufte Tickets
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Top 8 Filme
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tickets & Umsatz der letzten 7 Tage
                </p>
              </header>
              <TopEventsTable topEvents={topEvents.slice(0, 8)} />
            </div>

            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Top N Concessions
                </h3>
                <p className="text-xs text-muted-foreground">
                  Produkte nach Absatz & Umsatz
                </p>
              </header>
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Produkt</th>
                      <th className="px-3 py-2 font-medium text-right">Anzahl</th>
                      <th className="px-3 py-2 font-medium text-right">Umsatz</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border hover:bg-muted/60">
                      <td className="px-3 py-2">Popcorn Large</td>
                      <td className="px-3 py-2 text-right">384</td>
                      <td className="px-3 py-2 text-right">2.688 €</td>
                    </tr>
                    <tr className="border-t border-border hover:bg-muted/60">
                      <td className="px-3 py-2">Softdrink 0,5 l</td>
                      <td className="px-3 py-2 text-right">312</td>
                      <td className="px-3 py-2 text-right">1.560 €</td>
                    </tr>
                    <tr className="border-t border-border hover:bg-muted/60">
                      <td className="px-3 py-2">Nachos + Dip</td>
                      <td className="px-3 py-2 text-right">176</td>
                      <td className="px-3 py-2 text-right">1.056 €</td>
                    </tr>
                    <tr className="border-t border-border hover:bg-muted/60">
                      <td className="px-3 py-2">Candy Mix</td>
                      <td className="px-3 py-2 text-right">129</td>
                      <td className="px-3 py-2 text-right">516 €</td>
                    </tr>
                    <tr className="border-t border-border hover:bg-muted/60">
                      <td className="px-3 py-2">Eis am Stiel</td>
                      <td className="px-3 py-2 text-right">88</td>
                      <td className="px-3 py-2 text-right">308 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface MatomoStats {
  today: {
    pageviews: number;
    visits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnSite: number;
  };
  yesterday: {
    pageviews: number;
    visits: number;
    uniqueVisitors: number;
  };
  devices: Array<{
    label: string;
    visits: number;
    percentage: string;
  }>;
  topPages: Array<{
    url: string;
    pageviews: number;
    bounceRate: number;
    avgTimeOnPage: number;
  }>;
}

function WebstatsTab() {
  const [matomoStats, setMatomoStats] = useState<MatomoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noMatomoConnection, setNoMatomoConnection] = useState(false);
  const { selectedSiteId, siteVersion } = useSite();
  const { session } = useAuth();
  const { dateRange } = useDateRange();

  const fromTimestamp = dateRange.from.getTime();
  const toTimestamp = dateRange.to.getTime();

  useEffect(() => {
    const fetchMatomoStats = async () => {
      if (selectedSiteId === null || !session) return;

      setLoading(true);
      setError(null);
      setNoMatomoConnection(false);

      try {
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };

        const params = new URLSearchParams({
          from: formatDate(dateRange.from),
          to: formatDate(dateRange.to),
        });

        if (selectedSiteId !== 0) {
          params.append('siteid', selectedSiteId.toString());
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-matomo-stats?${params}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMatomoStats(data);
        } else {
          const errorData = await response.json();
          if (response.status === 404 || errorData.error?.includes('not configured') || errorData.error?.includes('No Matomo')) {
            setNoMatomoConnection(true);
          } else {
            setError('Fehler beim Laden der Matomo-Statistiken');
          }
        }
      } catch (err) {
        setNoMatomoConnection(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMatomoStats();
  }, [selectedSiteId, siteVersion, session, fromTimestamp, toTimestamp]);

  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { value: "-", positive: true, label: "vs. Vortag" };
    const trend = ((today - yesterday) / yesterday) * 100;
    return {
      value: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)} %`,
      positive: trend >= 0,
      label: "vs. Vortag"
    };
  };

  const pageviewsTrend = matomoStats
    ? calculateTrend(matomoStats.today.pageviews, matomoStats.yesterday.pageviews)
    : { value: "-", positive: true, label: "vs. Vortag" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
          Webseitenstatistiken
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Online-Performance, Conversion & Traffic-Quellen
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Lade Daten...</div>
        </div>
      ) : noMatomoConnection ? (
        <div className="card p-8 border-border bg-muted/30">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FiInfo size={24} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Keine Matomo-Verknüpfung</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Für diese Site ist keine Verknüpfung zu Matomo konfiguriert.
                Webseitenstatistiken können nicht angezeigt werden.
              </p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="card p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-center gap-3 text-destructive">
            <FiAlertTriangle size={20} />
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-4">
            <KPICard
              title="Seitenaufrufe heute"
              value={matomoStats?.today.pageviews.toLocaleString('de-DE') || '0'}
              badge="Pageviews"
              trend={pageviewsTrend}
            />
            <KPICard
              title="Besuche heute"
              value={matomoStats?.today.visits.toLocaleString('de-DE') || '0'}
              badge="Visits"
              trend={{ value: "-", positive: true, label: "vs. Vortag" }}
            />
            <KPICard
              title="Absprungrate"
              value={`${matomoStats?.today.bounceRate.toFixed(1) || '0'} %`}
              badge="Bounce Rate"
              trend={{ value: "-", positive: true, label: "heute" }}
            />
            <KPICard
              title="Durchschn. Verweildauer"
              value={`${matomoStats?.today.avgTimeOnSite ? Math.floor(matomoStats.today.avgTimeOnSite / 60) : 0} min`}
              badge="Avg Time"
              trend={{ value: "-", positive: true, label: "heute" }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Neue vs. Wiederkehrende Besucher
                </h3>
                <p className="text-xs text-muted-foreground">
                  Besuchertyp heute
                </p>
              </header>
              <NewVsReturningVisitors />
            </div>

            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Browser-Verteilung
                </h3>
                <p className="text-xs text-muted-foreground">
                  Top Browser heute
                </p>
              </header>
              <BrowserDistribution />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Traffic-Quellen
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verteilung nach Quelle
                </p>
              </header>
              <DonutChartPlaceholder />
            </div>

            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Besucher nach Endgerät
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verteilung nach Device-Typ
                </p>
              </header>
              <DevicePieChart devices={matomoStats?.devices || []} totalVisits={matomoStats?.today.visits || 0} />
            </div>

            <div className="card p-4 sm:p-5">
              <header className="mb-4">
                <h3 className="text-sm font-medium tracking-tight">
                  Top 5 Seiten
                </h3>
                <p className="text-xs text-muted-foreground">
                  Aufrufe & Bounce Rate
                </p>
              </header>
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Seite</th>
                      <th className="px-3 py-2 font-medium text-right">Aufrufe</th>
                      <th className="px-3 py-2 font-medium text-right">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matomoStats?.topPages.length ? (
                      matomoStats.topPages.map((page, index) => (
                        <tr key={index} className="border-t border-border hover:bg-muted/60">
                          <td className="px-3 py-2 max-w-[200px] truncate" title={page.url}>{page.url}</td>
                          <td className="px-3 py-2 text-right">{page.pageviews.toLocaleString('de-DE')}</td>
                          <td className="px-3 py-2 text-right">{page.bounceRate.toFixed(1)} %</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-border">
                        <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                          Keine Daten verfügbar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NewVsReturningVisitors() {
  const newVisitors = 342;
  const returningVisitors = 158;
  const total = newVisitors + returningVisitors;
  const newPercentage = ((newVisitors / total) * 100).toFixed(1);
  const returningPercentage = ((returningVisitors / total) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-chart-1"></span>
            Neue Besucher
          </span>
          <span className="font-semibold">{newVisitors} ({newPercentage}%)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-chart-1" style={{ width: `${newPercentage}%` }}></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-chart-2"></span>
            Wiederkehrende Besucher
          </span>
          <span className="font-semibold">{returningVisitors} ({returningPercentage}%)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-chart-2" style={{ width: `${returningPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function BrowserDistribution() {
  const browsers = [
    { name: 'Chrome', visits: 287, percentage: 57.4, color: 'var(--chart-1)' },
    { name: 'Safari', visits: 123, percentage: 24.6, color: 'var(--chart-2)' },
    { name: 'Firefox', visits: 56, percentage: 11.2, color: 'var(--chart-3)' },
    { name: 'Edge', visits: 34, percentage: 6.8, color: 'var(--chart-4)' },
  ];

  return (
    <div className="space-y-3">
      {browsers.map((browser, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: browser.color }}></span>
              {browser.name}
            </span>
            <span className="font-semibold">{browser.visits} ({browser.percentage}%)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full" style={{ width: `${browser.percentage}%`, backgroundColor: browser.color }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MailingsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
          Mailings & Kampagnen
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Newsletter-Performance & Marketing-Kampagnen
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-4">
        <KPICard
          title="Gesendete Mailings"
          value="14"
          badge="letzten 30 Tage"
          trend={{ value: "+2", positive: true, label: "vs. Vormonat" }}
        />
        <KPICard
          title="Ø Öffnungsrate"
          value="41 %"
          badge="Open Rate"
          trend={{ value: "+3 %", positive: true, label: "vs. Vormonat" }}
        />
        <KPICard
          title="Ø Klickrate"
          value="9,5 %"
          badge="CTR"
          trend={{ value: "+1,2 %", positive: true, label: "vs. Vormonat" }}
        />
        <KPICard
          title="Conversion-Rate"
          value="3,2 %"
          badge="Ticketkäufe"
          trend={{ value: "+0,4 %", positive: true, label: "vs. Vormonat" }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <header className="mb-4">
            <h3 className="text-sm font-medium tracking-tight">
              Top Mailings
            </h3>
            <p className="text-xs text-muted-foreground">
              nach Öffnungsrate
            </p>
          </header>
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Mailing</th>
                  <th className="px-3 py-2 font-medium text-right">Öffnungsrate</th>
                  <th className="px-3 py-2 font-medium text-right">Klickrate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Premiere GALAXY WARS</td>
                  <td className="px-3 py-2 text-right text-primary">56 %</td>
                  <td className="px-3 py-2 text-right">14 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Family Sunday Aktion</td>
                  <td className="px-3 py-2 text-right text-primary">48 %</td>
                  <td className="px-3 py-2 text-right">11 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Horror Night</td>
                  <td className="px-3 py-2 text-right">42 %</td>
                  <td className="px-3 py-2 text-right">10 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Montag 2für1</td>
                  <td className="px-3 py-2 text-right">37 %</td>
                  <td className="px-3 py-2 text-right">8 %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <header className="mb-4">
            <h3 className="text-sm font-medium tracking-tight">
              Aktuelle Kampagnen
            </h3>
            <p className="text-xs text-muted-foreground">
              nach Umsatz
            </p>
          </header>
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Kampagne</th>
                  <th className="px-3 py-2 font-medium text-right">Zeitraum</th>
                  <th className="px-3 py-2 font-medium text-right">Umsatz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Sommer Festival</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">15.07 - 31.08</td>
                  <td className="px-3 py-2 text-right font-semibold">15.600 €</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Family Sunday Aktion</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">01.06 - 30.06</td>
                  <td className="px-3 py-2 text-right font-semibold">12.300 €</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Premiere GALAXY WARS</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">15.05 - 20.05</td>
                  <td className="px-3 py-2 text-right font-semibold">8.450 €</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2">Montag 2für1</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">Jeden Montag</td>
                  <td className="px-3 py-2 text-right font-semibold">6.800 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZahlungenTab() {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDisputeFlyoutOpen, setIsDisputeFlyoutOpen] = useState(false);

  const handleDisputeClick = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsDisputeFlyoutOpen(true);
  };

  const handleCloseDisputeFlyout = () => {
    setIsDisputeFlyoutOpen(false);
    setTimeout(() => setSelectedDispute(null), 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
          Zahlungen
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Umsatz nach Zahlungsart & PayPal Konfliktfälle
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <header className="mb-4">
            <h3 className="text-sm font-medium tracking-tight">
              Umsatz nach Zahlungsart
            </h3>
            <p className="text-xs text-muted-foreground">
              Verteilung heute
            </p>
          </header>
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Zahlungsart</th>
                  <th className="px-3 py-2 font-medium text-right">Transaktionen</th>
                  <th className="px-3 py-2 font-medium text-right">Umsatz</th>
                  <th className="px-3 py-2 font-medium text-right">Anteil</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-chart-1 flex-shrink-0"></span>
                    <span>VISA</span>
                  </td>
                  <td className="px-3 py-2 text-right">612</td>
                  <td className="px-3 py-2 text-right font-semibold">9.180 €</td>
                  <td className="px-3 py-2 text-right text-primary">37,4 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-chart-2 flex-shrink-0"></span>
                    <span>Mastercard</span>
                  </td>
                  <td className="px-3 py-2 text-right">548</td>
                  <td className="px-3 py-2 text-right font-semibold">8.220 €</td>
                  <td className="px-3 py-2 text-right text-primary">33,4 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-chart-3 flex-shrink-0"></span>
                    <span>PayPal</span>
                  </td>
                  <td className="px-3 py-2 text-right">286</td>
                  <td className="px-3 py-2 text-right font-semibold">4.290 €</td>
                  <td className="px-3 py-2 text-right">17,5 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-chart-4 flex-shrink-0"></span>
                    <span>Kundenkarte</span>
                  </td>
                  <td className="px-3 py-2 text-right">124</td>
                  <td className="px-3 py-2 text-right font-semibold">1.860 €</td>
                  <td className="px-3 py-2 text-right">7,6 %</td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/60">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-chart-5 flex-shrink-0"></span>
                    <span>Gutscheine</span>
                  </td>
                  <td className="px-3 py-2 text-right">92</td>
                  <td className="px-3 py-2 text-right font-semibold">1.030 €</td>
                  <td className="px-3 py-2 text-right">4,2 %</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Gesamt</span>
            <span className="font-semibold text-sm">24.580 €</span>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <header className="mb-4">
            <h3 className="text-sm font-medium tracking-tight">
              Umsatz nach Zahlungsart
            </h3>
            <p className="text-xs text-muted-foreground">
              Visualisierung
            </p>
          </header>
          <PaymentMethodsChart />
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <header className="mb-4">
          <h3 className="text-sm font-medium tracking-tight">
            PayPal Konfliktfälle
          </h3>
          <p className="text-xs text-muted-foreground">
            Übersicht über aktuelle und vergangene Dispute-Fälle
          </p>
        </header>
        <PayPalDisputeList disputes={mockDisputes.items} onDisputeClick={handleDisputeClick} />
      </div>

      <DisputeDetailOverlay
        dispute={selectedDispute}
        isOpen={isDisputeFlyoutOpen}
        onClose={handleCloseDisputeFlyout}
      />
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  badge: string;
  trend: {
    value: string;
    positive: boolean;
    label: string;
  };
  footer?: string;
  additionalData?: {
    label: string;
    value: string;
  }[];
}

function KPICard({ title, value, badge, trend, footer, additionalData }: KPICardProps) {
  return (
    <article className="card p-4 sm:p-5 space-y-3">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="badge bg-muted text-muted-foreground">
          {badge}
        </span>
      </header>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {value}
        </p>
        <div className="text-right space-y-1">
          <div className={`badge ${trend.positive ? 'badge-success' : 'badge-destructive'}`}>
            <span>{trend.positive ? '▲' : '▼'}</span>
            <span>{trend.value}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {trend.label}
          </p>
        </div>
      </div>
      {additionalData && additionalData.length > 0 && (
        <div className="pt-2 border-t border-border space-y-1.5">
          {additionalData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      )}
      {footer && (
        <p className="text-xs text-muted-foreground">
          {footer}
        </p>
      )}
    </article>
  );
}

interface HourlyRevenueChartProps {
  data: HourlyData[];
  isLoading: boolean;
}

function HourlyRevenueChart({ data, isLoading }: HourlyRevenueChartProps) {
  const [visibleLines, setVisibleLines] = useState({ revenue: true, tickets: true });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-56">
        <div className="text-sm text-muted-foreground">Lade Daten...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  const chartData = data.map(d => ({
    hour: d.hour,
    hourLabel: `${d.hour}:00`,
    umsatz: d.gross - d.refundGross,
    besucher: d.tickets,
    rawGross: d.gross,
    refund: d.refundGross,
  }));

  const maxRevenue = Math.max(...chartData.map(d => d.umsatz));
  const maxTickets = Math.max(...chartData.map(d => d.besucher));

  const toggleLine = (line: 'revenue' | 'tickets') => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const totalRevenue = chartData.reduce((sum, d) => sum + d.umsatz, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;
  const totalTickets = chartData.reduce((sum, d) => sum + d.besucher, 0);
  const avgTickets = chartData.length > 0 ? Math.round(totalTickets / chartData.length) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-2 text-foreground">{data.hourLabel} Uhr</p>
          {visibleLines.revenue && (
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
                <span className="text-muted-foreground">Umsatz</span>
              </span>
              <span className="font-semibold text-foreground">
                {data.umsatz.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
          )}
          {visibleLines.tickets && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                <span className="text-muted-foreground">Besucher</span>
              </span>
              <span className="font-semibold text-foreground">{data.besucher}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => toggleLine('revenue')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-opacity ${
            visibleLines.revenue ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }}></span>
          <span className="text-[11px] text-muted-foreground">Umsatz</span>
        </button>
        <button
          onClick={() => toggleLine('tickets')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-opacity ${
            visibleLines.tickets ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: '#10b981' }}></span>
          <span className="text-[11px] text-muted-foreground">Besucher</span>
        </button>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

            <XAxis
              dataKey="hourLabel"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              domain={[0, Math.ceil(maxRevenue * 1.1)]}
              tickFormatter={(value) => `${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`}
              width={55}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              domain={[0, Math.ceil(maxTickets * 1.1)]}
              width={35}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />

            {visibleLines.revenue && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="umsatz"
                  fill="url(#revenueAreaGradient)"
                  stroke="none"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="umsatz"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                />
              </>
            )}

            {visibleLines.tickets && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="besucher"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ø Umsatz</span>
            <span className="font-semibold">{formatCurrency(avgRevenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Gesamt Umsatz</span>
            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ø Besucher</span>
            <span className="font-semibold">{avgTickets.toLocaleString('de-DE')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Gesamt Besucher</span>
            <span className="font-semibold">{totalTickets.toLocaleString('de-DE')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Revenue30DaysChartProps {
  data: ChartData[];
  isLoading: boolean;
}

function Revenue30DaysChart({ data, isLoading }: Revenue30DaysChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-56">
        <div className="text-sm text-muted-foreground">Lade Daten...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.`;
  };

  const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const maxRevenue = Math.max(...data.map(d => d.value));

  const chartData = data.map(d => ({
    date: d.date,
    dateLabel: formatDate(d.date),
    umsatz: d.value,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-2 text-foreground">{data.dateLabel}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
              <span className="text-muted-foreground">Umsatz</span>
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(data.umsatz)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenue30DaysGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />

            <XAxis
              dataKey="dateLabel"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
              domain={[0, Math.ceil(maxRevenue * 1.1)]}
              tickFormatter={(value) => `${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`}
              width={55}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="umsatz"
              fill="url(#revenue30DaysGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="umsatz"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Durchschnitt</span>
          <span className="font-semibold">{formatCurrency(avgRevenue)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Gesamt</span>
          <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
    </div>
  );
}

interface FilmRevenueChartProps {
  topEvents: TopEvent[];
}

function FilmRevenueChart({ topEvents }: FilmRevenueChartProps) {
  if (topEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  const maxRevenue = Math.max(...topEvents.map(event => event.gross));
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-2)', 'var(--chart-3)'];

  const bars = topEvents.map((event, index) => ({
    label: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
    fullName: event.name,
    height: `${(event.gross / maxRevenue) * 100}%`,
    color: colors[index % colors.length],
    revenue: event.gross,
  }));

  return (
    <div className="relative h-64 rounded-md border border-border bg-card overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to top, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '100% 20px'
        }}
      >
        <div className="h-full flex items-end justify-between px-4 pb-12 gap-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
              <div
                className="w-full max-w-[50px] rounded-t-md transition-opacity hover:opacity-80"
                style={{ height: bar.height, backgroundColor: bar.color }}
                title={`${bar.fullName}: ${bar.revenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
              />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TopEventsTableProps {
  topEvents: TopEvent[];
}

function TopEventsTable({ topEvents }: TopEventsTableProps) {
  if (topEvents.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Film</th>
            <th className="px-3 py-2 font-medium text-right">Tickets</th>
            <th className="px-3 py-2 font-medium text-right">Umsatz</th>
          </tr>
        </thead>
        <tbody>
          {topEvents.map((event, index) => (
            <tr key={event.iD || index} className="border-t border-border hover:bg-muted/60">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{event.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-right">{event.count.toLocaleString('de-DE')}</td>
              <td className="px-3 py-2 text-right font-semibold">
                {event.gross.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarChartPlaceholder() {
  const bars = [
    { label: 'Galactic\nOdyssey 2', height: '70%', color: 'var(--chart-1)' },
    { label: 'Midnight\nCity', height: '55%', color: 'var(--chart-2)' },
    { label: "Ocean's\nWhisper", height: '48%', color: 'var(--chart-3)' },
    { label: 'Comedy\nNights', height: '42%', color: 'var(--chart-4)' },
    { label: 'Love in\nParis', height: '38%', color: 'var(--chart-5)' },
    { label: 'Horror\nNight', height: '31%', color: 'var(--chart-2)' },
    { label: 'Kids\nSpecial', height: '24%', color: 'var(--chart-3)' },
  ];

  return (
    <div className="relative h-64 rounded-md border border-border bg-card overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to top, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '100% 20px'
        }}
      >
        <div className="h-full flex items-end justify-between px-4 pb-6 gap-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-4 rounded-t-md"
                style={{ height: bar.height, backgroundColor: bar.color }}
              />
              <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-pre-line">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonutChartPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <div
          className="h-36 w-36 sm:h-40 sm:w-40 rounded-full shadow-md"
          style={{
            background: `conic-gradient(
              var(--chart-1) 0 144deg,
              var(--chart-2) 144deg 259deg,
              var(--chart-3) 259deg 317deg,
              var(--chart-4) 317deg 360deg
            )`
          }}
        />
        <div className="absolute h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-background flex flex-col items-center justify-center shadow-sm">
          <span className="text-[11px] text-muted-foreground">Gesamt</span>
          <span className="text-sm font-semibold tracking-tight">
            18.420
          </span>
        </div>
      </div>
      <dl className="space-y-2 text-xs w-full">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-chart-1 flex-shrink-0"></span>
          <dt className="text-foreground">Direct</dt>
          <dd className="ml-auto text-muted-foreground">
            7.380 (40 %)
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-chart-2 flex-shrink-0"></span>
          <dt className="text-foreground">Organic Search</dt>
          <dd className="ml-auto text-muted-foreground">
            5.890 (32 %)
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-chart-3 flex-shrink-0"></span>
          <dt className="text-foreground">Paid</dt>
          <dd className="ml-auto text-muted-foreground">
            2.950 (16 %)
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-chart-4 flex-shrink-0"></span>
          <dt className="text-foreground">Social</dt>
          <dd className="ml-auto text-muted-foreground">
            2.200 (12 %)
          </dd>
        </div>
      </dl>
    </div>
  );
}

function TopMoviesTable() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Film</th>
            <th className="px-3 py-2 font-medium text-right">Vorst.</th>
            <th className="px-3 py-2 font-medium text-right">Umsatz</th>
            <th className="px-3 py-2 font-medium text-right">Auslastung</th>
          </tr>
        </thead>
        <tbody>
          {topMovies.map((movie, index) => (
            <tr key={index} className="border-t border-border hover:bg-muted/60">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-12 w-8 rounded overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span>{movie.title}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-right">{movie.shows}</td>
              <td className="px-3 py-2 text-right">{movie.revenue}</td>
              <td className={`px-3 py-2 text-right ${movie.occupancyPercent >= 60 ? 'text-primary' : 'text-destructive-foreground/80'}`}>
                {movie.occupancy}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentMethodsChart() {
  const paymentMethods = [
    { label: 'VISA', height: '75%', color: 'var(--chart-1)', amount: '9.180 €' },
    { label: 'Mastercard', height: '68%', color: 'var(--chart-2)', amount: '8.220 €' },
    { label: 'PayPal', height: '35%', color: 'var(--chart-3)', amount: '4.290 €' },
    { label: 'Kundenkarte', height: '15%', color: 'var(--chart-4)', amount: '1.860 €' },
    { label: 'Gutscheine', height: '8%', color: 'var(--chart-5)', amount: '1.030 €' },
  ];

  return (
    <div className="relative h-64 rounded-md border border-border bg-card overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to top, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '100% 20px'
        }}
      >
        <div className="h-full flex items-end justify-between px-4 pb-14 gap-3">
          {paymentMethods.map((method, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full max-w-[60px] rounded-t-md transition-all hover:opacity-80"
                style={{ height: method.height, backgroundColor: method.color }}
              />
              <div className="text-center">
                <span className="block text-[10px] text-muted-foreground leading-tight mb-1">
                  {method.label}
                </span>
                <span className="block text-[9px] font-semibold">
                  {method.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DevicePieChartProps {
  devices: Array<{
    label: string;
    visits: number;
    percentage: string;
  }>;
  totalVisits: number;
}

function DevicePieChart({ devices, totalVisits }: DevicePieChartProps) {
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

  const generateConicGradient = () => {
    if (devices.length === 0) return 'var(--chart-1)';

    let currentAngle = 0;
    const gradientParts = devices.map((device, index) => {
      const percentage = parseFloat(device.percentage);
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      return `${colors[index % colors.length]} ${startAngle}deg ${endAngle}deg`;
    });

    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <div
          className="h-36 w-36 sm:h-40 sm:w-40 rounded-full shadow-md"
          style={{
            background: generateConicGradient()
          }}
        />
        <div className="absolute h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-background flex flex-col items-center justify-center shadow-sm">
          <span className="text-[11px] text-muted-foreground">Gesamt</span>
          <span className="text-sm font-semibold tracking-tight">
            {totalVisits.toLocaleString('de-DE')}
          </span>
        </div>
      </div>
      <dl className="space-y-2 text-xs w-full">
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
              <dt className="text-foreground">{device.label}</dt>
              <dd className="ml-auto text-muted-foreground">
                {device.visits.toLocaleString('de-DE')} ({device.percentage} %)
              </dd>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-2">
            Keine Daten verfügbar
          </div>
        )}
      </dl>
    </div>
  );
}
