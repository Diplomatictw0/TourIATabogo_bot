import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Cloud project details from environment variables
const PROJECT_ID = Deno.env.get('GOOGLE_PROJECT_ID')
const PROJECT_LOCATION = Deno.env.get('GOOGLE_PROJECT_LOCATION')
const API_KEY = Deno.env.get('GOOGLE_API_KEY')

const AI_API_URL = `https://` + PROJECT_LOCATION + `-aiplatform.googleapis.com/v1/projects/` + PROJECT_ID + `/locations/` + PROJECT_LOCATION + `/publishers/google/models/gemini-1.5-flash-001:generateContent?key=` + API_KEY;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Construct the payload for the Vertex AI API
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      safety_settings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ]
    };

    // Call the Vertex AI API
    const aiResponse = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Vertex AI API error: ${aiResponse.status} ${errorText}`);
    }

    const aiJson = await aiResponse.json();
    const text = aiJson.candidates[0].content.parts[0].text;

    // Return the generated text
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
