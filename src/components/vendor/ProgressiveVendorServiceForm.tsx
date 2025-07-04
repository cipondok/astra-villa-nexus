import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import SmartTypeSelector from "./SmartTypeSelector";
import DynamicSubcategorySelector from "./DynamicSubcategorySelector";
import { CategoryLoader, CategoryNode } from "@/utils/categoryLoader";

interface CategoryHierarchy {
  id: string;
  category_code: string;
  name_en: string;
  name_id: string;
  level: number;
  parent_id: string | null;
  vendor_type: string;
  requirements: any;
  commission_rate: number;
  icon: string;
  is_active: boolean;
  display_order: number;
}

interface ProgressiveServiceFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ProgressiveVendorServiceForm = ({ onClose, onSuccess }: ProgressiveServiceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    vendor_type: '', // product, service, both
    level1_category: '',
    level2_category: '',
    level3_category: '',
    level4_category: '',
    service_name: '',
    service_description: '',
    pricing_rules: {},
    requirements_docs: {},
    compliance_data: {
      skk_number: '',
      siuk_number: '',
      bpjs_ketenagakerjaan_status: 'unregistered',
      bpjs_kesehatan_status: 'unregistered',
      tarif_harian_min: '',
      tarif_harian_max: ''
    },
    service_capacity: {},
    geofencing_areas: [],
    location_type: 'on_site',
    service_location_state: '',
    service_location_city: '',
    service_location_area: '',
    is_active: true
  });

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Fetch categories by level and parent
  const { data: level1Categories } = useQuery({
    queryKey: ['categories-level-1'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('*')
        .eq('level', 1)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as CategoryHierarchy[];
    }
  });

  const { data: level2Categories } = useQuery({
    queryKey: ['categories-level-2', formData.level1_category],
    queryFn: async () => {
      if (!formData.level1_category) return [];
      
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('*')
        .eq('level', 2)
        .eq('parent_id', formData.level1_category)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as CategoryHierarchy[];
    },
    enabled: !!formData.level1_category
  });

  const { data: level3Categories } = useQuery({
    queryKey: ['categories-level-3', formData.level2_category],
    queryFn: async () => {
      if (!formData.level2_category) return [];
      
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('*')
        .eq('level', 3)
        .eq('parent_id', formData.level2_category)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as CategoryHierarchy[];
    },
    enabled: !!formData.level2_category
  });

  const { data: level4Categories } = useQuery({
    queryKey: ['categories-level-4', formData.level3_category],
    queryFn: async () => {
      if (!formData.level3_category) return [];
      
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('*')
        .eq('level', 4)
        .eq('parent_id', formData.level3_category)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as CategoryHierarchy[];
    },
    enabled: !!formData.level3_category
  });

  // Get current category requirements
  const currentCategory = level3Categories?.find(cat => cat.id === formData.level3_category) || 
                         level4Categories?.find(cat => cat.id === formData.level4_category);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCategorySelection = (level: number, categoryId: string) => {
    const updates: any = { [`level${level}_category`]: categoryId };
    
    // Reset lower levels when upper level changes
    for (let i = level + 1; i <= 4; i++) {
      updates[`level${i}_category`] = '';
    }
    
    setFormData({ ...formData, ...updates });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.vendor_type;
      case 2: return !!formData.level1_category;
      case 3: return !!formData.level2_category;
      case 4: return !!formData.level3_category || level3Categories?.length === 0;
      case 5: return !!formData.service_name && !!formData.service_description;
      case 6: return !!formData.service_location_state && !!formData.service_location_city;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const serviceData = {
        vendor_id: user.id,
        service_name: formData.service_name,
        service_description: formData.service_description,
        category_hierarchy_id: formData.level4_category || formData.level3_category,
        pricing_rules: formData.pricing_rules,
        service_capacity: formData.service_capacity,
        geofencing_areas: formData.geofencing_areas,
        location_type: formData.location_type,
        service_location_state: formData.service_location_state,
        service_location_city: formData.service_location_city,
        service_location_area: formData.service_location_area,
        is_active: formData.is_active,
        admin_approval_status: 'pending'
      };

      const { error } = await supabase
        .from('vendor_services')
        .insert([serviceData]);

      if (error) throw error;

      // Update vendor business profile with compliance data
      const complianceData = {
        vendor_id: user.id,
        business_name: formData.service_name, // Use service name as business name for now
        business_type: 'service_provider',
        skk_number: formData.compliance_data.skk_number,
        siuk_number: formData.compliance_data.siuk_number,
        bpjs_ketenagakerjaan_status: formData.compliance_data.bpjs_ketenagakerjaan_status,
        bpjs_kesehatan_status: formData.compliance_data.bpjs_kesehatan_status,
        tarif_harian_min: formData.compliance_data.tarif_harian_min ? parseFloat(formData.compliance_data.tarif_harian_min) : null,
        tarif_harian_max: formData.compliance_data.tarif_harian_max ? parseFloat(formData.compliance_data.tarif_harian_max) : null
      };

      const { error: profileError } = await supabase
        .from('vendor_business_profiles')
        .upsert(complianceData);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Service created successfully and sent for admin approval"
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SmartTypeSelector
            onSelect={(type) => setFormData({ ...formData, vendor_type: type })}
            selectedType={formData.vendor_type as 'product' | 'service' | null}
          />
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Pilih Kategori Utama</h3>
              <p className="text-muted-foreground">Select Main Category</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {level1Categories?.filter(cat => 
                cat.vendor_type === formData.vendor_type || cat.vendor_type === 'both'
              ).map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.level1_category === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategorySelection(1, category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{category.name_en}</h4>
                        <p className="text-sm text-muted-foreground">{category.name_id}</p>
                      </div>
                      {formData.level1_category === category.id && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Pilih Sub Kategori</h3>
              <p className="text-muted-foreground">Select Subcategory</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {level2Categories?.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.level2_category === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategorySelection(2, category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{category.name_en}</h4>
                        <p className="text-sm text-muted-foreground">{category.name_id}</p>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Komisi: {category.commission_rate}%
                          </Badge>
                        </div>
                      </div>
                      {formData.level2_category === category.id && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        if (!level3Categories || level3Categories.length === 0) {
          return (
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">No Specializations Available</h3>
              <p className="text-muted-foreground">Continue to the next step</p>
              <Button onClick={handleNext}>Continue</Button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Pilih Spesialisasi</h3>
              <p className="text-muted-foreground">Select Specialization</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {level3Categories?.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.level3_category === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategorySelection(3, category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{category.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{category.name_en}</h4>
                        <p className="text-sm text-muted-foreground">{category.name_id}</p>
                        {category.requirements && Object.keys(category.requirements).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {category.requirements.docs?.map((doc: string) => (
                              <Badge key={doc} variant="secondary" className="text-xs">
                                {doc.toUpperCase()}
                              </Badge>
                            ))}
                            {category.requirements.license && (
                              <Badge variant="secondary" className="text-xs">Lisensi</Badge>
                            )}
                            {category.requirements.insurance && (
                              <Badge variant="secondary" className="text-xs">Asuransi</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {formData.level3_category === category.id && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {level4Categories && level4Categories.length > 0 && formData.level3_category && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Pilih Tipe Detail</h4>
                <div className="grid grid-cols-1 gap-4">
                  {level4Categories.map((category) => (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.level4_category === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleCategorySelection(4, category.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-xl">{category.icon}</div>
                          <div className="flex-1">
                            <h5 className="font-medium">{category.name_en}</h5>
                            <p className="text-sm text-muted-foreground">{category.name_id}</p>
                          </div>
                          {formData.level4_category === category.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Detail Layanan</h3>
              <p className="text-muted-foreground">Service Details</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Nama Layanan *</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="Masukkan nama layanan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_description">Deskripsi Layanan *</Label>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                  placeholder="Deskripsikan layanan Anda secara detail"
                  rows={4}
                />
              </div>

              {currentCategory?.requirements && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold">Persyaratan Dokumen</h4>
                  
                  {currentCategory.requirements.docs?.map((doc: string) => (
                    <div key={doc} className="space-y-2">
                      <Label>{doc.toUpperCase()} Number</Label>
                      <Input
                        placeholder={`Masukkan nomor ${doc.toUpperCase()}`}
                        onChange={(e) => setFormData({
                          ...formData,
                          requirements_docs: {
                            ...formData.requirements_docs,
                            [doc]: e.target.value
                          }
                        })}
                      />
                    </div>
                  ))}

                  {currentCategory.requirements.license && (
                    <div className="space-y-2">
                      <Label>Nomor Lisensi</Label>
                      <Input
                        placeholder="Masukkan nomor lisensi"
                        onChange={(e) => setFormData({
                          ...formData,
                          requirements_docs: {
                            ...formData.requirements_docs,
                            license: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarif Harian Minimum (IDR)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    onChange={(e) => setFormData({
                      ...formData,
                      compliance_data: {
                        ...formData.compliance_data,
                        tarif_harian_min: e.target.value
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tarif Harian Maksimum (IDR)</Label>
                  <Input
                    type="number"
                    placeholder="500000"
                    onChange={(e) => setFormData({
                      ...formData,
                      compliance_data: {
                        ...formData.compliance_data,
                        tarif_harian_max: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Area Layanan</h3>
              <p className="text-muted-foreground">Service Coverage Area</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Provinsi *</Label>
                <Select 
                  value={formData.service_location_state} 
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    service_location_state: value,
                    service_location_city: ''
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih provinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                    <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                    <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                    <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kota *</Label>
                <Select 
                  value={formData.service_location_city} 
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    service_location_city: value
                  })}
                  disabled={!formData.service_location_state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jakarta Pusat">Jakarta Pusat</SelectItem>
                    <SelectItem value="Jakarta Selatan">Jakarta Selatan</SelectItem>
                    <SelectItem value="Jakarta Utara">Jakarta Utara</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  value={formData.service_location_area}
                  onChange={(e) => setFormData({ ...formData, service_location_area: e.target.value })}
                  placeholder="Contoh: Menteng, Sudirman"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Tipe Lokasi Layanan</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => setFormData({ ...formData, location_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_site">🏠 On-site (di lokasi pelanggan)</SelectItem>
                  <SelectItem value="remote">💻 Remote/Virtual</SelectItem>
                  <SelectItem value="business_location">🏢 Di lokasi bisnis</SelectItem>
                  <SelectItem value="home_delivery">🚚 Antar ke rumah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Ringkasan Layanan</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Jenis:</strong> {formData.vendor_type === 'product' ? 'Jual Produk' : 'Tawarkan Jasa'}</p>
                <p><strong>Kategori:</strong> {level3Categories?.find(c => c.id === formData.level3_category)?.name_id}</p>
                {level4Categories?.find(c => c.id === formData.level4_category) && (
                  <p><strong>Detail:</strong> {level4Categories.find(c => c.id === formData.level4_category)?.name_id}</p>
                )}
                <p><strong>Layanan:</strong> {formData.service_name}</p>
                <p><strong>Area:</strong> {formData.service_location_city}, {formData.service_location_state}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Formulir Layanan Vendor</CardTitle>
            <CardDescription>
              Langkah {currentStep} dari {totalSteps} - Buat layanan baru dengan sistem kategori hierarkis
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        <div className="mt-4">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progressPercentage)}% selesai</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>

          {currentStep === totalSteps ? (
            <Button 
              onClick={handleSubmit}
              disabled={!validateStep(currentStep)}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Buat Layanan
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={!validateStep(currentStep)}
            >
              Selanjutnya
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressiveVendorServiceForm;