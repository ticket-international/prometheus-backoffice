'use client';

import { useState, useEffect } from 'react';
import { FiFilm, FiClock, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';
import { useTheme } from 'next-themes';

interface TopEvent {
  count: number;
  gross: number;
  name: string;
  iD: number;
}

interface ApiResponse {
  items: TopEvent[];
}

const CHART_COLORS_LIGHT = ['#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#06b6d4'];
const CHART_COLORS_DARK = ['#059669', '#4f46e5', '#7c3aed', '#d97706', '#0891b2'];

export default function FilmDaten() {
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [toDate, setToDate] = useState<Date>(new Date());
  const { session } = useAuth();
  const { selectedSiteId, siteVersion } = useSite();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const chartColors = isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
  const textColor = isDark ? '#a1a1aa' : '#52525b';
  const borderColor = isDark ? '#3f3f46' : '#e4e4e7';
  const cardBg = isDark ? '#27272a' : '#ffffff';
  const labelColor = isDark ? '#e4e4e7' : '#18181b';

  const fetchTopEvents = async () => {
    if (!session || selectedSiteId === null) return;

    console.log('[Film-Daten] Fetching top events for site:', selectedSiteId);

    setLoading(true);
    setError(null);

    try {
      const from = format(fromDate, 'yyyy-MM-dd');
      const to = format(toDate, 'yyyy-MM-dd');

      const params = new URLSearchParams({
        apikey: session.apiKey,
        from,
        to,
        topn: '10',
      });

      // Only add siteid if it's not 0 (which means "all sites" for admins)
      if (selectedSiteId !== 0) {
        params.append('siteid', selectedSiteId.toString());
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-top-events?${params}`;
      console.log('[Film-Daten] Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Film-Daten');
      }

      const data: ApiResponse = await response.json();
      setTopEvents(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && selectedSiteId) {
      fetchTopEvents();
    }
  }, [session, selectedSiteId, siteVersion]);

  const chartData = topEvents.map((event) => ({
    name: event.name.length > 20 ? event.name.substring(0, 20) + '...' : event.name,
    fullName: event.name,
    tickets: event.count,
    revenue: event.gross,
  }));

  const pieData = topEvents.map((event) => ({
    name: event.name,
    value: event.gross,
  }));

  const totalRevenue = topEvents.reduce((sum, event) => sum + event.gross, 0);
  const totalTickets = topEvents.reduce((sum, event) => sum + event.count, 0);

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiFilm className="text-xl text-foreground" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Film-Daten</h1>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-muted-foreground" size={18} />
            <h2 className="text-sm font-medium tracking-tight">Zeitraum auswählen</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Von: {format(fromDate, 'dd.MM.yyyy', { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(date) => date && setFromDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Bis: {format(toDate, 'dd.MM.yyyy', { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(date) => date && setToDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={fetchTopEvents} size="sm">
              Aktualisieren
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Lade Daten...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-12">
            <div className="text-destructive">{error}</div>
          </div>
        )}

        {!loading && !error && topEvents.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Keine Daten verfügbar</div>
          </div>
        )}

        {!loading && !error && topEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-xs text-muted-foreground mb-1">Gesamtumsatz</div>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
            </div>
            <div className="card p-4 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
              <div className="text-xs text-muted-foreground mb-1">Verkaufte Tickets</div>
              <div className="text-2xl font-bold">{totalTickets.toLocaleString('de-DE')}</div>
            </div>
            <div className="card p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/5">
              <div className="text-xs text-muted-foreground mb-1">Anzahl Filme</div>
              <div className="text-2xl font-bold">{topEvents.length}</div>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && topEvents.length > 0 && (
        <>
          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-5">
              <FiFilm className="text-muted-foreground" size={18} />
              <h2 className="text-sm font-medium tracking-tight">Top Filme nach Tickets</h2>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis
                  type="number"
                  stroke={textColor}
                  tick={{ fill: textColor }}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={textColor}
                  tick={{ fill: textColor }}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: labelColor,
                  }}
                  labelStyle={{ color: labelColor, fontWeight: 500 }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === 'tickets') {
                      return [value.toLocaleString('de-DE'), 'Tickets'];
                    }
                    return [value];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar
                  dataKey="tickets"
                  fill={chartColors[0]}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-5">
              <FiFilm className="text-muted-foreground" size={18} />
              <h2 className="text-sm font-medium tracking-tight">Umsatzverteilung</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, x, y, cx }) => {
                      const shortName = name.length > 15 ? name.substring(0, 15) + '...' : name;
                      const labelText = `${shortName} (${(percent * 100).toFixed(0)}%)`;
                      return (
                        <text
                          x={x}
                          y={y}
                          fill={labelColor}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize="11"
                        >
                          {labelText}
                        </text>
                      );
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: cardBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: labelColor,
                    }}
                    labelStyle={{ color: labelColor, fontWeight: 500 }}
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                      'Umsatz'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {topEvents.map((event, index) => (
                  <div key={event.iD} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{event.name}</div>
                        <div className="text-[10px] text-muted-foreground">{event.count} Tickets</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-right">
                      {event.gross.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
