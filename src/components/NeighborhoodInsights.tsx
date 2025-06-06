
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Bike, Footprints, GraduationCap, Shield, Bus } from 'lucide-react';

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
      {/* Neighborhood Intelligence Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Neighborhood Intelligence
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Comprehensive demographic data and area analytics for informed decisions
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Know Before You Go</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our platform integrates real-time data on schools, transportation, crime rates, and local amenities to give you complete neighborhood transparency.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Education */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              School ratings and distances
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Primary Schools</span>
                <Badge className="bg-green-500 text-white">9.2/10</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Secondary Schools</span>
                <Badge className="bg-blue-500 text-white">8.8/10</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Universities</span>
                <Badge className="bg-purple-500 text-white">2.5km</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bus className="h-5 w-5 text-green-600" />
              Transportation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              MRT access and traffic patterns
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">MRT Station</span>
                <Badge className="bg-green-500 text-white">800m</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bus Stops</span>
                <Badge className="bg-blue-500 text-white">5 nearby</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Traffic Level</span>
                <Badge className="bg-yellow-500 text-white">Moderate</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-red-600" />
              Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Crime statistics and trends
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Crime Rate</span>
                <Badge className="bg-green-500 text-white">Low</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Police Response</span>
                <Badge className="bg-blue-500 text-white">5 min</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Safety Trend</span>
                <Badge className="bg-green-500 text-white">Improving</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobility Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Mobility Scores</CardTitle>
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

      {/* Nearby Places */}
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
