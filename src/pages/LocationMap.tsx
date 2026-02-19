import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Home, TrendingUp, Search, Filter, ChevronRight, ArrowLeft, Loader2, Navigation2 } from 'lucide-react';
import EnhancedNavigation from '@/components/navigation/EnhancedNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { IndonesiaMap, Province } from '@/components/location/IndonesiaMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProvincePropertyCounts, useTotalPropertyCount } from '@/hooks/useProvincePropertyCounts';
import ProvincePropertiesModal from '@/components/location/ProvincePropertiesModal';
import { useLastSelectedProvince } from '@/hooks/useLastSelectedProvince';

// Harmonized color palette for provinces - earthy & professional tones
const provinceColors = [
  'hsl(210, 35%, 78%)',  // Soft Blue
  'hsl(160, 30%, 72%)',  // Sage
  'hsl(35, 40%, 75%)',   // Sand
  'hsl(190, 30%, 70%)',  // Aqua
  'hsl(25, 35%, 72%)',   // Terracotta light
  'hsl(145, 25%, 68%)',  // Mint
  'hsl(220, 30%, 75%)',  // Periwinkle
  'hsl(45, 35%, 73%)',   // Wheat
  'hsl(175, 28%, 68%)',  // Teal light
  'hsl(15, 30%, 70%)',   // Coral light
  'hsl(200, 32%, 72%)',  // Steel blue
  'hsl(80, 25%, 70%)',   // Olive light
];

const getProvinceColor = (index: number) => provinceColors[index % provinceColors.length];

// Map province names to IDs for lookup
const provinceNameToId: Record<string, string> = {
  'Aceh': 'aceh', 'Sumatera Utara': 'sumut', 'Sumatera Barat': 'sumbar', 'Riau': 'riau',
  'Kepulauan Riau': 'kepri', 'Jambi': 'jambi', 'Sumatera Selatan': 'sumsel', 'Bengkulu': 'bengkulu',
  'Bangka Belitung': 'babel', 'Lampung': 'lampung', 'Banten': 'banten', 'DKI Jakarta': 'jakarta',
  'Jawa Barat': 'jabar', 'Jawa Tengah': 'jateng', 'Yogyakarta': 'yogya', 'Jawa Timur': 'jatim',
  'Kalimantan Barat': 'kalbar', 'Kalimantan Tengah': 'kalteng', 'Kalimantan Selatan': 'kalsel',
  'Kalimantan Timur': 'kaltim', 'Kalimantan Utara': 'kaltara', 'Sulawesi Utara': 'sulut',
  'Gorontalo': 'gorontalo', 'Sulawesi Tengah': 'sulteng', 'Sulawesi Barat': 'sulbar',
  'Sulawesi Selatan': 'sulsel', 'Sulawesi Tenggara': 'sultra', 'Bali': 'bali',
  'Nusa Tenggara Barat': 'ntb', 'Nusa Tenggara Timur': 'ntt', 'Maluku Utara': 'malut',
  'Maluku': 'maluku', 'Papua Barat': 'papuabarat', 'Papua': 'papua',
};

// Static provinces list for sidebar
const provinces = [
  { id: 'aceh', code: 'IDAC', name: 'Aceh' },
  { id: 'sumut', code: 'IDSU', name: 'Sumatera Utara' },
  { id: 'sumbar', code: 'IDSB', name: 'Sumatera Barat' },
  { id: 'riau', code: 'IDRI', name: 'Riau' },
  { id: 'kepri', code: 'IDKR', name: 'Kepulauan Riau' },
  { id: 'jambi', code: 'IDJA', name: 'Jambi' },
  { id: 'sumsel', code: 'IDSS', name: 'Sumatera Selatan' },
  { id: 'bengkulu', code: 'IDBE', name: 'Bengkulu' },
  { id: 'babel', code: 'IDBB', name: 'Bangka Belitung' },
  { id: 'lampung', code: 'IDLA', name: 'Lampung' },
  { id: 'banten', code: 'IDBT', name: 'Banten' },
  { id: 'jakarta', code: 'IDJK', name: 'DKI Jakarta' },
  { id: 'jabar', code: 'IDJB', name: 'Jawa Barat' },
  { id: 'jateng', code: 'IDJT', name: 'Jawa Tengah' },
  { id: 'yogya', code: 'IDYO', name: 'Yogyakarta' },
  { id: 'jatim', code: 'IDJI', name: 'Jawa Timur' },
  { id: 'kalbar', code: 'IDKB', name: 'Kalimantan Barat' },
  { id: 'kalteng', code: 'IDKT', name: 'Kalimantan Tengah' },
  { id: 'kalsel', code: 'IDKS', name: 'Kalimantan Selatan' },
  { id: 'kaltim', code: 'IDKI', name: 'Kalimantan Timur' },
  { id: 'kaltara', code: 'IDKU', name: 'Kalimantan Utara' },
  { id: 'sulut', code: 'IDSA', name: 'Sulawesi Utara' },
  { id: 'gorontalo', code: 'IDGO', name: 'Gorontalo' },
  { id: 'sulteng', code: 'IDST', name: 'Sulawesi Tengah' },
  { id: 'sulbar', code: 'IDSR', name: 'Sulawesi Barat' },
  { id: 'sulsel', code: 'IDSN', name: 'Sulawesi Selatan' },
  { id: 'sultra', code: 'IDSG', name: 'Sulawesi Tenggara' },
  { id: 'bali', code: 'IDBA', name: 'Bali' },
  { id: 'ntb', code: 'IDNB', name: 'Nusa Tenggara Barat' },
  { id: 'ntt', code: 'IDNT', name: 'Nusa Tenggara Timur' },
  { id: 'malut', code: 'IDMU', name: 'Maluku Utara' },
  { id: 'maluku', code: 'IDMA', name: 'Maluku' },
  { id: 'papuabarat', code: 'IDPB', name: 'Papua Barat' },
  { id: 'papua', code: 'IDPA', name: 'Papua' },
];

