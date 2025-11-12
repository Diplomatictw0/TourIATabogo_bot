
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { VertexAI, HarmCategory, HarmBlockThreshold } from "npm:@google-cloud/vertexai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildIntentPrompt = (messages: any[]): string => {
  const history = messages.map(m => `${m.sender_type === "user" ? "Usuario" : "Bot"}: ${m.content}`).join("\n");
  const lastMessage = messages[messages.length - 1].content;
  return `Analiza la consulta de un usuario para un chatbot de turismo en Bogotá. HISTORIAL: ${history} TAREA: Extrae la intención y la ubicación del ÚLTIMO MENSAJE DEL USUARIO ("${lastMessage}"). ZONAS CONOCIDAS: Fontibón, Zona T, Chapinero, Usaquén, La Candelaria, Chía, Zona Rosa, Suba, Engativá, Kennedy. Responde SOLAMENTE con un objeto JSON. No incluyas explicaciones ni markdown. EJEMPLOS: - Si el último mensaje es "restaurantes en chapinero", responde: {"intent": "restaurant", "location": "chapinero", "query": "restaurantes en chapinero"} - Si el bot preguntó "¿En qué zona?" y el usuario responde "Usaquén", responde: {"intent": "restaurant", "location": "Usaquén", "query": "Usaquén"} - Si el mensaje es "clima", responde: {"intent": "weather", "location": null, "query": "clima"} - Si no hay intención clara, responde: {"intent": "general", "location": null, "query": "${lastMessage}"} Tu JSON de respuesta:`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const projectId = Deno.env.get("VITE_GOOGLE_PROJECT_ID");
    const location = Deno.env.get("VITE_GOOGLE_PROJECT_LOCATION");
    const credentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS");

    if (!projectId || !location || !credentialsJson) {
      throw new Error("Server configuration error: Missing secrets.");
    }

    const credentials = JSON.parse(credentialsJson);

    const vertexAI = new VertexAI({ project: projectId, location: location, googleAuthOptions: { credentials } });
    
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];

    const generativeModel = vertexAI.getGenerativeModel({ 
      model: "gemini-1.0-pro",
      safetySettings,
    });

    const { messages, type, prompt } = await req.json();
    const promptForAI = type === 'intent' ? buildIntentPrompt(messages) : prompt;
    
    // --- THE CORRECTED AND VERIFIED FIX ---
    const result = await generativeModel.generateContent(promptForAI);

    const response = result.response;
    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts) {
        console.error("Invalid AI response structure:", JSON.stringify(response));
        throw new Error("La IA devolvió una respuesta inválida o vacía.");
    }

    const responseText = response.candidates[0].content.parts[0].text?.trim() || "";

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Function failed:", error);
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
