
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { Building2, CheckCircle, AlertCircle, Check } from "lucide-react";
import BPJSVerification from "./BPJSVerification";


interface VendorRegistrationFormProps {
  onSuccess: () => void;
}

const VendorRegistrationForm = ({ onSuccess }: VendorRegistrationFormProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    property_type: 'residential',
    full_name: '',
    email: user?.email || '',
    phone: '',
    company_name: '',
    license_number: '',
    surat_izin_usaha: '',
    verification_documents: null,
    bpjs_ketenagakerjaan_status: 'unregistered',
    bpjs_kesehatan_status: 'unregistered',
    bpjs_ketenagakerjaan_number: '',
    bpjs_kesehatan_number: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

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

  // Live validation state
  const fieldValidation = useMemo(() => {
    return {
      full_name: formData.full_name.trim().length >= 2,
      business_name: formData.business_name.trim().length >= 2,
      business_type: !!formData.business_type,
      phone: formData.phone.trim().length >= 8,
      surat_izin_usaha: formData.property_type !== 'commercial' || formData.surat_izin_usaha.trim().length >= 3,
      property_type: !!formData.property_type
    };
  }, [formData]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    setTouchedFields({
      full_name: true,
      business_name: true,
      business_type: true,
      phone: true,
      surat_izin_usaha: true,
      property_type: true
    });

    if (!user) {
      showError("Authentication Required", "You must be logged in to register as a vendor.");
      return;
    }

    // Check all validations
    const requiredFields: (keyof typeof fieldValidation)[] = ['full_name', 'business_name', 'business_type', 'phone'];
    if (formData.property_type === 'commercial') {
      requiredFields.push('surat_izin_usaha');
    }

    const invalidFields = requiredFields.filter(field => !fieldValidation[field]);
    if (invalidFields.length > 0) {
      showError("Please fix the errors", "Fill in all required fields correctly");
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting vendor registration for user:', user.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          company_name: formData.company_name,
          license_number: formData.license_number
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      console.log('Profile updated successfully');

      const { data: requestData, error: requestError } = await supabase
        .from('vendor_requests')
        .insert([{
          user_id: user.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          status: 'pending'
        }])
        .select('id')
        .single();

      if (requestError) {
        console.error('Vendor request error:', requestError);
        throw requestError;
      }

      console.log('Vendor request created successfully');

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'role_upgrade_request',
        activity_description: `User requested upgrade to vendor role (${formData.business_type})`,
        metadata: {
          request_id: requestData?.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          property_type: formData.property_type
        }
      });

      showSuccess("Application Submitted", "Your vendor application has been submitted successfully and is pending review. You'll be notified once reviewed.");
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
                <Label htmlFor="property_type" className="flex items-center gap-2">
                  Tipe Properti / Property Type *
                  {renderFieldIndicator('property_type')}
                </Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => handleSelectChange('property_type', value)}
                >
                  <SelectTrigger className={getFieldStatus('property_type') === 'invalid' ? 'border-red-500' : getFieldStatus('property_type') === 'valid' ? 'border-green-500' : ''}>
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
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  Full Name *
                  {renderFieldIndicator('full_name')}
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleFieldChange('full_name', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, full_name: true }))}
                  placeholder="Enter your full name"
                  className={getFieldStatus('full_name') === 'invalid' ? 'border-red-500' : getFieldStatus('full_name') === 'valid' ? 'border-green-500' : ''}
                />
                {getFieldStatus('full_name') === 'invalid' && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Full Name is required (min 2 characters)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email *
                  <Check className="h-4 w-4 text-green-500" />
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="border-green-500 bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Phone Number *
                  {renderFieldIndicator('phone')}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
                  placeholder="Enter your phone number"
                  className={getFieldStatus('phone') === 'invalid' ? 'border-red-500' : getFieldStatus('phone') === 'valid' ? 'border-green-500' : ''}
                />
                {getFieldStatus('phone') === 'invalid' && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Phone Number is required (min 8 digits)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name" className="flex items-center gap-2">
                  Business Name *
                  {renderFieldIndicator('business_name')}
                </Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleFieldChange('business_name', e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, business_name: true }))}
                  placeholder="Enter your business name"
                  className={getFieldStatus('business_name') === 'invalid' ? 'border-red-500' : getFieldStatus('business_name') === 'valid' ? 'border-green-500' : ''}
                />
                {getFieldStatus('business_name') === 'invalid' && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Business Name is required (min 2 characters)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type" className="flex items-center gap-2">
                  Business Type *
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
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldStatus('business_type') === 'invalid' && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Please select a business type
                  </p>
                )}
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
                  <Label htmlFor="surat_izin_usaha" className="flex items-center gap-2">
                    Surat Izin Usaha *
                    {renderFieldIndicator('surat_izin_usaha')}
                  </Label>
                  <Input
                    id="surat_izin_usaha"
                    value={formData.surat_izin_usaha}
                    onChange={(e) => handleFieldChange('surat_izin_usaha', e.target.value)}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, surat_izin_usaha: true }))}
                    placeholder="Nomor surat izin usaha"
                    className={getFieldStatus('surat_izin_usaha') === 'invalid' ? 'border-red-500' : getFieldStatus('surat_izin_usaha') === 'valid' ? 'border-green-500' : ''}
                  />
                  {getFieldStatus('surat_izin_usaha') === 'invalid' && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Surat Izin Usaha is required for commercial
                    </p>
                  )}
                  <p className="text-sm text-orange-600">
                    📋 Wajib untuk layanan komersial
                  </p>
                </div>
              )}
            </div>

            {/* BPJS Verification Section */}
            <BPJSVerification
              propertyType={formData.property_type as 'residential' | 'commercial'}
              onVerificationChange={(bpjsData) => {
                setFormData(prev => ({
                  ...prev,
                  bpjs_ketenagakerjaan_status: bpjsData.bpjs_ketenagakerjaan_status,
                  bpjs_kesehatan_status: bpjsData.bpjs_kesehatan_status,
                  bpjs_ketenagakerjaan_number: bpjsData.bpjs_ketenagakerjaan_number || '',
                  bpjs_kesehatan_number: bpjsData.bpjs_kesehatan_number || ''
                }));
              }}
              showKetenagakerjaan={true}
              showKesehatan={formData.property_type === 'commercial'}
            />

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
