import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Image, 
  DollarSign, 
  Send, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Clock,
  Save,
  Sparkles,
  Zap
} from "lucide-react";
import SimpleImageUpload from "./SimpleImageUpload";
import EnhancedLocationSelector from "./EnhancedLocationSelector";

const steps = [
  { id: 1, label: 'Basic Info', icon: FileText, description: 'Title, type & description' },
  { id: 2, label: 'Photos', icon: Image, description: 'Upload property images' },
  { id: 3, label: 'Pricing', icon: DollarSign, description: 'Set your price' },
];

interface QuickPropertyFormProps {
  onComplete?: () => void;
}

const QuickPropertyForm = ({ onComplete }: QuickPropertyFormProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === 'admin';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "",
    listing_type: "",
    price: "",
    location: "",
    state: "",
    city: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    images: [] as string[],
  });

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (!user) return;
    const draftKey = `quick_property_draft_${user.id}`;
    localStorage.setItem(draftKey, JSON.stringify({
      formData,
      currentStep,
      timestamp: new Date().toISOString()
    }));
    setLastSaved(new Date());
  }, [formData, currentStep, user]);

  // Load draft on mount
  useEffect(() => {
    if (!user) return;
    const draftKey = `quick_property_draft_${user.id}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const { formData: savedData, currentStep: savedStep, timestamp } = JSON.parse(saved);
        // Only restore if less than 24 hours old
        const age = Date.now() - new Date(timestamp).getTime();
        if (age < 24 * 60 * 60 * 1000 && savedData.title) {
          setFormData(savedData);
          setCurrentStep(savedStep);
          setLastSaved(new Date(timestamp));
          showSuccess('Draft Restored', 'Your previous listing has been restored');
        }
      } catch (e) {
        localStorage.removeItem(draftKey);
      }
    }
  }, [user]);

  // Auto-save on change
  useEffect(() => {
    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [formData, saveDraft]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        location: formData.location,
        state: formData.state,
        city: formData.city,
        area: formData.area,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseInt(formData.area_sqm) : null,
        images: formData.images,
        image_urls: formData.images,
        owner_id: user.id,
        agent_id: user.id,
        status: isAdmin ? 'active' : 'pending_approval',
        approval_status: isAdmin ? 'approved' : 'pending',
        development_status: 'completed',
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
      showSuccess("Property Created!", `"${data.title}" has been submitted for review.`);
      
      // Clear draft
      if (user) {
        localStorage.removeItem(`quick_property_draft_${user.id}`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onComplete?.();
      navigate('/my-properties');
    },
    onError: (error: any) => {
      showError("Error", error.message || 'Failed to create property');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.property_type || !formData.listing_type) {
      showError("Missing Info", "Please complete all required fields");
      setCurrentStep(1);
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      showError("No Photos", "Please add at least one photo");
      setCurrentStep(2);
      return;
    }
    if (!formData.price) {
      showError("No Price", "Please set a price for your property");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    createPropertyMutation.mutate();
  };

  const progress = (currentStep / steps.length) * 100;

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.property_type && formData.listing_type;
      case 2:
        return formData.images && formData.images.length > 0;
      case 3:
        return formData.price;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Quick Listing</span>
          {lastSaved && (
            <Badge variant="secondary" className="text-[9px] px-1.5">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              Saved
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{currentStep}/3</span>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex-1 p-2 rounded-lg border transition-all ${
                isCurrent 
                  ? 'border-primary bg-primary/10 shadow-sm' 
                  : isCompleted
                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-border bg-muted/20 opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Icon className="h-2.5 w-2.5" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] font-medium">{step.label}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Progress value={progress} className="h-1" />

      {/* Step Content */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Property Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Modern Villa in Seminyak"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type *</Label>
                  <Select value={formData.property_type} onValueChange={(v) => updateFormData('property_type', v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Listing Type *</Label>
                  <Select value={formData.listing_type} onValueChange={(v) => updateFormData('listing_type', v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your property..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* Quick Location */}
              <EnhancedLocationSelector
                selectedState={formData.state}
                selectedCity={formData.city}
                selectedArea={formData.area}
                onStateChange={(v) => updateFormData('state', v)}
                onCityChange={(v) => updateFormData('city', v)}
                onAreaChange={(v) => updateFormData('area', v)}
                onLocationChange={(v) => updateFormData('location', v)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Image className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-sm font-medium">Add Photos</h3>
                <p className="text-xs text-muted-foreground">Upload at least 1 photo to continue</p>
              </div>
              
              <SimpleImageUpload
                images={formData.images}
                onImagesChange={(images) => updateFormData('images', images)}
              />

              {formData.images.length > 0 && (
                <Alert className="border-emerald-200 bg-emerald-50/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-sm text-emerald-800">
                    {formData.images.length} photo{formData.images.length > 1 ? 's' : ''} uploaded
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <DollarSign className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-sm font-medium">Set Your Price</h3>
                <p className="text-xs text-muted-foreground">Enter your asking price in IDR</p>
              </div>

              <div>
                <Label className="text-xs">Price (IDR) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', e.target.value)}
                  placeholder="e.g., 2500000000"
                  className="mt-1 text-lg font-semibold"
                />
                {formData.price && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rp {parseInt(formData.price).toLocaleString('id-ID')}
                    {formData.listing_type === 'rent' && '/month'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Bedrooms</Label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData('bedrooms', e.target.value)}
                    placeholder="3"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Bathrooms</Label>
                  <Input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData('bathrooms', e.target.value)}
                    placeholder="2"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Area (m²)</Label>
                  <Input
                    type="number"
                    value={formData.area_sqm}
                    onChange={(e) => updateFormData('area_sqm', e.target.value)}
                    placeholder="150"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Summary Preview */}
              <Card className="bg-muted/30 border-dashed">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Listing Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex gap-3">
                    {formData.images[0] && (
                      <img 
                        src={formData.images[0]} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{formData.title || 'Untitled Property'}</p>
                      <p className="text-xs text-muted-foreground">{formData.location || 'No location'}</p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formData.price ? `Rp ${parseInt(formData.price).toLocaleString('id-ID')}` : 'No price'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid(currentStep)}
            className="flex-1"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isStepValid(3)}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Submitting...' : 'Submit Listing'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuickPropertyForm;
