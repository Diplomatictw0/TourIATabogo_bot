import { Restaurant } from '../types';

const restaurants: Restaurant[] = [
  {
    name: 'Andrés Carne de Res',
    zone: 'Chía / Zona T',
    description: 'Un clásico con comida típica colombiana, música en vivo y un ambiente único lleno de decoración colorida.',
    type: 'Colombiana',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    name: 'Harry Sasson',
    zone: 'Chapinero',
    description: 'Uno de los restaurantes más reconocidos del país, con una carta internacional de alta cocina.',
    type: 'Internacional',
    image: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    name: 'Leo Cocina y Cava',
    zone: 'Chapinero',
    description: 'Restaurante galardonado con estrella Michelin, ofrece una experiencia gastronómica excepcional con productos locales.',
    type: 'Colombiana Contemporánea',
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    name: 'Criterion',
    zone: 'Usaquén',
    description: 'Cocina francesa clásica en un ambiente elegante. Perfecto para ocasiones especiales.',
    type: 'Francesa',
    image: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    name: 'Wok',
    zone: 'Zona Rosa / Usaquén',
    description: 'Fusión asiática con platillos de diferentes países orientales. Ambiente moderno y casual.',
    type: 'Asiática',
    image: 'https://images.pexels.com/photos/1410236/pexels-photo-1410236.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    name: 'La Puerta de la Catedral',
    zone: 'La Candelaria',
    description: 'Restaurante tradicional en el corazón histórico de Bogotá, ideal para probar ajiaco y otros platos típicos.',
    type: 'Colombiana',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

const safetyZones: Record<string, string> = {
  'zona t': 'La Zona T es generalmente segura, especialmente durante el día y en áreas concurridas. Como en cualquier zona turística, mantén precaución con tus pertenencias.',
  'chapinero': 'Chapinero es un barrio en desarrollo con zonas muy seguras, especialmente en Chapinero Alto. Se recomienda precaución en la noche.',
  'usaquén': 'Usaquén es uno de los barrios más seguros de Bogotá, muy popular entre turistas y locales. Ideal para pasear incluso en la noche.',
  'la candelaria': 'La Candelaria es segura durante el día, pero se recomienda precaución en la noche. Mantente en calles principales y áreas turísticas.',
  'chía': 'Chía es una zona residencial muy segura, ubicada al norte de Bogotá. Excelente para salir a comer.',
  'zona rosa': 'La Zona Rosa es segura y muy concurrida, especialmente los fines de semana. Es una zona turística con buena presencia policial.'
};

export async function generateBotResponse(userMessage: string): Promise<{
  content: string;
  metadata?: {
    image?: string;
    map?: string;
    location?: {
      name: string;
      address: string;
    };
  };
}> {
  const lowerMessage = userMessage.toLowerCase();

  if (
    lowerMessage.includes('comer') ||
    lowerMessage.includes('cenar') ||
    lowerMessage.includes('restaurante') ||
    lowerMessage.includes('comida')
  ) {
    const randomRestaurants = restaurants
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    let response = 'Genial, te ayudaré a encontrar los mejores sitios para cenar en Bogotá:\n\n';
    randomRestaurants.forEach((restaurant, index) => {
      response += `${index + 1}. ${restaurant.name} (${restaurant.zone}): ${restaurant.description}\n\n`;
    });

    return {
      content: response,
      metadata: {
        image: randomRestaurants[0].image,
        map: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=300&center=lonlat:-74.0721,4.6097&zoom=12&marker=lonlat:-74.0721,4.6097;color:%2300aeef;size:medium&apiKey=demo`,
        location: {
          name: randomRestaurants[0].name,
          address: randomRestaurants[0].zone
        }
      }
    };
  }

  if (lowerMessage.includes('clima') || lowerMessage.includes('tiempo')) {
    const weatherData = await getWeather();
    return {
      content: `El clima actual en Bogotá:\n\n🌡️ Temperatura: ${weatherData.temperature}°C\n${weatherData.description}\n\nRecuerda que Bogotá tiene un clima variable, siempre es bueno llevar una chaqueta.`,
      metadata: {}
    };
  }

  if (
    lowerMessage.includes('segur') ||
    lowerMessage.includes('peligro') ||
    lowerMessage.includes('riesgo')
  ) {
    const foundZone = Object.keys(safetyZones).find(zone =>
      lowerMessage.includes(zone)
    );

    if (foundZone) {
      return {
        content: `Información de seguridad sobre ${foundZone}:\n\n${safetyZones[foundZone]}`,
        metadata: {}
      };
    }

    return {
      content: 'Para darte información de seguridad específica, ¿me puedes decir qué zona de Bogotá te interesa? Por ejemplo: Zona T, Chapinero, Usaquén, La Candelaria, etc.',
      metadata: {}
    };
  }

  if (
    lowerMessage.includes('hola') ||
    lowerMessage.includes('ayuda') ||
    lowerMessage.includes('qué puedes hacer')
  ) {
    return {
      content: '¡Hola! Puedo ayudarte con:\n\n• Recomendaciones de restaurantes y lugares para comer\n• Información sobre el clima en Bogotá\n• Datos de seguridad sobre diferentes zonas\n• Sugerencias turísticas\n\n¿En qué te puedo ayudar hoy?',
      metadata: {}
    };
  }

  if (
    lowerMessage.includes('turismo') ||
    lowerMessage.includes('visitar') ||
    lowerMessage.includes('lugares')
  ) {
    return {
      content: 'En Bogotá hay lugares increíbles para visitar:\n\n• Cerro de Monserrate - Vista panorámica de la ciudad\n• Museo del Oro - Increíble colección precolombina\n• La Candelaria - Centro histórico con arquitectura colonial\n• Usaquén - Barrio bohemio con mercado de pulgas los domingos\n• Zona T - Centro comercial y de entretenimiento\n\n¿Te gustaría información más detallada sobre alguno?',
      metadata: {}
    };
  }

  return {
    content: 'Interesante pregunta. Puedo ayudarte con información sobre restaurantes, clima, seguridad en diferentes zonas y lugares turísticos de Bogotá. ¿Qué te gustaría saber?',
    metadata: {}
  };
}

async function getWeather(): Promise<{
  temperature: number;
  description: string;
}> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return {
      temperature: 14,
      description: '⛅ Parcialmente nublado (clima típico de Bogotá)'
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Bogota,CO&units=metric&appid=${apiKey}&lang=es`
    );
    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      description: `${getWeatherEmoji(data.weather[0].main)} ${data.weather[0].description}`
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      temperature: 14,
      description: '⛅ Parcialmente nublado'
    };
  }
}

function getWeatherEmoji(condition: string): string {
  const emojiMap: Record<string, string> = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️'
  };
  return emojiMap[condition] || '🌤️';
}
