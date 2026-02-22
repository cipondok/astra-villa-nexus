
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
          <p className="text-sm text-muted-foreground">
            See empty spaces transformed with our AI-powered virtual furniture staging
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Transform Empty Spaces</h3>
            <p className="text-muted-foreground mb-4">
              Our AI can digitally furnish any empty property in 12 different interior design styles. 
              See how a space could look with furniture before making any physical changes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Palette className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold">12 Design Styles</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center p-4 bg-chart-1/5 rounded-lg">
                <Zap className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                <div className="font-semibold">Instant Rendering</div>
                <div className="text-sm text-muted-foreground">In 4K Resolution</div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-accent" />
                <div className="font-semibold">View in AR</div>
                <div className="text-sm text-muted-foreground">On Your Smartphone</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {styles.map((style) => (
              <div
                key={style.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedStyle === style.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/80'
                }`}
                onClick={() => onStyleChange(style.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{style.name}</h4>
                  {selectedStyle === style.id && (
                    <Badge className="bg-primary text-primary-foreground text-xs">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
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
