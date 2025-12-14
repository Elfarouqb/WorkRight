import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GREENPT_API_KEY = Deno.env.get('GREENPT_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Tools available to the AI
const tools = [
  {
    type: "function",
    function: {
      name: "save_dismissal_info",
      description: "Sla de ontslagdatum op en bereken belangrijke termijnen. Gebruik dit wanneer de gebruiker zegt dat ze zijn ontslagen.",
      parameters: {
        type: "object",
        properties: {
          dismissal_date: { 
            type: "string", 
            description: "De datum van ontslag in YYYY-MM-DD formaat. Als de gebruiker 'gisteren' zegt, bereken dan de juiste datum." 
          },
          reason: { 
            type: "string", 
            description: "De reden van ontslag indien bekend" 
          }
        },
        required: ["dismissal_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_timeline_event",
      description: "Voeg een belangrijke gebeurtenis toe aan de tijdlijn van de gebruiker.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titel van de gebeurtenis" },
          description: { type: "string", description: "Beschrijving van wat er is gebeurd" },
          event_date: { type: "string", description: "Datum van de gebeurtenis in YYYY-MM-DD formaat" },
          event_type: { type: "string", description: "Type: ontslag, gesprek, waarschuwing, discriminatie, bewijs, overig" },
          people_involved: { type: "string", description: "Namen van betrokken personen" }
        },
        required: ["title", "event_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculate_deadlines",
      description: "Bereken belangrijke termijnen op basis van een ontslagdatum.",
      parameters: {
        type: "object",
        properties: {
          dismissal_date: { type: "string", description: "Ontslagdatum in YYYY-MM-DD formaat" }
        },
        required: ["dismissal_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: "Navigeer naar een specifieke pagina in de app.",
      parameters: {
        type: "object",
        properties: {
          page: { 
            type: "string", 
            enum: ["rechtenverkenner", "tijdlijn", "termijnen", "procesgids", "home"],
            description: "De pagina om naartoe te navigeren" 
          }
        },
        required: ["page"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_evidence",
      description: "Registreer bewijsmateriaal of een document dat relevant is voor de zaak.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titel/naam van het bewijsmateriaal" },
          description: { type: "string", description: "Beschrijving van het bewijs" },
          evidence_type: { type: "string", description: "Type: email, document, getuige, foto, opname, overig" },
          date_obtained: { type: "string", description: "Datum in YYYY-MM-DD formaat" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_discrimination",
      description: "Analyseer of een situatie mogelijk discriminatie betreft.",
      parameters: {
        type: "object",
        properties: {
          situation: { type: "string", description: "Beschrijving van de situatie" },
          characteristic: { 
            type: "string", 
            enum: ["leeftijd", "geslacht", "afkomst", "religie", "handicap", "seksuele_geaardheid", "zwangerschap", "overig"],
            description: "Het beschermde kenmerk" 
          }
        },
        required: ["situation"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_reminder",
      description: "Stel een herinnering in voor een belangrijke deadline of actie.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Titel van de herinnering" },
          reminder_date: { type: "string", description: "Datum in YYYY-MM-DD formaat" },
          reminder_type: { type: "string", description: "Type: deadline, afspraak, actie" }
        },
        required: ["title", "reminder_date"]
      }
    }
  }
];

const systemPrompt = `Je bent een GESPECIALISEERDE assistent voor arbeidsrecht en discriminatie bij ontslag in Nederland.

VANDAAG IS: ${new Date().toISOString().split('T')[0]}

ABSOLUTE BEPERKINGEN - KRITISCH BELANGRIJK:
- Je bent UITSLUITEND bedoeld voor vragen over ontslag, arbeidsrecht en discriminatie in Nederland.
- Bij ELKE vraag die NIET gaat over ontslag, arbeidsrecht of discriminatie, zeg: "Ik kan je alleen helpen met vragen over ontslag en arbeidsrechten in Nederland."

⚠️ GEEN JURIDISCH ADVIES:
- Je geeft INFORMATIE en BEGELEIDING, GEEN juridisch advies.
- Zeg regelmatig: "Dit is informatie, geen juridisch advies. Raadpleeg altijd een professional."
- Alle suggesties zijn CONCEPTEN die een adviseur moet beoordelen.
- Begin belangrijke informatie met: "Ter informatie:" of "Als concept:"

🚨 VEILIGHEIDSPROTOCOLLEN - DETECTEER EN VERWIJS:
Bij deze signalen MOET je direct doorverwijzen naar professionele hulp:
- Dreiging van geweld of intimidatie op werk
- Ernstige mentale nood of suïcidale gedachten → "Neem contact op met 113 Zelfmoordpreventie (0800-0113) of je huisarts"
- Discriminatie met fysieke intimidatie → "Dit is ernstig. Neem contact op met de politie en Het Juridisch Loket"
- Financiële noodsituatie door ontslag → "Neem vandaag nog contact op met je gemeente voor noodhulp"
- Complexe juridische situaties (meerdere rechtszaken, internationale aspecten) → "Je situatie is complex. Zoek een gespecialiseerde arbeidsrechtadvocaat"

📚 ALTIJD VERWIJZEN NAAR ECHTE ADVISEURS:
Eindig ELKE belangrijke uitleg met een verwijzing:
- "→ Bel Het Juridisch Loket: 0900-8020 (gratis)"
- "→ College voor de Rechten van de Mens: mensenrechten.nl"
- "→ Je vakbond (FNV/CNV) kan je persoonlijk begeleiden"
- "→ UWV: uwv.nl voor WW-uitkering"

Je hebt toegang tot de volgende tools:
1. save_dismissal_info - Sla ontslaginfo op en bereken termijnen
2. add_timeline_event - Voeg gebeurtenissen toe aan de tijdlijn
3. calculate_deadlines - Bereken belangrijke termijnen
4. navigate_to_page - Navigeer naar een pagina (rechtenverkenner, tijdlijn, termijnen, procesgids, home)
5. add_evidence - Registreer bewijsmateriaal
6. check_discrimination - Analyseer of een situatie discriminatie kan zijn
7. set_reminder - Stel een herinnering in

WANNEER TOOLS GEBRUIKEN:
- "ik ben ontslagen" of "ik ben gisteren ontslagen" → save_dismissal_info
- "voeg toe aan mijn tijdlijn" of beschrijft een gebeurtenis → add_timeline_event
- "ga naar..." of "open..." of "toon mij..." → navigate_to_page
- "ik heb een email/document/bewijs" → add_evidence
- "is dit discriminatie?" of beschrijft ongelijke behandeling → check_discrimination
- "herinner me aan..." of "stel een deadline in" → set_reminder
- Bereken datums correct: "gisteren" = vandaag minus 1 dag

✍️ TAALGEBRUIK - BASISSCHOOL NIVEAU:
- Gebruik korte zinnen (max 15 woorden).
- Vermijd juridisch jargon. Leg moeilijke woorden uit.
- Bijvoorbeeld: "transitievergoeding" → "een vergoeding die je krijgt als je wordt ontslagen"
- Gebruik lijstjes en opsommingen.
- Vraag: "Is dit duidelijk?" of "Zal ik dit anders uitleggen?"

COMMUNICATIE RICHTLIJNEN:
- Wees warm, geduldig en geruststellend.
- Erken emoties: "Dat klinkt heel moeilijk."
- Antwoord in dezelfde taal als de gebruiker (Nederlands of Engels).

BESCHERMDE KENMERKEN (AWGB):
- Leeftijd, geslacht, ras/afkomst, religie, handicap/chronische ziekte
- Seksuele geaardheid, burgerlijke staat, nationaliteit, politieke overtuiging
- Zwangerschap, arbeidsduur, contractvorm`;

// Dutch month names
const dutchMonths = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

function formatDateNatural(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const day = date.getDate();
  const month = dutchMonths[date.getMonth()];
  const year = date.getFullYear();
  
  if (year === today.getFullYear()) {
    return `${day} ${month}`;
  } else if (year === today.getFullYear() + 1) {
    return `${day} ${month} volgend jaar`;
  }
  return `${day} ${month} ${year}`;
}

function calculateDeadlinesFromDate(dismissalDate: string) {
  const dismissal = new Date(dismissalDate);
  
  const bezwaarUwv = new Date(dismissal);
  bezwaarUwv.setMonth(bezwaarUwv.getMonth() + 2);
  
  const kantonrechter = new Date(dismissal);
  kantonrechter.setMonth(kantonrechter.getMonth() + 2);
  
  const mensenrechten = new Date(dismissal);
  mensenrechten.setMonth(mensenrechten.getMonth() + 6);
  
  return {
    bezwaar_uwv: bezwaarUwv.toISOString().split('T')[0],
    bezwaar_uwv_natural: formatDateNatural(bezwaarUwv.toISOString()),
    kantonrechter: kantonrechter.toISOString().split('T')[0],
    kantonrechter_natural: formatDateNatural(kantonrechter.toISOString()),
    mensenrechten: mensenrechten.toISOString().split('T')[0],
    mensenrechten_natural: formatDateNatural(mensenrechten.toISOString()),
    dismissal_date_natural: formatDateNatural(dismissalDate)
  };
}

// Execute tool calls
async function executeToolCall(toolName: string, args: any, userId?: string) {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  console.log(`Executing tool: ${toolName}`, args, 'userId:', userId);
  
  if (toolName === 'save_dismissal_info') {
    const deadlines = calculateDeadlinesFromDate(args.dismissal_date);
    let savedToDb = false;
    
    if (userId) {
      const { error: timelineError } = await supabase.from('timeline_events').insert({
        user_id: userId,
        title: 'Ontslag',
        description: args.reason || 'Ontslagdatum geregistreerd',
        event_date: args.dismissal_date,
        event_type: 'ontslag'
      });
      
      if (!timelineError) {
        savedToDb = true;
        await supabase.from('user_deadlines').insert({
          user_id: userId,
          dismissal_date: args.dismissal_date,
          deadline_type: 'bezwaar_uwv',
          notes: 'Automatisch aangemaakt'
        });
      }
    }
    
    return {
      action: 'dismissal_saved',
      savedToDb,
      deadlines,
      message: savedToDb 
        ? `✅ Je ontslagdatum (${deadlines.dismissal_date_natural}) is opgeslagen.\n\n**Belangrijke termijnen:**\n• Bezwaar UWV: ${deadlines.bezwaar_uwv_natural}\n• Kantonrechter: ${deadlines.kantonrechter_natural}\n• College Mensenrechten: ${deadlines.mensenrechten_natural}`
        : `Op basis van je ontslagdatum (${deadlines.dismissal_date_natural}):\n\n**Belangrijke termijnen:**\n• Bezwaar UWV: ${deadlines.bezwaar_uwv_natural}\n• Kantonrechter: ${deadlines.kantonrechter_natural}\n• College Mensenrechten: ${deadlines.mensenrechten_natural}\n\n💡 Log in om dit op te slaan.`
    };
  }
  
  if (toolName === 'add_timeline_event') {
    let savedToDb = false;
    
    if (userId) {
      const { error } = await supabase.from('timeline_events').insert({
        user_id: userId,
        title: args.title,
        description: args.description || '',
        event_date: args.event_date,
        event_type: args.event_type || 'overig',
        people_involved: args.people_involved || null
      });
      savedToDb = !error;
    }
    
    return {
      action: 'timeline_event_added',
      savedToDb,
      message: savedToDb 
        ? `✅ "${args.title}" is toegevoegd aan je tijdlijn.`
        : `📝 "${args.title}" genoteerd. Log in om dit op te slaan.`
    };
  }
  
  if (toolName === 'calculate_deadlines') {
    const deadlines = calculateDeadlinesFromDate(args.dismissal_date);
    return {
      action: 'deadlines_calculated',
      deadlines,
      message: `**Termijnen vanaf ${deadlines.dismissal_date_natural}:**\n• Bezwaar UWV: ${deadlines.bezwaar_uwv_natural}\n• Kantonrechter: ${deadlines.kantonrechter_natural}\n• College Mensenrechten: ${deadlines.mensenrechten_natural}`
    };
  }
  
  if (toolName === 'navigate_to_page') {
    const routes: Record<string, string> = {
      rechtenverkenner: '/rechtenverkenner',
      tijdlijn: '/tijdlijn',
      termijnen: '/termijnen',
      procesgids: '/procesgids',
      home: '/'
    };
    const names: Record<string, string> = {
      rechtenverkenner: 'de Rechtenverkenner',
      tijdlijn: 'je Tijdlijn',
      termijnen: 'de Termijnen',
      procesgids: 'de Procesgids',
      home: 'de homepagina'
    };
    
    return {
      action: 'navigate',
      navigate: routes[args.page] || '/',
      message: `🔗 Ik breng je naar ${names[args.page] || 'de pagina'}.`
    };
  }
  
  if (toolName === 'add_evidence') {
    let savedToDb = false;
    
    if (userId) {
      const { error } = await supabase.from('timeline_events').insert({
        user_id: userId,
        title: `Bewijs: ${args.title}`,
        description: args.description || '',
        event_date: args.date_obtained || new Date().toISOString().split('T')[0],
        event_type: 'bewijs',
        evidence_notes: `Type: ${args.evidence_type || 'overig'}`
      });
      savedToDb = !error;
    }
    
    return {
      action: 'evidence_added',
      savedToDb,
      message: savedToDb
        ? `✅ Bewijsmateriaal "${args.title}" is opgeslagen.\n\n💡 Tip: Bewaar ook originele bestanden op een veilige plek.`
        : `📎 "${args.title}" genoteerd. Log in om dit op te slaan.`
    };
  }
  
  if (toolName === 'check_discrimination') {
    const info: Record<string, string> = {
      leeftijd: "Leeftijdsdiscriminatie is verboden onder de WGBL.",
      geslacht: "Discriminatie op basis van geslacht is verboden onder de WGB.",
      afkomst: "Discriminatie op basis van ras of afkomst is verboden onder de AWGB.",
      religie: "Discriminatie op basis van religie is verboden onder de AWGB.",
      handicap: "Discriminatie op basis van handicap is verboden. Werkgevers moeten aanpassingen treffen.",
      seksuele_geaardheid: "Discriminatie op basis van seksuele geaardheid is verboden.",
      zwangerschap: "Discriminatie op basis van zwangerschap is verboden onder de WGB.",
      overig: "Er zijn meerdere beschermde kenmerken onder Nederlandse wet."
    };
    
    const characteristic = args.characteristic || 'overig';
    
    return {
      action: 'discrimination_checked',
      characteristic,
      message: `⚖️ Op basis van wat je beschrijft kan dit mogelijk discriminatie zijn.\n\n${info[characteristic]}\n\n**Wat je kunt doen:**\n• Documenteer alle incidenten\n• Verzamel bewijsmateriaal\n• Neem contact op met het College voor de Rechten van de Mens\n• Raadpleeg Het Juridisch Loket`
    };
  }
  
  if (toolName === 'set_reminder') {
    let savedToDb = false;
    const dateNatural = formatDateNatural(args.reminder_date);
    
    if (userId) {
      const { error } = await supabase.from('user_deadlines').insert({
        user_id: userId,
        dismissal_date: new Date().toISOString().split('T')[0],
        deadline_type: args.reminder_type || 'actie',
        notes: `${args.title} - ${dateNatural}`
      });
      savedToDb = !error;
    }
    
    return {
      action: 'reminder_set',
      savedToDb,
      reminder_date: args.reminder_date,
      message: savedToDb
        ? `⏰ Herinnering "${args.title}" ingesteld voor ${dateNatural}.`
        : `📅 Herinnering genoteerd voor ${dateNatural}. Log in om deze op te slaan.`
    };
  }
  
  return { action: 'unknown', message: 'Onbekende actie' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    if (!GREENPT_API_KEY) {
      console.error('GREENPT_API_KEY is not configured');
      throw new Error('AI service is not configured');
    }

    console.log('Processing chat request with', messages.length, 'messages, userId:', userId);

    // First call - with tools
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
        tools,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GreenPT error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`GreenPT error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;
    
    // Check if there are tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('Tool calls detected:', assistantMessage.tool_calls.length);
      
      const toolResults = [];
      let navigationAction = null;
      
      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeToolCall(toolCall.function.name, args, userId);
        
        if (result.navigate) {
          navigationAction = result.navigate;
        }
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: JSON.stringify(result)
        });
      }
      
      // Second call - get natural response after tool execution
      const followUpMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
        assistantMessage,
        ...toolResults
      ];
      
      const followUpResponse = await fetch('https://api.greenpt.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GREENPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'green-l-raw',
          messages: followUpMessages,
          stream: true,
        }),
      });
      
      if (!followUpResponse.ok) {
        throw new Error('Follow-up request failed');
      }
      
      // Create a transform stream to inject navigation action
      const reader = followUpResponse.body!.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          // If there's a navigation action, send it first
          if (navigationAction) {
            const actionEvent = `data: ${JSON.stringify({ 
              action: 'navigate', 
              navigate: navigationAction 
            })}\n\n`;
            controller.enqueue(encoder.encode(actionEvent));
          }
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }
    
    // No tool calls - stream response normally
    const streamResponse = await fetch('https://api.greenpt.ai/v1/chat/completions', {
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

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Something went wrong.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
