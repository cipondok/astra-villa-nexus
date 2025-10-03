import React, { useState, useEffect } from 'react';
import { MapPin, School, Hospital, ShoppingCart, Trees, Map, DollarSign, TrendingUp, Building2, Compass, Home, Globe, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const AreaGuides = () => {
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchSociety, setSearchSociety] = useState('');
  const [cities, setCities] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('city_name, city_code')
          .eq('is_active', true)
          .order('city_name');

        if (error) throw error;

        interface CityData {
          id: string;
          name: string;
          count: number;
        }

        // De-duplicate cities and count
        const cityMap: { [key: string]: CityData } = {};
        data?.forEach((location: any) => {
          if (!cityMap[location.city_code]) {
            cityMap[location.city_code] = {
              id: location.city_code.toLowerCase(),
              name: location.city_name,
              count: 0
            };
          }
          cityMap[location.city_code].count++;
        });

        const uniqueCities: CityData[] = Object.values(cityMap);
        setCities(uniqueCities);
        
        if (uniqueCities.length > 0 && !selectedCity) {
          setSelectedCity(uniqueCities[0].id);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const translations = {
    id: {
      title: 'Jelajahi Perumahan di Indonesia',
      subtitle: 'ASTRA Villa menyediakan gambaran kehidupan sehari-hari di berbagai kompleks perumahan di Indonesia',
      searchCity: 'Kota',
      searchSociety: 'Cari Perumahan',
      searchButton: 'Cari',
      feature1Title: 'Lihat peta detail perumahan',
      feature1Desc: 'Jelajahi peta lengkap semua kompleks perumahan di Indonesia, termasuk master plan, jaringan jalan, dan plot kavling.',
      feature2Title: 'Fasilitas Lokal Terbaik',
      feature2Desc: 'Temukan tempat favorit warga lokal. Temukan sekolah, rumah sakit, taman, toko kelontong, dan banyak lagi.',
      feature3Title: 'Harga Rumah & Kavling',
      feature3Desc: 'Temukan ribuan listing rumah dan kavling murah untuk dijual di kompleks pilihan Anda. Lihat rumah terjangkau untuk disewa dan properti komersial.',
      mostViewed: 'Perumahan Paling Banyak Dilihat',
      viewedIn: 'Perumahan paling banyak dilihat di',
      viewGuide: 'Lihat Panduan Area',
      viewDetails: 'Lihat Detail',
      avgPrice: 'Harga Rata-rata',
      discoverAmenities: 'Temukan Fasilitas Lokal',
      amenitiesDesc: 'Jelajahi ribuan fasilitas di seluruh kompleks perumahan Indonesia',
      schools: 'Sekolah',
      hospitals: 'Rumah Sakit',
      shopping: 'Pusat Belanja',
      parks: 'Taman',
      whyUse: 'Mengapa Menggunakan Panduan Area ASTRA Villa?',
      whyUseDesc: 'Buat keputusan yang tepat tentang rumah Anda berikutnya',
      detailedMaps: 'Peta Perumahan Detail',
      detailedMapsDesc: 'Akses master plan lengkap, jaringan jalan, dan tata letak kavling untuk setiap kompleks perumahan',
      localInsights: 'Wawasan Lokal',
      localInsightsDesc: 'Temukan sekolah, rumah sakit, pusat belanja, dan hiburan terdekat',
      pricing: 'Harga Transparan',
      pricingDesc: 'Bandingkan harga properti dan temukan penawaran terbaik di lokasi pilihan Anda',
      trends: 'Tren Pasar',
      trendsDesc: 'Lacak pertumbuhan nilai properti dan identifikasi peluang investasi baru'
    },
    en: {
      title: 'Explore Housing Societies in Indonesia',
      subtitle: 'ASTRA Villa provides you with a vibe of what everyday life looks like in different housing societies of Indonesia',
      searchCity: 'City',
      searchSociety: 'Search Societies',
      searchButton: 'Search',
      feature1Title: 'Take a look inside society maps',
      feature1Desc: 'Conveniently browse through detailed maps of all the housing societies established across Indonesia, featuring master plans, road networks, and plots.',
      feature2Title: 'Best of Local Amenities',
      feature2Desc: 'Surf through the \'hot spots\' that the locals love to flock to. Discover top places including schools, hospitals, parks, grocery stores, and much more.',
      feature3Title: 'Houses & Plot Prices',
      feature3Desc: 'Find thousands of listings of low price houses and plots for sale in your desired society. Check out these affordable houses for rent and commercial properties for sale.',
      mostViewed: 'Most Viewed Societies',
      viewedIn: 'Most viewed societies in',
      viewGuide: 'View Area Guide',
      viewDetails: 'View Details',
      avgPrice: 'Average Price',
      discoverAmenities: 'Discover Local Amenities',
      amenitiesDesc: 'Explore thousands of facilities across Indonesian housing societies',
      schools: 'Schools',
      hospitals: 'Hospitals',
      shopping: 'Shopping Centers',
      parks: 'Parks',
      whyUse: 'Why Use ASTRA Villa Area Guides?',
      whyUseDesc: 'Make informed decisions about your next home',
      detailedMaps: 'Detailed Society Maps',
      detailedMapsDesc: 'Access comprehensive master plans, road networks, and plot layouts for every housing society',
      localInsights: 'Local Insights',
      localInsightsDesc: 'Discover nearby schools, hospitals, shopping centers, and entertainment options',
      pricing: 'Transparent Pricing',
      pricingDesc: 'Compare property prices and find the best deals in your preferred location',
      trends: 'Market Trends',
      trendsDesc: 'Track property value growth and identify emerging investment opportunities'
    }
  };

  const t = translations[language];

  const mainFeatures = [
    {
      icon: Map,
      title: t.feature1Title,
      description: t.feature1Desc,
      image: '🗺️'
    },
    {
      icon: MapPin,
      title: t.feature2Title,
      description: t.feature2Desc,
      image: '📍'
    },
    {
      icon: DollarSign,
      title: t.feature3Title,
      description: t.feature3Desc,
      image: '🏘️'
    }
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
    { icon: School, name: t.schools, count: '500+', color: 'text-blue-500' },
    { icon: Hospital, name: t.hospitals, count: '200+', color: 'text-red-500' },
    { icon: ShoppingCart, name: t.shopping, count: '350+', color: 'text-purple-500' },
    { icon: Trees, name: t.parks, count: '180+', color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sticky Header with Language Toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <Compass className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{language === 'id' ? 'Panduan Area' : 'Area Guides'}</h1>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {language === 'id' ? 'Jelajahi Perumahan Indonesia' : 'Explore Indonesian Housing'}
                </p>
              </div>
            </div>
            
            {/* Language Toggle */}
            <Tabs value={language} onValueChange={(v: any) => setLanguage(v)} className="w-auto">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="id" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Bahasa
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-2">
                  <Globe className="w-4 h-4" />
                  English
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 px-4 relative overflow-hidden">
        {/* Decorative background illustration */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMaxYMid slice">
            <g transform="rotate(-15 200 150)">
              <rect x="50" y="100" width="40" height="80" fill="currentColor" className="text-primary" opacity="0.3"/>
              <rect x="100" y="80" width="40" height="100" fill="currentColor" className="text-primary" opacity="0.4"/>
              <rect x="150" y="60" width="40" height="120" fill="currentColor" className="text-primary" opacity="0.5"/>
              <rect x="200" y="90" width="40" height="90" fill="currentColor" className="text-primary" opacity="0.3"/>
              <rect x="250" y="70" width="40" height="110" fill="currentColor" className="text-primary" opacity="0.4"/>
            </g>
          </svg>
        </div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t.subtitle}
          </p>
          
          {/* Enhanced Search Section */}
          <Card className="max-w-3xl mx-auto border-2 shadow-xl">
            <CardContent className="pt-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block text-left">{t.searchCity}</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-semibold mb-2 block text-left">{t.searchSociety}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t.searchSociety}
                      value={searchSociety}
                      onChange={(e) => setSearchSociety(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button size="lg" className="w-full md:w-auto gap-2">
                    <Search className="w-4 h-4" />
                    {t.searchButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <h2 className="text-3xl font-bold mb-6">{t.mostViewed}</h2>
          
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
            {t.viewedIn} {cities.find(c => c.id === selectedCity)?.name}
          </h3>
          <Button variant="link" className="gap-2">
            {t.viewGuide} {cities.find(c => c.id === selectedCity)?.name}
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
                    <span className="text-sm text-muted-foreground">{t.avgPrice}</span>
                    <span className="font-semibold text-primary">{society.avgPrice}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    {t.viewDetails}
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
            <h2 className="text-3xl font-bold mb-4">{t.discoverAmenities}</h2>
            <p className="text-muted-foreground">
              {t.amenitiesDesc}
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
            <CardTitle className="text-2xl">{t.whyUse}</CardTitle>
            <CardDescription>{t.whyUseDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t.detailedMaps}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.detailedMapsDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t.localInsights}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.localInsightsDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t.pricing}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.pricingDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t.trends}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.trendsDesc}
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
