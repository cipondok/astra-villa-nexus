
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { Building2, FileText, CheckCircle } from "lucide-react";

interface VendorRegistrationFormProps {
  onSuccess: () => void;
}

const VendorRegistrationForm = ({ onSuccess }: VendorRegistrationFormProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    property_type: 'residential', // New field for commercial/residential toggle
    full_name: '',
    email: user?.email || '',
    phone: '',
    company_name: '',
    license_number: '',
    surat_izin_usaha: '', // Required for commercial
    verification_documents: null
  });
  const [submitting, setSubmitting] = useState(false);

  const businessTypes = [
    'Home Maintenance',
    'Cleaning Services',
    'Construction',
    'Landscaping',
    'Interior Design',
    'Security Services',
    'Moving Services',
    'Photography',
    'Legal Services',
    'Financial Services',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError("Authentication Required", "You must be logged in to register as a vendor.");
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting vendor registration for user:', user.id);

      // Step 1: Update user profile to vendor role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'vendor',
          company_name: formData.company_name,
          license_number: formData.license_number,
          verification_status: 'pending'
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      // Step 2: Create vendor registration request with property type
      const { error: requestError } = await supabase
        .from('vendor_requests')
        .insert([{
          user_id: user.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          verification_documents: formData.verification_documents,
          // Add property type and conditional requirements
          compliance_region: 'ID', // Indonesia
          nomor_skt: formData.property_type === 'commercial' ? formData.surat_izin_usaha : null,
          status: 'pending'
        }]);

      if (requestError) {
        console.error('Vendor request error:', requestError);
        throw requestError;
      }

      console.log('Vendor request created successfully');

      // Step 3: Create vendor business profile with property type adjustments
      const baseRate = 100000; // Base residential rate
      const commercialMultiplier = formData.property_type === 'commercial' ? 1.5 : 1.0;
      
      const { error: businessProfileError } = await supabase
        .from('vendor_business_profiles')
        .insert([{
          vendor_id: user.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          business_phone: formData.phone,
          business_email: formData.email,
          // Apply property type pricing
          tarif_harian_min: baseRate * commercialMultiplier,
          tarif_harian_max: (baseRate * 2) * commercialMultiplier,
          is_active: false, // Will be activated when approved
          is_verified: false
        }]);

      if (businessProfileError) {
        console.error('Business profile error:', businessProfileError);
        throw businessProfileError;
      }

      console.log('Business profile created successfully');

      showSuccess("Application Submitted", "Your vendor application has been submitted successfully and is pending review.");
      onSuccess();
    } catch (error: any) {
      console.error('Vendor registration error:', error);
      showError("Registration Failed", error.message || "Failed to submit vendor application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Become a Vendor
          </CardTitle>
          <CardDescription>
            Join our marketplace and start offering your services to customers
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Type Toggle */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="property_type">Tipe Properti / Property Type *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe properti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">🏠 Perumahan (Residential)</SelectItem>
                    <SelectItem value="commercial">🏢 Komersial (Commercial)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.property_type === 'commercial' 
                    ? 'Komersial memerlukan dokumen tambahan dan tarif yang berbeda'
                    : 'Layanan untuk rumah dan properti pribadi'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => setFormData({ ...formData, business_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Enter license number (if applicable)"
                />
              </div>

              {/* Commercial-only requirement */}
              {formData.property_type === 'commercial' && (
                <div className="space-y-2">
                  <Label htmlFor="surat_izin_usaha">Surat Izin Usaha *</Label>
                  <Input
                    id="surat_izin_usaha"
                    value={formData.surat_izin_usaha}
                    onChange={(e) => setFormData({ ...formData, surat_izin_usaha: e.target.value })}
                    placeholder="Nomor surat izin usaha"
                    required
                  />
                  <p className="text-sm text-orange-600">
                    📋 Wajib untuk layanan komersial
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Property Type Requirements Info */}
              <div className={`p-4 rounded-lg ${
                formData.property_type === 'commercial' 
                  ? 'bg-orange-50 dark:bg-orange-900/20' 
                  : 'bg-green-50 dark:bg-green-900/20'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  formData.property_type === 'commercial'
                    ? 'text-orange-800 dark:text-orange-200'
                    : 'text-green-800 dark:text-green-200'
                }`}>
                  {formData.property_type === 'commercial' 
                    ? '🏢 Persyaratan Komersial' 
                    : '🏠 Persyaratan Perumahan'
                  }
                </h3>
                <ul className={`space-y-1 text-sm ${
                  formData.property_type === 'commercial'
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  {formData.property_type === 'commercial' ? (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Surat Izin Usaha diperlukan
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Tarif 50% lebih tinggi dari residensial
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Asuransi komersial mungkin diperlukan
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Dokumen standar sudah cukup
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Tarif residensial standar
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Proses persetujuan lebih cepat
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  What happens next?
                </h3>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Your application will be reviewed by our team
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    We may contact you for additional information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Once approved, you can access your vendor dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Start creating services and receiving bookings
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorRegistrationForm;
