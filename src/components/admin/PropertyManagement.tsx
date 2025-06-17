import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, RefreshCw, Check, X, Image, Upload, Eye, Trash2, Edit3 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import StyledPropertyEditModal from "./StyledPropertyEditModal";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  state: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  status: string;
  approval_status: string;
  images: string[];
  owner_id: string;
  agent_id?: string;
  created_at: string;
  updated_at: string;
}

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");
  const [selectedListingType, setSelectedListingType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { themeSettings } = useThemeSettings();

  // Fetch properties from Supabase
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setProperties(data || []);
    } catch (err: any) {
      setError(err.message);
      showError("Fetch Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter properties based on selected type and search query
  const filteredProperties = properties.filter((property) => {
    const typeMatch =
      selectedPropertyType === "all" ||
      property.property_type === selectedPropertyType;
    const listingMatch =
      selectedListingType === "all" ||
      property.listing_type === selectedListingType;
    const searchMatch =
      searchQuery === "" ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && listingMatch && searchMatch;
  });

  // Handle property save
  const handleSaveProperty = async (property: Property) => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .update(property)
        .eq("id", property.id);

      if (error) {
        throw new Error(error.message);
      }

      // Optimistically update the properties list
      setProperties((prevProperties) =>
        prevProperties.map((p) => (p.id === property.id ? property : p))
      );

      // Invalidate the query to refetch data
      queryClient.invalidateQueries({ queryKey: ["properties"] });

      showSuccess("Property Updated", "Property has been successfully updated.");
    } catch (err: any) {
      setError(err.message);
      showError("Update Failed", err.message);
    } finally {
      setSelectedProperty(null); // Close the modal
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Management</CardTitle>
          <CardDescription>Manage and view property listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={selectedPropertyType}
              onValueChange={(value) => setSelectedPropertyType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedListingType}
              onValueChange={(value) => setSelectedListingType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Listing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="search"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <StyledPropertyEditModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onSave={handleSaveProperty}
      />

      {loading ? (
        <p>Loading properties...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>{property.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-semibold">Type:</span> {property.property_type}
                </p>
                <p>
                  <span className="font-semibold">Listing:</span> {property.listing_type}
                </p>
                <div className="flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
