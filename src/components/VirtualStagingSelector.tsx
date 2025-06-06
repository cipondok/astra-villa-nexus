
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Palette } from 'lucide-react';

interface StagingStyle {
  id: string;
  name: string;
  description: string;
}

interface VirtualStagingSelectorProps {
  styles: StagingStyle[];
  selectedStyle: string;
  onStyleChange: (styleId: string) => void;
  onOpen3DView: () => void;
}

const VirtualStagingSelector = ({ 
  styles, 
  selectedStyle, 
  onStyleChange, 
  onOpen3DView 
}: VirtualStagingSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Virtual Staging Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Visualize this property with different interior design styles using our AI-powered virtual staging.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {styles.map((style) => (
            <div
              key={style.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedStyle === style.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onStyleChange(style.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{style.name}</h3>
                {selectedStyle === style.id && (
                  <Badge className="bg-blue-500 text-white">Selected</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {style.description}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <Button onClick={onOpen3DView} className="w-full">
            <Box className="h-4 w-4 mr-2" />
            View in 3D with {styles.find(s => s.id === selectedStyle)?.name} Staging
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Real-time AI rendering</p>
          <p>• 4K quality visualization</p>
          <p>• Compare multiple styles instantly</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualStagingSelector;
