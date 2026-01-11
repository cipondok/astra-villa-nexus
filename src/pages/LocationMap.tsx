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

// Multi-color palette for provinces (same as map) - muted/softer colors
const provinceColors = [
  'hsl(45, 45%, 75%)',   // Gold
  'hsl(200, 40%, 70%)',  // Blue
  'hsl(150, 35%, 68%)',  // Teal
  'hsl(280, 35%, 72%)',  // Purple
  'hsl(15, 45%, 70%)',   // Orange
  'hsl(340, 40%, 72%)',  // Pink
  'hsl(180, 35%, 65%)',  // Cyan
  'hsl(100, 30%, 68%)',  // Green
  'hsl(35, 50%, 72%)',   // Amber
  'hsl(260, 35%, 70%)',  // Violet
  'hsl(170, 35%, 65%)',  // Emerald
  'hsl(5, 40%, 70%)',    // Red
];

const getProvinceColor = (index: number) => provinceColors[index % provinceColors.length];

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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Jelajahi Lokasi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Peta Properti Indonesia
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan properti impian Anda di seluruh Indonesia. Klik pada peta untuk melihat properti di setiap provinsi.
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
                <div className="flex flex-wrap gap-1.5">
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
                        className={`flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer transition-colors ${
                          selectedProvince === province.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:opacity-80'
                        }`}
                      >
                        <province.icon className="h-2.5 w-2.5" />
                        <span className="text-xs font-medium">{province.name}</span>
                        <Badge variant={selectedProvince === province.id ? "secondary" : "outline"} className="text-[10px] px-1 py-0 h-4 bg-background/60">
                          {province.properties.toLocaleString()}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* All Provinces - Wrap */}
              <div>
                <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Filter className="h-3 w-3 text-primary" />
                  Semua Provinsi
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {filteredProvinces.map((province) => {
                    const colorIndex = provinces.findIndex(p => p.id === province.id);
                    const bgColor = getProvinceColor(colorIndex);
                    return (
                      <motion.div
                        key={province.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleProvinceClick(province.id, province.name)}
                        style={{
                          backgroundColor: selectedProvince === province.id ? undefined : bgColor,
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                          selectedProvince === province.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:opacity-80'
                        }`}
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="text-xs">{province.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Provinsi', value: '38', icon: MapPin },
            { label: 'Total Properti', value: '125.4K', icon: Building2 },
            { label: 'Kota Tersedia', value: '514', icon: Home },
            { label: 'Agen Aktif', value: '12.3K', icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
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
