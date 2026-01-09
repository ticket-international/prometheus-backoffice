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
    const apikey = url.searchParams.get('apikey');

    if (!apikey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Fetching sites from API...');
    const response = await fetch(`${API_BASE_URL}/sites?apikey=${encodeURIComponent(apikey)}`);
    
    console.log('API Response Status:', response.status);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      return new Response(
        JSON.stringify({ error: 'API returned non-JSON response', details: text }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    console.log('API Response Data:', JSON.stringify(data).substring(0, 500));
    console.log('Full response structure:', JSON.stringify(data, null, 2).substring(0, 1000));

    if (!response.ok) {
      console.error('API Error:', data);
      return new Response(
        JSON.stringify({
          error: data.error || data.message || 'API request failed',
          status: response.status,
          details: data
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (data.sites && Array.isArray(data.sites)) {
      const transformedSites = data.sites.map((site: any, index: number) => {
        console.log(`[fetch-sites] Site ${index} full object:`, JSON.stringify(site).substring(0, 500));
        console.log(`[fetch-sites] Available ID fields: siteid=${site.siteid}, id=${site.id}, iD=${site.iD}`);

        let displayName = site.shortName || site.name || '';
        if (!displayName || displayName.trim() === '') {
          if (site.street) {
            displayName = site.housenumber
              ? `${site.street} ${site.housenumber}`.trim()
              : site.street;
          } else {
            displayName = `Standort ${index + 1}`;
          }
        }

        const siteId = site.iD || site.siteid || site.id || (index + 1);
        console.log(`[fetch-sites] Using siteId: ${siteId} for site "${displayName}"`);

        return {
          siteid: siteId,
          name: displayName,
          address: site.street && site.housenumber
            ? `${site.street} ${site.housenumber}`.trim()
            : site.street || undefined,
          email: site.email || undefined,
          phone: site.phone || undefined,
          keys: site.keys || [],
        };
      });

      console.log('Transformed sites:', JSON.stringify(transformedSites).substring(0, 300));

      return new Response(
        JSON.stringify({ sites: transformedSites }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        stack: error instanceof Error ? error.stack : undefined
      }),
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