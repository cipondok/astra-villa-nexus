import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Home, CheckCircle, Building, MapPin } from "lucide-react";

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
    property_count: '1',
    property_types: [] as string[],
    address: '',
    city: '',
    province: '',
    additional_info: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const propertyTypes = [
    { value: 'house', label: 'House / Rumah' },
    { value: 'apartment', label: 'Apartment / Apartemen' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land / Tanah' },
    { value: 'commercial', label: 'Commercial / Komersial' },
    { value: 'warehouse', label: 'Warehouse / Gudang' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to register as a property owner.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Update user profile to property_owner role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'property_owner',
          verification_status: 'pending'
        });

      if (profileError) throw profileError;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'role_upgrade_request',
        activity_description: `User requested upgrade to property_owner role`,
        metadata: {
          property_count: formData.property_count,
          property_types: formData.property_types,
          location: `${formData.city}, ${formData.province}`
        }
      });

      toast({
        title: "Application Submitted",
        description: "Your property owner application has been submitted successfully!",
      });
      onSuccess();
    } catch (error: any) {
      console.error('Property owner registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit application. Please try again.",
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

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <Card className="border-0 sm:border">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Home className="h-5 w-5 text-primary" />
            Become a Property Owner
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Register your properties and manage them through our platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="full_name" className="text-xs sm:text-sm">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                  required
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-9 sm:h-10 text-sm bg-muted"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62..."
                  required
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="property_count" className="text-xs sm:text-sm">Number of Properties *</Label>
                <Select
                  value={formData.property_count}
                  onValueChange={(value) => setFormData({ ...formData, property_count: value })}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 property</SelectItem>
                    <SelectItem value="2-5">2-5 properties</SelectItem>
                    <SelectItem value="6-10">6-10 properties</SelectItem>
                    <SelectItem value="10+">More than 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Property Types *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {propertyTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.property_types.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePropertyType(type.value)}
                    className="h-8 sm:h-9 text-xs sm:text-sm justify-start"
                  >
                    <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-xs sm:text-sm">Property Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="city" className="text-xs sm:text-sm">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="province" className="text-xs sm:text-sm">Province</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="Province"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="additional_info" className="text-xs sm:text-sm">Additional Information</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                placeholder="Tell us more about your properties..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Benefits Info */}
            <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-primary text-sm sm:text-base mb-2">
                Property Owner Benefits
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  List and manage multiple properties
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  Access to property analytics & insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  Connect with verified agents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  Book property services from vendors
                </li>
              </ul>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={submitting || formData.property_types.length === 0}
                className="w-full sm:w-auto sm:flex-1"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyOwnerRegistrationForm;
