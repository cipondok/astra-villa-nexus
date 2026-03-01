
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, Save, AlertCircle, ChevronDown, Ruler, TrendingUp, Cpu, Sparkles, RefreshCw, Loader2, Check, PenLine } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PropertyImageUpload from "./PropertyImageUpload";
import LocationSelector from "./LocationSelector";
import VRMediaUploader from "./VRMediaUploader";

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  location: string;
  city: string;
  state: string;
  area: string;
  development_status: string;
  owner_type: string;
  status: string;
  seo_title: string;
  seo_description: string;
  property_features: any;
  // Rental-specific fields
  rental_periods: string[];
  minimum_rental_days: string;
  online_booking_enabled: boolean;
  booking_type: string;
  advance_booking_days: string;
  rental_terms: string;
  available_from: string;
  available_until: string;
  // Virtual office/office space fields
  pt_name_required?: string;
  business_license_required?: string;
  domicile_services?: boolean;
  mail_handling?: boolean;
  // Image upload
  images?: string[];
  // Nearby & Payment
  nearby_facilities: string[];
  payment_methods: string[];
  // Indonesian specs
  land_area_sqm: string;
  building_area_sqm: string;
  floors: string;
  has_pool: boolean;
  garage_count: string;
  view_type: string;
  furnishing: string;
  // Investment
  roi_percentage: string;
  rental_yield_percentage: string;
  legal_status: string;
  wna_eligible: boolean;
  payment_plan_available: boolean;
  handover_year: string;
  // Technology
  has_vr: boolean;
  has_360_view: boolean;
  has_drone_video: boolean;
  has_interactive_floorplan: boolean;
  // VR/3D Media URLs
  virtual_tour_url: string;
  three_d_model_url: string;
  glb_model_url: string;
  drone_video_url: string;
  panorama_360_urls: string[];
  ai_staging_images: string[];
}

const RoleBasedPropertyForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Check user permissions
  const canCreateProperty = profile?.role && ['property_owner', 'agent', 'admin'].includes(profile.role);
  const isAdmin = profile?.role === 'admin';
  const isAgent = profile?.role === 'agent';

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    property_type: "",
    listing_type: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    location: "",
    city: "",
    state: "",
    area: "",
    development_status: "completed",
    owner_type: "individual",
    status: isAdmin ? "active" : "pending_approval",
    seo_title: "",
    seo_description: "",
    property_features: {},
    // Rental-specific fields
    rental_periods: ["monthly"],
    minimum_rental_days: "30",
    online_booking_enabled: true,
    booking_type: "astra_villa",
    advance_booking_days: "7",
    rental_terms: "",
    available_from: "",
    available_until: "",
    // Nearby & Payment
    nearby_facilities: [],
    payment_methods: [],
    // Indonesian specs
    land_area_sqm: "",
    building_area_sqm: "",
    floors: "",
    has_pool: false,
    garage_count: "",
    view_type: "",
    furnishing: "",
    // Investment
    roi_percentage: "",
    rental_yield_percentage: "",
    legal_status: "",
    wna_eligible: false,
    payment_plan_available: false,
    handover_year: "",
    // Technology
    has_vr: false,
    has_360_view: false,
    has_drone_video: false,
    has_interactive_floorplan: false,
    // VR/3D Media URLs
    virtual_tour_url: "",
    three_d_model_url: "",
    glb_model_url: "",
    drone_video_url: "",
    panorama_360_urls: [],
    ai_staging_images: [],
  });

  // AI Description Generator state
  const [aiLoading, setAiLoading] = useState(false);
  const [draftPropertyId, setDraftPropertyId] = useState<string | null>(null);
  const [aiTone, setAiTone] = useState<string>('luxury');
  const [aiRewrite, setAiRewrite] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [aiContent, setAiContent] = useState<{
    long_description: string;
    seo_description: string;
    social_caption: string;
    highlights: string[];
  } | null>(null);

  const saveDraftAndGetId = async (): Promise<string> => {
    if (draftPropertyId) return draftPropertyId;

    // Minimal validation
    if (!formData.title?.trim()) throw new Error('Title is required to generate AI content.');
    if (!formData.price?.trim()) throw new Error('Price is required to generate AI content.');
    if (!formData.city?.trim() && !locationState.selectedCity) throw new Error('City is required to generate AI content.');

    if (!user) throw new Error('Not authenticated');

    const draftData: Record<string, unknown> = {
      title: formData.title,
      price: parseFloat(formData.price),
      city: formData.city || locationState.selectedCity,
      district: locationState.selectedDistrict || null,
      property_type: formData.property_type || 'house',
      listing_type: formData.listing_type || 'sale',
      status: 'draft',
      approval_status: 'pending',
      owner_id: user.id,
      agent_id: isAgent ? user.id : null,
      land_area_sqm: formData.land_area_sqm ? parseFloat(formData.land_area_sqm) : null,
      building_area_sqm: formData.building_area_sqm ? parseFloat(formData.building_area_sqm) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      floors: formData.floors ? parseInt(formData.floors) : null,
      has_pool: formData.has_pool,
      garage_count: formData.garage_count ? parseInt(formData.garage_count) : null,
      investment_score: 0,
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(draftData as any)
      .select('id')
      .single();

    if (error) throw new Error('Failed to save draft: ' + error.message);
    setDraftPropertyId(data.id);
    return data.id;
  };

  const generateAiDescription = async (propertyId?: string) => {
    setAiLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      // Auto-save as draft if no property ID
      const id = propertyId || await saveDraftAndGetId();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-description-generator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            property_id: id,
            tone: aiTone,
            save_results: false,
            ...(aiRewrite && formData.description.trim() ? { rewrite_text: formData.description } : {}),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        if (errData.upgrade_required) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(errData.error || 'Failed to generate');
      }

      const data = await res.json();
      setAiContent({
        long_description: data.long_description,
        seo_description: data.seo_description,
        social_caption: data.social_caption,
        highlights: data.highlights || [],
      });

      // Auto-populate description and seo_description
      setFormData(prev => ({
        ...prev,
        description: data.long_description,
        seo_description: data.seo_description,
      }));

      showSuccess('AI Content Generated', 'Description, SEO, and social content are ready.');
    } catch (err: any) {
      console.error('AI generation error:', err);
      showError('Generation Failed', err.message || 'Could not generate AI content.');
    } finally {
      setAiLoading(false);
    }
  };

  // Location selector state
  const [locationState, setLocationState] = useState({
    selectedState: "",
    selectedCity: "",
    selectedDistrict: "",
    selectedSubdistrict: ""
  });

  const [advancedFeatures, setAdvancedFeatures] = useState({
    parking: false,
    swimming_pool: false,
    garden: false,
    balcony: false,
    furnished: false,
    air_conditioning: false,
    security: false,
    elevator: false
  });

  // Fetch property categories for agents/admins
  const { data: categories } = useQuery({
    queryKey: ['property-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAgent || isAdmin,
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user || !canCreateProperty) {
        throw new Error('Unauthorized to create properties');
      }

      const propertyData = {
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        listing_type: data.listing_type,
        price: data.price ? parseFloat(data.price) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area_sqm: data.area_sqm ? parseInt(data.area_sqm) : null,
        location: data.location,
        city: data.city,
        state: data.state,
        area: data.area,
        development_status: data.development_status,
        owner_type: data.owner_type,
        status: data.status,
        approval_status: isAdmin ? 'approved' : 'pending',
        owner_id: user.id,
        agent_id: isAgent ? user.id : null,
        images: data.images || [],
        image_urls: data.images || [],
        seo_title: data.seo_title || data.title,
        seo_description: data.seo_description || data.description,
        property_features: { ...advancedFeatures },
        nearby_facilities: data.nearby_facilities || [],
        payment_methods: data.payment_methods || [],
        // Indonesian specs
        land_area_sqm: data.land_area_sqm ? parseFloat(data.land_area_sqm) : null,
        building_area_sqm: data.building_area_sqm ? parseFloat(data.building_area_sqm) : null,
        floors: data.floors ? parseInt(data.floors) : null,
        has_pool: data.has_pool,
        garage_count: data.garage_count ? parseInt(data.garage_count) : null,
        view_type: data.view_type || null,
        furnishing: data.furnishing || null,
        // Investment
        roi_percentage: data.roi_percentage ? parseFloat(data.roi_percentage) : null,
        rental_yield_percentage: data.rental_yield_percentage ? parseFloat(data.rental_yield_percentage) : null,
        legal_status: data.legal_status || null,
        wna_eligible: data.wna_eligible,
        payment_plan_available: data.payment_plan_available,
        handover_year: data.handover_year ? parseInt(data.handover_year) : null,
        // Technology
        has_vr: data.has_vr,
        has_360_view: data.has_360_view,
        has_drone_video: data.has_drone_video,
        has_interactive_floorplan: data.has_interactive_floorplan,
        // VR/3D Media URLs
        virtual_tour_url: data.virtual_tour_url || null,
        three_d_model_url: data.three_d_model_url || null,
        glb_model_url: data.glb_model_url || null,
        drone_video_url: data.drone_video_url || null,
        panorama_360_urls: data.panorama_360_urls?.length ? data.panorama_360_urls : [],
        ai_staging_images: data.ai_staging_images?.length ? data.ai_staging_images : [],
        // Rental-specific fields (only for rental properties)
        ...(data.listing_type === 'rent' && {
          rental_periods: data.rental_periods,
          minimum_rental_days: data.minimum_rental_days ? parseInt(data.minimum_rental_days) : 30,
          online_booking_enabled: data.online_booking_enabled,
          booking_type: data.booking_type,
          advance_booking_days: data.advance_booking_days ? parseInt(data.advance_booking_days) : 7,
          rental_terms: data.rental_terms ? JSON.parse(data.rental_terms || '{}') : {},
          available_from: data.available_from || null,
          available_until: data.available_until || null
        })
      };

      const { data: result, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      
      if (error) {
        console.error('Property creation error:', error);
        throw error;
      }
      
      return result;
    },
    onSuccess: (data) => {
      const statusMessage = isAdmin 
        ? "Property has been created and is now active."
        : "Property has been submitted for approval.";
      
      showSuccess("Property Created", `Property "${data.title}" ${statusMessage}`);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        property_type: "",
        listing_type: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        location: "",
        city: "",
        state: "",
        area: "",
        development_status: "completed",
        owner_type: "individual",
        status: isAdmin ? "active" : "pending_approval",
        seo_title: "",
        seo_description: "",
        property_features: {},
        rental_periods: ["monthly"],
        minimum_rental_days: "30",
        online_booking_enabled: true,
        booking_type: "astra_villa",
        advance_booking_days: "7",
        rental_terms: "",
        available_from: "",
        available_until: "",
        nearby_facilities: [],
        payment_methods: [],
        land_area_sqm: "",
        building_area_sqm: "",
        floors: "",
        has_pool: false,
        garage_count: "",
        view_type: "",
        furnishing: "",
        roi_percentage: "",
        rental_yield_percentage: "",
        legal_status: "",
        wna_eligible: false,
        payment_plan_available: false,
        handover_year: "",
        has_vr: false,
        has_360_view: false,
        has_drone_video: false,
        has_interactive_floorplan: false,
        virtual_tour_url: "",
        three_d_model_url: "",
        glb_model_url: "",
        drone_video_url: "",
        panorama_360_urls: [],
        ai_staging_images: [],
      });

      // Reset location selector
      setLocationState({
        selectedState: "",
        selectedCity: "",
        selectedDistrict: "",
        selectedSubdistrict: ""
      });
      
      setAdvancedFeatures({
        parking: false,
        swimming_pool: false,
        garden: false,
        balcony: false,
        furnished: false,
        air_conditioning: false,
        security: false,
        elevator: false
      });
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Navigate to property list
      navigate('/dijual');
    },
    onError: (error: any) => {
      console.error('Property creation failed:', error);
      showError("Creation Failed", error.message || 'Failed to create property');
    },
  });

  const handleInputChange = (key: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setAdvancedFeatures(prev => ({ ...prev, [feature]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateProperty) {
      showError("Access Denied", "You don't have permission to create properties.");
      return;
    }
    
    if (!formData.title || !formData.property_type || !formData.listing_type || !formData.location) {
      showError("Validation Error", "Please fill in all required fields: Title, Property Type, Listing Type, and Location.");
      return;
    }

    if (!user) {
      showError("Authentication Error", "You must be logged in to create properties.");
      return;
    }
    
    createPropertyMutation.mutate(formData);
  };

  if (!canCreateProperty) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              You need to be a Property Owner, Agent, or Admin to create property listings.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Current role: <span className="font-medium capitalize">{profile?.role || 'Not assigned'}</span>
            </p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Create New Property Listing
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Create a new property listing with full administrative access"
            : isAgent 
            ? "Create a property listing as an agent (subject to approval)"
            : "Submit your property for listing (subject to approval)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter property title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="property_type">Property Type *</Label>
                <Select 
                  value={formData.property_type} 
                  onValueChange={(value) => handleInputChange('property_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="office">Office Space</SelectItem>
                    <SelectItem value="virtual_office">Virtual Office</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="retail">Retail Space</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="listing_type">Listing Type *</Label>
                <Select 
                  value={formData.listing_type} 
                  onValueChange={(value) => handleInputChange('listing_type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
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
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="description">Description ({formData.description.length} characters)</Label>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property..."
                rows={6}
              />
              {formData.description.length > 0 && formData.description.length < 300 && (
                <p className="text-xs mt-1.5 text-orange-500">💡 Tip: Listings with 400+ characters perform better.</p>
              )}
              {formData.description.length > 1000 && (
                <p className="text-xs mt-1.5 text-muted-foreground">⚠️ Consider shortening for readability.</p>
              )}
            </div>

            {/* AI Description Generator */}
            <div className="relative rounded-xl overflow-hidden shadow-lg animate-scale-in">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/40 via-primary/20 to-accent/30 p-[1px]" />
              <div className="relative rounded-xl backdrop-blur-md bg-background/80 border border-primary/10 p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">AI Content Generator</span>
                  </div>
                  <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Powered by AI
                  </span>
                </div>

                {/* AI Insight Badges */}
                {aiContent && !aiLoading && (
                  <div className="flex flex-wrap gap-1.5">
                    {Number(formData.roi_percentage) >= 75 && (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">
                        📊 Optimized for Investment Buyers
                      </span>
                    )}
                    {formData.has_pool && (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        🏊 Luxury Lifestyle Emphasis
                      </span>
                    )}
                    {aiContent.seo_description.length >= 140 && aiContent.seo_description.length <= 160 && (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                        🔍 SEO Optimized
                      </span>
                    )}
                  </div>
                )}

                {/* Tone Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Content Tone</Label>
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">🏛️ Luxury</SelectItem>
                      <SelectItem value="investment">📈 Investment</SelectItem>
                      <SelectItem value="family">👨‍👩‍👧‍👦 Family Living</SelectItem>
                      <SelectItem value="minimalist">🔲 Modern Minimalist</SelectItem>
                      <SelectItem value="resort">🌴 Resort Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Rewrite checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aiRewrite}
                    onChange={(e) => setAiRewrite(e.target.checked)}
                    className="rounded border-border accent-primary h-3.5 w-3.5"
                  />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <PenLine className="h-3 w-3" />
                    Rewrite existing description instead of generating new
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={aiLoading}
                    onClick={() => generateAiDescription(draftPropertyId || undefined)}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : aiContent ? (
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {aiLoading ? 'Generating...' : aiContent ? '🔄 Regenerate AI Content' : '✨ Generate AI Description'}
                  </Button>
                  {aiContent && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={aiLoading}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          description: aiContent.long_description,
                          seo_description: aiContent.seo_description,
                        }));
                        showSuccess('Applied', 'AI content saved to form fields.');
                      }}
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Apply to Form
                    </Button>
                  )}
                </div>

                {/* Loading shimmer */}
                {aiLoading && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-full w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-full w-full" />
                    <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-full w-5/6" />
                    <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-full w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-7 w-24 bg-muted rounded-full" />
                      <div className="h-7 w-28 bg-muted rounded-full" />
                      <div className="h-7 w-20 bg-muted rounded-full" />
                    </div>
                  </div>
                )}

                {/* AI Content Preview */}
                {aiContent && !aiLoading && (
                  <div className="space-y-4 animate-[ai-reveal_0.4s_ease-out_both]">
                    {/* SEO Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">SEO Description</Label>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          aiContent.seo_description.length <= 160
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}>
                          {aiContent.seo_description.length}/160
                        </span>
                      </div>
                      <p className="text-sm p-3 bg-muted/50 rounded-lg border border-border/50">{aiContent.seo_description}</p>
                    </div>

                    {/* Social Caption */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Instagram Caption</Label>
                      <p className="text-sm p-3 bg-muted/50 rounded-lg border border-border/50 whitespace-pre-wrap">{aiContent.social_caption}</p>
                    </div>

                    {/* Highlights as chips */}
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">Property Highlights</Label>
                      <div className="flex flex-wrap gap-2">
                        {aiContent.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/15 hover:bg-primary/15 transition-colors"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Property Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Images</h3>
            <PropertyImageUpload
              propertyType={formData.property_type}
              onImagesUploaded={(imageUrls) => {
                setFormData(prev => ({ 
                  ...prev, 
                  images: imageUrls 
                }));
              }}
              maxImages={10}
            />
          </div>

          {/* Rental-Specific Fields */}
          {formData.listing_type === 'rent' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rental Information</h3>
              
              {/* Rental Period Options */}
              <div>
                <Label>Accepted Rental Periods</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {[
                    { value: 'daily', label: 'Daily (1+ days)', min: 1 },
                    { value: 'weekly', label: 'Weekly (7+ days)', min: 7 },
                    { value: 'monthly', label: 'Monthly (30+ days)', min: 30 },
                    { value: 'yearly', label: 'Yearly (365+ days)', min: 365 }
                  ].map((period) => (
                    <div key={period.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={period.value}
                        checked={formData.rental_periods.includes(period.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              rental_periods: [...prev.rental_periods, period.value],
                              minimum_rental_days: prev.minimum_rental_days || period.min.toString()
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              rental_periods: prev.rental_periods.filter(p => p !== period.value)
                            }));
                          }
                        }}
                        className="rounded border-border"
                      />
                      <Label htmlFor={period.value} className="text-sm">{period.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Office/Office Space Company Information */}
              {(formData.property_type === 'virtual_office' || formData.property_type === 'office') && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-base">Company Information Required</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pt_name_required">PT Name Requirements</Label>
                      <textarea
                        id="pt_name_required"
                        value={formData.pt_name_required || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pt_name_required: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="e.g., Valid PT registration required, SIUP certificate needed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business_license_required">Business License Requirements</Label>
                      <textarea
                        id="business_license_required"
                        value={formData.business_license_required || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, business_license_required: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="e.g., NIB, SIUP, TDP, or other required business licenses"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domicile_services">Domicile Services Available</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="domicile_services"
                          checked={formData.domicile_services || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, domicile_services: e.target.checked }))}
                          className="rounded border-border"
                        />
                        <Label htmlFor="domicile_services" className="text-sm">
                          Business domicile address services provided
                        </Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mail_handling">Mail Handling Services</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="mail_handling"
                          checked={formData.mail_handling || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, mail_handling: e.target.checked }))}
                          className="rounded border-border"
                        />
                        <Label htmlFor="mail_handling" className="text-sm">
                          Mail and package handling included
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum_rental_days">Minimum Rental Days</Label>
                  <Input
                    id="minimum_rental_days"
                    type="number"
                    value={formData.minimum_rental_days}
                    onChange={(e) => handleInputChange('minimum_rental_days', e.target.value)}
                    placeholder="e.g., 30"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers can see minimum booking duration
                  </p>
                </div>
                <div>
                  <Label htmlFor="booking_type">Booking Type</Label>
                  <Select 
                    value={formData.booking_type} 
                    onValueChange={(value) => handleInputChange('booking_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Booking</SelectItem>
                      <SelectItem value="owner_contact">Contact Owner</SelectItem>
                      <SelectItem value="agent_assisted">Agent Assisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="advance_booking_days">Advance Booking Days</Label>
                  <Input
                    id="advance_booking_days"
                    type="number"
                    value={formData.advance_booking_days}
                    onChange={(e) => handleInputChange('advance_booking_days', e.target.value)}
                    placeholder="e.g., 7"
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="online_booking_enabled"
                    checked={formData.online_booking_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, online_booking_enabled: checked }))}
                  />
                  <Label htmlFor="online_booking_enabled">Enable Online Booking</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => handleInputChange('available_from', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="date"
                    value={formData.available_until}
                    onChange={(e) => handleInputChange('available_until', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rental_terms">Rental Terms & Conditions</Label>
                <Textarea
                  id="rental_terms"
                  value={formData.rental_terms}
                  onChange={(e) => handleInputChange('rental_terms', e.target.value)}
                  placeholder="Enter rental terms, house rules, and conditions..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  placeholder="Number of bedrooms"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  placeholder="Number of bathrooms"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="area_sqm">Area (m²)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  placeholder="Area in square meters"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Property Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(advancedFeatures).map(([feature, value]) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Switch
                    id={feature}
                    checked={value}
                    onCheckedChange={(checked) => handleFeatureChange(feature, checked)}
                  />
                  <Label htmlFor={feature} className="capitalize text-sm">
                    {feature.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            
            {/* Database-driven Location Selector */}
            <LocationSelector
              selectedState={locationState.selectedState}
              selectedCity={locationState.selectedCity}
              selectedDistrict={locationState.selectedDistrict}
              selectedSubdistrict={locationState.selectedSubdistrict}
              onStateChange={(state) => {
                setLocationState(prev => ({ ...prev, selectedState: state }));
                setFormData(prev => ({ ...prev, state }));
              }}
              onCityChange={(city) => {
                setLocationState(prev => ({ ...prev, selectedCity: city }));
                setFormData(prev => ({ ...prev, city }));
              }}
              onDistrictChange={(district) => {
                setLocationState(prev => ({ ...prev, selectedDistrict: district }));
                setFormData(prev => ({ ...prev, area: district }));
              }}
              onSubdistrictChange={(subdistrict) => {
                setLocationState(prev => ({ ...prev, selectedSubdistrict: subdistrict }));
              }}
              onLocationChange={(location) => {
                setFormData(prev => ({ ...prev, location }));
              }}
            />

            {/* Additional Address Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_address">Street Address & Details</Label>
                <Input
                  id="full_address"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter street address, building number, etc."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Complete street address including house/building number
                </p>
              </div>
            </div>
          </div>

          {/* Nearby Facilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fasilitas Terdekat (Nearby)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { value: "public_transport", label: "Transportasi Umum" },
                { value: "lrt_mrt", label: "LRT / MRT" },
                { value: "airport", label: "Bandara" },
                { value: "toll_road", label: "Jalan Tol" },
                { value: "international_school", label: "Sekolah Internasional" },
                { value: "shopping_mall", label: "Mall" },
                { value: "minimarket", label: "Indomaret / Alfamart" },
                { value: "supermarket", label: "Supermarket" },
                { value: "hospital", label: "Rumah Sakit" },
                { value: "restaurant", label: "Restoran / Kafe" },
                { value: "park", label: "Taman" },
                { value: "public_garden", label: "Kebun Raya" },
                { value: "golf_club", label: "Golf Club" },
                { value: "gym_fitness", label: "Gym / Fitness" },
                { value: "beach", label: "Pantai" },
                { value: "mosque_temple", label: "Tempat Ibadah" },
                { value: "gas_station", label: "SPBU" },
                { value: "coworking", label: "Co-Working Space" },
                { value: "university", label: "Universitas" },
                { value: "popular_area", label: "Area Populer" },
                { value: "parking_area", label: "Parkir Luas" },
              ].map(opt => {
                const checked = formData.nearby_facilities.includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const updated = checked
                          ? formData.nearby_facilities.filter(v => v !== opt.value)
                          : [...formData.nearby_facilities, opt.value];
                        handleInputChange('nearby_facilities', updated);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metode Pembayaran yang Diterima</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: "online", label: "Online Payment" },
                { value: "pay_on_property", label: "Bayar di Lokasi" },
                { value: "bank_transfer", label: "Transfer Bank" },
                { value: "installment", label: "Cicilan / KPR" },
                { value: "crypto", label: "Crypto / Digital" },
              ].map(opt => {
                const checked = formData.payment_methods.includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent/30 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const updated = checked
                          ? formData.payment_methods.filter(v => v !== opt.value)
                          : [...formData.payment_methods, opt.value];
                        handleInputChange('payment_methods', updated);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Indonesian Specs - Collapsible */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                Spesifikasi Properti
              </h3>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="land_area_sqm">Luas Tanah (m²)</Label>
                  <Input id="land_area_sqm" type="number" value={formData.land_area_sqm} onChange={(e) => handleInputChange('land_area_sqm', e.target.value)} placeholder="e.g. 200" min="0" />
                </div>
                <div>
                  <Label htmlFor="building_area_sqm">Luas Bangunan (m²)</Label>
                  <Input id="building_area_sqm" type="number" value={formData.building_area_sqm} onChange={(e) => handleInputChange('building_area_sqm', e.target.value)} placeholder="e.g. 150" min="0" />
                </div>
                <div>
                  <Label htmlFor="floors">Jumlah Lantai</Label>
                  <Input id="floors" type="number" value={formData.floors} onChange={(e) => handleInputChange('floors', e.target.value)} placeholder="e.g. 2" min="1" />
                </div>
                <div>
                  <Label htmlFor="garage_count">Garasi / Carport</Label>
                  <Input id="garage_count" type="number" value={formData.garage_count} onChange={(e) => handleInputChange('garage_count', e.target.value)} placeholder="e.g. 1" min="0" />
                </div>
                <div>
                  <Label htmlFor="view_type">Tipe Pemandangan</Label>
                  <Select value={formData.view_type} onValueChange={(v) => handleInputChange('view_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih view" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ocean">Ocean / Laut</SelectItem>
                      <SelectItem value="mountain">Mountain / Gunung</SelectItem>
                      <SelectItem value="rice_field">Rice Field / Sawah</SelectItem>
                      <SelectItem value="city">City / Kota</SelectItem>
                      <SelectItem value="garden">Garden / Taman</SelectItem>
                      <SelectItem value="pool">Pool / Kolam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="furnishing">Furnishing</Label>
                  <Select value={formData.furnishing} onValueChange={(v) => handleInputChange('furnishing', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi">Semi Furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="has_pool" checked={formData.has_pool} onCheckedChange={(v) => handleInputChange('has_pool', v)} />
                <Label htmlFor="has_pool">Kolam Renang</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Investment - Collapsible */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Informasi Investasi
              </h3>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="roi_percentage">ROI (%)</Label>
                  <Input id="roi_percentage" type="number" step="0.1" value={formData.roi_percentage} onChange={(e) => handleInputChange('roi_percentage', e.target.value)} placeholder="e.g. 8.5" min="0" />
                </div>
                <div>
                  <Label htmlFor="rental_yield_percentage">Rental Yield (%)</Label>
                  <Input id="rental_yield_percentage" type="number" step="0.1" value={formData.rental_yield_percentage} onChange={(e) => handleInputChange('rental_yield_percentage', e.target.value)} placeholder="e.g. 6.0" min="0" />
                </div>
                <div>
                  <Label htmlFor="legal_status">Status Hukum</Label>
                  <Select value={formData.legal_status} onValueChange={(v) => handleInputChange('legal_status', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shm">SHM (Hak Milik)</SelectItem>
                      <SelectItem value="hgb">HGB</SelectItem>
                      <SelectItem value="leasehold">Leasehold</SelectItem>
                      <SelectItem value="strata">Strata Title</SelectItem>
                      <SelectItem value="girik">Girik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="handover_year">Tahun Serah Terima</Label>
                  <Input id="handover_year" type="number" value={formData.handover_year} onChange={(e) => handleInputChange('handover_year', e.target.value)} placeholder="e.g. 2026" min="2024" max="2035" />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Switch id="wna_eligible" checked={formData.wna_eligible} onCheckedChange={(v) => handleInputChange('wna_eligible', v)} />
                  <Label htmlFor="wna_eligible">WNA Eligible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="payment_plan_available" checked={formData.payment_plan_available} onCheckedChange={(v) => handleInputChange('payment_plan_available', v)} />
                  <Label htmlFor="payment_plan_available">Payment Plan Available</Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Technology & VR/3D Marketplace - Collapsible */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Teknologi & 3D/VR Marketplace
              </h3>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              {/* Feature Toggles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="has_vr" checked={formData.has_vr} onCheckedChange={(v) => handleInputChange('has_vr', v)} />
                  <Label htmlFor="has_vr" className="text-sm">VR Ready</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="has_360_view" checked={formData.has_360_view} onCheckedChange={(v) => handleInputChange('has_360_view', v)} />
                  <Label htmlFor="has_360_view" className="text-sm">360° View</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="has_drone_video" checked={formData.has_drone_video} onCheckedChange={(v) => handleInputChange('has_drone_video', v)} />
                  <Label htmlFor="has_drone_video" className="text-sm">Drone Video</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="has_interactive_floorplan" checked={formData.has_interactive_floorplan} onCheckedChange={(v) => handleInputChange('has_interactive_floorplan', v)} />
                  <Label htmlFor="has_interactive_floorplan" className="text-sm">Floor Plan Interaktif</Label>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-2 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">📁 Upload Media</h4>
                <VRMediaUploader
                  onPanoramasChange={(urls) => handleInputChange('panorama_360_urls', urls)}
                  onModelChange={(url) => handleInputChange('glb_model_url', url)}
                  onDroneVideoChange={(url) => handleInputChange('drone_video_url', url)}
                  onStagingImagesChange={(urls) => handleInputChange('ai_staging_images', urls)}
                  panoramaUrls={formData.panorama_360_urls}
                  modelUrl={formData.glb_model_url}
                  droneVideoUrl={formData.drone_video_url}
                  stagingImageUrls={formData.ai_staging_images}
                />
              </div>

              {/* Manual URL Inputs (collapsible) */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                  Or paste media URLs manually
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="virtual_tour_url" className="text-sm">Virtual Tour URL (Matterport/Kuula)</Label>
                      <Input id="virtual_tour_url" value={formData.virtual_tour_url} onChange={(e) => handleInputChange('virtual_tour_url', e.target.value)} placeholder="https://my.matterport.com/show/?m=..." />
                    </div>
                    <div>
                      <Label htmlFor="three_d_model_url" className="text-sm">3D Model URL (Sketchfab)</Label>
                      <Input id="three_d_model_url" value={formData.three_d_model_url} onChange={(e) => handleInputChange('three_d_model_url', e.target.value)} placeholder="https://sketchfab.com/models/..." />
                    </div>
                    <div>
                      <Label htmlFor="glb_model_url" className="text-sm">GLB/GLTF Model File URL</Label>
                      <Input id="glb_model_url" value={formData.glb_model_url} onChange={(e) => handleInputChange('glb_model_url', e.target.value)} placeholder="https://storage.example.com/model.glb" />
                    </div>
                    <div>
                      <Label htmlFor="drone_video_url" className="text-sm">Drone Walkthrough Video URL</Label>
                      <Input id="drone_video_url" value={formData.drone_video_url} onChange={(e) => handleInputChange('drone_video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Info callout */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">🏠 3D/VR Marketplace Advantage</p>
                <p>Properties with virtual tours get <strong className="text-primary">3x more inquiries</strong>. Upload 360° images, GLB models, or drone videos to stand out. A "Virtual Tour Available" badge will appear on your listing.</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {(isAgent || isAdmin) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO & Advanced Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Admin Only Settings */}
          {isAdmin && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Administrative Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="development_status">Development Status</Label>
                  <Select 
                    value={formData.development_status} 
                    onValueChange={(value) => handleInputChange('development_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="under_construction">Under Construction</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="new_project">New Project</SelectItem>
                      <SelectItem value="pre_launching">Pre-launching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="owner_type">Owner Type</Label>
                  <Select 
                    value={formData.owner_type} 
                    onValueChange={(value) => handleInputChange('owner_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Listing Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {!isAdmin && (
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-chart-3" />
                    Property will be submitted for admin approval
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/dijual')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPropertyMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createPropertyMutation.isPending ? (
                    'Creating...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Property
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>

    {/* Upgrade Modal */}
    {showUpgradeModal && (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Upgrade Required</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have reached your monthly AI generation limit (5). Upgrade to Pro for unlimited AI content.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => {
                setShowUpgradeModal(false);
                navigate('/membership');
              }}
            >
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowUpgradeModal(false)}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default RoleBasedPropertyForm;
