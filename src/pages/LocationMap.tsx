import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Home, TrendingUp, Search, Filter, ChevronRight } from 'lucide-react';
import { IndonesiaMap, Province } from '@/components/location/IndonesiaMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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

// Property counts for each province (mock data)
const provincePropertyCounts: Record<string, number> = {
  'aceh': 1250, 'sumut': 3420, 'sumbar': 2180, 'riau': 2890, 'kepri': 1560,
  'jambi': 980, 'sumsel': 2340, 'bengkulu': 720, 'babel': 890, 'lampung': 1870,
  'banten': 4560, 'jakarta': 15420, 'jabar': 12350, 'jateng': 5890, 'yogya': 3210,
  'jatim': 8920, 'kalbar': 1340, 'kalteng': 890, 'kalsel': 1560, 'kaltim': 2340,
  'kaltara': 560, 'sulut': 1120, 'gorontalo': 420, 'sulteng': 780, 'sulbar': 540,
  'sulsel': 3420, 'sultra': 890, 'bali': 6540, 'ntb': 1890, 'ntt': 1230,
  'malut': 340, 'maluku': 560, 'papuabarat': 280, 'papua': 450,
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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularProvinces = [
    { id: 'jakarta', name: 'DKI Jakarta', properties: 15420, icon: Building2 },
    { id: 'jabar', name: 'Jawa Barat', properties: 12350, icon: Home },
    { id: 'jatim', name: 'Jawa Timur', properties: 8920, icon: Building2 },
    { id: 'bali', name: 'Bali', properties: 6540, icon: TrendingUp },
    { id: 'jateng', name: 'Jawa Tengah', properties: 5890, icon: Home },
    { id: 'sulsel', name: 'Sulawesi Selatan', properties: 3420, icon: Building2 },
  ];

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province.id);
    navigate(`/properties?location=${encodeURIComponent(province.name)}`);
  };

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    setSelectedProvince(provinceId);
    navigate(`/properties?location=${encodeURIComponent(provinceName)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full mb-2">
            <MapPin className="h-2.5 w-2.5" />
            <span className="text-[10px] font-medium">Jelajahi Lokasi</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-foreground mb-1">
            Peta Properti Indonesia
          </h1>
          <p className="text-[10px] text-muted-foreground max-w-md mx-auto leading-tight">
            Temukan properti impian Anda di seluruh Indonesia. Klik pada peta untuk melihat properti.
          </p>
        </motion.div>

        {/* Main Content - Full Width Map First */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <IndonesiaMap 
            onProvinceSelect={handleProvinceSelect}
            selectedProvince={selectedProvince}
          />
        </motion.div>

        {/* Province List - Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-3 space-y-3">
              {/* Row 1: Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Cari provinsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-7 text-xs"
                />
              </div>
              
              {/* Row 2: Popular Provinces */}
              <div>
                <span className="text-xs font-semibold text-foreground flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  Populer:
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {popularProvinces.map((province, index) => {
                    const colorIndex = provinces.findIndex(p => p.id === province.id);
                    const bgColor = getProvinceColor(colorIndex >= 0 ? colorIndex : index);
                    return (
                      <motion.div
                        key={province.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleProvinceClick(province.id, province.name)}
                        style={{
                          backgroundColor: selectedProvince === province.id ? undefined : bgColor,
                        }}
                        className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-pointer transition-colors ${
                          selectedProvince === province.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:opacity-80'
                        }`}
                      >
                        <province.icon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        <span className="text-[10px] sm:text-xs font-medium">{province.name}</span>
                        <Badge variant={selectedProvince === province.id ? "secondary" : "outline"} className="text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0 h-3 sm:h-4 bg-background/60">
                          {province.properties.toLocaleString()}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* All Provinces - Wrap */}
              <div>
                <h3 className="text-[10px] sm:text-xs font-semibold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
                  <Filter className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                  Semua Provinsi
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {filteredProvinces.map((province) => {
                    const colorIndex = provinces.findIndex(p => p.id === province.id);
                    const bgColor = getProvinceColor(colorIndex);
                    const propertyCount = provincePropertyCounts[province.id] || 0;
                    return (
                      <motion.div
                        key={province.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleProvinceClick(province.id, province.name)}
                        style={{
                          backgroundColor: selectedProvince === province.id ? undefined : bgColor,
                        }}
                        className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md cursor-pointer transition-colors border border-transparent hover:border-primary/30 ${
                          selectedProvince === province.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:opacity-90'
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs font-medium">{province.name}</span>
                        <div className="flex items-center gap-0.5 bg-background/70 rounded px-0.5 sm:px-1 py-0.5">
                          <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary" />
                          <span className="text-[8px] sm:text-[10px] font-semibold text-primary">
                            {propertyCount >= 1000 ? `${(propertyCount / 1000).toFixed(1)}K` : propertyCount}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Slim */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total Provinsi', value: '38', icon: MapPin },
            { label: 'Total Properti', value: '125.4K', icon: Building2 },
            { label: 'Kota Tersedia', value: '514', icon: Home },
            { label: 'Agen Aktif', value: '12.3K', icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-2 sm:p-3 flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-foreground leading-tight">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Region Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Wilayah Populer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { region: 'Jawa', provinces: ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'], properties: 42500, color: 'from-blue-500/20 to-blue-600/20' },
              { region: 'Sumatera', provinces: ['Sumatera Utara', 'Sumatera Barat', 'Riau'], properties: 18200, color: 'from-green-500/20 to-green-600/20' },
              { region: 'Kalimantan', provinces: ['Kalimantan Timur', 'Kalimantan Selatan'], properties: 12800, color: 'from-orange-500/20 to-orange-600/20' },
            ].map((item, index) => (
              <motion.div
                key={item.region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className={`bg-gradient-to-br ${item.color} border-border/50 hover:border-primary/30 transition-all hover:shadow-lg cursor-pointer`}>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-2">{item.region}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.provinces.slice(0, 3).map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                      {item.provinces.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.provinces.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.properties.toLocaleString()} properti
                      </span>
                      <Button size="sm" variant="ghost" className="h-8">
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
    </div>
  );
};

export default LocationMap;
