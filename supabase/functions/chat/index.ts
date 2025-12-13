import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are a compassionate, supportive assistant helping people understand UK employment rights after dismissal, particularly focusing on potential discrimination cases.

IMPORTANT GUIDELINES:
- Use plain, simple language. Avoid legal jargon.
- Be warm, patient, and reassuring. Users may be stressed, overwhelmed, or have reading difficulties.
- Keep responses concise and break information into small, digestible chunks.
- Always remind users that you provide guidance, NOT legal advice.
- Encourage users to seek help from ACAS, Citizens Advice, or a solicitor for specific legal matters.

KEY KNOWLEDGE:
- Protected characteristics in UK: disability, race, gender, age, religion, sexual orientation, pregnancy, marriage status
- ACAS Early Conciliation is required before going to tribunal
- Critical deadline: typically 3 months minus 1 day from the discriminatory act to file
- Employment Tribunal handles cases if conciliation fails

When asked about specific situations:
1. Listen and validate their feelings
2. Explain relevant concepts in plain terms
3. Suggest next steps they can take
4. Remind them about the time limit if relevant
5. Point them to appropriate resources (ACAS, Citizens Advice)

NEVER:
- Tell them they definitely have/don't have a case
- Provide specific legal strategy
- Make promises about outcomes
- Use complex legal terminology without explaining it`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service is not configured');
    }

    console.log('Processing chat request with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log('Streaming response from AI gateway');

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
