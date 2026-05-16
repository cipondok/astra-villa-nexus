import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ARPropertyPreview from '@/components/mobile/ARPropertyPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ARPreviewPage: React.FC = () => {
  const { propertyId } = useParams();
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
          <h1 className="font-semibold">AR Property Preview</h1>
        </div>
      </div>

      {/* Content with top padding for header */}
      <div className="pt-16">
        <ARPropertyPreview 
          propertyId={propertyId}
          onClose={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default ARPreviewPage;
