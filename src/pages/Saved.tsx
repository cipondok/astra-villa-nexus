import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, ArrowLeft } from 'lucide-react';

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Saved Properties</h1>
          <p className="text-muted-foreground mb-6">
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
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button Header */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Saved Properties</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Your favorite properties</p>
          </div>
        </div>
        
        <div className="text-center py-12 sm:py-16">
          <Heart className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-base sm:text-xl font-semibold mb-2">No saved properties yet</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            Start browsing and save your favorites by clicking the heart icon
          </p>
          <Button onClick={() => navigate('/')} className="gap-2 h-9 text-sm">
            <Home className="h-4 w-4" />
            Browse Properties
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Saved;