import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const PropertyDetailSimple: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('PropertyDetailSimple mounted with id:', id);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4">Property Detail</h1>
          <p className="text-muted-foreground mb-4">Property ID: {id}</p>
          <p className="text-sm text-muted-foreground">
            This is a simplified version while we debug the React hooks issue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailSimple;