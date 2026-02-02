import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Glasses, Sparkles, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VRPropertyTourManager, VRTourScene } from '@/components/vr-tours';
import { BaseProperty } from '@/types/property';

// Demo property data
const demoProperty: any = {
  id: 'demo-villa-1',
  title: 'Luxury Villa Seminyak',
  description: 'Beautiful 4-bedroom villa with pool and garden',
  property_type: 'villa',
  listing_type: 'sale',
  price: 8500000000,
  bedrooms: 4,
  bathrooms: 4,
  area_sqm: 450,
  city: 'Seminyak, Bali',
  images: [],
  is_featured: true,
  view_count: 1250,
};

// Demo VR tour scenes with sample panorama images
const demoScenes: VRTourScene[] = [
  {
    id: 'living-room',
    title: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2048&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=60',
    roomType: 'living_room',
    hotspots: [
      { id: 'h1', type: 'navigation', position: { pitch: 0, yaw: 90 }, targetSceneId: 'kitchen', title: 'Go to Kitchen' },
      { id: 'h2', type: 'info', position: { pitch: -10, yaw: 180 }, title: 'Designer Sofa', description: 'Italian leather sectional' },
    ],
  },
  {
    id: 'kitchen',
    title: 'Modern Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2048&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=60',
    roomType: 'kitchen',
    hotspots: [
      { id: 'h3', type: 'navigation', position: { pitch: 0, yaw: -90 }, targetSceneId: 'living-room', title: 'Back to Living Room' },
      { id: 'h4', type: 'navigation', position: { pitch: 0, yaw: 45 }, targetSceneId: 'bedroom', title: 'Go to Master Bedroom' },
    ],
  },
  {
    id: 'bedroom',
    title: 'Master Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=2048&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=200&q=60',
    roomType: 'bedroom',
    hotspots: [
      { id: 'h5', type: 'navigation', position: { pitch: 0, yaw: 180 }, targetSceneId: 'bathroom', title: 'En-suite Bathroom' },
    ],
  },
  {
    id: 'bathroom',
    title: 'Luxury Bathroom',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=2048&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=200&q=60',
    roomType: 'bathroom',
    hotspots: [
      { id: 'h6', type: 'navigation', position: { pitch: 0, yaw: 0 }, targetSceneId: 'bedroom', title: 'Back to Bedroom' },
    ],
  },
  {
    id: 'outdoor',
    title: 'Pool & Garden',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2048&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=60',
    roomType: 'outdoor',
    hotspots: [
      { id: 'h7', type: 'navigation', position: { pitch: 0, yaw: -45 }, targetSceneId: 'living-room', title: 'Enter Villa' },
      { id: 'h8', type: 'info', position: { pitch: -20, yaw: 90 }, title: 'Infinity Pool', description: '12m x 5m heated pool' },
    ],
  },
];

const VRTourShowcase: React.FC = () => {
  const [stagedImages, setStagedImages] = useState<Record<string, string>>({});

  const handleSaveStaging = (sceneId: string, stagedImageUrl: string) => {
    setStagedImages((prev) => ({ ...prev, [sceneId]: stagedImageUrl }));
    console.log('Saved staged image for scene:', sceneId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Glasses className="h-5 w-5 text-primary" />
                  VR Property Tours
                </h1>
                <p className="text-xs text-muted-foreground">
                  Immersive 360° virtual property experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: '🔄', title: '360° Tours', desc: 'Immersive walkthroughs' },
            { icon: '🛋️', title: 'AI Staging', desc: 'Virtual furniture placement' },
            { icon: '📏', title: 'Measure', desc: 'Distance measurement tools' },
            { icon: '🌙', title: 'Day/Night', desc: 'Lighting mode toggle' },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 text-center"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="text-sm font-medium mt-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
          <div>
            <h2 className="text-lg font-semibold">{demoProperty.title}</h2>
            <p className="text-sm text-muted-foreground">{demoProperty.city}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              Rp {(demoProperty.price / 1_000_000_000).toFixed(1)}B
            </p>
            <p className="text-xs text-muted-foreground">
              {demoProperty.bedrooms} BR • {demoProperty.bathrooms} BA • {demoProperty.area_sqm}m²
            </p>
          </div>
        </div>

        {/* VR Tour Manager */}
        <VRPropertyTourManager
          property={demoProperty}
          scenes={demoScenes}
          onSaveStaging={handleSaveStaging}
        />

        {/* Info section */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">How to use VR Tours</h3>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• <strong>360° Tour:</strong> Click and drag to look around, use navigation hotspots to move between rooms</li>
                <li>• <strong>AI Staging:</strong> Select a room type and style, then click "Stage This Room" to add virtual furniture</li>
                <li>• <strong>Measure:</strong> Click two points to measure distances, calibrate with known dimensions for accuracy</li>
                <li>• <strong>Neighborhood:</strong> Explore nearby amenities in 3D, click markers for details</li>
                <li>• <strong>Day/Night:</strong> Toggle the sun/moon button to preview lighting conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VRTourShowcase;
