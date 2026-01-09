import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const topn = url.searchParams.get('topn') || '7';

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

    const siteParam = siteId && siteId !== '0' ? `&siteid=${siteId}` : '';
    const apiUrl = `https://api.cinster.ticketserver.net/3.0/reports/nexus/charts?apikey=${apiKey}${siteParam}&charttype=top_events&topn=${topn}&from=${from}&to=${to}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn(`API returned status ${response.status} for site ${siteId || 'all'}`);
      return new Response(
        JSON.stringify({ values: [] }),
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
    
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.warn('Error fetching top events:', error);
    return new Response(
      JSON.stringify({ values: [] }),
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