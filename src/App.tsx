import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';
import ProfileManager from './components/ProfileManager';
import { supabase } from './lib/supabase';
import { MessageSquare, Menu, X, User } from 'lucide-react';

interface Session {
  id: string;
  created_at: string;
  first_message_summary?: string;
}

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('chat_sessions').select('id, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
    if (error) console.error('Error fetching sessions:', error);
    else {
      const sessionsWithSummary = data.map((s, i) => ({ ...s, first_message_summary: `Conversación ${data.length - i}` }));
      setSessions(sessionsWithSummary);
      if (sessionsWithSummary.length > 0 && !activeSessionId) setActiveSessionId(sessionsWithSummary[0].id);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('chat_sessions').insert({ user_id: user.id }).select('id, created_at').single();
    if (error) console.error('Error creating new session:', error);
    else if (data) {
      const newSession: Session = { ...data, first_message_summary: `Nueva Conversación` };
      setSessions(prev => [newSession, ...prev.slice(0, 4)]);
      setActiveSessionId(newSession.id);
      setSidebarOpen(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <LoginScreen />;

  const Sidebar = () => (
    <aside className={`absolute z-20 h-full w-72 bg-gray-800 text-white flex flex-col transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-xl font-bold">Mis Chats</h2>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1"><X /></button>
      </div>
      <button onClick={handleNewChat} className="p-4 border-b border-gray-700 hover:bg-gray-700 text-left font-semibold">+ Nuevo Chat</button>
      <nav className="flex-1 overflow-y-auto">
        {sessions.map(session => (
          <a key={session.id} href="#" onClick={() => { setActiveSessionId(session.id); setSidebarOpen(false); }} className={`block p-4 truncate ${activeSessionId === session.id ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
            <MessageSquare className="inline w-4 h-4 mr-2" />
            {session.first_message_summary}
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={() => setProfileOpen(true)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-700">
          {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><User className="w-4 h-4"/></div>
          )}
          <span className="font-medium">{profile?.full_name || 'Perfil'}</span>
        </button>
        <button onClick={signOut} className="w-full text-left p-2 mt-2 rounded-md hover:bg-gray-700 text-sm text-gray-400">Cerrar Sesión</button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden absolute top-4 left-4 z-30 p-2 bg-gray-800 text-white rounded-full">
          <Menu />
        </button>
        <ProfileManager isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
        {activeSessionId ? (
          <ChatInterface sessionId={activeSessionId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">Selecciona o crea una nueva conversación para empezar a chatear.</div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
