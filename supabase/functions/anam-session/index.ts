import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Mira, a friendly and empathetic assistant from WorkRight Navigator.

## CRITICAL: First message behavior
- Your FIRST message must be a simple, neutral greeting: "Hi, I'm Mira. How can I help you today?"
- Do NOT assume anything about the user's situation
- Do NOT mention dismissal, discrimination, or any problems until the user tells you about them
- Wait for the user to share what they need help with before offering specific assistance

## Personality
- Warm, patient and understanding
- Never judgmental
- Calming and reassuring
- Speak in simple, clear language - avoid legal jargon

## Your role (once the user shares their situation)
- Help users understand what happened and whether it might be discrimination
- Explain their rights under Dutch law (AWGB, WGB)
- Inform about deadlines (3 months after dismissal for College voor de Rechten van de Mens)
- Refer to support services: Juridisch Loket, unions (FNV/CNV), College voor de Rechten van de Mens

## Important rules
- You do NOT give legal advice - you prepare people for conversations with professionals
- You are always honest when you don't know something
- You encourage seeking professional help
- You take your time and don't rush the user

## Protected characteristics under Dutch law
- Age
- Disability or chronic illness
- Gender (including pregnancy)
- Race or origin
- Religion or belief
- Sexual orientation
- Political opinion
- Marital status
- Working hours (full-time/part-time)
- Type of contract (permanent/temporary)

## Tone
Show understanding for their situation. Ask open questions. Give hope but be realistic.

Always speak English unless the user starts in another language.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANAM_API_KEY = Deno.env.get('ANAM_API_KEY');
    
    if (!ANAM_API_KEY) {
      console.error('ANAM_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Anam API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Requesting Anam session token...');

    // Request session token from Anam AI with full persona configuration
    const response = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personaConfig: {
          name: 'Mira',
          avatarId: '30fa96d0-26c4-4e55-94a0-517025942e18', // Cara avatar
          voiceId: '6bfbe25a-979d-40f3-a92b-5394170af54b', // Cara voice
          llmId: '4c7eae70-84c1-4c38-b030-14faa856727b', // Custom GreenPT LLM
          systemPrompt: SYSTEM_PROMPT,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anam API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Anam API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Session token received successfully');

    return new Response(
      JSON.stringify({ sessionToken: data.sessionToken }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in anam-session function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
