import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Home, MapPin, Ruler, CheckCircle } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { toast } from "sonner";

const PropertyEdit = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    listing_type: "",
    location: "",
    city: "",
    state: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    status: "active"
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?auth=true');
    }
    if (isAuthenticated && !['agent', 'property_owner', 'admin'].includes(profile?.role || '')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  // Fetch property data
  const { data: property, isLoading } = useQuery({
    queryKey: ['property-edit', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Check if user owns this property (or is admin)
      if (data.agent_id !== user.id && profile?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      
      return data;
    },
    enabled: !!id && !!user,
  });

  // Update form data when property loads
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        price: property.price?.toString() || "",
        property_type: property.property_type || "",
        listing_type: property.listing_type || "",
        location: property.location || "",
        city: property.city || "",
        state: property.state || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area_sqm: property.area_sqm?.toString() || "",
        status: property.status || "active"
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          property_type: formData.property_type,
          listing_type: formData.listing_type,
          location: formData.location,
          city: formData.city,
          state: formData.state,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('agent_id', user.id);

      if (error) throw error;

      toast.success("Property updated successfully!");
      navigate('/agent-dashboard');
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error("Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading property...</h2>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate('/agent-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 backdrop-blur-sm -z-10"></div>
      
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={() => setLanguage(language === "en" ? "id" : "en")}
          theme={theme}
          onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
        />
      </div>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/agent-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Edit Property
              </CardTitle>
              <CardDescription className="text-base">Update your property listing details across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="basic" className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Basic Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Location</span>
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <Ruler className="h-4 w-4" />
                      <span className="hidden sm:inline">Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="status" className="flex items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Status</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold">Property Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                          className="h-11"
                          placeholder="e.g., Modern Luxury Villa in Seminyak"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={6}
                          className="resize-none"
                          placeholder="Describe your property in detail..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="property_type" className="text-sm font-semibold">Property Type *</Label>
                          <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="listing_type" className="text-sm font-semibold">Listing Type *</Label>
                          <Select value={formData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select listing type" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="sale">For Sale</SelectItem>
                              <SelectItem value="rent">For Rent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-semibold">Price (IDR) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="Enter price"
                          required
                          className="h-11"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Location Tab */}
                  <TabsContent value="location" className="space-y-6 mt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold">Full Address *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter full address"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="Enter city"
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-semibold">State/Province</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            placeholder="Enter state"
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms" className="text-sm font-semibold">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                          placeholder="0"
                          className="h-11"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bathrooms" className="text-sm font-semibold">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                          placeholder="0"
                          className="h-11"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area_sqm" className="text-sm font-semibold">Area (m²)</Label>
                        <Input
                          id="area_sqm"
                          type="number"
                          value={formData.area_sqm}
                          onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                          placeholder="0"
                          className="h-11"
                          min="0"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Status Tab */}
                  <TabsContent value="status" className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-semibold">Property Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-2">
                        Active properties are visible to the public. Inactive properties are hidden.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 h-11">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Property
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/agent-dashboard')} className="flex-1 sm:flex-none h-11">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyEdit;