import React, { lazy, Suspense, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, GraduationCap, Bus, Shield, Footprints, Bike, Car, Loader2 } from 'lucide-react';
import { cityCoordinates, generatePOIs } from './PropertyNeighborhoodMap';

const PropertyNeighborhoodMap = lazy(() => import('./PropertyNeighborhoodMap'));

interface PropertyNeighborhoodInsightsProps {
  city?: string;
  coordinates?: { lat: number; lng: number };
  propertyType?: string;
}

function seededScore(city: string, offset: number): number {
  let h = 0;
  for (let i = 0; i < city.length; i++) h = ((h << 5) - h + city.charCodeAt(i)) | 0;
  return 55 + (((h + offset * 7919) >>> 0) % 40);
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-chart-1';
  if (score >= 60) return 'bg-chart-3';
  return 'bg-destructive';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Fair';
};

const PropertyNeighborhoodInsights = ({ city, coordinates, propertyType }: PropertyNeighborhoodInsightsProps) => {
  const cityName = city || 'Jakarta';
  
  const scores = useMemo(() => ({
    walk: seededScore(cityName, 1),
    transit: seededScore(cityName, 2),
    bike: seededScore(cityName, 3),
  }), [cityName]);

  const center: [number, number] = useMemo(() => {
    if (coordinates) return [coordinates.lng, coordinates.lat];
    return cityCoordinates[cityName] || [106.8456, -6.2088];
  }, [cityName, coordinates]);

  const nearbyPlaces = useMemo(() => {
    const pois = generatePOIs(cityName, center);
    return pois.slice(0, 6);
  }, [cityName, center]);

  return (
    <Card className="border border-gold-primary/10 bg-card backdrop-blur-xl rounded-xl overflow-hidden">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <div className="w-6 h-6 rounded-full bg-gold-primary/10 flex items-center justify-center">
            <MapPin className="h-3.5 w-3.5 text-gold-primary" />
          </div>
          Neighborhood Insights
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Area amenities, transit access, and safety data for {cityName}
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-4">
        {/* Interactive Map */}
        <Suspense fallback={
          <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-gold-primary" />
          </div>
        }>
          <PropertyNeighborhoodMap city={city} coordinates={coordinates} />
        </Suspense>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg border border-gold-primary/10 bg-gold-primary/5 text-center">
            <GraduationCap className="h-4 w-4 mx-auto mb-1 text-chart-4" />
            <div className="text-[10px] font-semibold">Education</div>
            <Badge className="mt-1 bg-chart-1 text-primary-foreground text-[8px] px-1.5 h-4">9.2/10</Badge>
          </div>
          <div className="p-2 rounded-lg border border-gold-primary/10 bg-gold-primary/5 text-center">
            <Bus className="h-4 w-4 mx-auto mb-1 text-chart-1" />
            <div className="text-[10px] font-semibold">Transit</div>
            <Badge className="mt-1 bg-chart-4 text-primary-foreground text-[8px] px-1.5 h-4">800m</Badge>
          </div>
          <div className="p-2 rounded-lg border border-gold-primary/10 bg-gold-primary/5 text-center">
            <Shield className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <div className="text-[10px] font-semibold">Safety</div>
            <Badge className="mt-1 bg-chart-1 text-primary-foreground text-[8px] px-1.5 h-4">Low Crime</Badge>
          </div>
        </div>

        {/* Mobility Scores */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Footprints, label: 'Walk', score: scores.walk, color: 'text-chart-4' },
            { icon: Car, label: 'Transit', score: scores.transit, color: 'text-chart-1' },
            { icon: Bike, label: 'Bike', score: scores.bike, color: 'text-chart-3' },
          ].map(({ icon: Icon, label, score, color }) => (
            <div key={label} className="text-center p-2 border border-border/30 rounded-lg">
              <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
              <div className="text-lg font-bold">{score}</div>
              <div className="text-[9px] text-muted-foreground">{label} Score</div>
              <Badge className={`mt-1 text-primary-foreground text-[8px] px-1.5 h-4 ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </Badge>
            </div>
          ))}
        </div>

        {/* Nearby Places */}
        <div>
          <h4 className="text-xs font-semibold mb-2">Nearby Places</h4>
          <div className="space-y-1.5">
            {nearbyPlaces.map((place, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded-lg text-[10px] sm:text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ 
                    background: place.category === 'school' ? '#4CAF50' : place.category === 'hospital' ? '#F44336' : place.category === 'transit' ? '#2196F3' : place.category === 'shopping' ? '#FF9800' : '#9C27B0' 
                  }} />
                  <span className="font-medium truncate">{place.name}</span>
                </div>
                <Badge variant="outline" className="text-[8px] px-1.5 h-4 flex-shrink-0 ml-2">
                  {place.distance}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyNeighborhoodInsights;
