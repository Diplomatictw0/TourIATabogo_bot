
import { supabase } from '../lib/supabase';

// ... (interfaces remain the same)

export async function searchPlaces(query: string, location: string): Promise<any[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'your_google_maps_api_key') {
    console.error("ALERTA: La clave VITE_GOOGLE_MAPS_API_KEY no está configurada. La búsqueda de lugares no funcionará.");
    // Return a specific error object instead of mock data
    return [{ name: "Error de Configuración", address: "Falta la clave de API para Google Maps. Por favor, revisa tu archivo .env." }];
  }

  try {
    const locationCoords = getLocationCoordinates(location.toLowerCase());
    const searchQuery = `${query} en ${location} Bogotá`;

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${locationCoords.lat},${locationCoords.lng}&radius=5000&key=${apiKey}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error("Error en la respuesta de la API de Google Places:", data.status, data.error_message);
      throw new Error(`La API de Google devolvió un error: ${data.status}. Revisa que la API 'Places' esté activa y que la facturación esté habilitada en tu proyecto de Google Cloud.`);
    }

    const places = data.results.slice(0, 5).map((p: any) => ({
      name: p.name,
      address: p.formatted_address,
      rating: p.rating,
      photos: p.photos ? p.photos.map((ph: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ph.photo_reference}&key=${apiKey}`) : [],
      location: p.geometry?.location,
    }));

    return places;

  } catch (error: any) {
    console.error('Error al llamar a la API de Google Places:', error);
    return [{ name: "Error de Conexión", address: `No se pudo conectar a la API de Google. ${error.message}` }];
  }
}

// ... (other functions remain the same)

function getLocationCoordinates(location: string): { lat: number; lng: number } {
  const locations: Record<string, { lat: number; lng: number }> = {
    'fontibón': { lat: 4.6813, lng: -74.1413 },
    'teusaquillo': { lat: 4.639, lng: -74.080 },
    // ... other locations
  };
  return locations[location] || { lat: 4.6097, lng: -74.0721 }; // Default to Bogotá center
}

export function generateMapUrl(center: { lat: number; lng: number }, places: any[]): string {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "";
  const markers = places.filter(p => p.location).map((p, i) => `markers=color:red%7Clabel:${i + 1}%7C${p.location!.lat},${p.location!.lng}`).join('&');
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=14&size=400x300&${markers}&key=${apiKey}`;
}
