import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import CategoryStep from './steps/CategoryStep';
import LocationStep from './steps/LocationStep';
import PictureUploadStep from './steps/PictureUploadStep';
import PricingStep from './steps/PricingStep';
import ReviewStep from './steps/ReviewStep';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ServiceFormData {
  // Step 1: Category
  category: string;
  subcategory: string;
  serviceName: string;
  serviceDescription: string;
  
  // Step 2: Location
  serviceAreas: string[];
  locationType: 'on_site' | 'remote' | 'both';
  travelRadius: number;
  
  // Step 3: Pictures
  serviceImages: File[];
  imageUrls: string[];
  
  // Step 4: Pricing
  priceType: 'fixed' | 'hourly' | 'package';
  basePrice: number;
  currency: string;
  duration: number;
  durationUnit: 'minutes' | 'hours' | 'days';
  packages: Array<{
    name: string;
    description: string;
    price: number;
    duration: number;
  }>;
  
  // Step 5: Additional Details
  requirements: string;
  cancellationPolicy: string;
  availability: string;
}

const steps = [
  { id: 1, title: 'Category', description: 'Choose service category' },
  { id: 2, title: 'Location', description: 'Set service areas' },
  { id: 3, title: 'Pictures', description: 'Upload service images' },
  { id: 4, title: 'Pricing', description: 'Set your pricing' },
  { id: 5, title: 'Review', description: 'Review and submit' },
];

interface MultiStepServiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MultiStepServiceForm: React.FC<MultiStepServiceFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    category: '',
    subcategory: '',
    serviceName: '',
    serviceDescription: '',
    serviceAreas: [],
    locationType: 'on_site',
    travelRadius: 10,
    serviceImages: [],
    imageUrls: [],
    priceType: 'fixed',
    basePrice: 0,
    currency: 'IDR',
    duration: 1,
    durationUnit: 'hours',
    packages: [],
    requirements: '',
    cancellationPolicy: '',
    availability: '',
  });

  const updateFormData = (data: Partial<ServiceFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload images first if any
      let uploadedImageUrls: string[] = [];
      
      if (formData.serviceImages.length > 0) {
        for (const image of formData.serviceImages) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('vendor-docs')
            .upload(fileName, image);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('vendor-docs')
            .getPublicUrl(fileName);
          
          uploadedImageUrls.push(publicUrl);
        }
      }

      // Create the service
      const serviceData = {
        vendor_id: user?.id,
        service_name: formData.serviceName,
        service_description: formData.serviceDescription,
        service_category: formData.category,
        service_location_types: [formData.locationType],
        service_location_state: formData.serviceAreas.join(', '),
        duration_value: formData.duration,
        duration_unit: formData.durationUnit,
        requirements: formData.requirements,
        cancellation_policy: formData.cancellationPolicy,
        currency: formData.currency,
        is_active: true,
        service_images: uploadedImageUrls,
        admin_approval_status: 'pending'
      };

      const { error: serviceError } = await supabase
        .from('vendor_services')
        .insert([serviceData]);

      if (serviceError) throw serviceError;

      toast.success('Service created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CategoryStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <LocationStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <PictureUploadStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PricingStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.category && formData.serviceName;
      case 2:
        return formData.serviceAreas.length > 0;
      case 3:
        return true; // Pictures are optional
      case 4:
        return formData.basePrice > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Step {currentStep} of {steps.length}</h3>
          <Badge variant="outline">{Math.round((currentStep / steps.length) * 100)}% Complete</Badge>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="w-full" />
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.id 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="text-center mt-2">
                <p className="text-xs font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onClose : prevStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Service'}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepServiceForm;