import { useState, useRef } from 'react'; // <--- Correct import
import { useAuth } from '../contexts/AuthContext';
import { User, X, Edit } from 'lucide-react';

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileManager({ isOpen, onClose }: ProfileManagerProps) {
  const { profile, updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // <--- Correct hook

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await updateAvatar(file);
    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Tu Perfil</h2>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                <User className="w-16 h-16 text-gray-500" />
              </div>
            )}
            <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-transform active:scale-95 shadow-md">
              <Edit className="w-4 h-4" />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
          
          <p className="text-lg font-medium text-gray-700">{profile?.full_name || 'Usuario'}</p>

          {uploading && <p className="text-sm text-gray-500">Subiendo imagen...</p>}
        </div>
      </div>
    </div>
  );
}
