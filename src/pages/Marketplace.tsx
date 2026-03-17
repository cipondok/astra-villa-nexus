import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Store, Wrench, Paintbrush, Hammer, Zap, Droplets, Shield, TreePine,
  Search, ArrowLeft, Lock, Star, Users, Sofa, Tv, Wifi, MapPin,
  Filter, ChevronRight, Sparkles, LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface FallbackCategory {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  vendorCount: number;
}

const fallbackCategories: FallbackCategory[] = [
  { id: 'repair', icon: Wrench, title: 'Perbaikan & Perawatan', description: 'Jasa perbaikan rumah profesional', vendorCount: 45 },
  { id: 'plumbing', icon: Droplets, title: 'Plumbing', description: 'Instalasi dan perbaikan pipa', vendorCount: 25 },
  { id: 'electrical', icon: Zap, title: 'Instalasi Listrik', description: 'Tukang listrik berlisensi', vendorCount: 28 },
  { id: 'renovation', icon: Hammer, title: 'Renovasi & Konstruksi', description: 'Kontraktor bangunan profesional', vendorCount: 38 },
  { id: 'interior', icon: Paintbrush, title: 'Desain Interior', description: 'Desainer interior berpengalaman', vendorCount: 32 },
  { id: 'furniture', icon: Sofa, title: 'Penjualan Furniture', description: 'Supplier furniture berkualitas', vendorCount: 35 },
  { id: 'electronics', icon: Tv, title: 'Elektronik & Appliances', description: 'Peralatan rumah tangga terbaik', vendorCount: 20 },
  { id: 'smarthome', icon: Wifi, title: 'Smart Home Installation', description: 'Instalasi rumah pintar modern', vendorCount: 15 },
  { id: 'landscaping', icon: TreePine, title: 'Landscaping', description: 'Taman dan lanskap profesional', vendorCount: 22 },
  { id: 'security', icon: Shield, title: 'Sistem Keamanan', description: 'Instalasi CCTV & alarm', vendorCount: 18 },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState('');
  const cameFromHome = searchParams.get('from') === 'home';

  // Fetch real categories from DB
  const { data: dbCategories, isLoading: catLoading } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('id, name, description, icon, slug')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured vendors
  const { data: featuredVendors = [] } = useQuery({
    queryKey: ['marketplace-featured-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select('vendor_id, business_name, logo_url, rating, total_reviews, is_verified, about_business, vendor_main_categories(name, icon)')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  const handleBackToHome = () => {
    sessionStorage.setItem('scrollToSection', 'marketplace-services-section');
    navigate('/');
  };

  // Use DB categories if available, else fallback
  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.map(c => ({
        id: c.id,
        title: c.name,
        description: c.description || '',
        icon: c.icon || '🔧',
        isDbCategory: true,
      }))
    : fallbackCategories.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        icon: null,
        lucideIcon: c.icon,
        vendorCount: c.vendorCount,
        isDbCategory: false,
      }));

  const filteredCategories = categories.filter(c => {
    if (selectedCategory && c.id !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="rounded-2xl border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">Autentikasi Diperlukan</h2>
                <p className="text-sm text-muted-foreground">Login untuk mengakses marketplace</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/auth?mode=login')} className="flex-1 rounded-xl h-10">Login</Button>
                <Button onClick={() => navigate('/auth?mode=signup')} variant="outline" className="flex-1 rounded-xl h-10">Daftar</Button>
              </div>
              <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="w-full text-xs">← Kembali</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {cameFromHome && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleBackToHome}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" /> Marketplace
              </h1>
              <p className="text-[10px] text-muted-foreground">Layanan properti terpercaya</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs" onClick={() => navigate('/vendor-registration')}>
            Jadi Vendor
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-6xl space-y-5">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari layanan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-border/50 bg-card"
            />
          </div>
          {selectedCategory && (
            <Button variant="outline" size="sm" className="rounded-xl h-10 text-xs" onClick={() => setSelectedCategory(null)}>
              <Filter className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={!selectedCategory ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs rounded-full active:scale-95 transition-transform"
            onClick={() => setSelectedCategory(null)}
          >
            Semua
          </Badge>
          {categories.slice(0, 8).map(cat => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1 text-xs rounded-full active:scale-95 transition-transform"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.title}
            </Badge>
          ))}
        </div>

        {/* Categories Grid */}
        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredCategories.map(cat => {
              const LucideIcon = (cat as any).lucideIcon;
              return (
                <Card
                  key={cat.id}
                  className="rounded-2xl border-border/30 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.97] group"
                  onClick={() => {
                    if (cat.isDbCategory) {
                      navigate(`/services/category/${cat.id}`);
                    } else {
                      navigate(`/marketplace/category/${cat.id}`);
                    }
                  }}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2.5 group-hover:bg-primary/20 transition-colors">
                      {cat.icon ? (
                        <span className="text-2xl">{cat.icon}</span>
                      ) : LucideIcon ? (
                        <LucideIcon className="h-6 w-6 text-primary" />
                      ) : (
                        <Store className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{cat.description}</p>
                    {(cat as any).vendorCount && (
                      <Badge variant="secondary" className="mt-2 text-[9px] px-1.5 py-0">
                        {(cat as any).vendorCount} vendor
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredCategories.length === 0 && !catLoading && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">Tidak ada layanan ditemukan</h3>
            <p className="text-xs text-muted-foreground mb-3">Coba ubah pencarian</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
              Reset Filter
            </Button>
          </div>
        )}

        {/* Featured Vendors */}
        {featuredVendors.length > 0 && !selectedCategory && (
          <div>
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-primary" /> Vendor Terpercaya
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featuredVendors.map((v: any) => (
                <Card
                  key={v.vendor_id}
                  className="rounded-2xl border-border/30 cursor-pointer hover:border-primary/20 hover:shadow-md transition-all active:scale-[0.98]"
                  onClick={() => navigate(`/vendor/${v.vendor_id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      {v.logo_url ? (
                        <img src={v.logo_url} alt={v.business_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-lg font-bold">
                          {v.business_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-foreground truncate">{v.business_name}</h4>
                        {v.is_verified && <Shield className="h-3.5 w-3.5 text-chart-2 flex-shrink-0" />}
                      </div>
                      {v.vendor_main_categories && (
                        <p className="text-[10px] text-muted-foreground">{v.vendor_main_categories.icon} {v.vendor_main_categories.name}</p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-gold-primary text-gold-primary" />
                        <span className="text-xs font-medium">{v.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-[10px] text-muted-foreground">({v.total_reviews || 0})</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <Card className="rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-5 text-center">
            <h3 className="text-base font-bold mb-1">Anda penyedia layanan?</h3>
            <p className="text-xs text-muted-foreground mb-4">Bergabung dan jangkau ribuan pemilik properti</p>
            <Button onClick={() => navigate('/vendor-registration')} className="rounded-xl h-10 px-6 shadow-md">
              <Store className="h-4 w-4 mr-2" /> Daftar sebagai Vendor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Marketplace;
