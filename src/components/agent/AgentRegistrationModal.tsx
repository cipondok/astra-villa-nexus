
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Building2, FileText, AlertCircle, Check } from "lucide-react";


interface AgentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgentRegistrationModal = ({ isOpen, onClose }: AgentRegistrationModalProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    license_number: "",
    company_name: "",
    business_type: "",
    additional_info: ""
  });
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const { showSuccess, showError } = useAlert();
  const { profile } = useAuth();

  // Live validation state
  const fieldValidation = useMemo(() => {
    return {
      full_name: formData.full_name.trim().length >= 2,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()),
      phone: formData.phone.trim().length >= 8,
      business_type: !!formData.business_type
    };
  }, [formData]);

  const getFieldStatus = (field: keyof typeof fieldValidation) => {
    const isValid = fieldValidation[field];
    const isTouched = touchedFields[field];
    
    if (!isTouched) return 'neutral';
    return isValid ? 'valid' : 'invalid';
  };

  const renderFieldIndicator = (field: keyof typeof fieldValidation) => {
    const status = getFieldStatus(field);
    if (status === 'valid') {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (status === 'invalid') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: insertedData, error } = await supabase
        .from('agent_registration_requests')
        .insert([{
          user_id: profile?.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          license_number: data.license_number,
          company_name: data.company_name,
          business_type: data.business_type,
          registration_documents: {
            additional_info: data.additional_info
          }
        }])
        .select('id')
        .single();
      if (error) throw error;
      return insertedData;
    },
    onSuccess: () => {
      showSuccess("Success", "Agent registration request submitted successfully. You'll be notified once reviewed.");
      onClose();
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        license_number: "",
        company_name: "",
        business_type: "",
        additional_info: ""
      });
      setTouchedFields({});
    },
    onError: (error) => {
      showError("Error", `Failed to submit registration: ${error.message}`);
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    setTouchedFields({
      full_name: true,
      email: true,
      phone: true,
      business_type: true
    });
    
    // Check all validations
    const invalidFields = Object.entries(fieldValidation)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      showError("Please fix the errors", "Fill in all required fields correctly");
      return;
    }

    registrationMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Register as Astra Agent
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Agent Registration Form
            </CardTitle>
            <CardDescription>
              Complete this form to register as an agent with Astra. All information will be reviewed by our admin team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    Full Name <span className="text-red-500">*</span>
                    {renderFieldIndicator('full_name')}
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, full_name: true }))}
                    placeholder="John Doe"
                    className={getFieldStatus('full_name') === 'invalid' ? 'border-red-500' : getFieldStatus('full_name') === 'valid' ? 'border-green-500' : ''}
                  />
                  {getFieldStatus('full_name') === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Full Name is required (min 2 characters)
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email Address <span className="text-red-500">*</span>
                    {renderFieldIndicator('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                    placeholder="john@example.com"
                    className={getFieldStatus('email') === 'invalid' ? 'border-red-500' : getFieldStatus('email') === 'valid' ? 'border-green-500' : ''}
                  />
                  {getFieldStatus('email') === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Please enter a valid email address
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    Phone Number <span className="text-red-500">*</span>
                    {renderFieldIndicator('phone')}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
                    placeholder="+1234567890"
                    className={getFieldStatus('phone') === 'invalid' ? 'border-red-500' : getFieldStatus('phone') === 'valid' ? 'border-green-500' : ''}
                  />
                  {getFieldStatus('phone') === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Phone Number is required (min 8 digits)
                    </p>
                  )}
                </div>

                {/* License Number */}
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    placeholder="RE123456"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Real Estate Company LLC"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <Label htmlFor="business_type" className="flex items-center gap-2">
                    Business Type <span className="text-red-500">*</span>
                    {renderFieldIndicator('business_type')}
                  </Label>
                  <Select 
                    value={formData.business_type} 
                    onValueChange={(value) => handleSelectChange('business_type', value)}
                  >
                    <SelectTrigger className={getFieldStatus('business_type') === 'invalid' ? 'border-red-500' : getFieldStatus('business_type') === 'valid' ? 'border-green-500' : ''}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual_agent">Individual Agent</SelectItem>
                      <SelectItem value="dealer">Property Dealer</SelectItem>
                      <SelectItem value="developer">Property Developer</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldStatus('business_type') === 'invalid' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Please select a business type
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="additional_info" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Information
                </Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                  placeholder="Tell us about your experience, specializations, or any other relevant information..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={registrationMutation.isPending}
                  className="flex-1"
                >
                  {registrationMutation.isPending ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AgentRegistrationModal;
