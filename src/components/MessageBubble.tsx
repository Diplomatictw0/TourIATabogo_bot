import { User, Bot } from 'lucide-react';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface MessageBubbleProps {
  message?: Message;
  isLoading?: boolean;
}

export default function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  const { profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-start gap-3 justify-start">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">T</div>
        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%] shadow-md">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!message) return null;

  const isUser = message.sender_type === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">T</div>
      )}
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-md ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )
      )}
    </div>
  );
}
