import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const GREENPT_API_KEY = Deno.env.get('GREENPT_API_KEY');

const systemPrompt = `Je bent een behulpzame spraakassistent voor WorkRight Navigator, een tool die mensen helpt bij arbeidsrechtelijke kwesties na ontslag in Nederland. 

Je belangrijkste taken:
1. Navigatie: Help gebruikers naar de juiste pagina's te gaan (Rechtenverkenner, Tijdlijn, Termijnen, Procesgids)
2. Informatie: Beantwoord vragen over arbeidsrecht, discriminatie en ontslagprocedures
3. Ondersteuning: Wees empathisch en begripvol - gebruikers kunnen overweldigd zijn

Navigatie commando's die je kunt herkennen:
- "ga naar rechtenverkenner" of "open rechtenverkenner" -> navigeer naar /rechtenverkenner
- "ga naar tijdlijn" of "open tijdlijn" -> navigeer naar /tijdlijn  
- "ga naar termijnen" of "open termijnen" -> navigeer naar /termijnen
- "ga naar procesgids" of "open procesgids" -> navigeer naar /procesgids
- "ga naar home" of "terug naar begin" -> navigeer naar /

Als je navigatie detecteert, antwoord dan met JSON: {"navigate": "/pad", "message": "korte bevestiging"}
Voor gewone antwoorden, geef gewoon tekst terug.

Houd antwoorden kort en duidelijk (max 2-3 zinnen voor spraak).
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

    // Chat with GreenPT
    if (action === 'chat') {
      if (!text) {
        throw new Error('No text provided');
      }

      console.log('Sending to GreenPT:', text);

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
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('GreenPT error:', errorText);
        throw new Error(`GreenPT error: ${chatResponse.status}`);
      }

      const chatResult = await chatResponse.json();
      const assistantMessage = chatResult.choices?.[0]?.message?.content || '';
      console.log('GreenPT response:', assistantMessage);

      // Check if response contains navigation
      let navigate = null;
      let responseText = assistantMessage;
      
      try {
        const parsed = JSON.parse(assistantMessage);
        if (parsed.navigate) {
          navigate = parsed.navigate;
          responseText = parsed.message;
        }
      } catch {
        // Not JSON, use as plain text
      }

      return new Response(JSON.stringify({ 
        text: responseText,
        navigate 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Text-to-Speech with ElevenLabs
    if (action === 'speak') {
      if (!text) {
        throw new Error('No text provided');
      }

      console.log('Converting to speech:', text);

      // Use a Dutch-friendly voice
      const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - natural female voice

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('ElevenLabs TTS error:', errorText);
        throw new Error(`ElevenLabs TTS error: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      
      // Convert to base64
      const uint8Array = new Uint8Array(audioBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64Audio = btoa(binary);

      return new Response(JSON.stringify({ audio: base64Audio }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
