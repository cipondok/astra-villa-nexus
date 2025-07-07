import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import Enhanced3DPropertyViewer from './Enhanced3DPropertyViewer';
import { BaseProperty } from '@/types/property';

interface Property3DModalProps {
  property: BaseProperty;
  isOpen: boolean;
  onClose: () => void;
  threeDModelUrl?: string;
  virtualTourUrl?: string;
}

const Property3DModal: React.FC<Property3DModalProps> = ({
  property,
  isOpen,
  onClose,
  threeDModelUrl,
  virtualTourUrl
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-background">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Enhanced3DPropertyViewer
          property={property}
          threeDModelUrl={threeDModelUrl}
          virtualTourUrl={virtualTourUrl}
          isFullscreen={true}
          onFullscreenToggle={toggleFullscreen}
        />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>3D Property View - {property.title}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1">
          <Enhanced3DPropertyViewer
            property={property}
            threeDModelUrl={threeDModelUrl}
            virtualTourUrl={virtualTourUrl}
            onFullscreenToggle={toggleFullscreen}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Property3DModal;