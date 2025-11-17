import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Star, Clock, Shield, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AgentTools from '@/components/agent/AgentTools';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Services = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // If user is an agent, show agent tools instead of general services
  if (profile?.role === 'agent') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Agent Tools & Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access your professional real estate tools and manage your property listings, clients, and business operations.
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

  const getIconForCategory = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'Property Services': Shield,
      'Home & Lifestyle Services': CheckCircle,
      'Lifestyle & Daily Needs': Clock,
      'Vendor & Client Marketplace': Users,
      'Extra Value Services': Star
    };
    return iconMap[categoryName] || CheckCircle;
  };

  const getColorForCategory = (index: number) => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500', 
      'bg-orange-500',
      'bg-purple-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  const features = [
    { icon: CheckCircle, title: "Verified Vendors", description: "All service providers are thoroughly vetted and verified" },
    { icon: Star, title: "Quality Guarantee", description: "100% satisfaction guarantee on all services" },
    { icon: Shield, title: "Insured Services", description: "All services covered by comprehensive insurance" },
    { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer support available" }
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-8">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
            Professional Services
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with verified professionals for all your property needs
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-3 md:pt-6 pb-3 md:pb-6 px-2 md:px-6">
                <feature.icon className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto mb-2 md:mb-4" />
                <h3 className="font-semibold text-foreground mb-1 md:mb-2 text-xs md:text-base">{feature.title}</h3>
                <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filter */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="h-7 md:h-9 text-[10px] md:text-sm px-2 md:px-3"
            >
              All Services
            </Button>
            {mainCategories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className="h-7 md:h-9 text-[10px] md:text-sm px-2 md:px-3"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Vendor Services Grid */}
        {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-16">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-32 md:h-48 w-full" />
                  <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                    <Skeleton className="h-4 md:h-6 w-3/4" />
                    <Skeleton className="h-3 md:h-4 w-full" />
                    <Skeleton className="h-3 md:h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vendorServices && vendorServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-16">
            {vendorServices.map((service) => (
              <Card 
                key={service.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group active:scale-95"
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <CardContent className="p-0">
                  {/* Service Image */}
                  <div className="relative h-32 md:h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                    {service.service_images && service.service_images[0] ? (
                      <img 
                        src={service.service_images[0]} 
                        alt={service.service_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shield className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                    {service.featured && (
                      <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-primary text-[9px] md:text-xs px-1.5 md:px-2 py-0.5">
                        <Star className="h-2 w-2 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Service Details */}
                  <div className="p-3 md:p-4">
                    <div className="mb-2 md:mb-3">
                      <h3 className="font-semibold text-sm md:text-lg text-foreground mb-1 line-clamp-1">
                        {service.service_name}
                      </h3>
                      {service.vendor_main_categories && (
                        <Badge variant="outline" className="text-[9px] md:text-xs px-1.5 py-0">
                          {service.vendor_main_categories.name}
                        </Badge>
                      )}
                    </div>

                    <p className="text-[11px] md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-2">
                      {service.service_description || 'Professional service provider'}
                    </p>

                    {/* Vendor Info */}
                    <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 md:pb-3 border-b border-border">
                      {service.vendor_business_profiles?.logo_url ? (
                        <img 
                          src={service.vendor_business_profiles.logo_url} 
                          alt={service.vendor_business_profiles.business_name}
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] md:text-sm font-medium text-foreground truncate">
                          {service.vendor_business_profiles?.business_name}
                        </p>
                        {service.vendor_business_profiles?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] md:text-xs text-muted-foreground">
                              {service.vendor_business_profiles.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Location */}
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        <span className="font-semibold text-primary text-[11px] md:text-sm">
                          {formatPrice(service.price_range)}
                        </span>
                      </div>
                      {(service.service_location_city || service.service_location_state) && (
                        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate text-[10px] md:text-xs">
                            {[service.service_location_city, service.service_location_state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-3 md:mt-4 h-8 md:h-10 text-xs md:text-sm" variant="outline">
                      View Details
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-6 md:p-12 mb-8 md:mb-16">
            <CardContent>
              <Shield className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">
                No services available
              </h3>
              <p className="text-xs md:text-base text-muted-foreground">
                {selectedCategory 
                  ? 'No services found in this category. Try selecting a different category.'
                  : 'No services are currently available. Check back soon!'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-4 md:pt-8 pb-4 md:pb-8 px-4">
            <h2 className="text-base md:text-2xl font-bold text-foreground mb-2 md:mb-4">
              Need a Custom Service?
            </h2>
            <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Contact us and we'll connect you with the right professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
              <Button size="sm" className="md:text-base h-9 md:h-11">
                Request Custom Service
              </Button>
              <Button variant="outline" size="sm" className="md:text-base h-9 md:h-11">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;