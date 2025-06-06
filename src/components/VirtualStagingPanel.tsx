
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StagingStyle {
  id: string;
  name: string;
  color: string;
}

interface VirtualStagingPanelProps {
  styles: StagingStyle[];
  activeStyle: string;
  onStyleChange: (styleId: string) => void;
}

const VirtualStagingPanel = ({ styles, activeStyle, onStyleChange }: VirtualStagingPanelProps) => {
  return (
    <div className="absolute top-20 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-xs">
      <div className="text-white mb-3">
        <h3 className="font-semibold mb-1">Virtual Staging</h3>
        <p className="text-xs text-gray-300">Choose your preferred interior style</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {styles.map((style) => (
          <Button
            key={style.id}
            variant={activeStyle === style.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onStyleChange(style.id)}
            className={`text-white hover:bg-white/20 justify-start ${
              activeStyle === style.id ? 'bg-white/30' : ''
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${style.color} mr-2`}></div>
            <span className="text-xs">{style.name}</span>
          </Button>
        ))}
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center justify-between">
          <span>Rendering Quality:</span>
          <Badge className="bg-green-500/80 text-white text-xs">4K</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Style Accuracy:</span>
          <Badge className="bg-blue-500/80 text-white text-xs">AI Enhanced</Badge>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/20">
        <p className="text-xs text-gray-400">
          Compare furnished vs empty layouts in real-time
        </p>
      </div>
    </div>
  );
};

export default VirtualStagingPanel;
