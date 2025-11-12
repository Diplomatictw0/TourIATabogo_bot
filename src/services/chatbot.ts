
import { Message } from '../types';

// --- Interfaces and Types ---
interface BotResponse {
  content: string;
  metadata?: any;
}

interface Place {
  name: string;
  address: string;
}

// --- USER-PROVIDED DATABASE for Tourist Spots ---
// This is the primary source of truth for tourist information.
const touristDB = {
  "1_Usaquen": [ { "nombre": "Mercado de las Pulgas de Usaquén", "direccion": "Carrera 6 No. 118-20", "horario": "Domingos por la mañana", "que_es": "Mercado de artesanías y antigüedades" } ],
  "2_Chapinero": [ { "nombre": "Parque de la 93", "direccion": "Calle 93", "horario": "Público", "que_es": "Parque con restaurantes y bares" } ],
  "3_Santa_Fe": [ { "nombre": "Cerro de Monserrate", "direccion": "Carrera 2 Este No. 21-48", "horario": "6am-10pm aprox.", "que_es": "Mirador y santuario" } ],
  "4_San_Cristobal": [ { "nombre": "Cerro de Guadalupe", "direccion": "Av. Circunvalar No. 70-50", "horario": "Consultar", "que_es": "Mirador y santuario" } ],
  "5_Usme": [ { "nombre": "Parque Ecológico Sumapaz", "direccion": "Vereda Nazareth", "horario": "6am-4pm", "que_es": "Parque natural" } ],
  "6_Tunjuelito": [ { "nombre": "Parque El Tunal", "direccion": "Calle 48B Sur #22-81", "horario": "Abierto", "que_es": "Gran parque con zonas verdes" } ],
  "7_Bosa": [ { "nombre": "Plaza Fundacional de Bosa", "direccion": "Carrera 80 #63-50 Sur", "horario": "Abierto", "que_es": "Centro histórico" } ],
  "8_Kennedy": [ { "nombre": "Parque Timiza", "direccion": "Carrera 73 #42-20 Sur", "horario": "Abierto", "que_es": "Gran parque con lago" } ],
  "9_Fontibon": [ { "nombre": "Plaza Fundacional de Fontibón", "direccion": "Carrera 99 #18-20", "horario": "Abierto", "que_es": "Centro histórico" } ],
  "10_Engativa": [ { "nombre": "Parque Central de Engativá", "direccion": "Carrera 77 #64-50", "horario": "Abierto", "que_es": "Parque recreativo principal" } ],
  "11_Suba": [ { "nombre": "Centro Comercial Santafé", "direccion": "Calle 185 No. 45-03", "horario": "10am-8pm", "que_es": "Gran centro comercial" } ],
  "12_Barrios_Unidos": [ { "nombre": "Parque El Virrey", "direccion": "Carrera 15 No. 92-42", "horario": "Público", "que_es": "Parque para caminar" } ],
  "13_Teusaquillo": [ { "nombre": "Parque Metropolitano Simón Bolívar", "direccion": "Entre calles 53 y 64", "horario": "6am-6pm", "que_es": "Gran parque para recreación" } ],
  "14_Los_Martires": [ { "nombre": "Cementerio Central", "direccion": "Calle 22 No. 3-90", "horario": "Consultar", "que_es": "Sitio histórico" } ],
  "15_Antonio_Narino": [ { "nombre": "Parque El Renacimiento", "direccion": "Calle 23 Sur #39-10", "horario": "Abierto", "que_es": "Parque recreativo" } ],
  "16_Puente_Aranda": [ { "nombre": "Maloka", "direccion": "Carrera 68D #24A-51", "horario": "Mar-Dom", "que_es": "Museo interactivo de ciencia" } ],
  "17_La_Candelaria": [ { "nombre": "Monserrate", "direccion": "Calle 21 No. 1-45 Este", "horario": "6am-11pm", "que_es": "Cerro y santuario" }, { "nombre": "Museo del Oro", "direccion": "Carrera 6 #15-88", "horario": "Mar-Dom", "que_es": "Museo de piezas precolombinas" } ],
  "18_Rafael_Uribe_Uribe": [ { "nombre": "Parque Entre Nubes", "direccion": "Carrera 1 Este #48 Sur", "horario": "6am-5pm", "que_es": "Parque ecológico" } ],
  "19_Ciudad_Bolivar": [ { "nombre": "Parque Illimaní", "direccion": "Diagonal 62 Sur #20-20", "horario": "6am-6pm", "que_es": "Parque recreativo" } ],
  "20_Sumapaz": [ { "nombre": "Páramo de Sumapaz", "direccion": "Vereda Nazareth", "horario": "6am-4pm", "que_es": "Páramo más grande del mundo" } ]
};

