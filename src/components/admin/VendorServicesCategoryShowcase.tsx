
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Star, MapPin, Clock, DollarSign, Users, Zap } from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  main_category_id: string;
  display_order: number;
  is_active: boolean;
}

interface VendorService {
  id: string;
  service_name: string;
  service_description: string;
  main_category_id: string;
  subcategory_id: string;
  price_range: any;
  duration_minutes: number;
  location_type: string;
  is_active: boolean;
  featured: boolean;
}

const VendorServicesCategoryShowcase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch main categories
  const { data: mainCategories } = useQuery({
    queryKey: ['main-categories-showcase'],
    queryFn: async (): Promise<MainCategory[]> => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subcategories
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories-showcase'],
    queryFn: async (): Promise<Subcategory[]> => {
      const { data, error } = await supabase
        .from('vendor_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch vendor services
  const { data: vendorServices } = useQuery({
    queryKey: ['vendor-services-showcase'],
    queryFn: async (): Promise<VendorService[]> => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getSubcategoriesForMain = (mainCategoryId: string) => {
    return subcategories?.filter(sub => sub.main_category_id === mainCategoryId) || [];
  };

  const getServicesForSubcategory = (subcategoryId: string) => {
    return vendorServices?.filter(service => service.subcategory_id === subcategoryId) || [];
  };

  const formatPrice = (priceRange: any) => {
    if (!priceRange) return 'Price on request';
    
    if (typeof priceRange === 'object' && priceRange.min !== undefined) {
      if (priceRange.min === priceRange.max) {
        return `$${priceRange.min}`;
      }
      return `$${priceRange.min} - $${priceRange.max}`;
    }
    
    return 'Price on request';
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return 'Duration varies';
    
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'on_site': return '🏠';
      case 'pickup_delivery': return '🚚';
      case 'business_location': return '🏢';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vendor Services Categories
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive marketplace for all your service needs - from property services to subscription plans
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{mainCategories?.length || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subcategories</p>
                <p className="text-2xl font-bold">{subcategories?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-2xl font-bold">{vendorServices?.length || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{vendorServices?.filter(s => s.featured).length || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Categories Showcase */}
      <Tabs value={selectedCategory || mainCategories?.[0]?.id} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {mainCategories?.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <span className="text-lg">{category.icon}</span>
              <span className="hidden md:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {mainCategories?.map((mainCategory) => (
          <TabsContent key={mainCategory.id} value={mainCategory.id} className="space-y-6">
            {/* Category Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                    {mainCategory.icon}
                  </div>
                </div>
                <CardTitle className="text-3xl">{mainCategory.name}</CardTitle>
                <CardDescription className="text-lg">{mainCategory.description}</CardDescription>
              </CardHeader>
            </Card>

            {/* Subcategories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getSubcategoriesForMain(mainCategory.id).map((subcategory) => {
                const services = getServicesForSubcategory(subcategory.id);
                
                return (
                  <Card key={subcategory.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{subcategory.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                            <Badge variant="secondary">{services.length} services</Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription>{subcategory.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Services List */}
                      {services.length > 0 ? (
                        <div className="space-y-3">
                          {services.slice(0, 2).map((service) => (
                            <div key={service.id} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm">{service.service_name}</h4>
                                {service.featured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {service.service_description}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{formatPrice(service.price_range)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(service.duration_minutes)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <span>{getLocationIcon(service.location_type)}</span>
                                  <span className="capitalize">{service.location_type.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {services.length > 2 && (
                            <Button variant="outline" size="sm" className="w-full">
                              View {services.length - 2} more services
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No services available yet</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Add First Service
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Featured Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Services
          </CardTitle>
          <CardDescription>
            Popular and recommended services across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorServices?.filter(service => service.featured).map((service) => {
              const subcategory = subcategories?.find(sub => sub.id === service.subcategory_id);
              const mainCategory = mainCategories?.find(main => main.id === service.main_category_id);
              
              return (
                <Card key={service.id} className="border-2 border-yellow-200 bg-yellow-50/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{subcategory?.icon || mainCategory?.icon}</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mainCategory?.name}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2">{service.service_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.service_description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{formatPrice(service.price_range)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-blue-600">
                        <MapPin className="h-4 w-4" />
                        <span>{getLocationIcon(service.location_type)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorServicesCategoryShowcase;
