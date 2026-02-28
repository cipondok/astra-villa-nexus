import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Glasses, Sparkles, Info, Eye, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VRPropertyTourManager, VRTourScene } from '@/components/vr-tours';
import { BaseProperty } from '@/types/property';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';

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

  const formatPrice = getCurrencyFormatterShort();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-9 px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                  <Glasses className="h-5 w-5 text-primary" />
                  <span className="hidden sm:inline">VR Property</span> Tours
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Immersive 360° virtual property experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex border-primary/30 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge className="bg-primary text-primary-foreground">
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Interactive</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3"
        >
          {[
            { icon: '🔄', title: '360° Tours', desc: 'Immersive walkthroughs' },
            { icon: '🛋️', title: 'AI Staging', desc: 'Virtual furniture' },
            { icon: '📏', title: 'Measure', desc: 'Distance tools' },
            { icon: '🌙', title: 'Day/Night', desc: 'Lighting toggle' },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors"
            >
              <span className="text-xl sm:text-2xl">{feature.icon}</span>
              <h3 className="text-xs sm:text-sm font-medium mt-1 text-foreground">{feature.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Property Info Card */}
        <div className="flex items-center justify-between bg-secondary/50 border border-border rounded-xl p-3 sm:p-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{demoProperty.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{demoProperty.city}</p>
          </div>
          <div className="text-right">
            <p className="text-base sm:text-lg font-bold text-primary">
              {formatPrice(demoProperty.price)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
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
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm text-foreground">How to use VR Tours</h3>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• <strong className="text-foreground">360° Tour:</strong> Click and drag to look around, use hotspots to navigate</li>
                <li>• <strong className="text-foreground">AI Staging:</strong> Select room type and style, click "Stage This Room"</li>
                <li>• <strong className="text-foreground">Measure:</strong> Click two points to measure distances</li>
                <li>• <strong className="text-foreground">Neighborhood:</strong> Explore nearby amenities on the map</li>
                <li>• <strong className="text-foreground">Day/Night:</strong> Toggle lighting conditions with sun/moon button</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VRTourShowcase;
