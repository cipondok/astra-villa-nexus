import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, Edit, Plus, MapPin, DollarSign, TrendingUp, Activity } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { useState } from "react";

const MyProperties = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?auth=true');
    }
    if (isAuthenticated && profile?.role === 'general_user') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['my-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleCreateProperty = () => {
    navigate('/add-property');
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}/edit`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `Rp ${price?.toLocaleString()}/month`;
    }
    return `Rp ${price?.toLocaleString()}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with 60% transparency */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 backdrop-blur-sm -z-10"></div>
      
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={() => setLanguage(prev => prev === "en" ? "id" : "en")}
          theme={theme}
          onThemeToggle={() => setTheme(prev => prev === "light" ? "dark" : "light")}
        />
      </div>

      {/* Main Content */}
      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white rounded-2xl overflow-hidden shadow-2xl mb-8">
            <div className="relative p-8">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Properties</h1>
                        <p className="text-blue-100 text-lg">Property Portfolio Management</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                        <Activity className="h-4 w-4 mr-2" />
                        {properties?.length || 0} Properties
                      </Badge>
                      <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                        {profile?.role?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCreateProperty}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/25"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Property
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading your properties...</p>
                </div>
              </CardContent>
            </Card>
          ) : properties?.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">No Properties Listed</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start building your property portfolio by creating your first listing
                </p>
                <Button onClick={handleCreateProperty} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {property.images?.[0] ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge variant={getStatusColor(property.status)} className="shadow-lg">
                        {property.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm capitalize">
                        {property.listing_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{property.location}</span>
                        </p>
                      </div>
                      
                      <div className="text-xl font-bold text-primary">
                        {property.price ? formatPrice(property.price, property.listing_type) : 'Price not set'}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        <div className="text-center">
                          <div className="font-bold text-foreground">{property.bedrooms || 'N/A'}</div>
                          <div className="text-xs">Bedrooms</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-foreground">{property.bathrooms || 'N/A'}</div>
                          <div className="text-xs">Bathrooms</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-foreground">{property.area_sqm || 'N/A'}</div>
                          <div className="text-xs">m²</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleViewProperty(property.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditProperty(property.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProperties;