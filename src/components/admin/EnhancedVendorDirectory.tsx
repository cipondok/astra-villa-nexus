import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";

interface PublicVendorProfile {
  id: string;
  business_name: string;
  business_type: string;
  business_description: string | null;
  rating: number | null;
  total_reviews: number;
  is_active?: boolean;
  is_verified?: boolean;
  logo_url: string | null;
  banner_url?: string | null;
  service_areas: any;
  business_hours?: any;
  gallery_images?: any;
  social_media?: any;
  created_at?: string;
  updated_at?: string;
}

const EnhancedVendorDirectory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [vendors, setVendors] = useState<PublicVendorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      // Use the secure function that only returns public, non-sensitive data
      const { data, error } = await supabase.rpc('get_public_vendor_profiles');
      
      if (error) {
        console.error('Error loading vendors:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor directory",
          variant: "destructive",
        });
        return;
      }
      
      setVendors((data || []).map((vendor: any) => ({
        ...vendor,
        logo_url: vendor.logo_url || null,
        service_areas: vendor.service_areas || null
      })));
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search vendors using the secure function
  const searchVendors = async (term: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('search_vendor_profiles', { 
        search_term: term || null 
      });
      
      if (error) {
        console.error('Error searching vendors:', error);
        return;
      }
      
      // Map the data to match our interface, providing defaults for missing fields
      const mappedData = (data || []).map((vendor: any) => ({
        ...vendor,
        logo_url: vendor.logo_url || null,
        service_areas: vendor.service_areas || null
      }));
      
      setVendors(mappedData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => searchVendors(searchTerm), 300);
      return () => clearTimeout(timeoutId);
    } else {
      loadVendors();
    }
  }, [searchTerm]);

  const filteredVendors = vendors.filter(vendor => {
    const matchesService = serviceFilter === "all" || 
      vendor.business_type.toLowerCase().includes(serviceFilter.toLowerCase());
    return matchesService;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Directory</h1>
          <p className="text-muted-foreground">
            Browse verified vendor profiles with secure access controls
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="repairs">Repairs</SelectItem>
            <SelectItem value="landscaping">Landscaping</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

                <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Vendors</p>
                <p className="text-2xl font-bold text-green-600">
                  {vendors.filter(v => v.is_verified !== false).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {vendors.length > 0 
                    ? (vendors.reduce((acc, v) => acc + (v.rating || 0), 0) / vendors.length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading vendors...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{vendor.business_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{vendor.business_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {vendor.is_verified !== false && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Rating and Reviews */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{vendor.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-sm text-muted-foreground">
                      ({vendor.total_reviews || 0} reviews)
                    </span>
                  </div>
                  <Badge variant={vendor.is_active !== false ? "default" : "secondary"}>
                    {vendor.is_active !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                {vendor.business_description && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vendor.business_description}
                    </p>
                  </div>
                )}

                {/* Service Areas */}
                {vendor.service_areas && Array.isArray(vendor.service_areas) && vendor.service_areas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Service Areas</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {vendor.service_areas.slice(0, 3).map((area: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof area === 'string' ? area : area.name || 'Unknown'}
                        </Badge>
                      ))}
                      {vendor.service_areas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.service_areas.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Notice */}
                <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mb-1" />
                  Contact information is only available to authenticated users for security reasons.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && filteredVendors.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vendors found matching your criteria.</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedVendorDirectory;