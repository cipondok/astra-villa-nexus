import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, Edit, Plus, MapPin, ArrowLeft, ChevronRight } from "lucide-react";

const MyProperties = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?auth=true');
    }
  }, [isAuthenticated, navigate]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending_approval': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}M`;
    return `Rp ${price?.toLocaleString()}`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-primary-foreground hover:bg-white/20"
              onClick={() => navigate('/dashboard/property-owner')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-bold">My Properties</h1>
              <p className="text-[9px] text-primary-foreground/80">
                {properties?.length || 0} listings
              </p>
            </div>
          </div>
          <Button 
            size="sm"
            className="h-7 px-2 text-[10px] bg-white/20 hover:bg-white/30"
            onClick={() => navigate('/add-property')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 space-y-1.5">
        {isLoading ? (
          <Card className="p-4">
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </Card>
        ) : properties?.length === 0 ? (
          <Card className="p-3">
            <div className="text-center py-6">
              <Building2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs font-medium mb-1">No properties yet</p>
              <p className="text-[9px] text-muted-foreground mb-3">
                Start by adding your first property
              </p>
              <Button size="sm" className="h-7 text-[10px]" onClick={() => navigate('/add-property')}>
                <Plus className="h-3 w-3 mr-1" />
                Add Property
              </Button>
            </div>
          </Card>
        ) : (
          properties?.map((property) => (
            <Card 
              key={property.id} 
              className="p-1.5 active:scale-[0.99] transition-transform cursor-pointer"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="flex gap-2">
                {/* Thumbnail */}
                <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {property.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <h3 className="text-[11px] font-semibold truncate flex-1 leading-tight">
                      {property.title || 'Untitled'}
                    </h3>
                    <Badge 
                      variant={getStatusColor(property.status)}
                      className="text-[7px] px-1 py-0 h-3.5 flex-shrink-0"
                    >
                      {property.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mb-1">
                    <MapPin className="h-2.5 w-2.5" />
                    <span className="truncate">{property.location || 'No location'}</span>
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary">
                      {property.price ? formatPrice(property.price) : 'Price TBD'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 capitalize">
                        {property.listing_type}
                      </Badge>
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${property.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${property.id}/edit`);
                          }}
                        >
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-2 mt-1 text-[8px] text-muted-foreground">
                    <span>{property.bedrooms || 0} bed</span>
                    <span>•</span>
                    <span>{property.bathrooms || 0} bath</span>
                    <span>•</span>
                    <span>{property.area_sqm || 0} m²</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyProperties;
