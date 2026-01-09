import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

interface ApiResponse {
  values?: Array<{
    date: string;
    tickets: number;
    refundedTickets: number;
    gross: number;
    refunds: number;
    siteName: string;
  }>;
  total?: {
    date: string;
    tickets: number;
    refundedTickets: number;
    gross: number;
    refunds: number;
    siteName: string;
  };
}

interface KpiDataRange {
  dateFrom: string;
  dateTo: string;
  grossTotal: number;
  grossTickets: number;
  grossItems: number;
  grossVouchers: number;
  refundsTickets: number;
  refundsItems: number;
  tickets: number;
  reservations: number;
  sPP: number;
  avgTicketPrice: number;
  hitRate: number;
  onlineRate: number;
}

interface KpiResponse {
  dataRange1: KpiDataRange;
  dataRange2: KpiDataRange;
  dataRangeWeek: KpiDataRange;
}

async function safeFetch(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`API request failed: ${url} - Status: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Fetch error for ${url}:`, error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('apikey');
    const siteId = url.searchParams.get('siteid');
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'apikey parameter is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!fromDate || !toDate) {
      return new Response(
        JSON.stringify({ error: 'from and to date parameters are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Dashboard stats requested:', { fromDate, toDate, siteId });

    const baseUrl = "https://api.cinster.ticketserver.net/3.0/reports/nexus/charts";
    const kpiUrl = "https://api.prometheus.ticketserver.net/3.0/reports/nexus/kpi";
    const siteParam = siteId && siteId !== '0' ? `&siteid=${siteId}` : '';

    const [kpiData, last30DaysData, onlineTicketsData] = await Promise.all([
      safeFetch(`${kpiUrl}?apikey=${apiKey}${siteParam}&from=${fromDate}&to=${toDate}`),
      safeFetch(`${baseUrl}?apikey=${apiKey}${siteParam}&charttype=gross_tickets&from=${fromDate}&to=${toDate}`),
      safeFetch(`${baseUrl}?apikey=${apiKey}${siteParam}&charttype=5&from=${fromDate}&to=${toDate}`)
    ]);

    const kpi = kpiData as KpiResponse | null;

    const extract30DaysData = (data: ApiResponse | null): ChartData[] => {
      if (Array.isArray(data?.values)) {
        return data.values.map((item) => ({
          date: item.date,
          value: item.gross || 0
        }));
      }
      return [];
    };

    const extractOnlineTicketsToday = (data: ApiResponse | null): number => {
      if (Array.isArray(data?.values) && data.values.length > 0) {
        const lastEntry = data.values[data.values.length - 1];
        return lastEntry?.tickets || 0;
      }
      return 0;
    };

    const totalRevenueToday = kpi?.dataRange1?.grossTotal || 0;
    const totalRevenueYesterday = kpi?.dataRange2?.grossTotal || 0;
    const ticketRev = kpi?.dataRange1?.grossTickets || 0;
    const concessionRev = kpi?.dataRange1?.grossItems || 0;
    const voucherRev = kpi?.dataRange1?.grossVouchers || 0;
    const refundsTickets = kpi?.dataRange1?.refundsTickets || 0;
    const refundsItems = kpi?.dataRange1?.refundsItems || 0;
    const visitorsToday = kpi?.dataRange1?.tickets || 0;
    const visitorsYesterday = kpi?.dataRange2?.tickets || 0;
    const visitorsCurrentWeek = kpi?.dataRangeWeek?.tickets || 0;
    const spp = kpi?.dataRange1?.sPP || 0;
    const sppYesterday = kpi?.dataRange2?.sPP || 0;
    const onlineQuotaToday = kpi?.dataRange1?.onlineRate || 0;
    const onlineQuotaYesterday = kpi?.dataRange2?.onlineRate || 0;
    const onlineTicketsToday = extractOnlineTicketsToday(onlineTicketsData);
    const concessionsPerHead = visitorsToday > 0 ? concessionRev / visitorsToday : 0;

    const stats: DashboardStats = {
      totalRevenue: totalRevenueToday,
      totalRevenueYesterday: totalRevenueYesterday,
      ticketRevenue: ticketRev,
      concessionRevenue: concessionRev,
      voucherRevenue: voucherRev,
      refunds: refundsTickets + refundsItems,
      refundedTickets: refundsTickets,
      last30Days: extract30DaysData(last30DaysData),
      visitorsToday: visitorsToday,
      visitorsYesterday: visitorsYesterday,
      visitorsCurrentWeek: visitorsCurrentWeek,
      spp: spp,
      sppYesterday: sppYesterday,
      concessionsPerHead: concessionsPerHead,
      onlineQuotaToday: onlineQuotaToday,
      onlineQuotaYesterday: onlineQuotaYesterday,
      onlineTicketsToday: onlineTicketsToday
    };

    return new Response(
      JSON.stringify(stats),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch dashboard statistics', details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});