const locationKeyMap: Record<string, keyof typeof touristDB> = {
    'usaquen': '1_Usaquen', 'chapinero': '2_Chapinero', 'santa fe': '3_Santa_Fe', 'san cristobal': '4_San_Cristobal', 
    'usme': '5_Usme', 'la candelaria': '17_La_Candelaria', 'tunjuelito': '6_Tunjuelito', 'bosa': '7_Bosa', 'kennedy': '8_Kennedy', 
    'fontibon': '9_Fontibon', 'engativa': '10_Engativa', 'suba': '11_Suba', 'barrios unidos': '12_Barrios_Unidos',
    'teusaquillo': '13_Teusaquillo', 'los martires': '14_Los_Martires', 'antonio narino': '15_Antonio_Narino', 
    'puente aranda': '16_Puente_Aranda', 'rafael uribe uribe': '18_Rafael_Uribe_Uribe', 'ciudad bolivar': '19_Ciudad_Bolivar', 'sumapaz': '20_Sumapaz'
};

const allKnownLocations = Object.keys(locationKeyMap);

// --- Bot Brain (Offline-First Version) ---

function getTouristSpotsFromDB(location: string): Place[] {
    const key = locationKeyMap[normalizeString(location)];
    if (!key || !touristDB[key]) return [];
    return touristDB[key].map(spot => ({
        name: spot.nombre,
        address: `${spot.direccion}. ${spot.que_es} (Horario: ${spot.horario})`
    }));
}

function findTopicAndLocation(message: string): { topic: string | null; location: string | null } {
    const normalizedMessage = normalizeString(message);
    let foundTopic: string | null = null;
    if (normalizedMessage.includes('restaurante')) foundTopic = 'restaurantes';
    else if (normalizedMessage.includes('turismo') || normalizedMessage.includes('turistico')) foundTopic = 'turismo';
    else if (normalizedMessage.includes('comercial')) foundTopic = 'centro comercial';
    else if (normalizedMessage.includes('clima')) foundTopic = 'clima';

    for (const loc of allKnownLocations) {
        if (normalizedMessage.includes(normalizeString(loc))) {
            return { topic: foundTopic, location: loc };
        }
    }
    return { topic: foundTopic, location: null };
}

function normalizeString(str: string): string {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function generateBotResponse(lastMessage: string, history: Message[]): Promise<BotResponse> {
  const normalizedMessage = normalizeString(lastMessage);

  // 1. Handle Small Talk
  const smallTalk: Record<string, string> = {
      'hola': '¡Hola! Soy TourlATabogo. Puedo darte recomendaciones de lugares turísticos. ¿Sobre qué zona de Bogotá te gustaría saber?',
      'como estas': '¡Muy bien! Listo para mostrarte lo mejor de Bogotá, basado en la información que tenemos.',
      'gracias': '¡De nada! Si necesitas más recomendaciones, no dudes en preguntar.',
      'adios': '¡Que tengas un gran día explorando Bogotá!'
  };
  for (const key in smallTalk) {
      if (normalizedMessage.includes(key)) return { content: smallTalk[key] };
  }

  // 2. Find Topic and Location
  let { topic, location } = findTopicAndLocation(lastMessage);

  // 3. Handle context from previous messages
  if (!topic && location) {
    const lastBotMessage = history.slice().reverse().find(m => m.sender_type === 'bot');
    if (lastBotMessage && lastBotMessage.content.includes('¿En qué localidad o barrio')) {
        if (lastBotMessage.content.includes('turísticos')) topic = 'turismo';
    }
  }

  // 4. Execute actions based on findings

  // --- API-DEPENDENT FEATURES --- (Now they explain the requirement)
  if (topic === 'restaurantes' || topic === 'centro comercial') {
      return { content: 'Esta función requiere una clave de API de Google Maps. Cuando la configures y actives la facturación en Google Cloud, podré buscar lugares en tiempo real.' };
  }
  if (topic === 'clima') {
      return { content: 'Para darte el pronóstico del clima, necesito una clave de API de OpenWeather. Cuando la configures, esta función se activará.' };
  }

  // --- DATABASE-DRIVEN FEATURE (Works Offline) ---
  if (topic === 'turismo') {
      if (!location) {
          return { content: '¡Claro! ¿En qué localidad o barrio de Bogotá te gustaría conocer lugares turísticos?' };
      }
      const places = getTouristSpotsFromDB(location);
      return formatPlacesResponse(places, location);
  }
  
  if(location) {
      const places = getTouristSpotsFromDB(location);
      return formatPlacesResponse(places, location);
  }

  // Fallback for when nothing is understood
  return { content: 'No te entendí. Por ahora, puedo darte información de lugares turísticos en las localidades de Bogotá. Intenta preguntando, por ejemplo, "turismo en chapinero".' };
}

// --- Helper to format the response for places ---
function formatPlacesResponse(places: Place[], location: string): BotResponse {
  if (places.length === 0) return { content: `Lo siento, no tengo información de lugares turísticos para ${location} en mi base de datos.` };
  let responseContent = `¡Claro! Según mi base de datos, aquí tienes algunos lugares recomendados en ${location}:\n\n`;
  places.forEach((place, i) => { responseContent += `${i + 1}. **${place.name}**: ${place.address}\n`; });
  return { content: responseContent };
}
