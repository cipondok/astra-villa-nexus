import React from 'react';
import { MapPin, TrendingUp, Building2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AreaGuides = () => {
  const popularAreas = [
    {
      name: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      avgPrice: 'Rp 25-50M',
      properties: 1250,
      trend: 'up',
      description: 'Prime location with excellent infrastructure and amenities'
    },
    {
      name: 'Bandung',
      province: 'West Java',
      avgPrice: 'Rp 10-25M',
      properties: 890,
      trend: 'up',
      description: 'Cool climate, creative city with growing property market'
    },
    {
      name: 'Surabaya',
      province: 'East Java',
      avgPrice: 'Rp 15-30M',
      properties: 670,
      trend: 'stable',
      description: 'Major business hub with diverse property options'
    },
    {
      name: 'Bali - Seminyak',
      province: 'Bali',
      avgPrice: 'Rp 30-100M',
      properties: 450,
      trend: 'up',
      description: 'Tourist hotspot with high rental yield potential'
    },
    {
      name: 'BSD City',
      province: 'Banten',
      avgPrice: 'Rp 8-20M',
      properties: 1100,
      trend: 'up',
      description: 'Modern township with complete facilities'
    },
    {
      name: 'Yogyakarta',
      province: 'DIY',
      avgPrice: 'Rp 5-15M',
      properties: 540,
      trend: 'stable',
      description: 'Cultural center with affordable property prices'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin className="w-10 h-10 text-primary" />
          <Building2 className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Area Guides Indonesia</h1>
        <p className="text-muted-foreground mb-6">Explore housing areas and neighborhoods across Indonesia</p>
        
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for areas, cities, or provinces..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularAreas.map((area, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{area.name}</CardTitle>
                  <CardDescription>{area.province}</CardDescription>
                </div>
                <Badge variant={area.trend === 'up' ? 'default' : 'secondary'} className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {area.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{area.description}</p>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Avg. Price</p>
                  <p className="font-semibold">{area.avgPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Properties</p>
                  <p className="font-semibold">{area.properties}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Why Use Area Guides?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Local Insights:</strong> Get detailed information about neighborhoods, amenities, and lifestyle</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Market Trends:</strong> Track property price movements and investment opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Compare Areas:</strong> Evaluate different locations to find your perfect home</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AreaGuides;
