import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface VendorApplication {
  id: string;
  vendor_type: 'product' | 'service';
  application_status: string;
  business_name: string;
  business_type: string;
  business_registration_number?: string;
  tax_id?: string;
  business_address: any;
  contact_info: any;
  bank_details: any;
  business_documents: string[];
  category_selections: string[];
  license_info: any;
  service_areas: any[];
  product_catalog: any[];
  compliance_region: 'UAE' | 'US' | 'EU';
  fraud_score: number;
  rejection_reason?: string;
  rejection_details: any;
  created_at: string;
  updated_at: string;
}

interface ValidationRule {
  id: string;
  field_name: string;
  vendor_type: string;
  validation_type: string;
  validation_logic: any;
  error_message: string;
  trigger_event: string;
  severity: string;
  compliance_region: string;
}

interface RejectionCode {
  code: string;
  category: string;
  description: string;
  resolution_steps: string[];
  auto_resubmit_allowed: boolean;
  estimated_fix_time_hours: number;
}

const VendorOnboardingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorType, setVendorType] = useState<'product' | 'service' | ''>('');
  const [complianceRegion, setComplianceRegion] = useState<'UAE' | 'US' | 'EU'>('UAE');
  const [formData, setFormData] = useState<Partial<VendorApplication>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch validation rules
  const { data: validationRules } = useQuery({
    queryKey: ['validation-rules', vendorType, complianceRegion],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('*')
        .in('vendor_type', [vendorType, 'both'])
        .eq('compliance_region', complianceRegion)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as ValidationRule[];
    },
    enabled: !!vendorType && !!complianceRegion
  });

  // Fetch document requirements
  const { data: documentRequirements } = useQuery({
    queryKey: ['document-requirements', vendorType, complianceRegion],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_requirements')
        .select('*')
        .in('vendor_type', [vendorType, 'both'])
        .eq('compliance_region', complianceRegion);
      
      if (error) throw error;
      return data;
    },
    enabled: !!vendorType && !!complianceRegion
  });

  // Fetch categories hierarchy
  const { data: categories } = useQuery({
    queryKey: ['categories-hierarchy', vendorType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', vendorType || 'service')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!vendorType
  });

  // Fetch existing application
  const { data: existingApplication } = useQuery({
    queryKey: ['vendor-application'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as VendorApplication | null;
    }
  });

  // Validation function
  const validateField = (fieldName: string, value: any) => {
    const rules = validationRules?.filter(rule => rule.field_name === fieldName) || [];
    
    for (const rule of rules) {
      const logic = rule.validation_logic;
      
      switch (rule.validation_type) {
        case 'regex':
          if (logic.pattern && !new RegExp(logic.pattern).test(value)) {
            return rule.error_message;
          }
          break;
        case 'range':
          const numValue = parseFloat(value);
          if (logic.min && numValue < logic.min) {
            return rule.error_message;
          }
          if (logic.max && numValue > logic.max) {
            return rule.error_message;
          }
          break;
        case 'required':
          if (!value || value.trim() === '') {
            return rule.error_message;
          }
          break;
      }
    }
    return null;
  };

  // Handle field changes with real-time validation
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  };

  // Save application mutation
  const saveApplicationMutation = useMutation({
    mutationFn: async (data: Partial<VendorApplication>) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const applicationData = {
        ...data,
        user_id: user.id,
        vendor_type: vendorType as 'product' | 'service',
        compliance_region: complianceRegion,
        application_status: 'draft',
        business_name: data.business_name || '',
        business_type: data.business_type || ''
      };

      if (applicationId) {
        const { error } = await supabase
          .from('vendor_applications')
          .update(applicationData)
          .eq('id', applicationId);
        if (error) throw error;
      } else {
        const { data: newApp, error } = await supabase
          .from('vendor_applications')
          .insert(applicationData)
          .select()
          .single();
        
        if (error) throw error;
        setApplicationId(newApp.id);
      }
    },
    onSuccess: () => {
      showSuccess("Success", "Application saved successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-application'] });
    },
    onError: () => {
      showError("Error", "Failed to save application");
    }
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!applicationId) throw new Error('No application to submit');

      const { error } = await supabase
        .from('vendor_applications')
        .update({ 
          application_status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Application submitted for review");
      queryClient.invalidateQueries({ queryKey: ['vendor-application'] });
    },
    onError: () => {
      showError("Error", "Failed to submit application");
    }
  });

  // Initialize form data from existing application
  useEffect(() => {
    if (existingApplication) {
      setFormData(existingApplication);
      setVendorType(existingApplication.vendor_type);
      setComplianceRegion(existingApplication.compliance_region);
      setApplicationId(existingApplication.id);
    }
  }, [existingApplication]);

  const renderStepIndicator = () => (
    <div className="mb-8">
      <Progress value={(currentStep / 5) * 100} className="w-full" />
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>Step {currentStep} of 5</span>
        <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendor_type">Vendor Type</Label>
          <Select 
            value={vendorType} 
            onValueChange={(value: 'product' | 'service') => setVendorType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vendor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product Vendor</SelectItem>
              <SelectItem value="service">Service Provider</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="compliance_region">Region</Label>
          <Select 
            value={complianceRegion} 
            onValueChange={(value: 'UAE' | 'US' | 'EU') => setComplianceRegion(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UAE">UAE</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="EU">European Union</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="business_name">Business Name</Label>
        <Input
          id="business_name"
          value={formData.business_name || ''}
          onChange={(e) => handleFieldChange('business_name', e.target.value)}
          placeholder="Enter your business name"
        />
        {validationErrors.business_name && (
          <p className="text-sm text-destructive mt-1">{validationErrors.business_name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="business_type">Business Type</Label>
        <Select 
          value={formData.business_type || ''} 
          onValueChange={(value) => handleFieldChange('business_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
            <SelectItem value="llc">Limited Liability Company</SelectItem>
            <SelectItem value="corporation">Corporation</SelectItem>
            <SelectItem value="partnership">Partnership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="business_registration_number">Business Registration Number</Label>
        <Input
          id="business_registration_number"
          value={formData.business_registration_number || ''}
          onChange={(e) => handleFieldChange('business_registration_number', e.target.value)}
          placeholder={complianceRegion === 'UAE' ? 'CN-1234567' : 'AB12345678'}
        />
        {validationErrors.business_registration_number && (
          <p className="text-sm text-destructive mt-1">{validationErrors.business_registration_number}</p>
        )}
      </div>

      <div>
        <Label htmlFor="tax_id">Tax ID</Label>
        <Input
          id="tax_id"
          value={formData.tax_id || ''}
          onChange={(e) => handleFieldChange('tax_id', e.target.value)}
          placeholder={complianceRegion === 'UAE' ? '123456789012345' : '12-3456789'}
        />
        {validationErrors.tax_id && (
          <p className="text-sm text-destructive mt-1">{validationErrors.tax_id}</p>
        )}
      </div>
    </div>
  );

  const renderCategorySelection = () => {
    const mainCategories = categories?.filter(cat => cat.level === 1) || [];
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Select Your Categories</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the categories that best describe your {vendorType} offerings
          </p>
        </div>

        <div className="space-y-4">
          {mainCategories.map(category => {
            const meta = typeof category.meta === 'object' && category.meta ? category.meta as any : {};
            return (
              <Card key={category.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{meta.icon || '📦'}</span>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{meta.description || 'No description available'}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDocumentUpload = () => (
    <div className="space-y-4">
      <div>
        <Label>Required Documents</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload the following documents for verification
        </p>
      </div>

      {documentRequirements?.map(requirement => (
        <Card key={requirement.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <div>
                <h4 className="font-medium">{requirement.document_name}</h4>
                <p className="text-sm text-muted-foreground">{requirement.description}</p>
                {requirement.is_required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderApplicationStatus = () => {
    if (!existingApplication) return null;

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
        case 'under_review': return <Clock className="h-5 w-5 text-yellow-600" />;
        default: return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved': return 'text-green-600';
        case 'rejected': return 'text-red-600';
        case 'under_review': return 'text-yellow-600';
        default: return 'text-blue-600';
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(existingApplication.application_status)}
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${getStatusColor(existingApplication.application_status)}`}>
                {existingApplication.application_status.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Business: {existingApplication.business_name}
              </p>
            </div>
            <Badge variant="outline">
              Fraud Score: {existingApplication.fraud_score}/100
            </Badge>
          </div>

          {existingApplication.rejection_reason && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rejection Reason:</strong> {existingApplication.rejection_reason}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendor Registration</h1>
        <p className="text-muted-foreground">
          Complete your vendor application to start offering your {vendorType || 'products/services'} on our platform
        </p>
      </div>

      {renderApplicationStatus()}
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor Application Form</CardTitle>
          <CardDescription>
            Fill out all required information to get approved as a vendor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}

          <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="1">Basic Info</TabsTrigger>
              <TabsTrigger value="2">Categories</TabsTrigger>
              <TabsTrigger value="3">Documents</TabsTrigger>
              <TabsTrigger value="4">Verification</TabsTrigger>
              <TabsTrigger value="5">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="1" className="mt-6">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="2" className="mt-6">
              {renderCategorySelection()}
            </TabsContent>

            <TabsContent value="3" className="mt-6">
              {renderDocumentUpload()}
            </TabsContent>

            <TabsContent value="4" className="mt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Verification Step</h3>
                <p className="text-muted-foreground">
                  Your application will be verified automatically and manually reviewed
                </p>
              </div>
            </TabsContent>

            <TabsContent value="5" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Your Application</h3>
                <div className="space-y-2">
                  <p><strong>Business Name:</strong> {formData.business_name}</p>
                  <p><strong>Vendor Type:</strong> {vendorType}</p>
                  <p><strong>Region:</strong> {complianceRegion}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => saveApplicationMutation.mutate(formData)}
                disabled={saveApplicationMutation.isPending}
              >
                Save Draft
              </Button>
              
              {currentStep === 5 ? (
                <Button 
                  onClick={() => submitApplicationMutation.mutate()}
                  disabled={submitApplicationMutation.isPending}
                >
                  Submit Application
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOnboardingSystem;