import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Glasses, Sparkles, Info, Eye } from 'lucide-react';
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
  };

  const formatPrice = getCurrencyFormatterShort();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Slim Header — merged with property info */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Glasses className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">{demoProperty.title}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">· {demoProperty.city}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-primary text-sm">{formatPrice(demoProperty.price)}</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              {demoProperty.bedrooms}BR · {demoProperty.bathrooms}BA · {demoProperty.area_sqm}m²
            </span>
            <Badge variant="outline" className="hidden md:flex h-5 text-[10px] border-primary/30 text-primary px-1.5">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />AI
            </Badge>
          </div>
        </div>
      </header>

      {/* Full-bleed VR content — minimal wrapper */}
      <main className="container mx-auto px-2 sm:px-3 py-1.5 space-y-1.5">
        <VRPropertyTourManager
          property={demoProperty}
          scenes={demoScenes}
          onSaveStaging={handleSaveStaging}
        />

        {/* Inline collapsible help */}
        <details className="group px-1">
          <summary className="inline-flex items-center gap-1 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-3 w-3 text-primary" />
            How to use
          </summary>
          <div className="text-[10px] text-muted-foreground mt-1 ml-4 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-0.5">
            <span><strong className="text-foreground">360°:</strong> Drag to look around</span>
            <span><strong className="text-foreground">AI Stage:</strong> Select style & stage</span>
            <span><strong className="text-foreground">Measure:</strong> Click two points</span>
            <span><strong className="text-foreground">Day/Night:</strong> Sun/moon toggle</span>
          </div>
        </details>
      </main>
    </div>
  );
};

export default VRTourShowcase;
