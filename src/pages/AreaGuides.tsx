import React, { useState, useEffect } from 'react';
import { MapPin, School, Hospital, ShoppingCart, Trees, Map, DollarSign, TrendingUp, Building2, Compass, Home, Globe, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import AIToolsTabBar from '@/components/common/AIToolsTabBar';
import BackToHomeLink from '@/components/common/BackToHomeLink';

const AreaGuides = () => {
  const { language } = useLanguage();
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

        // De-duplicate cities and count - filter out empty city codes
        const cityMap: { [key: string]: CityData } = {};
        data?.forEach((location: any) => {
          // Skip if city_code is empty or null
          if (!location.city_code || location.city_code.trim() === '') return;
          
          const cityId = location.city_code.toLowerCase();
          if (!cityMap[cityId]) {
            cityMap[cityId] = {
              id: cityId,
              name: location.city_name || location.city_code,
              count: 0
            };
          }
          cityMap[cityId].count++;
        });

        const uniqueCities: CityData[] = Object.values(cityMap).filter(city => city.id && city.id.trim() !== '');
        setCities(uniqueCities);
        
        // Default to 'jakarta' if available, otherwise first city
        if (!selectedCity) {
          const defaultCity = uniqueCities.find(c => c.id === 'jakarta' || c.name.toLowerCase().includes('jakarta'));
          setSelectedCity(defaultCity ? 'jakarta' : 'jakarta');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Fallback to default if fetch fails
        setSelectedCity('jakarta');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pt-11 md:pt-12">
      {/* Slim Sticky Header */}
      <header className="sticky top-11 md:top-12 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-2 md:px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 group">
              <div className="flex items-center gap-1 p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg shadow group-hover:shadow-md transition-all duration-300">
                <Compass className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {language === 'id' ? 'Panduan Area' : 'Area Guides'}
                </h1>
                <p className="text-[9px] text-muted-foreground hidden md:block font-medium">
                  {language === 'id' ? 'Jelajahi Perumahan Indonesia' : 'Explore Indonesian Housing'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI Tools Tab Bar */}
      <div className="container mx-auto px-2 md:px-3 py-2">
        <BackToHomeLink sectionId="ai-tools-section" />
        <AIToolsTabBar className="mb-2" />
      </div>

      {/* Compact Hero Section */}
      <section className="relative py-8 md:py-12 px-3 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-5">
          <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMaxYMid slice">
            <g className="animate-pulse">
              <rect x="50" y="100" width="30" height="60" fill="currentColor" className="text-primary" opacity="0.4"/>
              <rect x="90" y="80" width="30" height="80" fill="currentColor" className="text-primary" opacity="0.5"/>
              <rect x="130" y="60" width="30" height="100" fill="currentColor" className="text-primary" opacity="0.6"/>
            </g>
          </svg>
        </div>
        
        <div className="container mx-auto text-center max-w-3xl relative z-10 space-y-4">
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </div>
          
          {/* Compact Search Card */}
          <Card className="max-w-2xl mx-auto border shadow-lg bg-background/50 backdrop-blur-sm hover:shadow-primary/20 transition-all duration-300 animate-scale-in">
            <CardContent className="p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-2 md:gap-3">
                <div>
                  <label className="text-[10px] font-semibold mb-1 block text-left text-foreground/80">{t.searchCity}</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-8 text-xs bg-background/80 backdrop-blur-sm border hover:border-primary/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm">
                      {cities.length > 0 ? cities.map((city) => (
                        <SelectItem key={city.id} value={city.id} className="text-xs hover:bg-primary/10">
                          {city.name}
                        </SelectItem>
                      )) : (
                        <SelectItem value="jakarta" className="text-xs hover:bg-primary/10">
                          Jakarta
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-[10px] font-semibold mb-1 block text-left text-foreground/80">{t.searchSociety}</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" />
                    <Input
                      placeholder={t.searchSociety}
                      value={searchSociety}
                      onChange={(e) => setSearchSociety(e.target.value)}
                      className="h-8 text-xs pl-7 bg-background/80 backdrop-blur-sm border hover:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button size="sm" className="h-8 text-xs w-full md:w-auto gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:shadow-md hover:shadow-primary/50 transition-all duration-300">
                    <Search className="w-3 h-3" />
                    {t.searchButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Slim Features Section */}
      <section className="container mx-auto px-2 md:px-3 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className="group text-center hover:shadow-lg transition-all duration-300 border hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:scale-[1.02] cursor-pointer"
            >
              <CardContent className="p-3 md:p-4 space-y-2">
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl md:text-3xl shadow group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                    {feature.image}
                  </div>
                </div>
                <h3 className="text-sm md:text-base font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Slim Societies Section */}
      <section className="container mx-auto px-2 md:px-3 py-6 md:py-8 max-w-7xl">
        <div className="mb-4 md:mb-6 space-y-3">
          <div className="text-center space-y-1">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {t.mostViewed}
            </h2>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {language === 'id' ? 'Temukan komunitas terbaik di berbagai kota' : 'Discover the best communities across cities'}
            </p>
          </div>
          
          {/* Compact City Tabs */}
          <Tabs value={selectedCity} onValueChange={setSelectedCity} className="w-full">
            <div className="relative mx-auto max-w-full mb-3">
              <TabsList className="w-full h-auto bg-muted/30 backdrop-blur-md p-1.5 md:p-2 rounded-lg border border-primary/10 shadow">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-1">
                  {cities.map((city) => (
                    <TabsTrigger 
                      key={city.id} 
                      value={city.id}
                      className="px-2 py-1 md:py-1.5 text-[10px] md:text-xs whitespace-nowrap rounded-md font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 hover:bg-primary/10"
                    >
                      {city.name}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Compact Societies Grid */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm md:text-base font-semibold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
            {t.viewedIn} {cities.find(c => c.id === selectedCity)?.name}
          </h3>
          <Button variant="link" size="sm" className="gap-1 text-xs text-primary hover:gap-2 transition-all">
            {t.viewGuide}
            <TrendingUp className="w-3 h-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {popularSocieties[selectedCity as keyof typeof popularSocieties]?.map((society, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer border hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:-translate-y-0.5"
            >
              <CardHeader className="p-2 md:p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <Home className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <CardTitle className="text-xs md:text-sm group-hover:text-primary transition-colors truncate">
                        {society.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-[10px] md:text-xs">
                      <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="truncate">{society.location}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20 flex-shrink-0 whitespace-nowrap">
                    {society.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg shadow-sm gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{t.avgPrice}</span>
                    <span className="font-bold text-xs md:text-sm text-primary whitespace-nowrap">{society.avgPrice}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full h-7 text-[10px] md:text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    {t.viewDetails}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Slim Amenities Section */}
      <section className="bg-gradient-to-br from-muted/50 to-primary/5 py-6 md:py-8 px-2 md:px-3">
        <div className="container mx-auto">
          <div className="text-center mb-4 space-y-1">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {t.discoverAmenities}
            </h2>
            <p className="text-muted-foreground text-[10px] md:text-xs max-w-xl mx-auto">
              {t.amenitiesDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {amenities.map((amenity, index) => (
              <Card 
                key={index} 
                className="group text-center hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:scale-[1.02] cursor-pointer"
              >
                <CardContent className="p-3 md:p-4 space-y-2">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg w-10 h-10 md:w-12 md:h-12 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow group-hover:shadow-md">
                    <amenity.icon className={`w-5 h-5 md:w-6 md:h-6 ${amenity.color} group-hover:scale-105 transition-transform`} />
                  </div>
                  <h3 className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors">{amenity.name}</h3>
                  <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {amenity.count}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compact Why Use Area Guides */}
      <section className="container mx-auto px-2 md:px-3 py-6 md:py-8">
        <Card className="border">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-sm md:text-base">{t.whyUse}</CardTitle>
            <CardDescription className="text-[10px] md:text-xs">{t.whyUseDesc}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0">
                  <Map className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-0.5">{t.detailedMaps}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {t.detailedMapsDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-0.5">{t.localInsights}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {t.localInsightsDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-0.5">{t.pricing}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {t.pricingDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-0.5">{t.trends}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
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
