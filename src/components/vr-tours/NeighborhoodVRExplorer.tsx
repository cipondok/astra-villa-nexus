import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Building2, GraduationCap,
  Stethoscope, Utensils, Waves,
  Navigation, ChevronRight, ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseProperty } from '@/types/property';

interface POI {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'restaurant' | 'shopping' | 'park' | 'beach' | 'temple' | 'market';
  position: { x: number; y: number }; // Percentage positions on the map
  distance: string;
  rating?: number;
}

interface NeighborhoodVRExplorerProps {
  property: BaseProperty;
  isDayMode?: boolean;
  isFullscreen?: boolean;
}

const NeighborhoodVRExplorer: React.FC<NeighborhoodVRExplorerProps> = ({
  property,
  isDayMode = true,
  isFullscreen = false
}) => {
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Mock POIs with 2D positions
  const mockPOIs: POI[] = [
    { id: '1', name: 'Bali International School', type: 'school', position: { x: 25, y: 20 }, distance: '1.2 km', rating: 4.8 },
    { id: '2', name: 'BIMC Hospital', type: 'hospital', position: { x: 75, y: 30 }, distance: '2.5 km', rating: 4.5 },
    { id: '3', name: 'Locavore Restaurant', type: 'restaurant', position: { x: 60, y: 65 }, distance: '800 m', rating: 4.9 },
    { id: '4', name: 'Seminyak Square', type: 'shopping', position: { x: 20, y: 70 }, distance: '1.8 km', rating: 4.3 },
    { id: '5', name: 'Echo Beach', type: 'beach', position: { x: 85, y: 55 }, distance: '3.2 km', rating: 4.7 },
    { id: '6', name: 'Tirta Empul Temple', type: 'temple', position: { x: 15, y: 40 }, distance: '4.5 km', rating: 4.9 },
    { id: '7', name: 'Ubud Market', type: 'market', position: { x: 70, y: 80 }, distance: '2.1 km', rating: 4.4 },
    { id: '8', name: 'Sacred Monkey Forest', type: 'park', position: { x: 35, y: 85 }, distance: '1.5 km', rating: 4.6 },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: MapPin },
    { id: 'school', label: 'Schools', icon: GraduationCap },
    { id: 'hospital', label: 'Health', icon: Stethoscope },
    { id: 'restaurant', label: 'Dining', icon: Utensils },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'beach', label: 'Beach', icon: Waves },
  ];

  const filteredPOIs = activeCategory === 'all'
    ? mockPOIs
    : mockPOIs.filter((poi) => poi.type === activeCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'restaurant': return '🍽️';
      case 'shopping': return '🛒';
      case 'park': return '🌳';
      case 'beach': return '🏖️';
      case 'temple': return '🛕';
      case 'market': return '🏪';
      default: return '📍';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-chart-4';
      case 'hospital': return 'bg-destructive';
      case 'restaurant': return 'bg-chart-3';
      case 'shopping': return 'bg-accent';
      case 'park': return 'bg-chart-1';
      case 'beach': return 'bg-primary';
      case 'temple': return 'bg-chart-3';
      case 'market': return 'bg-accent';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4 p-3 sm:p-4",
      isFullscreen ? "lg:grid-cols-4 h-screen overflow-auto" : "lg:grid-cols-4"
    )}>
      {/* 2D Neighborhood Map View */}
      <div className={cn(
        "relative rounded-xl overflow-hidden lg:col-span-3 border border-border",
        isDayMode 
          ? "bg-gradient-to-b from-primary/10 to-chart-1/10" 
          : "bg-gradient-to-b from-card to-card/80",
        isFullscreen ? "h-[600px]" : "h-[300px] sm:h-[400px]"
      )}>
        {/* Grid lines for visual effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, ${isDayMode ? '#000' : '#fff'} 1px, transparent 1px),
              linear-gradient(to bottom, ${isDayMode ? '#000' : '#fff'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Roads */}
        <div className={cn(
          "absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2",
          isDayMode ? "bg-muted-foreground/40" : "bg-muted-foreground/60"
        )} />
        <div className={cn(
          "absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2",
          isDayMode ? "bg-muted-foreground/40" : "bg-muted-foreground/60"
        )} />

        {/* Property marker (center) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary shadow-lg flex items-center justify-center animate-pulse border-2 border-primary-foreground/20">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground whitespace-nowrap text-[8px] sm:text-[10px]">
              Your Property
            </Badge>
          </div>
        </div>

        {/* POI markers */}
        {filteredPOIs.map((poi) => (
          <motion.button
            key={poi.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            className={cn(
              "absolute z-10 transition-transform",
              selectedPOI?.id === poi.id && "z-30"
            )}
            style={{
              left: `${poi.position.x}%`,
              top: `${poi.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedPOI(poi)}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white",
              getColor(poi.type),
              selectedPOI?.id === poi.id && "ring-4 ring-primary/50"
            )}>
              {getIcon(poi.type)}
            </div>
            {selectedPOI?.id === poi.id && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                  <p className="font-medium text-foreground">{poi.name}</p>
                  <p className="text-muted-foreground">{poi.distance}</p>
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Category filters */}
        <div className="absolute top-4 left-4 z-20">
          <div className="flex flex-wrap gap-1 bg-card/90 border border-border rounded-lg p-1 shadow-lg">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon className="h-3 w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">{cat.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-20">
          <Badge className="bg-card/90 border border-border text-foreground shadow-lg">
            <Building2 className="h-3 w-3 mr-1" />
            {filteredPOIs.length} Places Nearby
          </Badge>
        </div>
      </div>

      {/* POI Details Panel */}
      <Card className="h-fit border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-foreground">
            <Navigation className="h-4 w-4 text-primary" />
            Nearby Places
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedPOI ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="text-2xl sm:text-3xl">
                  {getIcon(selectedPOI.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground">{selectedPOI.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{selectedPOI.type}</p>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                    <Badge variant="outline" className="text-[10px] sm:text-xs border-border">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                      {selectedPOI.distance}
                    </Badge>
                    {selectedPOI.rating && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        ⭐ {selectedPOI.rating}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full mt-2 sm:mt-3 h-8 text-xs">
                Get Directions
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click a marker to see details</p>
            </div>
          )}

          {/* POI List */}
          <div className="space-y-2 max-h-[250px] overflow-auto">
            {filteredPOIs.map((poi) => (
              <button
                key={poi.id}
                onClick={() => setSelectedPOI(poi)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                  selectedPOI?.id === poi.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-lg">{getIcon(poi.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{poi.name}</p>
                  <p className="text-xs text-muted-foreground">{poi.distance}</p>
                </div>
                {poi.rating && (
                  <span className="text-xs text-muted-foreground">⭐ {poi.rating}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeighborhoodVRExplorer;
