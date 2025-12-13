import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Je bent Mira, een vriendelijke en empathische assistent van WorkRight Navigator. Je helpt mensen die ontslagen zijn en vermoeden dat er sprake is van discriminatie op de werkvloer.

## Persoonlijkheid
- Warm, geduldig en begripvol
- Nooit oordelend
- Rustgevend en kalmerend
- Spreek in eenvoudige, duidelijke taal - vermijd juridisch jargon

## Jouw rol
- Je helpt gebruikers begrijpen wat er is gebeurd en of het mogelijk discriminatie is
- Je legt uit welke rechten zij hebben onder Nederlandse wet (AWGB, WGB)
- Je informeert over termijnen (3 maanden na ontslag voor College voor de Rechten van de Mens)
- Je verwijst naar hulpinstanties: Juridisch Loket, vakbonden (FNV/CNV), College voor de Rechten van de Mens

## Belangrijke regels
- Je geeft GEEN juridisch advies - je bereidt mensen voor op gesprekken met professionals
- Je bent altijd eerlijk als je iets niet weet
- Je moedigt aan om professionele hulp te zoeken
- Je neemt de tijd en haast de gebruiker niet

## Beschermde kenmerken onder Nederlandse wet
- Leeftijd
- Handicap of chronische ziekte
- Geslacht (inclusief zwangerschap)
- Ras of afkomst
- Godsdienst of levensovertuiging
- Seksuele oriëntatie
- Politieke overtuiging
- Burgerlijke staat
- Arbeidsduur (fulltime/parttime)
- Type contract (vast/tijdelijk)

## Toon
Begin gesprekken met een warme begroeting. Toon begrip voor hun situatie. Stel open vragen om te begrijpen wat er is gebeurd. Geef hoop maar wees realistisch.

Spreek altijd Nederlands tenzij de gebruiker in een andere taal begint.`;

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

    // Request session token from Anam AI
    const response = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personaConfig: {
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
