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
    const apikey = url.searchParams.get("apikey");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const siteid = url.searchParams.get("siteid");

    if (!apikey || !from || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: apikey, from, to" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let apiUrl = `https://api.cinster.ticketserver.net/3.0/reports/nexus/grossperdate?apikey=${apikey}&from=${from}&to=${to}`;

    if (siteid) {
      apiUrl += `&siteid=${siteid}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.warn(`API returned status ${response.status} for site ${siteid || 'all'}`);
      return new Response(
        JSON.stringify({ data: [], total: 0 }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.warn("Error fetching gross per date:", error);
    return new Response(
      JSON.stringify({ data: [], total: 0 }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});