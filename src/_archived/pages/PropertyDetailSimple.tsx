import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const PropertyDetailSimple: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('PropertyDetailSimple mounted with id:', id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg animate-fade-in">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Property Detail
            </h1>
            <div className="inline-flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2">
              <span className="text-sm text-muted-foreground">Property ID:</span>
              <span className="font-mono text-sm text-foreground bg-background/80 px-2 py-1 rounded">{id}</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This is a simplified version while we debug the React hooks issue. 
              The full property details with images, features, and interactive elements will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailSimple;