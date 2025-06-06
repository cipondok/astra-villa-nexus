
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Bike, Footprints } from 'lucide-react';

interface NearbyPlace {
  name: string;
  distance: string;
  type: string;
}

interface Neighborhood {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  nearbyPlaces: NearbyPlace[];
}

interface NeighborhoodInsightsProps {
  neighborhood: Neighborhood;
}

const NeighborhoodInsights = ({ neighborhood }: NeighborhoodInsightsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Neighborhood Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Footprints className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{neighborhood.walkScore}</div>
              <div className="text-sm text-gray-600">Walk Score</div>
              <Badge className={`mt-2 text-white ${getScoreColor(neighborhood.walkScore)}`}>
                {getScoreLabel(neighborhood.walkScore)}
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Car className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{neighborhood.transitScore}</div>
              <div className="text-sm text-gray-600">Transit Score</div>
              <Badge className={`mt-2 text-white ${getScoreColor(neighborhood.transitScore)}`}>
                {getScoreLabel(neighborhood.transitScore)}
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Bike className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{neighborhood.bikeScore}</div>
              <div className="text-sm text-gray-600">Bike Score</div>
              <Badge className={`mt-2 text-white ${getScoreColor(neighborhood.bikeScore)}`}>
                {getScoreLabel(neighborhood.bikeScore)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nearby Places</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {neighborhood.nearbyPlaces.map((place, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{place.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {place.type}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {place.distance}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeighborhoodInsights;
