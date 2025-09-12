import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Wrench, 
  AlertTriangle, 
  Settings, 
  Percent,
  Lock 
} from 'lucide-react';

interface VendorService {
  id: string;
  service_name: string;
  service_category: string;
  subcategory_id?: string;
  main_category_id?: string;
  is_active: boolean;
  discount_percentage?: number;
  is_discount_active?: boolean;
}

interface VendorProfile {
  id: string;
  main_service_category_id?: string;
  main_category_locked: boolean;
  vendor_main_categories?: {
    id: string;
    name: string;
    type: string;
    discount_eligible: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  type: string;
  discount_eligible: boolean;
}

interface Subcategory {
  id: string;
  name: string;
  main_category_id: string;
  discount_eligible: boolean;
}

const VendorServiceCategoryChecker = () => {
  const { user } = useAuth();
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorServices, setVendorServices] = useState<VendorService[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingDiscount, setUpdatingDiscount] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchVendorData();
    }
  }, [user?.id]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);

      // Fetch vendor profile with main category info
      const { data: profile } = await supabase
        .from('vendor_business_profiles')
        .select(`
          id,
          main_service_category_id,
          main_category_locked,
          vendor_main_categories!main_service_category_id(
            id, name, type, discount_eligible
          )
        `)
        .eq('vendor_id', user?.id)
        .single();

      setVendorProfile(profile);

      // Fetch vendor's services
      const { data: services } = await supabase
        .from('vendor_services')
        .select(`
          id,
          service_name,
          service_category,
          subcategory_id,
          main_category_id,
          is_active,
          discount_percentage,
          is_discount_active
        `)
        .eq('vendor_id', user?.id);

      setVendorServices(services || []);

      // Get unique category and subcategory IDs from services
      const categoryIds = [...new Set(services?.map(s => s.main_category_id).filter(Boolean))];
      const subcategoryIds = [...new Set(services?.map(s => s.subcategory_id).filter(Boolean))];

      // Fetch categories used by vendor
      if (categoryIds.length > 0) {
        const { data: cats } = await supabase
          .from('vendor_main_categories')
          .select('id, name, type, discount_eligible')
          .in('id', categoryIds);
        setMainCategories(cats || []);
      }

      // Fetch subcategories used by vendor
      if (subcategoryIds.length > 0) {
        const { data: subs } = await supabase
          .from('vendor_subcategories')
          .select('id, name, main_category_id, discount_eligible')
          .in('id', subcategoryIds);
        setSubcategories(subs || []);
      }

    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Gagal memuat data vendor');
    } finally {
      setLoading(false);
    }
  };

  const updateServiceDiscount = async (serviceId: string, percentage: number, isActive: boolean) => {
    try {
      setUpdatingDiscount(serviceId);
      
      const { error } = await supabase
        .from('vendor_services')
        .update({
          discount_percentage: percentage,
          is_discount_active: isActive,
          discount_start_date: isActive ? new Date().toISOString() : null,
          discount_end_date: isActive ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null // 30 days
        })
        .eq('id', serviceId);

      if (error) throw error;

      // Update local state
      setVendorServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, discount_percentage: percentage, is_discount_active: isActive }
            : service
        )
      );

      toast.success('Pengaturan diskon berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating discount:', error);
      toast.error('Gagal memperbarui diskon: ' + error.message);
    } finally {
      setUpdatingDiscount(null);
    }
  };

  const getServicesByCategory = (categoryId: string) => {
    return vendorServices.filter(service => service.main_category_id === categoryId);
  };

  const getServicesBySubcategory = (subcategoryId: string) => {
    return vendorServices.filter(service => service.subcategory_id === subcategoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Memuat data layanan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vendor Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profil Kategori Layanan Vendor
          </CardTitle>
          <CardDescription>
            Ringkasan kategori utama dan pengaturan diskon untuk layanan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendorProfile?.vendor_main_categories ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {vendorProfile.vendor_main_categories.type === 'products' ? (
                    <Package className="h-6 w-6 text-primary" />
                  ) : (
                    <Wrench className="h-6 w-6 text-primary" />
                  )}
                  <div>
                    <h3 className="font-semibold">{vendorProfile.vendor_main_categories.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Kategori Utama • {vendorProfile.vendor_main_categories.type === 'products' ? 'Produk' : 'Layanan'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vendorProfile.main_category_locked && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      <Lock className="h-3 w-3 mr-1" />
                      Terkunci
                    </Badge>
                  )}
                  {vendorProfile.vendor_main_categories.discount_eligible ? (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <Percent className="h-3 w-3 mr-1" />
                      Diskon Tersedia
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500 border-gray-300">
                      Diskon Tidak Tersedia
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <p className="text-muted-foreground">
                Kategori utama belum dipilih. Silakan lengkapi profil vendor Anda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services by Category */}
      {mainCategories.map(category => {
        const categoryServices = getServicesByCategory(category.id);
        const categorySubcategories = subcategories.filter(sub => sub.main_category_id === category.id);

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.type === 'products' ? (
                  <Package className="h-5 w-5" />
                ) : (
                  <Wrench className="h-5 w-5" />
                )}
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {categoryServices.length} Layanan
                </Badge>
              </CardTitle>
              <CardDescription>
                Layanan Anda dalam kategori {category.name.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Services directly in category */}
              {categoryServices.filter(s => !s.subcategory_id).map(service => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{service.service_name}</h4>
                      {service.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          <XCircle className="h-3 w-3 mr-1" />
                          Tidak Aktif
                        </Badge>
                      )}
                    </div>
                    {category.discount_eligible && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Diskon:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={service.discount_percentage || 0}
                            onChange={(e) => {
                              const percentage = parseInt(e.target.value) || 0;
                              setVendorServices(prev => 
                                prev.map(s => 
                                  s.id === service.id 
                                    ? { ...s, discount_percentage: percentage }
                                    : s
                                )
                              );
                            }}
                            className="w-20"
                            disabled={updatingDiscount === service.id}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                          <Switch
                            checked={service.is_discount_active || false}
                            onCheckedChange={(checked) => 
                              updateServiceDiscount(
                                service.id, 
                                service.discount_percentage || 0, 
                                checked
                              )
                            }
                            disabled={updatingDiscount === service.id}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Services by subcategory */}
              {categorySubcategories.map(subcategory => {
                const subcategoryServices = getServicesBySubcategory(subcategory.id);
                if (subcategoryServices.length === 0) return null;

                return (
                  <div key={subcategory.id} className="ml-4 border-l-2 border-muted pl-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h5 className="font-medium">{subcategory.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        Sub-kategori • {subcategoryServices.length} layanan
                      </Badge>
                      {subcategory.discount_eligible ? (
                        <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                          <Percent className="h-2 w-2 mr-1" />
                          Diskon OK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">
                          Tanpa Diskon
                        </Badge>
                      )}
                    </div>
                    
                    {subcategoryServices.map(service => (
                      <div key={service.id} className="border rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{service.service_name}</span>
                            {service.is_active ? (
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                                <CheckCircle className="h-2 w-2 mr-1" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                                <XCircle className="h-2 w-2 mr-1" />
                                Tidak Aktif
                              </Badge>
                            )}
                          </div>
                          {subcategory.discount_eligible && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={service.discount_percentage || 0}
                                onChange={(e) => {
                                  const percentage = parseInt(e.target.value) || 0;
                                  setVendorServices(prev => 
                                    prev.map(s => 
                                      s.id === service.id 
                                        ? { ...s, discount_percentage: percentage }
                                        : s
                                    )
                                  );
                                }}
                                className="w-16 h-8 text-xs"
                                disabled={updatingDiscount === service.id}
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                              <Switch
                                checked={service.is_discount_active || false}
                                onCheckedChange={(checked) => 
                                  updateServiceDiscount(
                                    service.id, 
                                    service.discount_percentage || 0, 
                                    checked
                                  )
                                }
                                disabled={updatingDiscount === service.id}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {categoryServices.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Belum ada layanan dalam kategori ini</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {vendorServices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="font-semibold mb-2">Belum Ada Layanan</h3>
            <p className="text-muted-foreground mb-4">
              Anda belum menambahkan layanan apapun. Mulai dengan menambahkan layanan pertama Anda.
            </p>
            <Button onClick={() => window.location.href = '/vendor'}>
              Tambah Layanan Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorServiceCategoryChecker;