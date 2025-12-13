import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
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
            description: "De reden van ontslag indien bekend (bijv. reorganisatie, discriminatie, etc.)" 
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
          event_type: { type: "string", description: "Type gebeurtenis: ontslag, gesprek, waarschuwing, discriminatie, bewijs, overig" },
          people_involved: { type: "string", description: "Namen van betrokken personen (bijv. manager, HR)" }
        },
        required: ["title", "event_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculate_benefits",
      description: "Bereken informatie over WW-uitkering en andere rechten na ontslag.",
      parameters: {
        type: "object",
        properties: {
          dismissal_date: { type: "string", description: "Ontslagdatum in YYYY-MM-DD formaat" },
          years_employed: { type: "number", description: "Aantal jaren in dienst (indien bekend)" }
        },
        required: ["dismissal_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: "Navigeer naar een specifieke pagina in de app. Gebruik dit wanneer de gebruiker vraagt om naar een pagina te gaan.",
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
          evidence_type: { type: "string", description: "Type bewijs: email, document, getuige, foto, opname, overig" },
          date_obtained: { type: "string", description: "Datum waarop het bewijs is verkregen in YYYY-MM-DD formaat" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_discrimination",
      description: "Analyseer of een situatie mogelijk discriminatie betreft op basis van beschermde kenmerken.",
      parameters: {
        type: "object",
        properties: {
          situation: { type: "string", description: "Beschrijving van de situatie die de gebruiker heeft meegemaakt" },
          characteristic: { 
            type: "string", 
            enum: ["leeftijd", "geslacht", "afkomst", "religie", "handicap", "seksuele_geaardheid", "zwangerschap", "overig"],
            description: "Het beschermde kenmerk dat mogelijk is geschonden" 
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
          reminder_date: { type: "string", description: "Datum voor de herinnering in YYYY-MM-DD formaat" },
          reminder_type: { type: "string", description: "Type: deadline, afspraak, actie" }
        },
        required: ["title", "reminder_date"]
      }
    }
  }
];

const systemPrompt = `Je bent een GESPECIALISEERDE spraakassistent voor arbeidsrecht en discriminatie bij ontslag in Nederland.

VANDAAG IS: ${new Date().toISOString().split('T')[0]}

ABSOLUTE BEPERKINGEN:
- Je bent UITSLUITEND bedoeld voor vragen over ontslag, arbeidsrecht en discriminatie in Nederland.
- Bij vragen die NIET gaan over ontslag, arbeidsrecht of discriminatie, zeg: "Ik kan je alleen helpen met vragen over ontslag en arbeidsrechten in Nederland."

Je hebt toegang tot de volgende tools:
1. save_dismissal_info - Sla ontslaginfo op en bereken termijnen
2. add_timeline_event - Voeg gebeurtenissen toe aan de tijdlijn
3. calculate_benefits - Bereken WW-uitkering informatie
4. navigate_to_page - Navigeer naar een pagina (rechtenverkenner, tijdlijn, termijnen, procesgids, home)
5. add_evidence - Registreer bewijsmateriaal (emails, documenten, getuigen)
6. check_discrimination - Analyseer of een situatie discriminatie kan zijn
7. set_reminder - Stel een herinnering in voor een deadline of afspraak

WANNEER TOOLS GEBRUIKEN:
- "ik ben ontslagen" of "ik ben gisteren ontslagen" → save_dismissal_info
- "voeg toe aan mijn tijdlijn" of beschrijft een gebeurtenis → add_timeline_event  
- "ga naar..." of "open..." → navigate_to_page
- "ik heb een email/document/bewijs" → add_evidence
- "is dit discriminatie?" of beschrijft ongelijke behandeling → check_discrimination
- "herinner me aan..." of "stel een herinnering in" → set_reminder
- Bereken datums correct: "gisteren" = vandaag minus 1 dag, "vorige week" = 7 dagen geleden

BESCHERMDE KENMERKEN (AWGB):
- Leeftijd, geslacht, ras/afkomst, religie, handicap/chronische ziekte
- Seksuele geaardheid, burgerlijke staat, nationaliteit, politieke overtuiging
- Zwangerschap, arbeidsduur (fulltime/parttime), contractvorm (vast/tijdelijk)

Houd antwoorden kort (max 3-4 zinnen voor spraak).
Wees empathisch - gebruikers kunnen overweldigd zijn.`;

// Dutch month names for natural speech
const dutchMonths = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

// Format date in natural Dutch (e.g., "12 februari 2026" or "12 februari volgend jaar")
function formatDateNatural(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const day = date.getDate();
  const month = dutchMonths[date.getMonth()];
  const year = date.getFullYear();
  const currentYear = today.getFullYear();
  
  if (year === currentYear) {
    return `${day} ${month}`;
  } else if (year === currentYear + 1) {
    return `${day} ${month} volgend jaar`;
  } else {
    return `${day} ${month} ${year}`;
  }
}

// Helper function to calculate deadlines
function calculateDeadlines(dismissalDate: string) {
  const dismissal = new Date(dismissalDate);
  
  // Bezwaar bij UWV: 2 maanden
  const bezwaarUwv = new Date(dismissal);
  bezwaarUwv.setMonth(bezwaarUwv.getMonth() + 2);
  
  // Verzoekschrift kantonrechter: 2 maanden
  const kantonrechter = new Date(dismissal);
  kantonrechter.setMonth(kantonrechter.getMonth() + 2);
  
  // College voor de Rechten van de Mens: 6 maanden aanbevolen
  const mensenrechten = new Date(dismissal);
  mensenrechten.setMonth(mensenrechten.getMonth() + 6);
  
  return {
    bezwaar_uwv: bezwaarUwv.toISOString().split('T')[0],
    bezwaar_uwv_natural: formatDateNatural(bezwaarUwv.toISOString().split('T')[0]),
    kantonrechter: kantonrechter.toISOString().split('T')[0],
    kantonrechter_natural: formatDateNatural(kantonrechter.toISOString().split('T')[0]),
    mensenrechten: mensenrechten.toISOString().split('T')[0],
    mensenrechten_natural: formatDateNatural(mensenrechten.toISOString().split('T')[0]),
    dismissal_date: dismissalDate,
    dismissal_date_natural: formatDateNatural(dismissalDate)
  };
}

// Execute tool calls
async function executeToolCall(toolName: string, args: any, userId?: string) {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  console.log(`Executing tool: ${toolName}`, args, 'userId:', userId);
  
  if (toolName === 'save_dismissal_info') {
    const deadlines = calculateDeadlines(args.dismissal_date);
    let savedToDb = false;
    
    // If we have a userId, save to database
    if (userId) {
      console.log('Saving to database for user:', userId);
      
      // Save timeline event
      const { error: timelineError } = await supabase.from('timeline_events').insert({
        user_id: userId,
        title: 'Ontslag',
        description: args.reason || 'Ontslagdatum geregistreerd via spraakassistent',
        event_date: args.dismissal_date,
        event_type: 'ontslag'
      });
      
      if (timelineError) {
        console.error('Error saving timeline event:', timelineError);
      } else {
        console.log('Timeline event saved successfully');
        savedToDb = true;
      }
      
      // Save deadline
      const { error: deadlineError } = await supabase.from('user_deadlines').insert({
        user_id: userId,
        dismissal_date: args.dismissal_date,
        deadline_type: 'bezwaar_uwv',
        notes: 'Automatisch aangemaakt via spraakassistent'
      });
      
      if (deadlineError) {
        console.error('Error saving deadline:', deadlineError);
      } else {
        console.log('Deadline saved successfully');
      }
    } else {
      console.log('No userId provided, data not saved to database');
    }
    
    const saveMessage = savedToDb 
      ? `Ik heb je ontslagdatum van ${deadlines.dismissal_date_natural} opgeslagen in je tijdlijn. `
      : `Op basis van je ontslagdatum (${deadlines.dismissal_date_natural}) zijn hier de belangrijke termijnen. Log in om dit op te slaan. `;
    
    return {
      success: true,
      message: saveMessage,
      deadlines,
      savedToDb,
      info: `
Belangrijke termijnen:
• Bezwaar bij UWV: uiterlijk ${deadlines.bezwaar_uwv_natural}
• Verzoekschrift kantonrechter: uiterlijk ${deadlines.kantonrechter_natural}
• College voor de Rechten van de Mens: aanbevolen vóór ${deadlines.mensenrechten_natural}

WW-uitkering: Je kunt binnen 1 week na ontslag een WW-aanvraag doen bij het UWV. Je hebt recht op WW als je minimaal 26 weken hebt gewerkt in de afgelopen 36 weken.`
    };
  }
  
  if (toolName === 'add_timeline_event') {
    const eventDateNatural = formatDateNatural(args.event_date);
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
      if (error) console.error('Error saving timeline event:', error);
    }
    
    return {
      success: true,
      message: savedToDb 
        ? `Ik heb "${args.title}" toegevoegd aan je tijdlijn voor ${eventDateNatural}.`
        : `Gebeurtenis "${args.title}" van ${eventDateNatural} genoteerd. Log in om dit op te slaan.`
    };
  }
  
  if (toolName === 'calculate_benefits') {
    const yearsWorked = args.years_employed || 0;
    let wwDuration = "3 maanden";
    
    if (yearsWorked >= 10) {
      wwDuration = "maximaal 24 maanden";
    } else if (yearsWorked >= 5) {
      wwDuration = "ongeveer 12 tot 18 maanden";
    } else if (yearsWorked >= 2) {
      wwDuration = "ongeveer 6 tot 12 maanden";
    }
    
    return {
      success: true,
      message: `Op basis van je dienstverband heb je mogelijk recht op WW voor ${wwDuration}. `,
      info: `
WW-uitkering informatie:
• Duur: ${wwDuration}
• Hoogte: eerste 2 maanden 75% van je laatstverdiende loon, daarna 70%
• Maximum dagloon: circa €256 per dag (2024)
• Aanvragen: binnen 1 week na ontslag via uwv.nl
• Voorwaarden: minimaal 26 weken gewerkt in afgelopen 36 weken`
    };
  }
  
  if (toolName === 'navigate_to_page') {
    const pageRoutes: Record<string, string> = {
      rechtenverkenner: '/rechtenverkenner',
      tijdlijn: '/tijdlijn',
      termijnen: '/termijnen',
      procesgids: '/procesgids',
      home: '/'
    };
    
    const pageNames: Record<string, string> = {
      rechtenverkenner: 'de Rechtenverkenner',
      tijdlijn: 'je Tijdlijn',
      termijnen: 'de Termijnen pagina',
      procesgids: 'de Procesgids',
      home: 'de homepagina'
    };
    
    const route = pageRoutes[args.page] || '/';
    const pageName = pageNames[args.page] || 'de pagina';
    
    return {
      success: true,
      message: `Ik breng je naar ${pageName}.`,
      navigate: route
    };
  }
  
  if (toolName === 'add_evidence') {
    const dateNatural = args.date_obtained ? formatDateNatural(args.date_obtained) : 'vandaag';
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
      if (error) console.error('Error saving evidence:', error);
    }
    
    return {
      success: true,
      message: savedToDb
        ? `Ik heb het bewijsmateriaal "${args.title}" toegevoegd aan je tijdlijn.`
        : `Bewijsmateriaal "${args.title}" genoteerd. Log in om dit op te slaan.`,
      info: `
Tip voor bewijsmateriaal:
• Bewaar originele emails en documenten
• Noteer data, tijden en aanwezige personen
• Maak screenshots van belangrijke berichten
• Vraag getuigen om een schriftelijke verklaring`
    };
  }
  
  if (toolName === 'check_discrimination') {
    const characteristicInfo: Record<string, string> = {
      leeftijd: "Leeftijdsdiscriminatie is verboden onder de WGBL. Dit omvat ongelijke behandeling bij ontslag, promotie of arbeidsvoorwaarden op basis van leeftijd.",
      geslacht: "Discriminatie op basis van geslacht is verboden onder de WGB. Dit omvat ongelijke beloning, beperkte doorgroeimogelijkheden en seksuele intimidatie.",
      afkomst: "Discriminatie op basis van ras of afkomst is verboden onder de AWGB. Dit omvat alle vormen van ongelijke behandeling gebaseerd op etniciteit.",
      religie: "Discriminatie op basis van religie of levensovertuiging is verboden onder de AWGB, tenzij voor specifieke functies bij religieuze organisaties.",
      handicap: "Discriminatie op basis van handicap of chronische ziekte is verboden onder de WGBH/CZ. Werkgevers moeten redelijke aanpassingen treffen.",
      seksuele_geaardheid: "Discriminatie op basis van seksuele geaardheid is verboden onder de AWGB.",
      zwangerschap: "Discriminatie op basis van zwangerschap is verboden onder de WGB. Dit omvat ontslag, demotie of weigering van verlenging.",
      overig: "Er zijn meerdere beschermde kenmerken onder Nederlandse anti-discriminatiewetgeving."
    };
    
    const characteristic = args.characteristic || 'overig';
    const info = characteristicInfo[characteristic] || characteristicInfo.overig;
    
    return {
      success: true,
      message: `Op basis van wat je beschrijft, kan dit mogelijk discriminatie zijn. ${info.split('.')[0]}.`,
      info: `
${info}

Wat kun je doen:
• Documenteer alle incidenten met data en details
• Verzamel bewijsmateriaal (emails, getuigen)
• Meld het bij je werkgever of HR
• Neem contact op met het College voor de Rechten van de Mens
• Raadpleeg een arbeidsrechtadvocaat of het Juridisch Loket

Let op: Dit is geen juridisch advies. Voor een officieel oordeel kun je terecht bij het College voor de Rechten van de Mens.`
    };
  }
  
  if (toolName === 'set_reminder') {
    const reminderDateNatural = formatDateNatural(args.reminder_date);
    let savedToDb = false;
    
    if (userId) {
      // Save as a deadline with notes
      const { error } = await supabase.from('user_deadlines').insert({
        user_id: userId,
        dismissal_date: new Date().toISOString().split('T')[0], // Use today as reference
        deadline_type: args.reminder_type || 'actie',
        notes: `Herinnering: ${args.title} - ${reminderDateNatural}`
      });
      savedToDb = !error;
      if (error) console.error('Error saving reminder:', error);
    }
    
    return {
      success: true,
      message: savedToDb
        ? `Ik heb een herinnering ingesteld voor "${args.title}" op ${reminderDateNatural}.`
        : `Herinnering voor "${args.title}" op ${reminderDateNatural} genoteerd. Log in om dit op te slaan.`
    };
  }
  
  return { success: false, message: "Onbekende actie" };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, text, audio, messages, userId } = await req.json();
    console.log(`Voice assistant action: ${action}`);

    // Speech-to-Text with ElevenLabs Scribe
    if (action === 'transcribe') {
      if (!audio) {
        throw new Error('No audio data provided');
      }

      console.log('Transcribing audio with ElevenLabs...');
      
      const binaryString = atob(audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const formData = new FormData();
      const blob = new Blob([bytes], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', 'nld');

      const sttResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: formData,
      });

      if (!sttResponse.ok) {
        const errorText = await sttResponse.text();
        console.error('ElevenLabs STT error:', errorText);
        throw new Error(`ElevenLabs STT error: ${sttResponse.status}`);
      }

      const transcription = await sttResponse.json();
      console.log('Transcription result:', transcription.text);

      return new Response(JSON.stringify({ text: transcription.text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Chat with GreenPT (with tool calling)
    if (action === 'chat') {
      if (!text) {
        throw new Error('No text provided');
      }

      console.log('Sending to GreenPT with tools:', text);

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...(messages || []),
        { role: 'user', content: text }
      ];

      const chatResponse = await fetch('https://api.greenpt.io/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GREENPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: chatMessages,
          max_tokens: 800,
          temperature: 0.7,
          tools,
          tool_choice: 'auto',
        }),
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('GreenPT error:', errorText);
        throw new Error(`GreenPT error: ${chatResponse.status}`);
      }

      const chatResult = await chatResponse.json();
      const choice = chatResult.choices?.[0];
      console.log('GreenPT response:', JSON.stringify(choice, null, 2));

      let navigate = null;
      let responseText = '';
      let toolResults: any[] = [];

      // Check if AI wants to call tools
      if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
        console.log('Processing tool calls...');
        
        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs = {};
          
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch (e) {
            console.error('Failed to parse tool arguments:', e);
          }
          
          const result = await executeToolCall(toolName, toolArgs, userId);
          toolResults.push(result);
          
          if (result.message) {
            responseText += result.message;
          }
          if (result.info) {
            responseText += result.info;
          }
        }
      } else {
        // Regular text response
        const assistantMessage = choice?.message?.content || '';
        
        // Clean up markdown code blocks if present
        let cleanedMessage = assistantMessage.trim();
        if (cleanedMessage.startsWith('```json')) {
          cleanedMessage = cleanedMessage.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedMessage.startsWith('```')) {
          cleanedMessage = cleanedMessage.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        try {
          const parsed = JSON.parse(cleanedMessage);
          if (parsed.navigate) {
            navigate = parsed.navigate;
            responseText = parsed.message || 'Ik navigeer je nu.';
          }
        } catch {
          responseText = assistantMessage;
        }
      }

      return new Response(JSON.stringify({ 
        text: responseText,
        navigate,
        toolResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Text-to-Speech with ElevenLabs
    if (action === 'speak') {
      if (!text) {
        throw new Error('No text provided');
      }

      // Shorten text for TTS (keep only the spoken message, not the detailed info)
      let speakText = text;
      if (text.includes('\n\n')) {
        // Get just the first paragraph for speaking
        speakText = text.split('\n\n')[0];
      }
      // Limit length for faster TTS
      if (speakText.length > 300) {
        speakText = speakText.substring(0, 300) + '...';
      }

      console.log('Converting to speech (streaming):', speakText);

      const voiceId = 'EXAVITQu4vr4xnSDxMaL';

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: speakText,
            model_id: 'eleven_flash_v2_5',
            output_format: 'mp3_22050_32',
            voice_settings: {
              stability: 0.4,
              similarity_boost: 0.8,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('ElevenLabs TTS error:', errorText);
        throw new Error(`ElevenLabs TTS error: ${ttsResponse.status}`);
      }

      return new Response(ttsResponse.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('Voice assistant error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
