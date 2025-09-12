import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Star, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AgentTools from '@/components/agent/AgentTools';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Services = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

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
  // Fetch main categories and subcategories from database
  const { data: mainCategories, isLoading } = useQuery({
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

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Professional Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with verified professionals for all your property needs. From maintenance to renovations, we have trusted experts ready to help.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-20 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {mainCategories?.map((category, index) => {
              const IconComponent = getIconForCategory(category.name);
              return (
                <Card key={category.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200" 
                      onClick={() => navigate(`/services/category/${category.id}`)}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getColorForCategory(index)} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.vendor_subcategories?.slice(0, 3).map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                          <span className="text-lg">{subcategory.icon || '🔧'}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm">{subcategory.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{subcategory.description}</p>
                          </div>
                        </div>
                      ))}
                      {(category.vendor_subcategories?.length || 0) > 3 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" className="text-primary w-full">
                            View {(category.vendor_subcategories?.length || 0) - 3} more services →
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Need a Custom Service?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Contact us and we'll connect you with the right professional for your specific needs.
            </p>
            <Button size="lg" className="mr-4">
              Request Custom Service
            </Button>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      </div>
  );
};

export default Services;