
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Box, ExternalLink, Upload, Eye } from "lucide-react";

interface Property3DViewerProps {
  threeDModelUrl?: string;
  virtualTourUrl?: string;
  onModelUrlChange: (url: string) => void;
  onTourUrlChange: (url: string) => void;
}

const Property3DViewer = ({
  threeDModelUrl,
  virtualTourUrl,
  onModelUrlChange,
  onTourUrlChange
}: Property3DViewerProps) => {
  const [activeTab, setActiveTab] = useState("3d-model");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          3D Experience
          <Badge variant="outline" className="ml-2">Optional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="3d-model">3D Model</TabsTrigger>
            <TabsTrigger value="virtual-tour">Virtual Tour</TabsTrigger>
          </TabsList>
          
          <TabsContent value="3d-model" className="space-y-4">
            <div>
              <Label htmlFor="model-url">3D Model URL</Label>
              <Input
                id="model-url"
                value={threeDModelUrl || ''}
                onChange={(e) => onModelUrlChange(e.target.value)}
                placeholder="https://sketchfab.com/models/... or upload your own"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supports Sketchfab embeds, GLB files, or other 3D model URLs
              </p>
            </div>

            {threeDModelUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">3D Model Preview</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={threeDModelUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Full
                    </a>
                  </Button>
                </div>
                <div className="aspect-video bg-white rounded border flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Box className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">3D Model will be embedded here</p>
                    <p className="text-xs">URL: {threeDModelUrl}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to add 3D models:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload to Sketchfab and get embed URL</li>
                <li>• Use Matterport virtual tours</li>
                <li>• Upload GLB/GLTF files to cloud storage</li>
                <li>• Create with tools like Blender or SketchUp</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="virtual-tour" className="space-y-4">
            <div>
              <Label htmlFor="tour-url">Virtual Tour URL</Label>
              <Input
                id="tour-url"
                value={virtualTourUrl || ''}
                onChange={(e) => onTourUrlChange(e.target.value)}
                placeholder="https://my.matterport.com/show/... or other tour URL"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supports Matterport, virtual tour platforms, or 360° image galleries
              </p>
            </div>

            {virtualTourUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Virtual Tour Preview</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Take Tour
                    </a>
                  </Button>
                </div>
                <div className="aspect-video bg-white rounded border flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Virtual tour will be embedded here</p>
                    <p className="text-xs">URL: {virtualTourUrl}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Virtual tour options:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Matterport 3D virtual tours</li>
                <li>• 360° photo galleries</li>
                <li>• Interactive floor plans</li>
                <li>• Video walkthroughs</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Property3DViewer;
