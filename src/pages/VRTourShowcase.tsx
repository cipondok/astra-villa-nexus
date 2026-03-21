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

      {/* Main Content — Ultra Compact */}
      <main className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
        {/* Compact header: feature pills + property info merged */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-2 py-1"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { icon: '🔄', title: '360°' },
              { icon: '🛋️', title: 'AI Stage' },
              { icon: '📏', title: 'Measure' },
              { icon: '🌙', title: 'Day/Night' },
            ].map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-card border border-border/60 rounded-full px-2 py-0.5 text-[11px] font-medium text-foreground">
                <span>{f.icon}</span>{f.title}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground text-sm">{demoProperty.title}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{demoProperty.city}</span>
            <span>·</span>
            <span className="font-bold text-primary text-sm">{formatPrice(demoProperty.price)}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{demoProperty.bedrooms}BR {demoProperty.bathrooms}BA {demoProperty.area_sqm}m²</span>
          </div>
        </motion.div>

        {/* VR Tour Manager */}
        <VRPropertyTourManager
          property={demoProperty}
          scenes={demoScenes}
          onSaveStaging={handleSaveStaging}
        />

        {/* Collapsible How-to-use */}
        <details className="group">
          <summary className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>How to use VR Tours</span>
          </summary>
          <ul className="text-[11px] text-muted-foreground mt-1.5 ml-5 space-y-0.5">
            <li>• <strong className="text-foreground">360° Tour:</strong> Drag to look around, use hotspots to navigate</li>
            <li>• <strong className="text-foreground">AI Staging:</strong> Select style, click "Stage This Room"</li>
            <li>• <strong className="text-foreground">Measure:</strong> Click two points to measure</li>
            <li>• <strong className="text-foreground">Day/Night:</strong> Toggle with sun/moon button</li>
          </ul>
        </details>
      </main>
    </div>
  );
};

export default VRTourShowcase;
