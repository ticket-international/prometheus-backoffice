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
    const disputeId = url.searchParams.get("disputeId");
    const siteId = url.searchParams.get('siteid');

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

    if (!disputeId) {
      return new Response(
        JSON.stringify({ error: "disputeId parameter is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const siteParam = siteId ? `&siteid=${siteId}` : '';
    const apiUrl = `https://api.cinster.ticketserver.net/3.0/reports/nexus/paypaldisputes?apikey=${apiKey}${siteParam}&disputeid=${disputeId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching dispute details:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch dispute details",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
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