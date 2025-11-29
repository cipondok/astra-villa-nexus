import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Home, CheckCircle, Building, MapPin, User, Briefcase, MessageCircle, Navigation, Loader2 } from "lucide-react";

interface PropertyOwnerRegistrationFormProps {
  onSuccess: () => void;
}

const PropertyOwnerRegistrationForm = ({ onSuccess }: PropertyOwnerRegistrationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    whatsapp_available: false,
    property_count: '1',
    property_types: [] as string[],
    owner_type: '' as 'individual' | 'business' | '',
    province: '',
    city: '',
    area: '',
    street_address: '',
    gps_lat: '',
    gps_lng: '',
    business_name: '',
    business_registration_number: '',
    business_province: '',
    business_city: '',
    business_area: '',
    business_street_address: '',
    business_gps_lat: '',
    business_gps_lng: '',
    social_media: {
      facebook: '',
      instagram: '',
      tiktok: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    },
    additional_info: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [gettingPropertyLocation, setGettingPropertyLocation] = useState(false);
  const [gettingBusinessLocation, setGettingBusinessLocation] = useState(false);

  // Fetch locations from database
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('province_name, city_name, area_name')
        .eq('is_active', true)
        .order('province_name', { ascending: true })
        .order('city_name', { ascending: true })
        .order('area_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Get unique provinces
  const provinces = locations 
    ? [...new Set(locations.map(loc => loc.province_name).filter(Boolean))]
    : [];

  // Get cities for selected province
  const cities = locations 
    ? [...new Set(locations
        .filter(loc => loc.province_name === formData.province)
        .map(loc => loc.city_name)
        .filter(Boolean))]
    : [];

  // Get areas for selected province and city
  const areas = locations
    ? [...new Set(locations
        .filter(loc => loc.province_name === formData.province && loc.city_name === formData.city)
        .map(loc => loc.area_name)
        .filter(Boolean))]
    : [];

  // Business location options
  const businessCities = locations 
    ? [...new Set(locations
        .filter(loc => loc.province_name === formData.business_province)
        .map(loc => loc.city_name)
        .filter(Boolean))]
    : [];

  const businessAreas = locations
    ? [...new Set(locations
        .filter(loc => loc.province_name === formData.business_province && loc.city_name === formData.business_city)
        .map(loc => loc.area_name)
        .filter(Boolean))]
    : [];

  const propertyTypes = [
    { value: 'house', label: 'House / Rumah' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land / Tanah' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'warehouse', label: 'Warehouse' }
  ];

  const socialMediaPlatforms = [
    { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/username' },
    { key: 'instagram', label: 'Instagram', placeholder: '@username' },
    { key: 'tiktok', label: 'TikTok', placeholder: '@username' },
    { key: 'twitter', label: 'Twitter/X', placeholder: '@username' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username' },
    { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@channel' }
  ];

  // Reverse geocode and match to database locations
  const reverseGeocodeAndMatch = async (lat: number, lng: number, type: 'property' | 'business') => {
    try {
      // Use Mapbox Geocoding API
      const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTN1eGo4eXAwMWV4MnFzYTNwaTgzZnN0In0.JfxWbLcAYW83y5b-A5hLUQ';
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=region,district,locality,place&country=id`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        let detectedProvince = '';
        let detectedCity = '';
        let detectedArea = '';
        let streetAddress = '';

        // Parse the response to extract location components
        for (const feature of data.features) {
          const placeType = feature.place_type?.[0];
          const text = feature.text || '';
          
          if (placeType === 'region') {
            detectedProvince = text;
          } else if (placeType === 'place' || placeType === 'district') {
            if (!detectedCity) detectedCity = text;
            else if (!detectedArea) detectedArea = text;
          } else if (placeType === 'locality') {
            detectedArea = text;
          }
        }

        // Get full address from first result
        if (data.features[0]?.place_name) {
          streetAddress = data.features[0].place_name;
        }

        // Try to match with database locations
        if (locations && locations.length > 0) {
          // Find matching province (case insensitive)
          const matchedProvince = provinces.find(p => 
            p.toLowerCase().includes(detectedProvince.toLowerCase()) ||
            detectedProvince.toLowerCase().includes(p.toLowerCase())
          );

          if (matchedProvince) {
            const citiesForProvince = [...new Set(locations
              .filter(loc => loc.province_name === matchedProvince)
              .map(loc => loc.city_name)
              .filter(Boolean))];

            // Find matching city
            const matchedCity = citiesForProvince.find(c =>
              c.toLowerCase().includes(detectedCity.toLowerCase()) ||
              detectedCity.toLowerCase().includes(c.toLowerCase())
            );

            if (type === 'property') {
              setFormData(prev => ({
                ...prev,
                province: matchedProvince,
                city: matchedCity || '',
                area: '',
                street_address: streetAddress
              }));

              // If city matched, try to find area
              if (matchedCity) {
                const areasForCity = [...new Set(locations
                  .filter(loc => loc.province_name === matchedProvince && loc.city_name === matchedCity)
                  .map(loc => loc.area_name)
                  .filter(Boolean))];

                const matchedArea = areasForCity.find(a =>
                  a.toLowerCase().includes(detectedArea.toLowerCase()) ||
                  detectedArea.toLowerCase().includes(a.toLowerCase())
                );

                if (matchedArea) {
                  setFormData(prev => ({ ...prev, area: matchedArea }));
                }
              }
            } else {
              setFormData(prev => ({
                ...prev,
                business_province: matchedProvince,
                business_city: matchedCity || '',
                business_area: '',
                business_street_address: streetAddress
              }));

              if (matchedCity) {
                const areasForCity = [...new Set(locations
                  .filter(loc => loc.province_name === matchedProvince && loc.city_name === matchedCity)
                  .map(loc => loc.area_name)
                  .filter(Boolean))];

                const matchedArea = areasForCity.find(a =>
                  a.toLowerCase().includes(detectedArea.toLowerCase()) ||
                  detectedArea.toLowerCase().includes(a.toLowerCase())
                );

                if (matchedArea) {
                  setFormData(prev => ({ ...prev, business_area: matchedArea }));
                }
              }
            }

            toast({ 
              title: "Location Auto-filled", 
              description: `Detected: ${matchedProvince}${matchedCity ? ', ' + matchedCity : ''}` 
            });
            return;
          }
        }

        // If no match found, just fill the street address
        if (type === 'property') {
          setFormData(prev => ({ ...prev, street_address: streetAddress }));
        } else {
          setFormData(prev => ({ ...prev, business_street_address: streetAddress }));
        }
        toast({ title: "Address Detected", description: "Please select province/city manually." });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Get GPS location for property
  const getPropertyGPSLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS Not Available", description: "Your browser doesn't support GPS.", variant: "destructive" });
      return;
    }
    setGettingPropertyLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          gps_lat: lat.toFixed(6),
          gps_lng: lng.toFixed(6)
        }));
        
        // Auto-detect and fill location fields
        await reverseGeocodeAndMatch(lat, lng, 'property');
        setGettingPropertyLocation(false);
      },
      () => {
        toast({ title: "Location Error", description: "Unable to get your location.", variant: "destructive" });
        setGettingPropertyLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Get GPS location for business
  const getBusinessGPSLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS Not Available", description: "Your browser doesn't support GPS.", variant: "destructive" });
      return;
    }
    setGettingBusinessLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          business_gps_lat: lat.toFixed(6),
          business_gps_lng: lng.toFixed(6)
        }));
        
        // Auto-detect and fill location fields
        await reverseGeocodeAndMatch(lat, lng, 'business');
        setGettingBusinessLocation(false);
      },
      () => {
        toast({ title: "Location Error", description: "Unable to get your location.", variant: "destructive" });
        setGettingBusinessLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields with specific error messages
    const errors: string[] = [];
    
    if (!user) {
      toast({ title: "Authentication Required", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    
    if (!formData.full_name.trim()) {
      errors.push("Full Name is required");
    }
    
    if (!formData.phone.trim()) {
      errors.push("Phone Number is required");
    }
    
    if (!formData.owner_type) {
      errors.push("Registration Type (Individual/Business) is required");
    }
    
    if (formData.property_types.length === 0) {
      errors.push("At least one Property Type must be selected");
    }
    
    if (!formData.province) {
      errors.push("Province is required");
    }
    
    if (!formData.city) {
      errors.push("City is required");
    }
    
    // Business validation
    if (formData.owner_type === 'business') {
      if (!formData.business_name.trim()) {
        errors.push("Business Name is required");
      }
      if (!formData.business_province) {
        errors.push("Business Province is required");
      }
      if (!formData.business_city) {
        errors.push("Business City is required");
      }
    }
    
    if (errors.length > 0) {
      toast({ 
        title: "Please fix the following errors:", 
        description: errors.join("\n• "), 
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);
    try {
      // Update profile (use update, not upsert - profile already exists for logged-in users)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Continue even if profile update fails - it's not critical
      }

      // Insert role request into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'property_owner',
          is_active: false // Pending approval
        }, { onConflict: 'user_id,role' });

      if (roleError) {
        console.error('Role insert error:', roleError);
        // Continue even if role insert fails - it might already exist
      }

      const activeSocialMedia = Object.fromEntries(
        Object.entries(formData.social_media).filter(([_, value]) => value.trim() !== '')
      );

      // Log activity
      const { error: activityError } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'role_upgrade_request',
        activity_description: `User requested upgrade to property_owner role (${formData.owner_type})`,
        metadata: {
          owner_type: formData.owner_type,
          property_count: formData.property_count,
          property_types: formData.property_types,
          property_location: {
            province: formData.province,
            city: formData.city,
            area: formData.area,
            street_address: formData.street_address,
            gps: formData.gps_lat && formData.gps_lng ? { lat: formData.gps_lat, lng: formData.gps_lng } : null
          },
          phone: formData.phone,
          whatsapp_available: formData.whatsapp_available,
          ...(formData.owner_type === 'business' && {
            business_info: {
              name: formData.business_name,
              registration_number: formData.business_registration_number,
              location: {
                province: formData.business_province,
                city: formData.business_city,
                area: formData.business_area,
                street_address: formData.business_street_address,
                gps: formData.business_gps_lat && formData.business_gps_lng 
                  ? { lat: formData.business_gps_lat, lng: formData.business_gps_lng } : null
              }
            }
          }),
          social_media: Object.keys(activeSocialMedia).length > 0 ? activeSocialMedia : null
        }
      });

      if (activityError) {
        console.error('Activity log error:', activityError);
      }

      toast({ title: "Application Submitted!", description: "Your property owner application is pending review." });
      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({ 
        title: "Registration Failed", 
        description: error.message || "An error occurred. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePropertyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      property_types: prev.property_types.includes(type)
        ? prev.property_types.filter(t => t !== type)
        : [...prev.property_types, type]
    }));
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [platform]: value }
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <Card className="border-0 sm:border">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Become a Property Owner
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">
            Register your properties and manage them through our platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-3 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Owner Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Registration Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.owner_type === 'individual' ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, owner_type: 'individual' })}
                  className="h-12 sm:h-14 flex flex-col gap-1"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs">Individual Sale</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.owner_type === 'business' ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, owner_type: 'business' })}
                  className="h-12 sm:h-14 flex flex-col gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Business</span>
                </Button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="full_name" className="text-xs">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                  required
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-8 sm:h-9 text-xs sm:text-sm bg-muted"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62..."
                  required
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <Checkbox
                    id="whatsapp"
                    checked={formData.whatsapp_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, whatsapp_available: checked as boolean })}
                  />
                  <Label htmlFor="whatsapp" className="text-[10px] sm:text-xs flex items-center gap-1 cursor-pointer">
                    <MessageCircle className="h-3 w-3 text-green-600" />
                    WhatsApp available
                  </Label>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="property_count" className="text-xs">Number of Properties *</Label>
                <Select
                  value={formData.property_count}
                  onValueChange={(value) => setFormData({ ...formData, property_count: value })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 property</SelectItem>
                    <SelectItem value="2">2 properties</SelectItem>
                    <SelectItem value="3">3 properties</SelectItem>
                    <SelectItem value="4">4 properties</SelectItem>
                    <SelectItem value="5">5 properties</SelectItem>
                    <SelectItem value="6-10">6-10 properties</SelectItem>
                    <SelectItem value="10+">More than 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-1.5">
              <Label className="text-xs">Property Types *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {propertyTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.property_types.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePropertyType(type.value)}
                    className="h-7 sm:h-8 text-[10px] sm:text-xs justify-start px-2"
                  >
                    <Building className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Location - INLINE, NOT A SEPARATE COMPONENT */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
              <Label className="text-xs font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                Property Location *
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Province *</Label>
                  <Select 
                    value={formData.province} 
                    onValueChange={(value) => setFormData({ ...formData, province: value, city: '', area: '' })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={locationsLoading ? "Loading..." : "Select Province"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov} value={prov} className="text-xs">
                          {prov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">City *</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => setFormData({ ...formData, city: value, area: '' })}
                    disabled={!formData.province}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Area</Label>
                  <Select 
                    value={formData.area} 
                    onValueChange={(value) => setFormData({ ...formData, area: value })}
                    disabled={!formData.city}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a} value={a} className="text-xs">
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Street Address</Label>
                <Input
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  placeholder="Street name, building number, etc."
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">GPS Coordinates</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getPropertyGPSLocation}
                    disabled={gettingPropertyLocation}
                    className="h-6 text-[10px] px-2"
                  >
                    {gettingPropertyLocation ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Navigation className="h-3 w-3 mr-1" />}
                    {gettingPropertyLocation ? "Detecting..." : "Auto-detect Location"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.gps_lat}
                    onChange={(e) => setFormData({ ...formData, gps_lat: e.target.value })}
                    placeholder="Latitude"
                    className="h-7 text-[10px]"
                  />
                  <Input
                    value={formData.gps_lng}
                    onChange={(e) => setFormData({ ...formData, gps_lng: e.target.value })}
                    placeholder="Longitude"
                    className="h-7 text-[10px]"
                  />
                </div>
                {formData.gps_lat && formData.gps_lng && (
                  <p className="text-[9px] text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5" />
                    GPS location captured
                  </p>
                )}
              </div>
            </div>

            {/* Business Information (Conditional) */}
            {formData.owner_type === 'business' && (
              <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-primary" />
                  Business Information *
                </Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Business Name *</Label>
                    <Input
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder="Company/Business name"
                      required={formData.owner_type === 'business'}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Registration Number</Label>
                    <Input
                      value={formData.business_registration_number}
                      onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                      placeholder="SIUP/NIB/etc."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Business Location */}
                <div className="pt-2 border-t space-y-2">
                  <Label className="text-[10px] font-medium text-muted-foreground">Business Address *</Label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Province *</Label>
                      <Select 
                        value={formData.business_province} 
                        onValueChange={(value) => setFormData({ ...formData, business_province: value, business_city: '', business_area: '' })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((prov) => (
                            <SelectItem key={prov} value={prov} className="text-xs">
                              {prov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">City *</Label>
                      <Select 
                        value={formData.business_city} 
                        onValueChange={(value) => setFormData({ ...formData, business_city: value, business_area: '' })}
                        disabled={!formData.business_province}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessCities.map((c) => (
                            <SelectItem key={c} value={c} className="text-xs">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Area</Label>
                      <Select 
                        value={formData.business_area} 
                        onValueChange={(value) => setFormData({ ...formData, business_area: value })}
                        disabled={!formData.business_city}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select Area" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessAreas.map((a) => (
                            <SelectItem key={a} value={a} className="text-xs">
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Street Address</Label>
                    <Input
                      value={formData.business_street_address}
                      onChange={(e) => setFormData({ ...formData, business_street_address: e.target.value })}
                      placeholder="Business street address"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground">GPS Coordinates</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getBusinessGPSLocation}
                        disabled={gettingBusinessLocation}
                        className="h-6 text-[10px] px-2"
                      >
                        {gettingBusinessLocation ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Navigation className="h-3 w-3 mr-1" />}
                        {gettingBusinessLocation ? "Detecting..." : "Auto-detect Location"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={formData.business_gps_lat}
                        onChange={(e) => setFormData({ ...formData, business_gps_lat: e.target.value })}
                        placeholder="Latitude"
                        className="h-7 text-[10px]"
                      />
                      <Input
                        value={formData.business_gps_lng}
                        onChange={(e) => setFormData({ ...formData, business_gps_lng: e.target.value })}
                        placeholder="Longitude"
                        className="h-7 text-[10px]"
                      />
                    </div>
                    {formData.business_gps_lat && formData.business_gps_lng && (
                      <p className="text-[9px] text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-2.5 w-2.5" />
                        GPS location captured
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Social Media (Optional) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Social Media (Optional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {socialMediaPlatforms.map((platform) => (
                  <div key={platform.key} className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">{platform.label}</Label>
                    <Input
                      value={formData.social_media[platform.key as keyof typeof formData.social_media]}
                      onChange={(e) => updateSocialMedia(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="h-7 text-[10px] sm:text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-1">
              <Label htmlFor="additional_info" className="text-xs">Additional Information</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                placeholder="Tell us more about your properties..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            {/* Benefits Info */}
            <div className="p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-primary text-xs sm:text-sm mb-1.5">Property Owner Benefits</h3>
              <ul className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs text-muted-foreground">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />List multiple properties</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />Property analytics</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />Connect with agents</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />Book vendor services</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={submitting || formData.property_types.length === 0 || !formData.owner_type}
              className="w-full h-9 text-sm"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyOwnerRegistrationForm;
