'use client';

import { useEffect, useState } from 'react';
import { FiBarChart2, FiEye, FiMousePointer, FiClock, FiTrendingUp, FiGlobe, FiMonitor, FiUsers } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSite } from '@/lib/SiteContext';

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
  last7Days: {
    pageviews: number;
    visits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnSite: number;
  };
  last30Days: {
    pageviews: number;
    visits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnSite: number;
  };
  devices: Array<{ label: string; visits: number; percentage: string }>;
  topPages: Array<{ url: string; pageviews: number; bounceRate: number; avgTimeOnPage: number }>;
  referrers: Array<{ label: string; visits: number; percentage: string }>;
  browsers: Array<{ label: string; visits: number; percentage: string }>;
  operatingSystems: Array<{ label: string; visits: number; percentage: string }>;
  countries: Array<{ label: string; visits: number; percentage: string }>;
  entryPages: Array<{ url: string; visits: number; bounceRate: number }>;
  exitPages: Array<{ url: string; exits: number; exitRate: number }>;
  visitsByHour: Array<{ hour: number; visits: number }>;
  visitorTypes: { new: number; returning: number };
}

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function WebseitenStatistiken() {
  const { selectedSiteId } = useSite();
  const [stats, setStats] = useState<MatomoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Component loaded');

  useEffect(() => {
    console.log('=== useEffect triggered ===');
    console.log('selectedSiteId:', selectedSiteId);
    setDebugInfo(`Fetching for site: ${selectedSiteId || 0}`);

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const siteId = selectedSiteId || 0;
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-matomo-stats?siteid=${siteId}`;
        console.log('Fetch URL:', url);
        setDebugInfo(`Fetching from: ${url}`);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        console.log('Response status:', response.status);
        setDebugInfo(`Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('===== RECEIVED DATA =====');
        console.log('Full data:', data);
        console.log('visitsByHour:', data.visitsByHour);
        console.log('visitorTypes:', data.visitorTypes);
        console.log('referrers:', data.referrers);
        console.log('browsers:', data.browsers);
        console.log('topPages:', data.topPages);
        console.log('devices:', data.devices);
        setDebugInfo(`Data received: ${JSON.stringify(Object.keys(data))}`);
        setStats(data);
      } catch (err) {
        console.error('Fetch error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setDebugInfo(`Error: ${errorMsg}`);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [selectedSiteId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} min`;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Lade Statistiken...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">Fehler: {error}</div>
      </div>
    );
  }

  if (!stats) {
    console.log('Stats is null - not rendering charts');
    return (
      <div className="p-8 bg-red-100 dark:bg-red-900 rounded-lg">
        <div className="font-bold">Stats is null!</div>
        <div className="text-sm mt-2">Loading: {loading ? 'yes' : 'no'}</div>
        <div className="text-sm">Error: {error || 'none'}</div>
      </div>
    );
  }

  const visitorTypeData = [
    { name: 'Neue Besucher', value: stats.visitorTypes?.new || 0, color: CHART_COLORS[0] },
    { name: 'Wiederkehrende', value: stats.visitorTypes?.returning || 0, color: CHART_COLORS[1] },
  ];

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* DEBUG INFO - REMOVE LATER */}
      <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg border-2 border-yellow-500">
        <div className="font-bold text-yellow-900 dark:text-yellow-100">DEBUG INFO:</div>
        <div className="text-sm text-yellow-800 dark:text-yellow-200">{debugInfo}</div>
        <div className="text-xs mt-2 text-yellow-700 dark:text-yellow-300">
          Stats keys: {stats ? Object.keys(stats).join(', ') : 'null'}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FiBarChart2 className="text-xl text-foreground" />
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Webseiten-Statistiken v2</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiEye className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Seitenaufrufe (Heute)</div>
          </div>
          <div className="text-2xl font-semibold">{stats.today.pageviews.toLocaleString()}</div>
          <div className="text-xs text-chart-1 mt-1">
            {calculateChange(stats.today.pageviews, stats.yesterday.pageviews)} vs. Gestern
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiMousePointer className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Unique Besucher</div>
          </div>
          <div className="text-2xl font-semibold">{stats.today.uniqueVisitors.toLocaleString()}</div>
          <div className="text-xs text-chart-1 mt-1">
            {calculateChange(stats.today.uniqueVisitors, stats.yesterday.uniqueVisitors)} vs. Gestern
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiClock className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Ø Verweildauer</div>
          </div>
          <div className="text-2xl font-semibold">{formatTime(stats.today.avgTimeOnSite)}</div>
          <div className="text-xs text-muted-foreground mt-1">Durchschnittlich</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FiTrendingUp className="text-muted-foreground" size={12} />
            <div className="text-xs text-muted-foreground">Bounce Rate</div>
          </div>
          <div className="text-2xl font-semibold">{stats.today.bounceRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground mt-1">Heute</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiUsers className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Neue vs. Wiederkehrende Besucher</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={visitorTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {visitorTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiMonitor className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Gerätetypen</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.devices.map((device, index) => ({
                  name: device.label,
                  value: device.visits,
                  color: CHART_COLORS[index % CHART_COLORS.length]
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.devices.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiClock className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Besuche nach Tageszeit</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.visitsByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}:00`}
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
              labelFormatter={(value) => `${value}:00 Uhr`}
            />
            <Bar
              dataKey="visits"
              name="Besuche"
              fill={CHART_COLORS[2]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiBarChart2 className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Top Seiten</h2>
          </div>
          <div className="space-y-3">
            {stats.topPages.slice(0, 8).map((page, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{page.url}</div>
                  <div className="text-xs text-muted-foreground">
                    Bounce: {page.bounceRate.toFixed(1)}% • Ø {formatTime(page.avgTimeOnPage)}
                  </div>
                </div>
                <div className="ml-4 font-semibold text-chart-1">{page.pageviews}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiTrendingUp className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Verweisquellen</h2>
          </div>
          <div className="space-y-3">
            {stats.referrers.slice(0, 8).map((ref, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ref.label}</div>
                  <div className="text-xs text-muted-foreground">{ref.percentage}% aller Besuche</div>
                </div>
                <div className="ml-4 font-semibold text-chart-2">{ref.visits}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiMonitor className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Browser</h2>
          </div>
          <div className="space-y-3">
            {stats.browsers.map((browser, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{browser.label}</span>
                    <span className="text-sm text-muted-foreground">{browser.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${browser.percentage}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiMonitor className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Betriebssysteme</h2>
          </div>
          <div className="space-y-3">
            {stats.operatingSystems.map((os, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{os.label}</span>
                    <span className="text-sm text-muted-foreground">{os.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${os.percentage}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-5">
          <FiGlobe className="text-muted-foreground" size={18} />
          <h2 className="text-sm font-medium tracking-tight">Besucher nach Ländern</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {stats.countries.map((country, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium">{country.label}</div>
                <div className="text-xs text-muted-foreground">{country.percentage}% aller Besuche</div>
              </div>
              <div className="ml-4 font-semibold text-chart-3">{country.visits}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiTrendingUp className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Einstiegsseiten</h2>
          </div>
          <div className="space-y-3">
            {stats.entryPages.slice(0, 6).map((page, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{page.url}</div>
                  <div className="text-xs text-muted-foreground">
                    Bounce: {page.bounceRate.toFixed(1)}%
                  </div>
                </div>
                <div className="ml-4 font-semibold text-chart-4">{page.visits}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-5">
            <FiTrendingUp className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Ausstiegsseiten</h2>
          </div>
          <div className="space-y-3">
            {stats.exitPages.slice(0, 6).map((page, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{page.url}</div>
                  <div className="text-xs text-muted-foreground">
                    Exit Rate: {page.exitRate.toFixed(1)}%
                  </div>
                </div>
                <div className="ml-4 font-semibold text-chart-5">{page.exits}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
