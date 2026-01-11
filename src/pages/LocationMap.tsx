import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Home, TrendingUp, Search, Filter, ChevronRight } from 'lucide-react';
import { IndonesiaMap, provinces, Province } from '@/components/location/IndonesiaMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Province List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari provinsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Popular Provinces */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Populer
                  </h3>
                  <div className="space-y-2">
                    {popularProvinces.map((province) => (
                      <motion.div
                        key={province.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProvinceClick(province.id, province.name)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProvince === province.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <province.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{province.name}</span>
                        </div>
                        <Badge variant={selectedProvince === province.id ? "secondary" : "outline"} className="text-xs">
                          {province.properties.toLocaleString()}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* All Provinces */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    Semua Provinsi
                  </h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1 pr-3">
                      {filteredProvinces.map((province) => (
                        <motion.div
                          key={province.id}
                          whileHover={{ x: 4 }}
                          onClick={() => handleProvinceClick(province.id, province.name)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedProvince === province.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{province.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <IndonesiaMap 
              onProvinceSelect={handleProvinceSelect}
              selectedProvince={selectedProvince}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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
            <div className="mt-8">
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
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LocationMap;
