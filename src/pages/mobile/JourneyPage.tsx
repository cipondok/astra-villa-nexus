import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyJourneyTimeline from '@/components/mobile/PropertyJourneyTimeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const JourneyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Property Journey</h1>
        </div>
      </div>

      {/* Content with top padding for header */}
      <div className="pt-16 pb-24">
        <PropertyJourneyTimeline />
      </div>
    </div>
  );
};

export default JourneyPage;
