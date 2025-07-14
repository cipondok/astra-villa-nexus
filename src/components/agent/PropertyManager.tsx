import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building2, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  MapPin, 
  DollarSign,
  Calendar,
  Clock,
  Zap,
  User,
  Home,
  Users
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  status: string;
  owner_id: string;
  agent_id: string;
  rental_periods?: string[];
  minimum_rental_days?: number;
  online_booking_enabled?: boolean;
  booking_type?: string;
  advance_booking_days?: number;
  rental_terms?: any;
  available_from?: string;
  available_until?: string;
  created_at: string;
}

const PROPERTY_TYPES = [
  'apartment', 'house', 'villa', 'townhouse', 'condo', 'studio', 
  'penthouse', 'duplex', 'loft', 'commercial', 'office', 'retail',
  'warehouse', 'land', 'farm', 'resort'
];

const RENTAL_PERIODS = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'quarterly', label: 'Triwulan' },
  { value: 'yearly', label: 'Tahunan' }
];

const PropertyManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '',
    listing_type: 'rent' as 'sale' | 'rent' | 'lease',
    price: 0,
    location: '',
    city: '',
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 50,
    rental_periods: ['monthly'] as string[],
    minimum_rental_days: 30,
    online_booking_enabled: false,
    booking_type: 'owner_only',
    advance_booking_days: 1,
    available_from: '',
    available_until: ''
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`agent_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          owner_id: user?.id,
          agent_id: user?.id,
          status: 'active'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: "Properti berhasil dibuat",
        description: "Properti baru telah ditambahkan ke daftar Anda.",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat properti",
        description: "Terjadi kesalahan saat membuat properti baru.",
        variant: "destructive",
      });
    }
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, ...propertyData }: any) => {
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      setEditingProperty(null);
      resetForm();
      toast({
        title: "Properti berhasil diperbarui",
        description: "Perubahan telah disimpan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui properti",
        description: "Terjadi kesalahan saat menyimpan perubahan.",
        variant: "destructive",
      });
    }
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      toast({
        title: "Properti berhasil dihapus",
        description: "Properti telah dihapus dari daftar Anda.",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus properti",
        description: "Terjadi kesalahan saat menghapus properti.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      property_type: '',
      listing_type: 'rent',
      price: 0,
      location: '',
      city: '',
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 50,
      rental_periods: ['monthly'],
      minimum_rental_days: 30,
      online_booking_enabled: false,
      booking_type: 'owner_only',
      advance_booking_days: 1,
      available_from: '',
      available_until: ''
    });
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || '',
      property_type: property.property_type,
      listing_type: (property.listing_type === 'sale' || property.listing_type === 'rent' || property.listing_type === 'lease') 
        ? property.listing_type as 'sale' | 'rent' | 'lease' 
        : 'rent',
      price: property.price,
      location: property.location,
      city: property.city || '',
      bedrooms: property.bedrooms || 1,
      bathrooms: property.bathrooms || 1,
      area_sqm: property.area_sqm || 50,
      rental_periods: property.rental_periods || ['monthly'],
      minimum_rental_days: property.minimum_rental_days || 30,
      online_booking_enabled: property.online_booking_enabled || false,
      booking_type: property.booking_type || 'owner_only',
      advance_booking_days: property.advance_booking_days || 1,
      available_from: property.available_from || '',
      available_until: property.available_until || ''
    });
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProperty) {
      updatePropertyMutation.mutate({ 
        id: editingProperty.id, 
        ...formData,
        rental_terms: {
          periods: formData.rental_periods,
          minimum_days: formData.minimum_rental_days,
          booking_settings: {
            online_enabled: formData.online_booking_enabled,
            booking_type: formData.booking_type,
            advance_days: formData.advance_booking_days
          }
        }
      });
    } else {
      createPropertyMutation.mutate({
        ...formData,
        rental_terms: {
          periods: formData.rental_periods,
          minimum_days: formData.minimum_rental_days,
          booking_settings: {
            online_enabled: formData.online_booking_enabled,
            booking_type: formData.booking_type,
            advance_days: formData.advance_booking_days
          }
        }
      });
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading properties...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Management
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProperty ? 'Edit Property' : 'Create New Property'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select 
                    value={formData.property_type} 
                    onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="listing_type">Listing Type</Label>
                  <Select 
                    value={formData.listing_type} 
                    onValueChange={(value: 'sale' | 'rent' | 'lease') => setFormData({ ...formData, listing_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="lease">For Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (IDR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="area_sqm">Area (sqm)</Label>
                  <Input
                    id="area_sqm"
                    type="number"
                    min="1"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData({ ...formData, area_sqm: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Rental-specific fields */}
              {formData.listing_type === 'rent' && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Rental Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Rental Periods</Label>
                      <div className="space-y-2">
                        {RENTAL_PERIODS.map((period) => (
                          <div key={period.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={period.value}
                              checked={formData.rental_periods.includes(period.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    rental_periods: [...formData.rental_periods, period.value]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    rental_periods: formData.rental_periods.filter(p => p !== period.value)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={period.value}>{period.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="minimum_rental_days">Minimum Rental Days</Label>
                      <Input
                        id="minimum_rental_days"
                        type="number"
                        min="1"
                        value={formData.minimum_rental_days}
                        onChange={(e) => setFormData({ ...formData, minimum_rental_days: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="advance_booking_days">Advance Booking Days</Label>
                      <Input
                        id="advance_booking_days"
                        type="number"
                        min="0"
                        value={formData.advance_booking_days}
                        onChange={(e) => setFormData({ ...formData, advance_booking_days: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="booking_type">Booking Type</Label>
                      <Select 
                        value={formData.booking_type} 
                        onValueChange={(value) => setFormData({ ...formData, booking_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner_only">Owner Contact Only</SelectItem>
                          <SelectItem value="astra_villa">ASTRA Villa System</SelectItem>
                          <SelectItem value="both">Both Options</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online_booking_enabled"
                      checked={formData.online_booking_enabled}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, online_booking_enabled: checked as boolean })
                      }
                    />
                    <Label htmlFor="online_booking_enabled">Enable Online Booking</Label>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
                >
                  {editingProperty ? 'Update Property' : 'Create Property'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProperty(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Properties ({properties?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties?.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating your first property listing</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties?.map((property) => (
                <div key={property.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{property.location}</span>
                        {property.city && <span>, {property.city}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(property.status)} className="capitalize">
                        {property.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {property.listing_type}
                      </Badge>
                      {property.listing_type === 'rent' && property.online_booking_enabled && (
                        <Badge className="bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Online Booking
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{property.property_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(property.price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bedrooms:</span>
                      <p className="font-medium">{property.bedrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Area:</span>
                      <p className="font-medium">{property.area_sqm ? `${property.area_sqm} m²` : 'N/A'}</p>
                    </div>
                  </div>

                  {property.listing_type === 'rent' && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Min. {property.minimum_rental_days || 30} days
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {property.rental_periods?.join(', ') || 'Monthly'}
                      </div>
                      <div className="flex items-center">
                        {property.booking_type === 'owner_only' ? (
                          <><User className="h-4 w-4 mr-1" />Owner Only</>
                        ) : (
                          <><Users className="h-4 w-4 mr-1" />Multiple Options</>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(property.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(property)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this property?')) {
                            deletePropertyMutation.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyManager;