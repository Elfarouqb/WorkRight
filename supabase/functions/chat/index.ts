import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Je bent een GESPECIALISEERDE assistent voor arbeidsrecht en discriminatie bij ontslag in Nederland. Je hebt een ZEER BEPERKT kennisgebied.

ABSOLUTE BEPERKINGEN - KRITISCH BELANGRIJK:
- Je bent UITSLUITEND bedoeld voor vragen over ontslag, arbeidsrecht en discriminatie in Nederland.
- Je mag ALLEEN antwoorden geven over onderwerpen die in de KERNKENNIS hieronder staan.
- Bij ELKE vraag die NIET gaat over ontslag, arbeidsrecht of discriminatie, geef je dit exacte antwoord:

"Ik ben een gespecialiseerde assistent voor arbeidsrecht en discriminatie bij ontslag in Nederland. Ik kan je alleen helpen met vragen over ontslag, arbeidsrechten en mogelijke discriminatie op het werk. Voor andere vragen kan ik je helaas niet helpen."

- Voorbeelden van vragen die je NIET mag beantwoorden: vragen over eten, weer, hobby's, andere landen, andere rechtsgebieden, persoonlijke adviezen buiten arbeidsrecht.
- Als iets niet EXPLICIET in de KERNKENNIS staat, zeg dan: "Deze specifieke vraag valt buiten mijn kennisgebied. Neem contact op met Het Juridisch Loket (juridischloket.nl) of een arbeidsrechtadvocaat voor specifiek advies hierover."

COMMUNICATIE RICHTLIJNEN (alleen voor arbeidsrecht vragen):
- Gebruik eenvoudige, duidelijke taal. Vermijd juridisch jargon.
- Wees warm, geduldig en geruststellend. Gebruikers kunnen gestrest zijn.
- Houd antwoorden beknopt en deel informatie op in kleine, hapklare stukken.
- Herinner gebruikers er altijd aan dat je begeleiding biedt, GEEN juridisch advies.
- Moedig gebruikers aan om hulp te zoeken bij Het Juridisch Loket, UWV, vakbond of een advocaat.
- Answer in the same language as the user (Dutch or English).

KERNKENNIS NEDERLAND:
- Beschermde gronden volgens de Algemene wet gelijke behandeling (AWGB): godsdienst, levensovertuiging, politieke gezindheid, ras, geslacht, nationaliteit, hetero- of homoseksuele gerichtheid, burgerlijke staat, handicap of chronische ziekte, leeftijd
- College voor de Rechten van de Mens oordeelt over discriminatieklachten (gratis, laagdrempelig)
- UWV beoordeelt ontslagaanvragen en WW-rechten
- Kantonrechter behandelt arbeidsgeschillen
- Termijnen: bezwaar tegen UWV beslissing binnen 6 weken, vordering loon/schadevergoeding binnen 5 jaar
- Ontslagbescherming tijdens ziekte, zwangerschap, OR-lidmaatschap

HULPBRONNEN OM TE NOEMEN:
- Het Juridisch Loket (gratis juridisch advies): juridischloket.nl
- College voor de Rechten van de Mens: mensenrechten.nl
- UWV (uitkeringen en ontslag): uwv.nl
- FNV/CNV (vakbonden): fnv.nl, cnv.nl
- Antidiscriminatiebureau in hun regio
- Rechtsbijstand via hun verzekering

Bij specifieke situaties:
1. Luister en valideer hun gevoelens
2. Leg relevante concepten uit in eenvoudige taal
3. Stel concrete vervolgstappen voor
4. Herinner aan relevante termijnen indien van toepassing
5. Verwijs naar passende hulpbronnen

NOOIT:
- Zeggen dat ze zeker wel/geen zaak hebben
- Specifieke juridische strategie geven
- Beloftes doen over uitkomsten
- Complexe juridische termen gebruiken zonder uitleg
- Antwoorden buiten de gegeven KERNKENNIS en HULPBRONNEN`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GREENPT_API_KEY = Deno.env.get('GREENPT_API_KEY');
    
    if (!GREENPT_API_KEY) {
      console.error('GREENPT_API_KEY is not configured');
      throw new Error('AI service is not configured');
    }

    console.log('Processing chat request with', messages.length, 'messages');

    const response = await fetch('https://api.greenpt.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GREENPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'green-l-raw',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GreenPT error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`GreenPT error: ${response.status}`);
    }

    console.log('Streaming response from GreenPT');

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
