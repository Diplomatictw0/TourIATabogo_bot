import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? <ChatInterface /> : <LoginScreen />;
}

export default App;
