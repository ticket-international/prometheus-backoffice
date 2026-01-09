import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TI_HMAC_SECRET = "2e224c2e3937ff88bf8f7db93b8c8b5561885b1b22bd76ce3e044b7e19728199";
const RECTANGLES_API_URL = "https://ticket-cloud.com/wp-json/ti/v1/rectangles";

// Base64URL encode function
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate HMAC-SHA256 signature
async function signToken(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureString = String.fromCharCode(...signatureArray);
  return base64UrlEncode(signatureString);
}

// Generate TI token
async function generateTiToken(blogId: string): Promise<string> {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    wp_blog_id: parseInt(blogId),
    rights: {
      "101458": { read: 1 } // rectangles permission
    },
    sub: "backoffice"
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64Url = base64UrlEncode(payloadJson);
  const signature = await signToken(payloadBase64Url, TI_HMAC_SECRET);

  return `${payloadBase64Url}.${signature}`;
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
    const blogId = url.searchParams.get('blogId') || '1';
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('perPage') || '50';

    console.log('Fetching rectangles:', { blogId, page, perPage });

    // Generate the properly signed token
    const token = await generateTiToken(blogId);
    console.log('Generated token:', token);

    const apiUrl = `${RECTANGLES_API_URL}?blogId=${blogId}&page=${page}&perPage=${perPage}`;
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-TI-Token': token,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch rectangles', 
          status: response.status,
          details: errorText
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

    const data = await response.json();
    console.log('=== EDGE FUNCTION RESPONSE ===');
    console.log('Raw WordPress data:', JSON.stringify(data, null, 2));
    console.log('Data type:', typeof data);
    console.log('Data keys:', Object.keys(data));
    console.log('Total:', data.total);
    console.log('Items count:', data.items?.length);
    console.log('================================');

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
    console.error('Error fetching rectangles:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch rectangles', details: error.message }),
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