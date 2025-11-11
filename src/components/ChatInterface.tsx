import { useState, useEffect, useRef } from 'react';
import { Send, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import { generateBotResponse } from '../services/chatbot';
import MessageBubble from './MessageBubble';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    initSession();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initSession = async () => {
    if (!user) return;

    const { data: existingSessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingSessions && existingSessions.length > 0) {
      setSessionId(existingSessions[0].id);
      loadMessages(existingSessions[0].id);
    } else {
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return;
      }

      setSessionId(newSession.id);
      sendWelcomeMessage(newSession.id);
    }
  };

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const sendWelcomeMessage = async (sessionId: string) => {
    const welcomeMessage: Omit<Message, 'id' | 'created_at'> = {
      session_id: sessionId,
      user_id: user!.id,
      content: 'Hola, soy tourlATabogo y te ayudaré a encontrar experiencias únicas en la ciudad.',
      sender_type: 'bot',
      metadata: {},
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(welcomeMessage)
      .select()
      .single();

    if (error) {
      console.error('Error sending welcome message:', error);
      return;
    }

    setMessages([data]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || !user || loading) return;

    const userMessage: Omit<Message, 'id' | 'created_at'> = {
      session_id: sessionId,
      user_id: user.id,
      content: inputValue,
      sender_type: 'user',
      metadata: {},
    };

    setLoading(true);
    setInputValue('');

    const { data: savedUserMessage, error: userError } = await supabase
      .from('messages')
      .insert(userMessage)
      .select()
      .single();

    if (userError) {
      console.error('Error saving user message:', error);
      setLoading(false);
      return;
    }

    setMessages((prev) => [...prev, savedUserMessage]);

    const botResponseData = await generateBotResponse(inputValue);

    const botMessage: Omit<Message, 'id' | 'created_at'> = {
      session_id: sessionId,
      user_id: user.id,
      content: botResponseData.content,
      sender_type: 'bot',
      metadata: botResponseData.metadata,
    };

    const { data: savedBotMessage, error: botError } = await supabase
      .from('messages')
      .insert(botMessage)
      .select()
      .single();

    if (botError) {
      console.error('Error saving bot message:', error);
      setLoading(false);
      return;
    }

    setMessages((prev) => [...prev, savedBotMessage]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-base font-medium text-gray-900">tourlATabogo_bot</h1>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
