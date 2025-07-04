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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Clock, MapPin, FileCheck, Banknote } from "lucide-react";

interface IndonesianVendorApplication {
  id: string;
  vendor_type: 'product' | 'service';
  application_status: string;
  business_name: string;
  business_type: string;
  business_registration_number?: string;
  tax_id?: string;
  nomor_npwp?: string;
  nomor_skt?: string;
  nomor_iujk?: string;
  siup_number?: string;
  tdp_number?: string;
  akta_notaris?: string;
  bpjs_ketenagakerjaan: boolean;
  bpjs_kesehatan: boolean;
  umkm_status: boolean;
  business_address: any;
  contact_info: any;
  bank_details: any;
  business_documents: string[];
  category_selections: string[];
  compliance_region: 'ID';
  fraud_score: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface IndonesianLocation {
  province_code: string;
  province_name: string;
  city_code?: string;
  city_name?: string;
  city_type?: string;
}

interface IndonesianCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: number;
  vendor_type: string;
  parent_id?: string;
  required_licenses: string[];
  icon?: string;
}

const IndonesianVendorOnboardingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorType, setVendorType] = useState<'product' | 'service' | ''>('');
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [formData, setFormData] = useState<Partial<IndonesianVendorApplication>>({
    compliance_region: 'ID',
    bpjs_ketenagakerjaan: false,
    bpjs_kesehatan: false,
    umkm_status: false
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch Indonesian provinces
  const { data: provinces } = useQuery({
    queryKey: ['indonesian-provinces'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('indonesian-vendor-validation/get-provinces');
      if (error) throw error;
      return data.locations as IndonesianLocation[];
    }
  });

  // Fetch cities for selected province
  const { data: cities } = useQuery({
    queryKey: ['indonesian-cities', selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return [];
      const { data, error } = await supabase.functions.invoke('indonesian-vendor-validation/get-provinces', {
        body: { province_code: selectedProvince }
      });
      if (error) throw error;
      return data.locations as IndonesianLocation[];
    },
    enabled: !!selectedProvince
  });

  // Fetch Indonesian categories
  const { data: categories } = useQuery({
    queryKey: ['indonesian-categories', vendorType, language],
    queryFn: async () => {
      if (!vendorType) return [];
      const { data, error } = await supabase.functions.invoke('indonesian-vendor-validation/get-categories', {
        body: { vendor_type: vendorType, language }
      });
      if (error) throw error;
      return data.categories as IndonesianCategory[];
    },
    enabled: !!vendorType
  });

  // Fetch existing application
  const { data: existingApplication } = useQuery({
    queryKey: ['indonesian-vendor-application'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('compliance_region', 'ID')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as IndonesianVendorApplication | null;
    }
  });

  // Validation function
  const validateIndonesianField = async (fieldName: string, value: any) => {
    if (!value || !vendorType) return null;

    try {
      const { data, error } = await supabase.functions.invoke('indonesian-vendor-validation/validate-field', {
        body: {
          field: fieldName,
          value,
          vendor_type: vendorType,
          language,
          application_id: applicationId
        }
      });

      if (error) throw error;
      return data.valid ? null : data.error_message;
    } catch (error) {
      console.error('Validation error:', error);
      return language === 'id' ? 'Gagal memvalidasi' : 'Validation failed';
    }
  };

  // Handle field changes with real-time validation
  const handleFieldChange = async (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear previous error
    setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));

    // Validate field
    const error = await validateIndonesianField(fieldName, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  // BPJS verification
  const verifyBPJS = async (type: 'ketenagakerjaan' | 'kesehatan', number: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('indonesian-vendor-validation/verify-bpjs', {
        body: {
          vendor_id: user.id,
          bpjs_type: type,
          verification_number: number
        }
      });

      if (error) throw error;

      if (data.valid) {
        setFormData(prev => ({ 
          ...prev, 
          [`bpjs_${type}`]: true 
        }));
        showSuccess("Sukses", `BPJS ${type} berhasil diverifikasi`);
      } else {
        showError("Error", data.message || `Gagal memverifikasi BPJS ${type}`);
      }
    } catch (error: any) {
      showError("Error", `Gagal memverifikasi BPJS: ${error.message}`);
    }
  };

  // Save application mutation
  const saveApplicationMutation = useMutation({
    mutationFn: async (data: Partial<IndonesianVendorApplication>) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const applicationData = {
        ...data,
        user_id: user.id,
        vendor_type: vendorType as 'product' | 'service',
        compliance_region: 'ID',
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
      showSuccess("Sukses", "Aplikasi berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ['indonesian-vendor-application'] });
    },
    onError: (error: any) => {
      showError("Error", `Gagal menyimpan aplikasi: ${error.message}`);
    }
  });

  // Initialize form data from existing application
  useEffect(() => {
    if (existingApplication) {
      setFormData(existingApplication);
      setVendorType(existingApplication.vendor_type);
      setApplicationId(existingApplication.id);
    }
  }, [existingApplication]);

  const formatIDR = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <Progress value={(currentStep / 6) * 100} className="w-full" />
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>
          {language === 'id' ? `Langkah ${currentStep} dari 6` : `Step ${currentStep} of 6`}
        </span>
        <span>{Math.round((currentStep / 6) * 100)}% {language === 'id' ? 'Selesai' : 'Complete'}</span>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendor_type">
            {language === 'id' ? 'Tipe Vendor' : 'Vendor Type'}
          </Label>
          <Select 
            value={vendorType} 
            onValueChange={(value: 'product' | 'service') => setVendorType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={language === 'id' ? 'Pilih tipe vendor' : 'Select vendor type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">
                {language === 'id' ? 'Vendor Produk' : 'Product Vendor'}
              </SelectItem>
              <SelectItem value="service">
                {language === 'id' ? 'Penyedia Jasa' : 'Service Provider'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="language">
            {language === 'id' ? 'Bahasa' : 'Language'}
          </Label>
          <Select 
            value={language} 
            onValueChange={(value: 'en' | 'id') => setLanguage(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="business_name">
          {language === 'id' ? 'Nama Usaha' : 'Business Name'}
        </Label>
        <Input
          id="business_name"
          value={formData.business_name || ''}
          onChange={(e) => handleFieldChange('business_name', e.target.value)}
          placeholder={language === 'id' ? 'Masukkan nama usaha' : 'Enter business name'}
        />
        {validationErrors.business_name && (
          <p className="text-sm text-destructive mt-1">{validationErrors.business_name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="business_type">
          {language === 'id' ? 'Bentuk Usaha' : 'Business Type'}
        </Label>
        <Select 
          value={formData.business_type || ''} 
          onValueChange={(value) => handleFieldChange('business_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={language === 'id' ? 'Pilih bentuk usaha' : 'Select business type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="perseorangan">
              {language === 'id' ? 'Perseorangan' : 'Individual'}
            </SelectItem>
            <SelectItem value="cv">CV (Commanditaire Vennootschap)</SelectItem>
            <SelectItem value="pt">PT (Perseroan Terbatas)</SelectItem>
            <SelectItem value="koperasi">
              {language === 'id' ? 'Koperasi' : 'Cooperative'}
            </SelectItem>
            <SelectItem value="umkm">
              UMKM (Usaha Mikro, Kecil & Menengah)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="umkm_status"
          checked={formData.umkm_status || false}
          onCheckedChange={(checked) => handleFieldChange('umkm_status', checked)}
        />
        <Label htmlFor="umkm_status" className="text-sm">
          {language === 'id' 
            ? 'Saya adalah pelaku UMKM (mendapat keringanan pajak)'
            : 'I am an UMKM business (eligible for tax relief)'
          }
        </Label>
      </div>
    </div>
  );

  const renderTaxAndLicenses = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              {language === 'id' ? 'Perpajakan' : 'Taxation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nomor_npwp">
                NPWP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomor_npwp"
                value={formData.nomor_npwp || ''}
                onChange={(e) => handleFieldChange('nomor_npwp', e.target.value)}
                placeholder="12.345.678.9-012.345"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'id' ? 'Format: XX.XXX.XXX.X-XXX.XXX' : 'Format: XX.XXX.XXX.X-XXX.XXX'}
              </p>
              {validationErrors.nomor_npwp && (
                <p className="text-sm text-destructive mt-1">{validationErrors.nomor_npwp}</p>
              )}
            </div>

            <div>
              <Label htmlFor="siup_number">
                SIUP
              </Label>
              <Input
                id="siup_number"
                value={formData.siup_number || ''}
                onChange={(e) => handleFieldChange('siup_number', e.target.value)}
                placeholder="SIUP/123/01/2024"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'id' ? 'Surat Izin Usaha Perdagangan' : 'Trade Business License'}
              </p>
            </div>

            <div>
              <Label htmlFor="tdp_number">
                TDP
              </Label>
              <Input
                id="tdp_number"
                value={formData.tdp_number || ''}
                onChange={(e) => handleFieldChange('tdp_number', e.target.value)}
                placeholder="TDP/1234567890123"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'id' ? 'Tanda Daftar Perusahaan' : 'Company Registration Certificate'}
              </p>
            </div>
          </CardContent>
        </Card>

        {vendorType === 'service' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'id' ? 'Lisensi Jasa' : 'Service Licenses'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nomor_skt">
                  SKT {language === 'id' ? '(Listrik)' : '(Electrical)'}
                </Label>
                <Input
                  id="nomor_skt"
                  value={formData.nomor_skt || ''}
                  onChange={(e) => handleFieldChange('nomor_skt', e.target.value)}
                  placeholder="SKT-EL/123456/LPJK"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'id' ? 'Sertifikat Kompetensi Tenaga Kerja' : 'Certificate of Competence'}
                </p>
                {validationErrors.nomor_skt && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.nomor_skt}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nomor_iujk">
                  IUJK {language === 'id' ? '(Konstruksi)' : '(Construction)'}
                </Label>
                <Input
                  id="nomor_iujk"
                  value={formData.nomor_iujk || ''}
                  onChange={(e) => handleFieldChange('nomor_iujk', e.target.value)}
                  placeholder="IUJK-123456789012/KAB-BDG"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'id' ? 'Izin Usaha Jasa Konstruksi' : 'Construction Service Business License'}
                </p>
                {validationErrors.nomor_iujk && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.nomor_iujk}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderBPJSVerification = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            {language === 'id' ? 'Verifikasi BPJS' : 'BPJS Verification'}
          </CardTitle>
          <CardDescription>
            {language === 'id' 
              ? 'BPJS diperlukan untuk semua vendor di Indonesia'
              : 'BPJS is required for all vendors in Indonesia'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">BPJS Ketenagakerjaan</CardTitle>
                <CardDescription>
                  {language === 'id' ? 'Jaminan sosial tenaga kerja' : 'Social security for workers'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.bpjs_ketenagakerjaan || false}
                    onCheckedChange={(checked) => handleFieldChange('bpjs_ketenagakerjaan', checked)}
                  />
                  <Label className="text-sm">
                    {formData.bpjs_ketenagakerjaan 
                      ? (language === 'id' ? 'Terverifikasi' : 'Verified')
                      : (language === 'id' ? 'Belum terverifikasi' : 'Not verified')
                    }
                  </Label>
                </div>
                {formData.bpjs_ketenagakerjaan && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {language === 'id' ? 'Aktif' : 'Active'}
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">BPJS Kesehatan</CardTitle>
                <CardDescription>
                  {language === 'id' ? 'Jaminan kesehatan nasional' : 'National health insurance'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.bpjs_kesehatan || false}
                    onCheckedChange={(checked) => handleFieldChange('bpjs_kesehatan', checked)}
                  />
                  <Label className="text-sm">
                    {formData.bpjs_kesehatan 
                      ? (language === 'id' ? 'Terverifikasi' : 'Verified')
                      : (language === 'id' ? 'Belum terverifikasi' : 'Not verified')
                    }
                  </Label>
                </div>
                {formData.bpjs_kesehatan && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {language === 'id' ? 'Aktif' : 'Active'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {language === 'id' 
                ? 'BPJS Ketenagakerjaan wajib untuk semua vendor jasa. BPJS Kesehatan sangat direkomendasikan.'
                : 'BPJS Ketenagakerjaan is mandatory for all service vendors. BPJS Kesehatan is highly recommended.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocationInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {language === 'id' ? 'Informasi Lokasi' : 'Location Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="province">
                {language === 'id' ? 'Provinsi' : 'Province'} <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih provinsi' : 'Select province'} />
                </SelectTrigger>
                <SelectContent>
                  {provinces?.map((province) => (
                    <SelectItem key={province.province_code} value={province.province_code}>
                      {province.province_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">
                {language === 'id' ? 'Kota/Kabupaten' : 'City/Regency'} <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih kota' : 'Select city'} />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.city_code} value={city.city_code || ''}>
                      {city.city_type} {city.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">
              {language === 'id' ? 'Alamat Lengkap' : 'Complete Address'} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              value={formData.business_address?.street || ''}
              onChange={(e) => handleFieldChange('business_address', {
                ...formData.business_address,
                street: e.target.value,
                province: selectedProvince,
                city: selectedCity
              })}
              placeholder={language === 'id' 
                ? 'Jl. Contoh No. 123, RT/RW 01/02, Kelurahan...'
                : 'Jl. Example No. 123, RT/RW 01/02, Village...'
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="postal_code">
              {language === 'id' ? 'Kode Pos' : 'Postal Code'}
            </Label>
            <Input
              id="postal_code"
              value={formData.business_address?.postal_code || ''}
              onChange={(e) => handleFieldChange('business_address', {
                ...formData.business_address,
                postal_code: e.target.value
              })}
              placeholder="12345"
              maxLength={5}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategorySelection = () => {
    const mainCategories = categories?.filter(cat => cat.level === 1) || [];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'id' ? 'Pilih Kategori Usaha' : 'Select Business Categories'}
            </CardTitle>
            <CardDescription>
              {language === 'id' 
                ? `Pilih kategori yang menggambarkan ${vendorType === 'product' ? 'produk' : 'jasa'} Anda`
                : `Choose categories that describe your ${vendorType} offerings`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedCategories.includes(category.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedCategories(prev => 
                      prev.includes(category.id)
                        ? prev.filter(id => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{category.icon || '📦'}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                        {category.required_licenses.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              {language === 'id' ? 'Lisensi diperlukan:' : 'Required licenses:'}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {category.required_licenses.map((license) => (
                                <Badge key={license} variant="outline" className="text-xs">
                                  {license}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReviewSubmit = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'id' ? 'Ringkasan Aplikasi' : 'Application Summary'}
          </CardTitle>
          <CardDescription>
            {language === 'id' 
              ? 'Periksa kembali informasi sebelum mengirim'
              : 'Review your information before submitting'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Nama Usaha' : 'Business Name'}
                </Label>
                <p className="font-medium">{formData.business_name || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Tipe Vendor' : 'Vendor Type'}
                </Label>
                <p className="font-medium">
                  {vendorType === 'product' 
                    ? (language === 'id' ? 'Vendor Produk' : 'Product Vendor')
                    : (language === 'id' ? 'Penyedia Jasa' : 'Service Provider')
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">NPWP</Label>
                <p className="font-medium">{formData.nomor_npwp || '-'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Status BPJS' : 'BPJS Status'}
                </Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.bpjs_ketenagakerjaan ? "default" : "secondary"}>
                      {formData.bpjs_ketenagakerjaan ? '✓' : '✗'} Ketenagakerjaan
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.bpjs_kesehatan ? "default" : "secondary"}>
                      {formData.bpjs_kesehatan ? '✓' : '✗'} Kesehatan
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Status UMKM' : 'UMKM Status'}
                </Label>
                <Badge variant={formData.umkm_status ? "default" : "secondary"}>
                  {formData.umkm_status 
                    ? (language === 'id' ? 'Ya' : 'Yes')
                    : (language === 'id' ? 'Tidak' : 'No')
                  }
                </Badge>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {language === 'id' 
                ? 'Aplikasi akan ditinjau dalam 1-3 hari kerja. Anda akan menerima notifikasi email.'
                : 'Application will be reviewed within 1-3 business days. You will receive email notification.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'id' ? 'Pendaftaran Vendor Indonesia' : 'Indonesian Vendor Registration'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'id' 
            ? 'Lengkapi aplikasi vendor sesuai dengan peraturan Indonesia'
            : 'Complete vendor application according to Indonesian regulations'
          }
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'id' ? 'Formulir Pendaftaran Vendor' : 'Vendor Registration Form'}
          </CardTitle>
          <CardDescription>
            {language === 'id' 
              ? 'Isi semua informasi yang diperlukan untuk disetujui sebagai vendor'
              : 'Fill out all required information to get approved as a vendor'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}

          <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="1">
                {language === 'id' ? 'Info Dasar' : 'Basic Info'}
              </TabsTrigger>
              <TabsTrigger value="2">
                {language === 'id' ? 'Pajak & Lisensi' : 'Tax & Licenses'}
              </TabsTrigger>
              <TabsTrigger value="3">
                {language === 'id' ? 'BPJS' : 'BPJS'}
              </TabsTrigger>
              <TabsTrigger value="4">
                {language === 'id' ? 'Lokasi' : 'Location'}
              </TabsTrigger>
              <TabsTrigger value="5">
                {language === 'id' ? 'Kategori' : 'Categories'}
              </TabsTrigger>
              <TabsTrigger value="6">
                {language === 'id' ? 'Review' : 'Review'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1" className="mt-6">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="2" className="mt-6">
              {renderTaxAndLicenses()}
            </TabsContent>

            <TabsContent value="3" className="mt-6">
              {renderBPJSVerification()}
            </TabsContent>

            <TabsContent value="4" className="mt-6">
              {renderLocationInfo()}
            </TabsContent>

            <TabsContent value="5" className="mt-6">
              {renderCategorySelection()}
            </TabsContent>

            <TabsContent value="6" className="mt-6">
              {renderReviewSubmit()}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              {language === 'id' ? 'Sebelumnya' : 'Previous'}
            </Button>
            
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => saveApplicationMutation.mutate(formData)}
                disabled={saveApplicationMutation.isPending}
              >
                {language === 'id' ? 'Simpan Draft' : 'Save Draft'}
              </Button>
              
              {currentStep === 6 ? (
                <Button 
                  onClick={() => {
                    const finalData = {
                      ...formData,
                      application_status: 'submitted',
                      category_selections: selectedCategories,
                      submitted_at: new Date().toISOString()
                    };
                    saveApplicationMutation.mutate(finalData);
                  }}
                  disabled={saveApplicationMutation.isPending}
                >
                  {language === 'id' ? 'Kirim Aplikasi' : 'Submit Application'}
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                >
                  {language === 'id' ? 'Selanjutnya' : 'Next'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndonesianVendorOnboardingSystem;