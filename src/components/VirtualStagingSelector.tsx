
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Palette, Smartphone, Zap, Eye } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Main Virtual Staging Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Virtual Staging Technology
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            See empty spaces transformed with our AI-powered virtual furniture staging
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Transform Empty Spaces</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our AI can digitally furnish any empty property in 12 different interior design styles. 
              See how a space could look with furniture before making any physical changes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Palette className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="font-semibold">12 Design Styles</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Available</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="font-semibold">Instant Rendering</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">In 4K Resolution</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="font-semibold">View in AR</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">On Your Smartphone</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {styles.map((style) => (
              <div
                key={style.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onStyleChange(style.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{style.name}</h4>
                  {selectedStyle === style.id && (
                    <Badge className="bg-blue-500 text-white text-xs">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {style.description}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <Button onClick={onOpen3DView} className="w-full mb-4">
              <Box className="h-4 w-4 mr-2" />
              Try Virtual Staging with {styles.find(s => s.id === selectedStyle)?.name} Style
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>Real-time AI rendering</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span>4K quality visualization</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-3 w-3" />
                <span>Compare multiple styles instantly</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualStagingSelector;
