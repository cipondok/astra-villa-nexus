import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Package, Wrench, Lock, AlertTriangle, MessageCircle } from 'lucide-react';

interface CategoryStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface MainCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
}

interface SubCategory {
  id: string;
  main_category_id: string;
  name: string;
  description: string;
}

const CategoryStep: React.FC<CategoryStepProps> = ({ formData, updateFormData }) => {
  const { user } = useAuth();
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [isRequestingChange, setIsRequestingChange] = useState(false);

  // Load vendor profile and main categories
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user?.id) return;

      try {
        // Fetch vendor profile first to check category lock status
        const { data: profile, error: profileError } = await supabase
          .from('vendor_business_profiles')
          .select(`
            id, 
            main_service_category_id, 
            main_category_locked, 
            main_category_locked_at,
            can_change_main_category,
            vendor_main_categories!main_service_category_id(id, name, description, type, icon)
          `)
          .eq('vendor_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // Not found is ok
          console.error('Error fetching vendor profile:', profileError);
        }

        setVendorProfile(profile);

        // If vendor has a locked main category, set it in form data
        if (profile?.main_service_category_id) {
          updateFormData({ 
            mainCategory: profile.main_service_category_id,
            implementationType: profile.vendor_main_categories?.type || 'services'
          });
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      }
    };

    const fetchMainCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('vendor_main_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        
        // If no categories exist, create default ones
        if (!data || data.length === 0) {
          const defaultCategories = [
            { name: 'Home Services', description: 'Professional home maintenance and repair services', type: 'services', icon: 'wrench' },
            { name: 'Construction', description: 'Building and construction services', type: 'services', icon: 'hammer' },
            { name: 'Professional Services', description: 'Expert consultation and professional services', type: 'services', icon: 'briefcase' },
            { name: 'Products & Supplies', description: 'Physical products and supplies', type: 'products', icon: 'package' }
          ];
          
          const { data: insertedData, error: insertError } = await supabase
            .from('vendor_main_categories')
            .insert(defaultCategories)
            .select();
            
          if (insertError) throw insertError;
          setMainCategories(insertedData || []);
        } else {
          setMainCategories(data);
        }
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching main categories:', error);
        toast.error('Failed to load categories');
        setIsLoading(false);
      }
    };

    fetchVendorData();
    fetchMainCategories();
  }, [user?.id]);

  // Load subcategories when main category is selected
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.mainCategory) {
        setSubCategories([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vendor_subcategories')
          .select('*')
          .eq('main_category_id', formData.mainCategory)
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setSubCategories(data || []);
        
        // Auto-select first subcategory if only one exists
        if (data && data.length === 1) {
          updateFormData({ subcategory: data[0].id });
        }
      } catch (error: any) {
        console.error('Error fetching subcategories:', error);
        toast.error('Failed to load subcategories');
      }
    };

    fetchSubCategories();
  }, [formData.mainCategory]);

  // Save main category to vendor profile when selected
  useEffect(() => {
    const updateVendorProfile = async () => {
      if (!user?.id || !formData.mainCategory || isMainCategoryLocked) return;
      
      try {
        // Check if vendor profile exists
        const { data: existingProfile } = await supabase
          .from('vendor_business_profiles')
          .select('id, main_service_category_id, business_name, business_type')
          .eq('vendor_id', user.id)
          .single();

        // Only update if main category is not set or if it's the first selection
        if (!existingProfile?.main_service_category_id) {
          const { error } = await supabase
            .from('vendor_business_profiles')
            .upsert({
              vendor_id: user.id,
              main_service_category_id: formData.mainCategory,
              business_name: existingProfile?.business_name || 'Vendor Business',
              business_type: existingProfile?.business_type || 'services'
            }, {
              onConflict: 'vendor_id'
            });

          if (error) {
            console.error('Error updating vendor profile:', error);
          }
        }
      } catch (error) {
        console.error('Error in updateVendorProfile:', error);
      }
    };

    updateVendorProfile();
  }, [formData.mainCategory, user?.id, isMainCategoryLocked]);

  const selectedMainCategory = mainCategories.find(cat => cat.id === formData.mainCategory);
  const isProductCategory = selectedMainCategory?.type === 'products' || selectedMainCategory?.type === 'mixed';
  const isMainCategoryLocked = vendorProfile?.main_category_locked && !vendorProfile?.can_change_main_category;

  // Handle main category change request
  const requestCategoryChange = async () => {
    setIsRequestingChange(true);
    try {
      const { error } = await supabase
        .from('vendor_change_requests')
        .insert([{
          vendor_id: user?.id,
          request_type: 'main_category_change',
          reason: 'Vendor meminta perubahan kategori utama layanan',
          current_data: { 
            main_category_id: vendorProfile?.main_service_category_id,
            main_category_name: vendorProfile?.vendor_main_categories?.name 
          },
          requested_data: { requested_change: true },
          status: 'pending'
        }]);

      if (error) throw error;
      
      toast.success('Permintaan perubahan kategori telah dikirim ke tim Customer Service');
    } catch (error: any) {
      console.error('Error requesting category change:', error);
      toast.error('Gagal mengirim permintaan: ' + error.message);
    } finally {
      setIsRequestingChange(false);
    }
  };

  const getDefaultCategoryImage = (categoryName: string) => {
    // Generate a default image URL based on category name
    const categoryImages: { [key: string]: string } = {
      'construction': 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
      'maintenance': 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
      'professional': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'home': 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=300&fit=crop',
      'creative': 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
      'technology': 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
      'cleaning': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'default': 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=300&fit=crop'
    };
    
    const key = categoryName.toLowerCase().split(' ')[0];
    return categoryImages[key] || categoryImages.default;
  };

  return (
    <div className="space-y-6">
      {/* Main Category Selection */}
      <div>
        <Label className="text-base font-medium mb-4 block">
          Pilih Kategori Utama Layanan
        </Label>
        {isMainCategoryLocked && vendorProfile?.vendor_main_categories && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <div className="font-medium">
                  Kategori Utama Terkunci: {vendorProfile.vendor_main_categories.name}
                </div>
                <p className="text-sm">
                  Kategori utama Anda telah terpilih dan tidak dapat diubah sendiri. 
                  Hanya tim Customer Service atau Admin yang dapat mengubah kategori utama Anda.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestCategoryChange}
                  disabled={isRequestingChange}
                  className="mt-2"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isRequestingChange ? 'Mengirim...' : 'Minta Perubahan Kategori'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Memuat kategori...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCategories.map((category) => (
            <Card 
              key={category.id}
              className={`transition-all ${
                isMainCategoryLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:shadow-md'
              } ${
                formData.mainCategory === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={!isMainCategoryLocked ? () => updateFormData({ 
                mainCategory: category.id,
                subcategory: '', // Reset subcategory when changing main category
                implementationType: category.type // Auto-select implementation type
              }) : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {category.type === 'products' ? (
                      <Package className="h-6 w-6 text-primary" />
                    ) : (
                      <Wrench className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.type === 'products' ? 'default' : 'secondary'} className="text-xs">
                        {category.type === 'products' ? 'Produk' : 'Layanan'}
                      </Badge>
                      {isMainCategoryLocked && formData.mainCategory === category.id && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                          <Lock className="h-3 w-3 mr-1" />
                          Terkunci
                        </Badge>
                      )}
                      {category.type === 'mixed' && (
                        <Badge variant="outline" className="text-xs">Campuran</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {/* Default category image */}
                <div className="mt-3 w-full h-24 bg-muted rounded-md overflow-hidden">
                  <img 
                    src={getDefaultCategoryImage(category.name)} 
                    alt={`${category.name} category`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=400&h=300&fit=crop';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Subcategory Selection */}
      {formData.mainCategory && (
        <div>
          <Label htmlFor="subcategory">Pilih Sub-Kategori</Label>
          <Select 
            value={formData.subcategory} 
            onValueChange={(value) => updateFormData({ subcategory: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih sub-kategori" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {subCategories.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Belum ada sub-kategori tersedia untuk kategori ini.
            </p>
          )}
        </div>
      )}

      {/* Implementation Type Display */}
      {formData.implementationType && (
        <div>
          <Label className="text-sm font-medium">Tipe Implementasi</Label>
          <div className="mt-2">
            <Badge variant="outline" className="capitalize">
              {formData.implementationType === 'products' ? 'Produk' : 'Layanan'}
            </Badge>
          </div>
        </div>
      )}

      {/* Service Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="serviceName">Nama Layanan *</Label>
          <Input
            id="serviceName"
            value={formData.serviceName}
            onChange={(e) => updateFormData({ serviceName: e.target.value })}
            placeholder="contoh: Jasa Pembersihan Rumah Profesional"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="serviceDescription">Deskripsi Layanan</Label>
          <Textarea
            id="serviceDescription"
            value={formData.serviceDescription}
            onChange={(e) => updateFormData({ serviceDescription: e.target.value })}
            placeholder="Deskripsikan layanan Anda secara detail. Apa yang Anda tawarkan? Apa yang membuat layanan Anda istimewa?"
            rows={4}
            className="mt-1"
          />
        </div>
      </div>

      {/* Show image upload hint for products */}
      {isProductCategory && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Kategori Produk Terpilih
          </h4>
          <p className="text-sm text-amber-800">
            Karena ini adalah kategori produk, Anda akan dapat mengunggah gambar produk di langkah berikutnya. 
            Gambar berkualitas tinggi sangat penting untuk daftar produk.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips untuk Daftar Layanan yang Baik</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Pilih kategori yang paling spesifik sesuai dengan layanan Anda</li>
          <li>• Gunakan nama layanan yang jelas dan deskriptif</li>
          <li>• Tonjolkan apa yang membuat layanan Anda unik dalam deskripsi</li>
          <li>• Sebutkan sertifikasi atau pengalaman yang Anda miliki</li>
          {isProductCategory && (
            <li>• Untuk produk, fokus pada kualitas, spesifikasi, dan manfaat</li>
          )}
          {isMainCategoryLocked && (
            <li>• ⚠️ Kategori utama Anda terkunci - hanya sub-kategori yang dapat diubah</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CategoryStep;