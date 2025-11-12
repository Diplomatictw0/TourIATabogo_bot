import { MapPin, Star } from 'lucide-react';

interface PlaceCardProps {
  place: {
    name: string;
    address: string;
    rating?: number;
    price_level?: number;
    image?: string;
  };
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const getPriceSymbols = (level?: number) => {
    if (!level) return '';
    return '$'.repeat(level);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {place.image && (
        <div className="h-40 overflow-hidden">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-2">
          {place.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {place.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-gray-700">{place.rating}</span>
            </div>
          )}

          {place.price_level && (
            <span className="text-sm text-gray-600">
              {getPriceSymbols(place.price_level)}
            </span>
          )}
        </div>

        <div className="flex items-start gap-1 text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">{place.address}</p>
        </div>
      </div>
    </div>
  );
}
