import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import { generateBotResponse } from '../services/chatbot';
import MessageBubble from './MessageBubble';

interface ChatInterfaceProps {
  sessionId: string;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error('Error getting location:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (sessionId) loadMessages(sessionId);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMessages = async (sid: string) => {
    setLoading(true);
    setMessages([]);
    const { data, error } = await supabase.from('messages').select('*').eq('session_id', sid).order('created_at', { ascending: true });
    if (error) console.error('Error loading messages:', error);
    else if (data && data.length > 0) setMessages(data);
    else await sendWelcomeMessage(sid);
    setLoading(false);
  };

  const sendWelcomeMessage = async (sid: string) => {
    if (!user) return;
    const welcomeMessage: Omit<Message, 'id' | 'created_at'> = {
      session_id: sid,
      user_id: user.id,
      content: 'Hola, soy tourlATabogo y te ayudaré a encontrar experiencias únicas en la ciudad.',
      sender_type: 'bot',
      metadata: {},
    };
    const { data, error } = await supabase.from('messages').insert(welcomeMessage).select().single();
    if (data) setMessages([data]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || loading) return;

    const userMessageContent = inputValue;
    const currentMessages = messages;
    setInputValue('');

    // 1. Save user message to DB and get the real message back
    const { data: savedUserMessage, error: userError } = await supabase
      .from('messages')
      .insert({ session_id: sessionId, user_id: user.id, content: userMessageContent, sender_type: 'user', metadata: {} })
      .select()
      .single();

    if (userError || !savedUserMessage) {
      console.error('Error saving user message:', userError);
      return; // Stop if user message fails to save
    }
    
    // 2. Update UI with the real user message and show loading for bot
    setMessages(prev => [...prev, savedUserMessage]);
    setLoading(true);

    // 3. Generate bot response
    const botResponseData = await generateBotResponse(userMessageContent, currentMessages, userLocation);
    
    // 4. Save bot message to DB
    const { data: savedBotMessage, error: botError } = await supabase
      .from('messages')
      .insert({ session_id: sessionId, user_id: user.id, content: botResponseData.content, sender_type: 'bot', metadata: botResponseData.metadata })
      .select()
      .single();

    setLoading(false);
    if (botError || !savedBotMessage) {
      console.error('Error saving bot message:', botError);
    } else {
      // 5. Update UI with the real bot message
      setMessages(prev => [...prev, savedBotMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 font-sans">
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {loading && <MessageBubble isLoading />}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // <-- THE FIX IS HERE
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            disabled={loading}
          />
          <button type="submit" disabled={!inputValue.trim() || loading} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
}
