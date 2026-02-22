import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Home, TrendingUp, Search, Filter, ChevronRight, ArrowLeft, Loader2, Navigation2, Globe2, Star, Layers } from 'lucide-react';
import { IndonesiaMap, Province } from '@/components/location/IndonesiaMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProvincePropertyCounts, useTotalPropertyCount } from '@/hooks/useProvincePropertyCounts';
import ProvincePropertiesModal from '@/components/location/ProvincePropertiesModal';
import { useLastSelectedProvince } from '@/hooks/useLastSelectedProvince';

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

// Vivid color palette for province badges
const badgeColors = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-400/30 hover:bg-blue-500/25',
  'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-400/30 hover:bg-violet-500/25',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/25',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/30 hover:bg-amber-500/25',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-400/30 hover:bg-rose-500/25',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/25',
  'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-400/30 hover:bg-orange-500/25',
  'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-400/30 hover:bg-pink-500/25',
];

const getBadgeColor = (index: number) => badgeColors[index % badgeColors.length];

const LocationMap = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { lastProvince, saveLastProvince } = useLastSelectedProvince();

  const { data: provincePropertyCounts = {}, isLoading: isLoadingCounts } = useProvincePropertyCounts();
  const { data: totalProperties = 0, isLoading: isLoadingTotal } = useTotalPropertyCount();

  const isLoading = isLoadingCounts || isLoadingTotal;

  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPropertyCount = (provinceName: string): number => {
    return provincePropertyCounts[provinceName] || 0;
  };

  const popularProvinces = [
    { id: 'bali', name: 'Bali', icon: Star, gradient: 'from-amber-500 to-orange-500' },
    { id: 'jabar', name: 'Jawa Barat', icon: Home, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'jakarta', name: 'DKI Jakarta', icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'jatim', name: 'Jawa Timur', icon: Building2, gradient: 'from-violet-500 to-purple-500' },
    { id: 'yogya', name: 'Yogyakarta', icon: Home, gradient: 'from-rose-500 to-pink-500' },
    { id: 'jateng', name: 'Jawa Tengah', icon: Building2, gradient: 'from-cyan-500 to-sky-500' },
  ].map(p => ({ ...p, properties: getPropertyCount(p.name) }));

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province.id);
    setSelectedProvinceName(province.name);
    saveLastProvince({ id: province.id, name: province.name, code: province.code || '' });
    setIsModalOpen(true);
  };

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    setSelectedProvince(provinceId);
    setSelectedProvinceName(provinceName);
    saveLastProvince({ id: provinceId, name: provinceName, code: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const stats = [
    { label: 'Total Provinsi', value: '38', icon: Globe2, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Properti', value: isLoading ? '...' : totalProperties.toLocaleString(), icon: Building2, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Provinsi Aktif', value: Object.keys(provincePropertyCounts).length.toString(), icon: MapPin, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Agen Aktif', value: '12.3K', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="Peta Properti Indonesia"
        description="Jelajahi properti di seluruh 34 provinsi Indonesia. Temukan properti impian Anda berdasarkan lokasi dengan peta interaktif."
        keywords="peta properti indonesia, properti per provinsi, lokasi properti, peta real estate"
      />
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-emerald-500/8 dark:bg-emerald-500/12 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-amber-500/8 dark:bg-amber-500/12 blur-3xl" />
      </div>

      <main className="container mx-auto px-4 py-6">

        {/* ── HERO HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Badge pill */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Jelajahi Lokasi</span>
          </motion.div>

          <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight">
            <span className="bg-gradient-to-r from-primary via-cyan-500 to-violet-500 bg-clip-text text-transparent">
              Peta Properti
            </span>{' '}
            <span className="text-foreground">Indonesia</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Temukan properti impian Anda di seluruh Indonesia. Klik pada peta untuk melihat properti per provinsi.
          </p>

          {/* Last Selected Province */}
          {lastProvince && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-4"
            >
              <button
                onClick={() => handleProvinceClick(lastProvince.id, lastProvince.name)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-400/40 bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-500/20 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                <Navigation2 className="h-4 w-4" />
                <span className="opacity-70">Lokasi Anda:</span>
                <span className="font-bold">{lastProvince.name}</span>
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ── QUICK STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06 }}
            >
              <Card className="border border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group">
                <CardContent className="p-4 flex items-center gap-3 relative">
                  {/* Gradient accent strip */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient}`} />
                  <div className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-5 w-5 ${stat.text}`} />
                  </div>
                  <div>
                    <p className={`text-lg sm:text-xl font-black leading-tight ${stat.text}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── MAP ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-card/60 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Peta Interaktif Indonesia</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span>Klik provinsi untuk detail</span>
            </div>
          </div>
          <IndonesiaMap
            onProvinceSelect={handleProvinceSelect}
            selectedProvince={selectedProvince}
            userProvince={lastProvince?.id || null}
          />
        </motion.div>

        {/* ── POPULAR PROVINCES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Provinsi Populer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {popularProvinces.map((province, index) => {
              const maxCount = Math.max(...popularProvinces.map(p => p.properties), 1);
              const percentage = (province.properties / maxCount) * 100;
              return (
                <motion.div
                  key={province.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleProvinceClick(province.id, province.name)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border backdrop-blur-sm overflow-hidden relative group ${
                    selectedProvince === province.id
                      ? 'border-primary shadow-lg shadow-primary/20 bg-primary/10'
                      : 'bg-card/70 border-border/60 hover:border-primary/40 hover:shadow-md'
                  }`}
                >
                  {/* gradient accent top */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${province.gradient} opacity-80`} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground truncate pr-1">{province.name}</span>
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${province.gradient} flex items-center justify-center shrink-0`}>
                      <province.icon className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${province.gradient}`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {province.properties.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold bg-gradient-to-r ${province.gradient} bg-clip-text text-transparent`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── ALL PROVINCES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <Card className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {/* Header + search */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 shrink-0">
                  <Filter className="h-4 w-4 text-primary" />
                  Semua Provinsi
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari provinsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm bg-background/80 border-border/60 rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              {/* Province chips */}
              <div className="flex flex-wrap gap-2">
                {filteredProvinces.map((province, index) => {
                  const propertyCount = getPropertyCount(province.name);
                  const isSelected = selectedProvince === province.id;
                  return (
                    <motion.button
                      key={province.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleProvinceClick(province.id, province.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30'
                          : `${getBadgeColor(index)} border`
                      }`}
                    >
                      <span>{province.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-current/10 opacity-80'
                      }`}>
                        {propertyCount >= 1000 ? `${(propertyCount / 1000).toFixed(1)}K` : propertyCount}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── REGION CARDS ── */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            Wilayah Populer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                region: 'Jawa',
                emoji: '🏙️',
                provinces: ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'],
                properties: 42500,
                gradient: 'from-primary to-chart-4',
                bg: 'bg-primary/5 dark:bg-primary/15',
                border: 'border-primary/25',
                text: 'text-primary',
              },
              {
                region: 'Sumatera',
                emoji: '🌴',
                provinces: ['Sumatera Utara', 'Sumatera Barat', 'Riau', 'Lampung'],
                properties: 18200,
                gradient: 'from-chart-1 to-chart-4',
                bg: 'bg-chart-1/5 dark:bg-chart-1/15',
                border: 'border-chart-1/25',
                text: 'text-chart-1',
              },
              {
                region: 'Kalimantan',
                emoji: '🌿',
                provinces: ['Kalimantan Timur', 'Kalimantan Selatan', 'Kalimantan Barat'],
                properties: 12800,
                gradient: 'from-gold-primary to-chart-3',
                bg: 'bg-gold-primary/5 dark:bg-gold-primary/15',
                border: 'border-gold-primary/25',
                text: 'text-gold-primary',
              },
            ].map((item, index) => (
              <motion.div
                key={item.region}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`${item.bg} ${item.border} border rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group`}>
                  <CardContent className="p-5">
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} rounded-t-2xl`} />
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-2xl mr-2">{item.emoji}</span>
                        <h3 className="font-black text-lg text-foreground inline">{item.region}</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-primary-foreground shadow-sm`}>
                        {(item.properties / 1000).toFixed(1)}K+
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.provinces.slice(0, 3).map((p) => (
                        <span key={p} className={`text-xs px-2.5 py-0.5 rounded-full border ${item.border} ${item.bg} ${item.text} font-medium`}>
                          {p}
                        </span>
                      ))}
                      {item.provinces.length > 3 && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border border-border/40 text-muted-foreground font-medium`}>
                          +{item.provinces.length - 3}
                        </span>
                      )}
                    </div>
                    <div className={`h-1 rounded-full bg-gradient-to-r ${item.gradient} opacity-30 mb-3`} />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        {item.properties.toLocaleString()} properti
                      </span>
                      <button className={`flex items-center gap-1 text-xs font-bold ${item.text} group-hover:gap-2 transition-all duration-200`}>
                        Jelajahi
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
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
