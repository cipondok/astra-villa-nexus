import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Star, Clock, Shield, MapPin, DollarSign, ArrowLeft, Briefcase, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AgentTools from '@/components/agent/AgentTools';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const text = {
    en: {
      title: 'Professional Services',
      subtitle: 'Connect with verified professionals for all your property needs',
      agentTitle: 'Agent Tools & Services',
      agentSubtitle: 'Access your professional real estate tools and manage your property listings, clients, and business operations.',
      back: 'Back',
      allServices: 'All Services',
      noServices: 'No services available',
      noServicesDesc: 'No services are currently available. Check back soon!',
      noCategoryDesc: 'No services found in this category. Try selecting a different category.',
      viewDetails: 'View Details',
      needCustom: 'Need a Custom Service?',
      needCustomDesc: "Can't find what you're looking for? Contact us and we'll connect you with the right professional.",
      requestCustom: 'Request Custom Service',
      contactSupport: 'Contact Support',
      featured: 'Featured',
      verifiedVendors: 'Verified Vendors',
      verifiedVendorsDesc: 'All service providers are thoroughly vetted and verified',
      qualityGuarantee: 'Quality Guarantee',
      qualityGuaranteeDesc: '100% satisfaction guarantee on all services',
      insuredServices: 'Insured Services',
      insuredServicesDesc: 'All services covered by comprehensive insurance',
      support247: '24/7 Support',
      support247Desc: 'Round-the-clock customer support available'
    },
    id: {
      title: 'Layanan Profesional',
      subtitle: 'Terhubung dengan profesional terverifikasi untuk semua kebutuhan properti Anda',
      agentTitle: 'Alat & Layanan Agen',
      agentSubtitle: 'Akses alat real estate profesional Anda dan kelola listing properti, klien, dan operasi bisnis.',
      back: 'Kembali',
      allServices: 'Semua Layanan',
      noServices: 'Tidak ada layanan tersedia',
      noServicesDesc: 'Tidak ada layanan yang tersedia saat ini. Cek kembali nanti!',
      noCategoryDesc: 'Tidak ada layanan dalam kategori ini. Coba pilih kategori lain.',
      viewDetails: 'Lihat Detail',
      needCustom: 'Butuh Layanan Khusus?',
      needCustomDesc: 'Tidak menemukan yang Anda cari? Hubungi kami dan kami akan menghubungkan Anda dengan profesional yang tepat.',
      requestCustom: 'Minta Layanan Khusus',
      contactSupport: 'Hubungi Dukungan',
      featured: 'Unggulan',
      verifiedVendors: 'Vendor Terverifikasi',
      verifiedVendorsDesc: 'Semua penyedia layanan telah diperiksa dan diverifikasi',
      qualityGuarantee: 'Jaminan Kualitas',
      qualityGuaranteeDesc: 'Jaminan kepuasan 100% untuk semua layanan',
      insuredServices: 'Layanan Berasuransi',
      insuredServicesDesc: 'Semua layanan dilindungi asuransi komprehensif',
      support247: 'Dukungan 24/7',
      support247Desc: 'Dukungan pelanggan tersedia sepanjang waktu'
    }
  };

  const t = text[language];

  // If user is an agent, show agent tools instead of general services
  if (profile?.role === 'agent') {
    return (
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t.back}</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="hidden sm:inline">{t.agentTitle}</span>
                <span className="sm:hidden">Agent Tools</span>
              </h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              {t.agentSubtitle}
            </p>
          </div>
          <AgentTools />
        </div>
      </div>
    );
  }

  // Fetch main categories
  const { data: mainCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['vendor-main-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select(`
          *,
          vendor_subcategories (
            id,
            name,
            description,
            icon,
            display_order
          )
        `)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch vendor services
  const { data: vendorServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['vendor-services', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles!inner (
            business_name,
            business_type,
            rating,
            logo_url
          ),
          vendor_main_categories (
            name
          )
        `)
        .eq('is_active', true)
        .eq('admin_approval_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(12);

      if (selectedCategory) {
        query = query.eq('main_category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const features = [
    { icon: CheckCircle, title: t.verifiedVendors, description: t.verifiedVendorsDesc },
    { icon: Star, title: t.qualityGuarantee, description: t.qualityGuaranteeDesc },
    { icon: Shield, title: t.insuredServices, description: t.insuredServicesDesc },
    { icon: Clock, title: t.support247, description: t.support247Desc }
  ];

  const formatPrice = (priceRange: any) => {
    if (!priceRange) return 'Contact for pricing';
    if (priceRange.min && priceRange.max) {
      return `Rp ${priceRange.min.toLocaleString()} - Rp ${priceRange.max.toLocaleString()}`;
    }
    if (priceRange.fixed) {
      return `Rp ${priceRange.fixed.toLocaleString()}`;
    }
    return 'Contact for pricing';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t.back}</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>{t.title}</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-8">
        {/* Subtitle */}
        <div className="text-center mb-6 md:mb-8">
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-10">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-card border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-3 md:pt-5 pb-3 md:pb-5 px-2 md:px-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-[11px] md:text-sm">{feature.title}</h3>
                <p className="text-[9px] md:text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filter */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="h-7 md:h-9 text-[10px] md:text-sm px-2 md:px-4 rounded-full"
            >
              {t.allServices}
            </Button>
            {mainCategories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className="h-7 md:h-9 text-[10px] md:text-sm px-2 md:px-4 rounded-full"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Vendor Services Grid */}
        {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-8 md:mb-12">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden border-border">
                <CardContent className="p-0">
                  <Skeleton className="h-32 md:h-44 w-full" />
                  <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                    <Skeleton className="h-4 md:h-5 w-3/4" />
                    <Skeleton className="h-3 md:h-4 w-full" />
                    <Skeleton className="h-3 md:h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vendorServices && vendorServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-8 md:mb-12">
            {vendorServices.map((service) => (
              <Card 
                key={service.id} 
                className="overflow-hidden cursor-pointer border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 group active:scale-[0.98]"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <CardContent className="p-0">
                  {/* Service Image */}
                  <div className="relative h-32 md:h-44 bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden">
                    {service.service_images && service.service_images[0] ? (
                      <img 
                        src={service.service_images[0]} 
                        alt={service.service_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shield className="h-12 w-12 md:h-16 md:w-16 text-primary/20" />
                      </div>
                    )}
                    {service.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] md:text-xs px-1.5 md:px-2 py-0.5 shadow-md">
                        <Star className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 fill-current" />
                        {t.featured}
                      </Badge>
                    )}
                  </div>

                  {/* Service Details */}
                  <div className="p-3 md:p-4">
                    <div className="mb-2 md:mb-3">
                      <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {service.service_name}
                      </h3>
                      {service.vendor_main_categories && (
                        <Badge variant="secondary" className="text-[9px] md:text-xs px-1.5 py-0 bg-muted text-muted-foreground">
                          {service.vendor_main_categories.name}
                        </Badge>
                      )}
                    </div>

                    <p className="text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                      {service.service_description || 'Professional service provider'}
                    </p>

                    {/* Vendor Info */}
                    <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 md:pb-3 border-b border-border">
                      {service.vendor_business_profiles?.logo_url ? (
                        <img 
                          src={service.vendor_business_profiles.logo_url} 
                          alt={service.vendor_business_profiles.business_name}
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-sm font-medium text-foreground truncate">
                          {service.vendor_business_profiles?.business_name}
                        </p>
                        {service.vendor_business_profiles?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[9px] md:text-xs text-muted-foreground">
                              {service.vendor_business_profiles.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Location */}
                    <div className="space-y-1 md:space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs md:text-sm">
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                        <span className="font-semibold text-primary text-[10px] md:text-sm">
                          {formatPrice(service.price_range)}
                        </span>
                      </div>
                      {(service.service_location_city || service.service_location_state) && (
                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          <span className="truncate">
                            {[service.service_location_city, service.service_location_state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-3 h-8 md:h-9 text-xs md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                      {t.viewDetails}
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-6 md:p-10 mb-8 md:mb-12 border-border bg-card">
            <CardContent className="p-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">
                {t.noServices}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {selectedCategory ? t.noCategoryDesc : t.noServicesDesc}
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="text-center border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="pt-5 md:pt-8 pb-5 md:pb-8 px-4 md:px-6">
            <h2 className="text-base md:text-xl font-bold text-foreground mb-2 md:mb-3">
              {t.needCustom}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto">
              {t.needCustomDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
              <Button size="sm" className="h-9 md:h-10 px-4 md:px-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                {t.requestCustom}
              </Button>
              <Button variant="outline" size="sm" className="h-9 md:h-10 px-4 md:px-6 border-border">
                {t.contactSupport}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;
