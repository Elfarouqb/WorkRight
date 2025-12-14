import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Minimum transcript length (configurable)
const MIN_TRANSCRIPT_LENGTH = 10;

interface TranscriptRequest {
  email?: string;
  name?: string;
  transcript: string;
}

interface TranscriptResponse {
  ok: boolean;
  error?: string;
  status?: number;
  details?: string;
}

/**
 * Validates the incoming request body
 */
function validateRequest(body: unknown): { valid: true; data: TranscriptRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { transcript, email, name } = body as Record<string, unknown>;

  // Transcript is required
  if (transcript === undefined || transcript === null) {
    return { valid: false, error: 'transcript is required' };
  }

  if (typeof transcript !== 'string') {
    return { valid: false, error: 'transcript must be a string' };
  }

  const trimmedTranscript = transcript.trim();

  if (trimmedTranscript.length < MIN_TRANSCRIPT_LENGTH) {
    return {
      valid: false,
      error: `transcript must be at least ${MIN_TRANSCRIPT_LENGTH} characters (after trimming whitespace)`
    };
  }

  // Email is optional but must be string if provided
  if (email !== undefined && email !== null && typeof email !== 'string') {
    return { valid: false, error: 'email must be a string if provided' };
  }

  // Name is optional but must be string if provided
  if (name !== undefined && name !== null && typeof name !== 'string') {
    return { valid: false, error: 'name must be a string if provided' };
  }

  return {
    valid: true,
    data: {
      transcript: trimmedTranscript,
      email: typeof email === 'string' ? email.trim() : '',
      name: typeof name === 'string' ? name.trim() : '',
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get environment variables
    const ACTIVEPIECES_WEBHOOK_URL = Deno.env.get('ACTIVEPIECES_WEBHOOK_URL');
    const ACTIVEPIECES_WEBHOOK_API_KEY = Deno.env.get('ACTIVEPIECES_WEBHOOK_API_KEY');

    if (!ACTIVEPIECES_WEBHOOK_URL) {
      console.error('ACTIVEPIECES_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ ok: false, error: 'Webhook service is not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const validation = validateRequest(body);

    if (!validation.valid) {
      console.log('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ ok: false, error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { transcript, email, name } = validation.data;

    console.log(`Processing transcript request: email=${email || '(none)'}, name=${name || '(none)'}, transcript_length=${transcript.length}`);

    // Build headers for Activepieces request
    const webhookHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key header if configured (for security)
    if (ACTIVEPIECES_WEBHOOK_API_KEY) {
      webhookHeaders['x-api-key'] = ACTIVEPIECES_WEBHOOK_API_KEY;
    }

    // Forward to Activepieces webhook
    const webhookPayload = {
      email,
      name,
      transcript,
      timestamp: new Date().toISOString(),
      source: 'workright-app',
    };

    console.log('Forwarding to Activepieces webhook...');

    const webhookResponse = await fetch(ACTIVEPIECES_WEBHOOK_URL, {
      method: 'POST',
      headers: webhookHeaders,
      body: JSON.stringify(webhookPayload),
    });

    // Check if Activepieces responded successfully
    if (webhookResponse.ok) {
      console.log('Activepieces webhook succeeded:', webhookResponse.status);
      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle Activepieces error
    const errorText = await webhookResponse.text();
    console.error('Activepieces webhook failed:', webhookResponse.status, errorText);

    const errorResponse: TranscriptResponse = {
      ok: false,
      error: 'Activepieces error',
      status: webhookResponse.status,
      details: errorText.substring(0, 500), // Limit details length
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Send transcript function error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
