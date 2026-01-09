import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const API_BASE_URL = 'https://api.cinster.ticketserver.net/3.0/reports/cinster/transactions';

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

    console.log('[fetch-orders] Request received:', { apiKey: apiKey ? 'present' : 'missing', siteId, fromDate, toDate });

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

    let apiUrl = `${API_BASE_URL}?apikey=${apiKey}`;

    if (siteId) {
      apiUrl += `&siteid=${siteId}`;
    }

    if (fromDate) {
      apiUrl += `&From=${fromDate}`;
    }

    if (toDate) {
      apiUrl += `&To=${toDate}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`API returned status ${response.status} for site ${siteId || 'all'}`);
      return new Response(
        JSON.stringify({ orders: [] }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.warn('Error fetching orders:', error);

    return new Response(
      JSON.stringify({ orders: [] }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});