import React, { useState } from 'react';
import { MapPin, School, Hospital, ShoppingCart, Trees, Map, DollarSign, TrendingUp, Building2, Compass, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AreaGuides = () => {
  const [selectedCity, setSelectedCity] = useState('jakarta');

  const mainFeatures = [
    {
      icon: Map,
      title: 'Take a look inside society maps',
      description: 'Conveniently browse through detailed maps of all the housing societies established across Indonesia, featuring master plans, road networks, and plots.',
      image: '🗺️'
    },
    {
      icon: MapPin,
      title: 'Best of Local Amenities',
      description: 'Surf through the \'hot spots\' that the locals love to flock to. Discover top places including schools, hospitals, parks, grocery stores, and much more.',
      image: '📍'
    },
    {
      icon: DollarSign,
      title: 'Houses & Plot Prices',
      description: 'Find thousands of listings of low price houses and plots for sale in your desired society. Check out these affordable houses for rent and commercial properties for sale.',
      image: '🏘️'
    }
  ];

  const cities = [
    { id: 'jakarta', name: 'Jakarta', count: 1250 },
    { id: 'surabaya', name: 'Surabaya', count: 890 },
    { id: 'bandung', name: 'Bandung', count: 780 },
    { id: 'medan', name: 'Medan', count: 650 },
    { id: 'semarang', name: 'Semarang', count: 520 },
    { id: 'bali', name: 'Bali', count: 450 }
  ];

  const popularSocieties = {
    jakarta: [
      { name: 'BSD City', location: 'Tangerang Selatan', avgPrice: 'Rp 8-20M', type: 'Modern Township' },
      { name: 'Alam Sutera', location: 'Tangerang', avgPrice: 'Rp 15-35M', type: 'Luxury Complex' },
      { name: 'Summarecon Bekasi', location: 'Bekasi', avgPrice: 'Rp 5-15M', type: 'Residential' },
      { name: 'PIK (Pantai Indah Kapuk)', location: 'North Jakarta', avgPrice: 'Rp 25-80M', type: 'Waterfront' },
      { name: 'Gading Serpong', location: 'Tangerang', avgPrice: 'Rp 7-18M', type: 'Integrated City' }
    ],
    surabaya: [
      { name: 'Citraland Surabaya', location: 'West Surabaya', avgPrice: 'Rp 5-15M', type: 'Premium' },
      { name: 'Pakuwon City', location: 'West Surabaya', avgPrice: 'Rp 8-25M', type: 'Modern City' },
      { name: 'Graha Famili', location: 'East Surabaya', avgPrice: 'Rp 4-12M', type: 'Family Living' }
    ],
    bandung: [
      { name: 'Dago Village', location: 'North Bandung', avgPrice: 'Rp 10-30M', type: 'Highland' },
      { name: 'Kota Baru Parahyangan', location: 'West Bandung', avgPrice: 'Rp 6-18M', type: 'New Town' },
      { name: 'Cihanjuang Regency', location: 'Cimahi', avgPrice: 'Rp 3-10M', type: 'Affordable' }
    ],
    medan: [
      { name: 'The Mansion', location: 'Medan Johor', avgPrice: 'Rp 8-20M', type: 'Luxury' },
      { name: 'Taman Setia Budi', location: 'Medan Selayang', avgPrice: 'Rp 5-15M', type: 'Residential' },
      { name: 'Polonia', location: 'Medan Polonia', avgPrice: 'Rp 6-18M', type: 'Central' }
    ],
    semarang: [
      { name: 'Semarang City', location: 'Central Semarang', avgPrice: 'Rp 4-12M', type: 'Urban Living' },
      { name: 'Bukit Semarang Baru', location: 'West Semarang', avgPrice: 'Rp 5-15M', type: 'Highland' },
      { name: 'Graha Padma', location: 'South Semarang', avgPrice: 'Rp 3-10M', type: 'Residential' }
    ],
    bali: [
      { name: 'Nusa Dua Residence', location: 'Nusa Dua', avgPrice: 'Rp 30-100M', type: 'Beachfront' },
      { name: 'Canggu Complex', location: 'Canggu', avgPrice: 'Rp 25-80M', type: 'Villa Complex' },
      { name: 'Ubud Green Valley', location: 'Ubud', avgPrice: 'Rp 15-50M', type: 'Nature Living' }
    ]
  };

  const amenities = [
    { icon: School, name: 'Schools', count: '500+', color: 'text-blue-500' },
    { icon: Hospital, name: 'Hospitals', count: '200+', color: 'text-red-500' },
    { icon: ShoppingCart, name: 'Shopping Centers', count: '350+', color: 'text-purple-500' },
    { icon: Trees, name: 'Parks', count: '180+', color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Compass className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the Perfect Place to live in!
          </h1>
          <p className="text-lg text-muted-foreground">
            Stop wondering how your life will be like in a housing society & make informed decisions with ASTRA Villa Area Guides
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-xl transition-all border-2 hover:border-primary/20">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-6xl">
                    {feature.image}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Most Viewed Societies Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Most Viewed Societies</h2>
          
          {/* City Tabs */}
          <Tabs value={selectedCity} onValueChange={setSelectedCity} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
              {cities.map((city) => (
                <TabsTrigger 
                  key={city.id} 
                  value={city.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {city.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Societies Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">
            Most viewed societies in {cities.find(c => c.id === selectedCity)?.name}
          </h3>
          <Button variant="link" className="gap-2">
            View {cities.find(c => c.id === selectedCity)?.name} Area Guide
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSocieties[selectedCity as keyof typeof popularSocieties].map((society, index) => (
            <Card key={index} className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {society.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {society.location}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{society.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm text-muted-foreground">Average Price</span>
                    <span className="font-semibold text-primary">{society.avgPrice}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-muted/30 py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Discover Local Amenities</h2>
            <p className="text-muted-foreground">
              Explore thousands of facilities across Indonesian housing societies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {amenities.map((amenity, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all">
                <CardContent className="pt-6 pb-6">
                  <amenity.icon className={`w-12 h-12 mx-auto mb-4 ${amenity.color}`} />
                  <h3 className="font-semibold mb-2">{amenity.name}</h3>
                  <p className="text-2xl font-bold text-primary">{amenity.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Area Guides */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Why Use ASTRA Villa Area Guides?</CardTitle>
            <CardDescription>Make informed decisions about your next home</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Detailed Society Maps</h4>
                  <p className="text-sm text-muted-foreground">
                    Access comprehensive master plans, road networks, and plot layouts for every housing society
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Local Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover nearby schools, hospitals, shopping centers, and entertainment options
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Transparent Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare property prices and find the best deals in your preferred location
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Market Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Track property value growth and identify emerging investment opportunities
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AreaGuides;
