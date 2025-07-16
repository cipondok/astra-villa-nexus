import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Saved Properties</h1>
          <p className="text-gray-600 mb-6">
            Sign in to view your saved properties
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
          <p className="text-gray-600">Your favorite properties are saved here</p>
        </div>
        
        <div className="text-center py-16">
          <Heart className="h-24 w-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold mb-2">No saved properties yet</h2>
          <p className="text-gray-600 mb-6">
            Start browsing properties and save your favorites by clicking the heart icon
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Browse Properties
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Saved;