const LocationMap = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Last selected province tracking
  const { lastProvince, saveLastProvince } = useLastSelectedProvince();
  
  // Fetch real property counts from database
  const { data: provincePropertyCounts = {}, isLoading: isLoadingCounts } = useProvincePropertyCounts();
  const { data: totalProperties = 0, isLoading: isLoadingTotal } = useTotalPropertyCount();
  
  const isLoading = isLoadingCounts || isLoadingTotal;

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get property count for a province by name
  const getPropertyCount = (provinceName: string): number => {
    return provincePropertyCounts[provinceName] || 0;
  };

  // Get top provinces by property count for popular section
  const popularProvinces = [
    { id: 'bali', name: 'Bali', icon: TrendingUp },
    { id: 'jabar', name: 'Jawa Barat', icon: Home },
    { id: 'jakarta', name: 'DKI Jakarta', icon: Building2 },
    { id: 'jatim', name: 'Jawa Timur', icon: Building2 },
    { id: 'yogya', name: 'Yogyakarta', icon: Home },
    { id: 'jateng', name: 'Jawa Tengah', icon: Building2 },
  ].map(p => ({ ...p, properties: getPropertyCount(p.name) }));

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province.id);
    setSelectedProvinceName(province.name);
    // Save as last selected
    saveLastProvince({ id: province.id, name: province.name, code: province.code || '' });
    setIsModalOpen(true);
  };

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    setSelectedProvince(provinceId);
    setSelectedProvinceName(provinceName);
    // Save as last selected
    saveLastProvince({ id: provinceId, name: provinceName, code: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const { language, setLanguage } = useLanguage();
  const toggleLanguage = () => setLanguage(language === 'en' ? 'id' : 'en');

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
      />
      <main className="container mx-auto px-4 py-6 pt-16 sm:pt-20">
        {/* Header - Rumah123 Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-[6px] mb-3 shadow-sm">
            <MapPin className="h-3 w-3" />
            <span className="text-xs font-semibold">Jelajahi Lokasi</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Peta Properti Indonesia
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Temukan properti impian Anda di seluruh Indonesia. Klik pada peta untuk melihat properti.
          </p>
          
          {/* Last Selected Province Indicator */}
          {lastProvince && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-3"
            >
              <button
                onClick={() => handleProvinceClick(lastProvince.id, lastProvince.name)}
                className="inline-flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-[6px] border border-destructive/30 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              >
                <Navigation2 className="h-4 w-4" />
                <span className="text-sm font-medium">Lokasi Anda:</span>
                <span className="text-sm font-bold">{lastProvince.name}</span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content - Full Width Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <IndonesiaMap 
            onProvinceSelect={handleProvinceSelect}
            selectedProvince={selectedProvince}
            userProvince={lastProvince?.id || null}
          />
        </motion.div>

        {/* Province List - Solid Card Rumah123 Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-card border border-border rounded-[6px] shadow-sm">
            <CardContent className="p-4 space-y-4">
              {/* Row 1: Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari provinsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm bg-background border-border rounded-[6px]"
                />
              </div>
              
              {/* Row 2: Popular Provinces with Progress Bars */}
              <div>
                <span className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Populer
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {popularProvinces.map((province, index) => {
                    const maxCount = Math.max(...popularProvinces.map(p => p.properties), 1);
                    const percentage = (province.properties / maxCount) * 100;
                    return (
                      <motion.div
                        key={province.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProvinceClick(province.id, province.name)}
                        className={`p-3 rounded-[6px] cursor-pointer transition-all border ${
                          selectedProvince === province.id
                            ? 'bg-primary/10 border-primary shadow-md'
                            : 'bg-background border-border hover:border-primary hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {province.name}
                          </span>
                          <province.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {province.properties.toLocaleString()}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold text-primary">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* All Provinces - Wrap */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Semua Provinsi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filteredProvinces.map((province) => {
                    const propertyCount = getPropertyCount(province.name);
                    return (
                      <motion.button
                        key={province.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProvinceClick(province.id, province.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs sm:text-sm font-medium transition-all border ${
                          selectedProvince === province.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-background text-foreground border-border hover:bg-primary/5 hover:border-primary hover:text-primary'
                        }`}
                      >
                        <span>{province.name}</span>
                        <span className={`text-[10px] sm:text-xs ${
                          selectedProvince === province.id 
                            ? 'text-primary-foreground/80' 
                            : 'text-muted-foreground'
                        }`}>
                          ({propertyCount >= 1000 ? `${(propertyCount / 1000).toFixed(1)}K` : propertyCount})
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Rumah123 Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Provinsi', value: '38', icon: MapPin },
            { label: 'Total Properti', value: totalProperties.toString(), icon: Building2 },
            { label: 'Kota Tersedia', value: Object.keys(provincePropertyCounts).length.toString(), icon: Home },
            { label: 'Agen Aktif', value: '12.3K', icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="bg-card border border-border rounded-[6px] hover:border-primary hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[6px] bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-primary leading-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Region Cards - Rumah123 Style */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Wilayah Populer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { region: 'Jawa', provinces: ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'], properties: 42500, accent: 'bg-primary/5 border-primary/20' },
              { region: 'Sumatera', provinces: ['Sumatera Utara', 'Sumatera Barat', 'Riau'], properties: 18200, accent: 'bg-emerald-500/5 border-emerald-500/20' },
              { region: 'Kalimantan', provinces: ['Kalimantan Timur', 'Kalimantan Selatan'], properties: 12800, accent: 'bg-amber-500/5 border-amber-500/20' },
            ].map((item, index) => (
              <motion.div
                key={item.region}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className={`${item.accent} border rounded-[6px] hover:shadow-md transition-all cursor-pointer`}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base sm:text-lg text-foreground mb-2">{item.region}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.provinces.slice(0, 3).map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs px-2 py-0.5 rounded-[4px]">
                          {p}
                        </Badge>
                      ))}
                      {item.provinces.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-[4px]">
                          +{item.provinces.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.properties.toLocaleString()} properti
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 px-3 text-sm text-primary hover:bg-primary/10">
                        Jelajahi
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Province Properties Modal */}
      <ProvincePropertiesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        provinceName={selectedProvinceName}
      />
    </div>
  );
};

export default LocationMap;
