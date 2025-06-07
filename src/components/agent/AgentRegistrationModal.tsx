
import { useState } from "react";
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
import { UserPlus, Building2, FileText } from "lucide-react";

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

  const { showSuccess, showError } = useAlert();
  const { profile } = useAuth();

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
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
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Agent registration request submitted successfully. Please wait for admin approval.");
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
    },
    onError: (error) => {
      showError("Error", `Failed to submit registration: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.business_type) {
      showError("Error", "Please fill in all required fields");
      return;
    }

    registrationMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                {/* License Number */}
                <div>
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    placeholder="RE123456"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Real Estate Company LLC"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual_agent">Individual Agent</SelectItem>
                      <SelectItem value="dealer">Property Dealer</SelectItem>
                      <SelectItem value="developer">Property Developer</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
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
