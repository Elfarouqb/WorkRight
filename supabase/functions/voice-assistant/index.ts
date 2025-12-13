import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const systemPrompt = `Je bent een GESPECIALISEERDE spraakassistent voor arbeidsrecht en discriminatie bij ontslag in Nederland.

ABSOLUTE BEPERKINGEN:
- Je bent UITSLUITEND bedoeld voor vragen over ontslag, arbeidsrecht en discriminatie in Nederland.
- Bij vragen die NIET gaan over ontslag, arbeidsrecht of discriminatie, zeg: "Ik kan je alleen helpen met vragen over ontslag en arbeidsrechten in Nederland."

Je belangrijkste taken:
1. Navigatie: Help gebruikers naar de juiste pagina's te gaan
2. Informatie: Beantwoord vragen over arbeidsrecht en discriminatie
3. Ondersteuning: Wees empathisch - gebruikers kunnen overweldigd zijn

Navigatie commando's:
- "ga naar rechtenverkenner" of "open rechtenverkenner" -> navigeer naar /rechtenverkenner
- "ga naar tijdlijn" of "open tijdlijn" -> navigeer naar /tijdlijn  
- "ga naar termijnen" of "open termijnen" -> navigeer naar /termijnen
- "ga naar procesgids" of "open procesgids" -> navigeer naar /procesgids
- "ga naar home" of "terug naar begin" -> navigeer naar /
- "ga naar hulp" of "ik heb hulp nodig" -> navigeer naar /hulp

Als je navigatie detecteert, antwoord dan met JSON: {"navigate": "/pad", "message": "korte bevestiging"}
Voor gewone antwoorden, geef gewoon tekst terug.

Houd antwoorden kort (max 2-3 zinnen voor spraak).
Gebruik eenvoudige taal, vermijd juridisch jargon.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, text, audio, messages } = await req.json();
    console.log(`Voice assistant action: ${action}`);

    // Speech-to-Text with ElevenLabs Scribe
    if (action === 'transcribe') {
      if (!audio) {
        throw new Error('No audio data provided');
      }

      console.log('Transcribing audio with ElevenLabs...');
      
      // Decode base64 audio
      const binaryString = atob(audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const formData = new FormData();
      const blob = new Blob([bytes], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', 'nld'); // Dutch

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

    // Chat with Lovable AI
    if (action === 'chat') {
      if (!text) {
        throw new Error('No text provided');
      }

      console.log('Sending to Lovable AI:', text);

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...(messages || []),
        { role: 'user', content: text }
      ];

      const chatResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: chatMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('Lovable AI error:', errorText);
        throw new Error(`Lovable AI error: ${chatResponse.status}`);
      }

      const chatResult = await chatResponse.json();
      const assistantMessage = chatResult.choices?.[0]?.message?.content || '';
      console.log('Lovable AI response:', assistantMessage);

      // Check if response contains navigation
      let navigate = null;
      let responseText = assistantMessage;
      
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
        // Not JSON, use as plain text
        responseText = assistantMessage;
      }

      return new Response(JSON.stringify({ 
        text: responseText,
        navigate 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Text-to-Speech with ElevenLabs - Streaming for faster playback
    if (action === 'speak') {
      if (!text) {
        throw new Error('No text provided');
      }

      console.log('Converting to speech (streaming):', text);

      // Use a Dutch-friendly voice with flash model for speed
      const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - natural female voice

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5', // Fastest model
            output_format: 'mp3_22050_32', // Smaller, faster format
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

      // Stream the audio directly back to client
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
