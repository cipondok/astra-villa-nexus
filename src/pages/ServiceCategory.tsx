import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Clock, Star, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PropertyServiceBooking from '@/components/property/PropertyServiceBooking';

const ServiceCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<{serviceId: string, vendorId: string} | null>(null);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
          <Button onClick={() => navigate('/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/services')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        </div>

        {/* Subcategories */}
        {category.vendor_subcategories && category.vendor_subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Service Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.vendor_subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{subcategory.icon || '🔧'}</span>
                      <h3 className="font-semibold text-foreground">{subcategory.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{subcategory.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Services */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Available Services</h2>
          
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-48 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{service.service_name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {service.service_description}
                        </CardDescription>
                      </div>
                      {service.featured && (
                        <Badge variant="secondary" className="ml-2">Featured</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Vendor Info */}
                    {service.vendor_business_profiles && (
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          {service.vendor_business_profiles.logo_url && (
                            <img
                              src={service.vendor_business_profiles.logo_url}
                              alt="Vendor Logo"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-foreground text-sm">
                              {service.vendor_business_profiles.business_name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">
                                {service.vendor_business_profiles.rating || '0.0'} 
                                ({service.vendor_business_profiles.total_reviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Details */}
                    <div className="space-y-2 mb-4">
                      {service.duration_value && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_value} {service.duration_unit || 'hours'}</span>
                        </div>
                      )}
                      
                      {service.service_location_city && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{service.service_location_city}</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    {service.price_range && (
                      <div className="mb-4">
                        <p className="text-lg font-semibold text-foreground">
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
                            className="flex-1"
                            onClick={() => setSelectedService({
                              serviceId: service.id,
                              vendorId: service.vendor_id
                            })}
                          >
                            Book Now
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
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Services Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no active services in this category.
                </p>
                <Button onClick={() => navigate('/services')}>
                  Explore Other Categories
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