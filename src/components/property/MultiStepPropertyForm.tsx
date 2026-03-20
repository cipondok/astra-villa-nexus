import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Home, MapPin, Sparkles, Image, Eye, Save, Send, CheckCircle2, Clock, Trash2, Box, Lock, Crown } from "lucide-react";
import BasicInfoStep from "./steps/BasicInfoStep";
import PropertyDetailsStep from "./steps/PropertyDetailsStep";
import LocationStep from "./steps/LocationStep";
import FeaturesStep from "./steps/FeaturesStep";
import ImagesStep from "./steps/ImagesStep";
import Virtual3DStep from "./steps/Virtual3DStep";
import ReviewStep from "./steps/ReviewStep";
import TierLockedFeature from "./TierLockedFeature";
import TierFeatureBanner from "./TierFeatureBanner";
import { usePropertyFormTiers } from "@/hooks/usePropertyFormTiers";
import { MEMBERSHIP_LEVELS } from "@/types/membership";

// Auto-save configuration
const AUTO_SAVE_DELAY = 2000; // 2 seconds after user stops typing
const DRAFT_EXPIRY_DAYS = 7; // Keep drafts for 7 days

// Base steps definition
const ALL_STEPS = [
  { id: 'basic', label: 'Basic Info', labelId: 'Info Dasar', icon: FileText, requiredLevel: 'basic' as const },
  { id: 'details', label: 'Details', labelId: 'Detail', icon: Home, requiredLevel: 'basic' as const },
  { id: 'location', label: 'Location', labelId: 'Lokasi', icon: MapPin, requiredLevel: 'basic' as const },
  { id: 'features', label: 'Features', labelId: 'Fitur', icon: Sparkles, requiredLevel: 'basic' as const },
  { id: 'images', label: 'Images', labelId: 'Gambar', icon: Image, requiredLevel: 'basic' as const },
  { id: '3d-tour', label: '3D Tour', labelId: '3D Tour', icon: Box, requiredLevel: 'gold' as const },
  { id: 'review', label: 'Review', labelId: 'Review', icon: Eye, requiredLevel: 'basic' as const },
];

const MultiStepPropertyForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { language } = useTranslation();
  const isAdmin = profile?.role === 'admin';
  const isAgent = profile?.role === 'agent';
  
  // Get tier-based feature access
  const {
    membershipLevel,
    maxImages,
    canUseVirtualTour,
    canUse3DModel,
    isLoading: tierLoading
  } = usePropertyFormTiers();

  // Compute available steps based on membership tier
  const steps = useMemo(() => {
    return ALL_STEPS.filter(step => {
      // Always show basic steps
      if (step.requiredLevel === 'basic') return true;
      // Show 3D tour only for Gold+ or admins
      if (step.id === '3d-tour') return isAdmin || canUseVirtualTour || canUse3DModel;
      return true;
    });
  }, [isAdmin, canUseVirtualTour, canUse3DModel]);

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
    virtual_tour_url: "",
    three_d_model_url: "",
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

  const loadDraft = useCallback((opts?: { silent?: boolean }) => {
    if (!user) return;

    const draftKey = `property_draft_${user.id}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (!savedDraft) return;

    try {
      const { formData: savedForm, features: savedFeatures, currentTab: savedTab, timestamp } = JSON.parse(savedDraft);

      // Check if draft is expired
      if (isDraftExpired(timestamp)) {
        localStorage.removeItem(draftKey);
        return;
      }

      // Check if draft has meaningful data
      const hasData = savedForm?.title || savedForm?.description || savedForm?.property_type;
      if (!hasData) return;

      setHasDraft(true);
      setFormData(savedForm);
      setFeatures(savedFeatures);
      setCurrentTab(savedTab);
      setLastSaved(new Date(timestamp));

      if (!opts?.silent) {
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
  }, [user, showSuccess]);

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Allow external import to refresh the form immediately
  useEffect(() => {
    const handler = () => loadDraft({ silent: true });
    window.addEventListener('astra:property-imported', handler);
    return () => window.removeEventListener('astra:property-imported', handler);
  }, [loadDraft]);

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
      virtual_tour_url: "",
      three_d_model_url: "",
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
        virtual_tour_url: formData.virtual_tour_url || null,
        three_d_model_url: formData.three_d_model_url || null,
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
    <div className="space-y-2.5">
      {/* Tier Feature Banner */}
      <TierFeatureBanner />

      {/* Auto-save Status - inline instead of fixed */}
      {lastSaved && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-chart-1/8 w-fit">
          <CheckCircle2 className="h-2.5 w-2.5 text-chart-1" />
          <span className="text-[9px] text-chart-1 font-medium">Saved {getTimeSinceLastSave()}</span>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground shrink-0">
          {getCurrentStepIndex() + 1}/{steps.length}
        </span>
        <Progress value={progress} multiColor className="h-1 flex-1" />
        <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      {/* Modern Step Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="flex w-full h-auto p-0.5 gap-0.5 bg-muted/40 border border-border/50 rounded-lg overflow-x-auto no-scrollbar">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepIndex = steps.findIndex(s => s.id === step.id);
            const isCompleted = stepIndex < getCurrentStepIndex();
            const isCurrent = currentTab === step.id;
            const stepLabel = language === 'id' ? step.labelId : step.label;
            
            return (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className={`
                  flex items-center gap-1 py-1.5 px-2 text-[10px] font-medium relative rounded-md flex-1 min-w-0
                  transition-all duration-150
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                  ${isCompleted ? 'text-chart-1' : 'text-muted-foreground'}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                ) : (
                  <Icon className="h-3 w-3 shrink-0" />
                )}
                <span className="hidden md:inline truncate">{stepLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-2 rounded-lg border border-border/50 bg-card">
          <div className="p-2.5 md:p-4">
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
                propertyType={formData.property_type}
                onUpdate={updateFeature} 
              />
            </TabsContent>
            <TabsContent value="images" className="mt-0">
              <ImagesStep formData={formData} onUpdate={updateFormData} />
            </TabsContent>
            <TabsContent value="3d-tour" className="mt-0">
              <Virtual3DStep formData={formData} onUpdate={updateFormData} />
            </TabsContent>
            <TabsContent value="review" className="mt-0">
              <ReviewStep formData={formData} features={features} />
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[10px] px-2.5 border-border rounded-md"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[10px] px-2.5 border-border rounded-md"
            onClick={handleManualSave}
          >
            <Save className="h-2.5 w-2.5 mr-0.5" />
            Save
          </Button>
          {hasDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearDraft}
              className="h-7 text-[10px] px-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {currentTab !== 'basic' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-3 border-border rounded-md"
              onClick={goToPrevTab}
            >
              Prev
            </Button>
          )}
          
          {currentTab !== 'review' ? (
            <Button
              type="button"
              size="sm"
              className="h-7 text-[10px] px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
              onClick={goToNextTab}
              disabled={!isCurrentStepValid()}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-7 text-[10px] px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
            >
              <Send className="h-2.5 w-2.5 mr-0.5" />
              {isSubmitting ? '...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepPropertyForm;
