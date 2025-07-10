import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  description?: string;
  discount_eligible: boolean;
}

const CategoryDiscountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch main categories
      const { data: mainCats, error: mainError } = await supabase
        .from('vendor_main_categories')
        .select('id, name, description, discount_eligible')
        .eq('is_active', true)
        .order('display_order');

      if (mainError) throw mainError;

      // Fetch subcategories
      const { data: subCats, error: subError } = await supabase
        .from('vendor_subcategories')
        .select('id, name, description, discount_eligible, main_category_id')
        .eq('is_active', true)
        .order('display_order');

      if (subError) throw subError;

      setMainCategories(mainCats || []);
      setSubcategories(subCats || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
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
        title: "Success",
        description: "Category discount settings updated",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category settings",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Discount Settings</CardTitle>
          <CardDescription>
            Control which service categories can offer discounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Main Categories</h3>
            <div className="space-y-4">
              {mainCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{category.name}</Label>
                      {category.discount_eligible ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Discounts Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Discounts Disabled
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
            <h3 className="text-lg font-semibold mb-4">Subcategories</h3>
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
                        {parentCategory && (
                          <Badge variant="secondary" className="text-xs">
                            {parentCategory.name}
                          </Badge>
                        )}
                        {subcategory.discount_eligible ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Discounts Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Discounts Disabled
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