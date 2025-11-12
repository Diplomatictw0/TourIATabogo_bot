
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export async function getChatGPTResponse(prompt: string): Promise<string> {
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return 'Lo siento, la API de ChatGPT no está configurada.';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud de ChatGPT: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error al obtener respuesta de ChatGPT:', error);
    return 'Lo siento, no pude obtener una respuesta de ChatGPT en este momento.';
  }
}
