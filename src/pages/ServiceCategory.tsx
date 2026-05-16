import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Clock, Star, Phone, Mail, Layers, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PropertyServiceBooking from '@/components/property/PropertyServiceBooking';
import { useTranslation } from '@/i18n/useTranslation';

const ServiceCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [selectedService, setSelectedService] = useState<{serviceId: string, vendorId: string} | null>(null);

  const text = {
    en: {
      back: 'Back to Services',
      serviceCategories: 'Service Categories',
      availableServices: 'Available Services',
      noServicesTitle: 'No Services Available',
      noServicesDesc: 'There are currently no active services in this category.',
      exploreOther: 'Explore Other Categories',
      categoryNotFound: 'Category Not Found',
      bookNow: 'Book Now',
      featured: 'Featured',
      reviews: 'reviews'
    },
    id: {
      back: 'Kembali ke Layanan',
      serviceCategories: 'Kategori Layanan',
      availableServices: 'Layanan Tersedia',
      noServicesTitle: 'Tidak Ada Layanan',
      noServicesDesc: 'Saat ini tidak ada layanan aktif dalam kategori ini.',
      exploreOther: 'Jelajahi Kategori Lain',
      categoryNotFound: 'Kategori Tidak Ditemukan',
      bookNow: 'Pesan Sekarang',
      featured: 'Unggulan',
      reviews: 'ulasan'
    }
  };

  const t = text[language] || text.en;

  // Fetch category details and services
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['vendor-category', categoryId],
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
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });

  // Fetch services in this category
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['category-services', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select(`
          *,
          vendor_business_profiles (
            business_name,
            rating,
            total_reviews,
            logo_url,
            business_phone,
            business_email,
            service_areas
          )
        `)
        .eq('main_category_id', categoryId)
        .eq('is_active', true)
        .eq('admin_approval_status', 'approved')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 py-3">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8 max-w-md border-border">
          <CardContent className="p-0">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-4">{t.categoryNotFound}</h1>
            <Button onClick={() => navigate('/services')} className="bg-primary text-primary-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
          <Link to="/services">
            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t.back}</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground truncate">
            <span className="text-xl">{category.icon || '📦'}</span>
            <span className="truncate">{category.name}</span>
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-8">
        {/* Category Description */}
        <div className="mb-6 md:mb-8">
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        </div>

        {/* Subcategories */}
        {category.vendor_subcategories && category.vendor_subcategories.length > 0 && (
          <div className="mb-8 md:mb-10">
            <h2 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              {t.serviceCategories}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {category.vendor_subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="cursor-pointer border-border bg-card hover:shadow-md hover:border-primary/30 transition-all group">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-xl md:text-2xl">
                        {subcategory.icon || '🔧'}
                      </div>
                      <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                        {subcategory.name}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{subcategory.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Services */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            {t.availableServices}
          </h2>
          
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-border">
                  <CardContent className="p-4 md:p-5">
                    <div className="h-40 md:h-48 bg-muted rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm md:text-base line-clamp-2 text-foreground">
                          {service.service_name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 text-xs md:text-sm">
                          {service.service_description}
                        </CardDescription>
                      </div>
                      {service.featured && (
                        <Badge className="bg-primary text-primary-foreground text-[9px] md:text-xs px-1.5 py-0.5 flex-shrink-0">
                          <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                          {t.featured}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Vendor Info */}
                    {service.vendor_business_profiles && (
                      <div className="mb-3 md:mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2 md:gap-3">
                          {service.vendor_business_profiles.logo_url ? (
                            <img
                              src={service.vendor_business_profiles.logo_url}
                              alt="Vendor Logo"
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-border"
                            />
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {service.vendor_business_profiles.business_name?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-xs md:text-sm truncate">
                              {service.vendor_business_profiles.business_name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-gold-primary text-gold-primary" />
                              <span className="text-[10px] md:text-xs text-muted-foreground">
                                {service.vendor_business_profiles.rating || '0.0'} 
                                ({service.vendor_business_profiles.total_reviews || 0} {t.reviews})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Details */}
                    <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                      {service.duration_value && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                          <span>{service.duration_value} {service.duration_unit || 'hours'}</span>
                        </div>
                      )}
                      
                      {service.service_location_city && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                          <span>{service.service_location_city}</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    {service.price_range && (
                      <div className="mb-3 md:mb-4 p-2 md:p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-sm md:text-base font-semibold text-primary">
                          {typeof service.price_range === 'object' && service.price_range !== null && !Array.isArray(service.price_range)
                            ? `IDR ${(service.price_range as any).min?.toLocaleString() || 'N/A'} - ${(service.price_range as any).max?.toLocaleString() || 'N/A'}`
                            : String(service.price_range)
                          }
                        </p>
                      </div>
                    )}

                    {/* Contact Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1 h-8 md:h-9 text-xs md:text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setSelectedService({
                              serviceId: service.id,
                              vendorId: service.vendor_id
                            })}
                          >
                            {t.bookNow}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          {selectedService && (
                            <PropertyServiceBooking
                              serviceId={selectedService.serviceId}
                              vendorId={selectedService.vendorId}
                              onClose={() => setSelectedService(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="h-8 md:h-9 px-2 md:px-3 border-border">
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 md:h-9 px-2 md:px-3 border-border">
                        <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-10 md:py-14 border-border bg-card">
              <CardContent className="p-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{t.noServicesTitle}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-5">
                  {t.noServicesDesc}
                </p>
                <Button onClick={() => navigate('/services')} className="bg-primary text-primary-foreground">
                  {t.exploreOther}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCategory;
