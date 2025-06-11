
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Home, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Camera
} from "lucide-react";

interface PropertyListing {
  id: string;
  vendor_id: string;
  title: string;
  description?: string;
  property_type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  price: number;
  price_type: string;
  is_furnished: boolean;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const VendorListings = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
  
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    property_type: "",
    location: "",
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 0,
    price: 0,
    price_type: "monthly",
    is_furnished: false,
    amenities: [] as string[],
    images: [] as string[],
    is_active: true
  });

  // Fetch vendor property listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ['vendor-listings', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('vendor_property_listings' as any)
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as PropertyListing[];
    },
  });

  // Create/Update listing mutation
  const saveListingMutation = useMutation({
    mutationFn: async (listingData: any) => {
      if (editingListing) {
        const { error } = await supabase
          .from('vendor_property_listings' as any)
          .update({
            ...listingData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingListing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vendor_property_listings' as any)
          .insert({
            vendor_id: user?.id,
            ...listingData
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", editingListing ? "Listing updated successfully" : "Listing created successfully");
      setIsCreateModalOpen(false);
      setEditingListing(null);
      setListingForm({
        title: "",
        description: "",
        property_type: "",
        location: "",
        bedrooms: 1,
        bathrooms: 1,
        area_sqm: 0,
        price: 0,
        price_type: "monthly",
        is_furnished: false,
        amenities: [],
        images: [],
        is_active: true
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-listings'] });
    },
    onError: () => {
      showError("Error", "Failed to save listing. Please try again.");
    }
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from('vendor_property_listings' as any)
        .delete()
        .eq('id', listingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-listings'] });
    },
    onError: () => {
      showError("Error", "Failed to delete listing.");
    }
  });

  const handleCreateListing = () => {
    setEditingListing(null);
    setListingForm({
      title: "",
      description: "",
      property_type: "",
      location: "",
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 0,
      price: 0,
      price_type: "monthly",
      is_furnished: false,
      amenities: [],
      images: [],
      is_active: true
    });
    setIsCreateModalOpen(true);
  };

  const handleEditListing = (listing: PropertyListing) => {
    setEditingListing(listing);
    setListingForm({
      title: listing.title || "",
      description: listing.description || "",
      property_type: listing.property_type || "",
      location: listing.location || "",
      bedrooms: listing.bedrooms || 1,
      bathrooms: listing.bathrooms || 1,
      area_sqm: listing.area_sqm || 0,
      price: listing.price || 0,
      price_type: listing.price_type || "monthly",
      is_furnished: listing.is_furnished || false,
      amenities: listing.amenities || [],
      images: listing.images || [],
      is_active: listing.is_active !== false
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveListing = () => {
    if (!listingForm.title || !listingForm.property_type || !listingForm.location || !listingForm.price) {
      showError("Missing Information", "Please fill in all required fields.");
      return;
    }
    saveListingMutation.mutate(listingForm);
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
    
    return `${formatted}/${type === 'monthly' ? 'month' : type === 'yearly' ? 'year' : 'sale'}`;
  };

  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && listing.is_active) ||
                         (statusFilter === "inactive" && !listing.is_active);
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Property Listings</h2>
          <p className="text-muted-foreground">Manage your property listings and rentals</p>
        </div>
        <Button onClick={handleCreateListing}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Listing
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{listings?.length || 0}</p>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {listings?.filter(l => l.is_active).length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Views This Month</p>
                <p className="text-2xl font-bold text-blue-600">1,245</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold text-purple-600">23</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading listings...</div>
        ) : filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No listings found. Create your first property listing!
          </div>
        ) : (
          filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <Badge 
                  className="absolute top-2 right-2"
                  variant={listing.is_active ? "default" : "secondary"}
                >
                  {listing.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">{listing.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {listing.bedrooms}
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {listing.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {listing.area_sqm}m²
                  </div>
                </div>
                
                <div className="text-lg font-bold text-primary mb-4">
                  {formatPrice(listing.price, listing.price_type)}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditListing(listing)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteListingMutation.mutate(listing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Listing Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingListing ? "Edit Property Listing" : "Create New Property Listing"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={listingForm.title}
                onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Modern 2BR Apartment in Central Jakarta"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_type">Property Type *</Label>
                <Select 
                  value={listingForm.property_type} 
                  onValueChange={(value) => setListingForm(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="condo">Condominium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={listingForm.location}
                  onChange={(e) => setListingForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Central Jakarta, Indonesia"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={listingForm.bedrooms}
                  onChange={(e) => setListingForm(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={listingForm.bathrooms}
                  onChange={(e) => setListingForm(prev => ({ ...prev, bathrooms: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="area_sqm">Area (m²)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  min="0"
                  value={listingForm.area_sqm}
                  onChange={(e) => setListingForm(prev => ({ ...prev, area_sqm: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={listingForm.price}
                  onChange={(e) => setListingForm(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  placeholder="Price in IDR"
                />
              </div>
              <div>
                <Label htmlFor="price_type">Price Type</Label>
                <Select 
                  value={listingForm.price_type} 
                  onValueChange={(value) => setListingForm(prev => ({ ...prev, price_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Rent</SelectItem>
                    <SelectItem value="yearly">Yearly Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={listingForm.description}
                onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your property, amenities, and unique features..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_furnished"
                  checked={listingForm.is_furnished}
                  onCheckedChange={(checked) => setListingForm(prev => ({ ...prev, is_furnished: checked }))}
                />
                <Label htmlFor="is_furnished">Furnished</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={listingForm.is_active}
                  onCheckedChange={(checked) => setListingForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active Listing</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveListing} 
                disabled={saveListingMutation.isPending}
                className="flex-1"
              >
                {saveListingMutation.isPending ? 'Saving...' : (editingListing ? 'Update Listing' : 'Create Listing')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorListings;
