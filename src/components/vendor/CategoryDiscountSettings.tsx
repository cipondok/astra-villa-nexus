import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  discount_eligible: boolean;
}

interface VendorService {
  id: string;
  main_category_id?: string;
  subcategory_id?: string;
}

const CategoryDiscountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [vendorServices, setVendorServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorCategoriesAndServices();
  }, [user?.id]);

  const fetchVendorCategoriesAndServices = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch vendor's services to get their categories
      const { data: services, error: servicesError } = await supabase
        .from('vendor_services')
        .select('id, main_category_id, subcategory_id')
        .eq('vendor_id', user.id);

      if (servicesError) throw servicesError;
      setVendorServices(services || []);

      // Get unique category and subcategory IDs from vendor's services
      const categoryIds = [...new Set(services?.map(s => s.main_category_id).filter(Boolean))];
      const subcategoryIds = [...new Set(services?.map(s => s.subcategory_id).filter(Boolean))];

      // Fetch only categories that the vendor uses
      if (categoryIds.length > 0) {
        const { data: mainCats, error: mainError } = await supabase
          .from('vendor_main_categories')
          .select('id, name, description, discount_eligible')
          .in('id', categoryIds)
          .eq('is_active', true)
          .order('name');

        if (mainError) throw mainError;
        setMainCategories(mainCats || []);
      }

      // Fetch only subcategories that the vendor uses
      if (subcategoryIds.length > 0) {
        const { data: subCats, error: subError } = await supabase
          .from('vendor_subcategories')
          .select('id, name, description, discount_eligible, main_category_id')
          .in('id', subcategoryIds)
          .eq('is_active', true)
          .order('name');

        if (subError) throw subError;
        setSubcategories(subCats || []);
      }

    } catch (error) {
      console.error('Error fetching vendor categories:', error);
      toast({
        title: "Error",
        description: "Gagal memuat kategori vendor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryDiscountEligibility = async (
    categoryId: string, 
    discountEligible: boolean, 
    table: 'vendor_main_categories' | 'vendor_subcategories'
  ) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ discount_eligible: discountEligible })
        .eq('id', categoryId);

      if (error) throw error;

      // Update local state
      if (table === 'vendor_main_categories') {
        setMainCategories(prev => 
          prev.map(cat => 
            cat.id === categoryId 
              ? { ...cat, discount_eligible: discountEligible }
              : cat
          )
        );
      } else {
        setSubcategories(prev => 
          prev.map(cat => 
            cat.id === categoryId 
              ? { ...cat, discount_eligible: discountEligible }
              : cat
          )
        );
      }

      toast({
        title: "Berhasil",
        description: "Pengaturan diskon kategori berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error", 
        description: "Gagal memperbarui pengaturan kategori",
        variant: "destructive",
      });
    }
  };

  const getServiceCountForCategory = (categoryId: string) => {
    return vendorServices.filter(s => s.main_category_id === categoryId).length;
  };

  const getServiceCountForSubcategory = (subcategoryId: string) => {
    return vendorServices.filter(s => s.subcategory_id === subcategoryId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Memuat pengaturan diskon...</span>
      </div>
    );
  }

  if (mainCategories.length === 0 && subcategories.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="font-semibold mb-2">Belum Ada Layanan</h3>
          <p className="text-muted-foreground">
            Anda belum memiliki layanan aktif. Tambahkan layanan terlebih dahulu untuk mengatur diskon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Diskon Kategori</CardTitle>
          <CardDescription>
            Atur diskon untuk kategori layanan yang Anda miliki
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategori Utama Anda</h3>
            <div className="space-y-4">
              {mainCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{category.name}</Label>
                      <Badge variant="secondary" className="text-xs">
                        {getServiceCountForCategory(category.id)} layanan
                      </Badge>
                      {category.discount_eligible ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Diskon Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Diskon Nonaktif
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={category.discount_eligible}
                    onCheckedChange={(checked) => 
                      updateCategoryDiscountEligibility(category.id, checked, 'vendor_main_categories')
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Sub-Kategori Anda</h3>
            <div className="space-y-4">
              {subcategories.map((subcategory) => {
                const parentCategory = mainCategories.find(cat => 
                  cat.id === (subcategory as any).main_category_id
                );
                
                return (
                  <div key={subcategory.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{subcategory.name}</Label>
                        <Badge variant="secondary" className="text-xs">
                          {getServiceCountForSubcategory(subcategory.id)} layanan
                        </Badge>
                        {parentCategory && (
                          <Badge variant="secondary" className="text-xs">
                            {parentCategory.name}
                          </Badge>
                        )}
                        {subcategory.discount_eligible ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Diskon Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Diskon Nonaktif
                          </Badge>
                        )}
                      </div>
                      {subcategory.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {subcategory.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={subcategory.discount_eligible}
                      onCheckedChange={(checked) => 
                        updateCategoryDiscountEligibility(subcategory.id, checked, 'vendor_subcategories')
                      }
                      disabled={!parentCategory?.discount_eligible}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDiscountSettings;