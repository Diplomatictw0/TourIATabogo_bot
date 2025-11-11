import { User } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender_type === 'bot';

  return (
    <div className={`flex gap-2 ${isBot ? 'items-start' : 'items-end justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}

      <div className={`max-w-[80%] ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isBot
              ? 'bg-white rounded-tl-none'
              : 'bg-blue-500 text-white rounded-tr-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.metadata?.image && (
          <img
            src={message.metadata.image}
            alt="Restaurant"
            className="mt-2 rounded-lg max-w-full h-auto shadow-sm"
          />
        )}

        {message.metadata?.map && (
          <div className="mt-2 rounded-lg overflow-hidden shadow-sm">
            <img
              src={message.metadata.map}
              alt="Map"
              className="w-full h-auto"
            />
          </div>
        )}

        {message.metadata?.location && (
          <div className="mt-2 bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600">
            <p className="font-medium">{message.metadata.location.name}</p>
            <p>{message.metadata.location.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}
