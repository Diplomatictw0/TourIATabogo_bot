export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  sender_type: 'user' | 'bot';
  metadata?: {
    image?: string;
    map?: string;
    location?: {
      name: string;
      address: string;
    };
  };
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  name: string;
  zone: string;
  description: string;
  type: string;
  image?: string;
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
}
