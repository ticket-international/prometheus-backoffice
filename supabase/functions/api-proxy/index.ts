import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const API_BASE_URL = 'https://api.prometheus.ticketserver.net/3.0';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const apikey = url.searchParams.get('apikey');

    if (!endpoint || !apikey) {
      return new Response(
        JSON.stringify({ error: 'Endpoint and API key are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    url.searchParams.delete('endpoint');

    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const targetUrl = `${API_BASE_URL}/${endpoint}?${queryParams.toString()}`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined,
      body: req.method !== 'GET' ? await req.text() : undefined,
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});