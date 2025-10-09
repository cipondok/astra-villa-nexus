import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Home, MapPin, Sparkles, Image, Eye, Save, Send, CheckCircle2, Clock, Trash2 } from "lucide-react";
import BasicInfoStep from "./steps/BasicInfoStep";
import PropertyDetailsStep from "./steps/PropertyDetailsStep";
import LocationStep from "./steps/LocationStep";
import FeaturesStep from "./steps/FeaturesStep";
import ImagesStep from "./steps/ImagesStep";
import ReviewStep from "./steps/ReviewStep";

// Auto-save configuration
const AUTO_SAVE_DELAY = 2000; // 2 seconds after user stops typing
const DRAFT_EXPIRY_DAYS = 7; // Keep drafts for 7 days

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

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

  // Auto-save to localStorage with debouncing
  const autoSaveDraft = useCallback(() => {
    if (!user) return;
    
    const draftKey = `property_draft_${user.id}`;
    const draftData = {
      formData,
      features,
      currentTab,
      timestamp: new Date().toISOString(),
      userId: user.id,
    };
    
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setLastSaved(new Date());
  }, [formData, features, currentTab, user]);

  // Check for expired drafts
  const isDraftExpired = (timestamp: string) => {
    const draftDate = new Date(timestamp);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - DRAFT_EXPIRY_DAYS);
    return draftDate < expiryDate;
  };

  // Load draft on component mount
  useEffect(() => {
    if (!user) return;

    const draftKey = `property_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const { formData: savedForm, features: savedFeatures, currentTab: savedTab, timestamp } = JSON.parse(savedDraft);
        
        // Check if draft is expired
        if (isDraftExpired(timestamp)) {
          localStorage.removeItem(draftKey);
          return;
        }

        // Check if draft has meaningful data
        const hasData = savedForm.title || savedForm.description || savedForm.property_type;
        
        if (hasData) {
          setHasDraft(true);
          setFormData(savedForm);
          setFeatures(savedFeatures);
          setCurrentTab(savedTab);
          setLastSaved(new Date(timestamp));
          
          // Show notification that draft was restored
          const draftAge = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000 / 60);
          showSuccess(
            'Draft Restored', 
            `Your previous work from ${draftAge < 60 ? draftAge + ' minutes' : Math.floor(draftAge / 60) + ' hours'} ago has been restored`
          );
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem(draftKey);
      }
    }
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.title || formData.description) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Auto-save with debouncing whenever form data changes
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      autoSaveDraft();
    }, AUTO_SAVE_DELAY);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData, features, currentTab, autoSaveDraft]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFeature = (feature: string, value: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: value }));
  };

  // Manual save with feedback
  const handleManualSave = () => {
    autoSaveDraft();
    showSuccess('Draft Saved', 'Your progress has been saved');
  };

  // Clear draft
  const clearDraft = () => {
    if (!user) return;
    const draftKey = `property_draft_${user.id}`;
    localStorage.removeItem(draftKey);
    setHasDraft(false);
    setLastSaved(null);
    showSuccess('Draft Cleared', 'Your saved draft has been removed');
  };

  // Reset form to initial state
  const resetForm = () => {
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
      district: "",
      subdistrict: "",
      development_status: "completed",
      owner_type: "individual",
      status: isAdmin ? "active" : "pending_approval",
      rental_periods: ["monthly"],
      minimum_rental_days: "30",
      images: [],
    });
    setFeatures({
      parking: false,
      swimming_pool: false,
      garden: false,
      balcony: false,
      furnished: false,
      air_conditioning: false,
      security: false,
      elevator: false,
    });
    setCurrentTab('basic');
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
      
      // Clear draft and reset form
      if (user) {
        const draftKey = `property_draft_${user.id}`;
        localStorage.removeItem(draftKey);
      }
      resetForm();
      setHasDraft(false);
      setLastSaved(null);
      
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

  // Check if current tab has required fields filled
  const isCurrentStepValid = () => {
    switch (currentTab) {
      case 'basic':
        return formData.title && formData.property_type && formData.listing_type && formData.description;
      case 'details':
        return formData.area_sqm;
      case 'location':
        return formData.location && formData.state && formData.city;
      case 'features':
        return true; // Optional
      case 'images':
        return formData.images && formData.images.length > 0;
      case 'review':
        return true;
      default:
        return true;
    }
  };

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

  // Format last saved time
  const getTimeSinceLastSave = () => {
    if (!lastSaved) return null;
    const seconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <div className="space-y-6">
      {/* Auto-save Status */}
      {lastSaved && (
        <Alert className="border-green-200 bg-green-50/50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-green-800">
              Auto-saved {getTimeSinceLastSave()}
            </span>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Session recovery enabled
            </Badge>
          </AlertDescription>
        </Alert>
      )}

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
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepIndex = steps.findIndex(s => s.id === step.id);
            const isCompleted = stepIndex < getCurrentStepIndex();
            const isCurrent = currentTab === step.id;
            
            return (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className="flex flex-col items-center gap-1 py-3 relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {isCompleted && (
                  <CheckCircle2 className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                )}
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
              <FeaturesStep 
                features={features} 
                listingType={formData.listing_type as 'sale' | 'rent' | 'lease' || 'sale'}
                onUpdate={updateFeature} 
              />
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
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
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
            onClick={handleManualSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Now
          </Button>
          {hasDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraft}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Draft
            </Button>
          )}
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
              disabled={!isCurrentStepValid()}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Property'}
            </Button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Tip: Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd> to save your progress anytime</p>
      </div>
    </div>
  );
};

export default MultiStepPropertyForm;
