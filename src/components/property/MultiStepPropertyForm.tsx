import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Home, MapPin, Sparkles, Image, Eye, Save, Send } from "lucide-react";
import BasicInfoStep from "./steps/BasicInfoStep";
import PropertyDetailsStep from "./steps/PropertyDetailsStep";
import LocationStep from "./steps/LocationStep";
import FeaturesStep from "./steps/FeaturesStep";
import ImagesStep from "./steps/ImagesStep";
import ReviewStep from "./steps/ReviewStep";

const steps = [
  { id: 'basic', label: 'Basic Info', icon: FileText },
  { id: 'details', label: 'Details', icon: Home },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'features', label: 'Features', icon: Sparkles },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'review', label: 'Review', icon: Eye },
];

const MultiStepPropertyForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === 'admin';
  const isAgent = profile?.role === 'agent';

  const [currentTab, setCurrentTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
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
    district: "",
    subdistrict: "",
    development_status: "completed",
    owner_type: "individual",
    status: isAdmin ? "active" : "pending_approval",
    rental_periods: ["monthly"],
    minimum_rental_days: "30",
    images: [],
  });

  const [features, setFeatures] = useState({
    parking: false,
    swimming_pool: false,
    garden: false,
    balcony: false,
    furnished: false,
    air_conditioning: false,
    security: false,
    elevator: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFeature = (feature: string, value: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: value }));
  };

  // Save draft to localStorage
  const saveDraft = () => {
    localStorage.setItem('property_draft', JSON.stringify({ formData, features }));
    showSuccess('Draft Saved', 'Your progress has been saved locally');
  };

  // Load draft from localStorage
  const loadDraft = () => {
    const draft = localStorage.getItem('property_draft');
    if (draft) {
      const { formData: savedForm, features: savedFeatures } = JSON.parse(draft);
      setFormData(savedForm);
      setFeatures(savedFeatures);
      showSuccess('Draft Loaded', 'Your previous progress has been restored');
    } else {
      showError('No Draft Found', 'No saved draft available');
    }
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('property_draft');
  };

  const createPropertyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const propertyData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price: formData.price ? parseFloat(formData.price) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        area: formData.area,
        development_status: formData.development_status,
        owner_type: formData.owner_type,
        status: formData.status,
        approval_status: isAdmin ? 'approved' : 'pending',
        owner_id: user.id,
        agent_id: isAgent ? user.id : null,
        images: formData.images,
        image_urls: formData.images,
        seo_title: formData.title,
        seo_description: formData.description,
        property_features: { ...features },
        ...(formData.listing_type === 'rent' && {
          rental_periods: formData.rental_periods,
          minimum_rental_days: parseInt(formData.minimum_rental_days) || 30,
        }),
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const statusMessage = isAdmin 
        ? "Property has been created and is now active."
        : "Property has been submitted for approval.";
      
      showSuccess("Property Created", `Property "${data.title}" ${statusMessage}`);
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/dijual');
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message || 'Failed to create property');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.property_type || !formData.listing_type) {
      showError("Validation Error", "Please fill in all required fields");
      setCurrentTab('basic');
      return;
    }

    if (!formData.location || !formData.state) {
      showError("Validation Error", "Please select a location");
      setCurrentTab('location');
      return;
    }

    setIsSubmitting(true);
    createPropertyMutation.mutate();
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentTab);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const goToNextTab = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentTab(steps[currentIndex + 1].id);
    }
  };

  const goToPrevTab = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentTab(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Step {getCurrentStepIndex() + 1} of {steps.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">{step.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <TabsContent value="basic" className="mt-0">
              <BasicInfoStep formData={formData} onUpdate={updateFormData} />
            </TabsContent>

            <TabsContent value="details" className="mt-0">
              <PropertyDetailsStep formData={formData} onUpdate={updateFormData} />
            </TabsContent>

            <TabsContent value="location" className="mt-0">
              <LocationStep formData={formData} onUpdate={updateFormData} />
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              <FeaturesStep features={features} onUpdate={updateFeature} />
            </TabsContent>

            <TabsContent value="images" className="mt-0">
              <ImagesStep formData={formData} onUpdate={updateFormData} />
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              <ReviewStep formData={formData} features={features} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={saveDraft}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={loadDraft}
          >
            Load Draft
          </Button>
        </div>

        <div className="flex gap-2">
          {currentTab !== 'basic' && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevTab}
            >
              Previous
            </Button>
          )}
          
          {currentTab !== 'review' ? (
            <Button
              type="button"
              onClick={goToNextTab}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Property'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepPropertyForm;
