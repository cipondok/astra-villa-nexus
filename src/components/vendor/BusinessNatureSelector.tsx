import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Building2, Lock, Package, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BusinessNatureSelectorProps {
  currentNatureId?: string;
  canChange: boolean;
  onSelect: (natureId: string) => void;
  forceAllowSelection?: boolean; // Allow selection even when locked if no category is set
}

interface MainCategory {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
  is_active: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  main_category_id: string;
  is_active: boolean;
}

const BusinessNatureSelector = ({ 
  currentNatureId, 
  canChange, 
  onSelect, 
  forceAllowSelection = false 
}: BusinessNatureSelectorProps) => {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // If currentNatureId exists, find which category it belongs to
    if (currentNatureId && (mainCategories.length > 0 || subCategories.length > 0)) {
      const foundMainCategory = mainCategories.find(cat => cat.id === currentNatureId);
      const foundSubCategory = subCategories.find(sub => sub.id === currentNatureId);
      
      if (foundMainCategory) {
        setSelectedMainCategory(foundMainCategory.id);
        setSelectedSubCategory('');
      } else if (foundSubCategory) {
        setSelectedMainCategory(foundSubCategory.main_category_id);
        setSelectedSubCategory(foundSubCategory.id);
      }
    }
  }, [currentNatureId, mainCategories, subCategories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch main categories
      const { data: mainCats, error: mainError } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (mainError) throw mainError;

      // Fetch subcategories
      const { data: subCats, error: subError } = await supabase
        .from('vendor_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (subError) throw subError;

      setMainCategories(mainCats || []);
      setSubCategories(subCats || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubCategoriesForMain = (mainCategoryId: string) => {
    return subCategories.filter(sub => sub.main_category_id === mainCategoryId);
  };

  const handleMainCategorySelect = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory('');
    onSelect(categoryId); // Select main category
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    onSelect(subCategoryId); // Select subcategory
  };

  const getCurrentCategoryInfo = () => {
    if (selectedSubCategory) {
      const subCat = subCategories.find(sub => sub.id === selectedSubCategory);
      const mainCat = mainCategories.find(main => main.id === subCat?.main_category_id);
      return {
        name: subCat?.name || '',
        description: subCat?.description || '',
        parentName: mainCat?.name || '',
        type: mainCat?.type || 'services'
      };
    } else if (selectedMainCategory) {
      const mainCat = mainCategories.find(main => main.id === selectedMainCategory);
      return {
        name: mainCat?.name || '',
        description: mainCat?.description || '',
        parentName: '',
        type: mainCat?.type || 'services'
      };
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Memuat kategori bisnis...</span>
        </CardContent>
      </Card>
    );
  }

  const currentCategoryInfo = getCurrentCategoryInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Jenis Bisnis & Kategori
        </CardTitle>
        <CardDescription>
          Pilih kategori utama dan sub-kategori untuk bisnis Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!canChange && currentNatureId && !forceAllowSelection && (
          <Alert className="border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Kategori bisnis Anda sudah dipilih dan terkunci. Hubungi customer service untuk perubahan.
            </AlertDescription>
          </Alert>
        )}

        {!currentNatureId && (
          <Alert className="border-blue-200 bg-blue-50">
            <Building2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Silakan pilih kategori utama bisnis Anda untuk melanjutkan pengaturan layanan dan fitur lainnya.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Selection Display */}
        {currentCategoryInfo && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              {currentCategoryInfo.type === 'products' ? (
                <Package className="h-5 w-5 text-primary" />
              ) : (
                <Wrench className="h-5 w-5 text-primary" />
              )}
              <div>
                <h4 className="font-semibold">{currentCategoryInfo.name}</h4>
                {currentCategoryInfo.parentName && (
                  <p className="text-sm text-muted-foreground">
                    Sub-kategori dari: {currentCategoryInfo.parentName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">
                {currentCategoryInfo.type === 'products' ? 'Produk' : 'Layanan'}
              </Badge>
              {!canChange && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <Lock className="h-3 w-3 mr-1" />
                  Terkunci
                </Badge>
              )}
            </div>
            {currentCategoryInfo.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {currentCategoryInfo.description}
              </p>
            )}
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="main_category">Kategori Utama *</Label>
            <Select 
              value={selectedMainCategory} 
              onValueChange={handleMainCategorySelect}
              disabled={!canChange && !forceAllowSelection}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Pilih kategori utama bisnis" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
                {mainCategories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="text-gray-900 hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-2">
                      {category.type === 'products' ? (
                        <Package className="h-4 w-4" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.type === 'products' ? 'Produk' : 'Layanan'}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Selection */}
          {selectedMainCategory && (
            <div>
              <Label htmlFor="sub_category">Sub-Kategori (Opsional)</Label>
               <Select 
                 value={selectedSubCategory} 
                 onValueChange={handleSubCategorySelect}
                 disabled={!canChange && !forceAllowSelection}
               >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Pilih sub-kategori (opsional)" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
                  <SelectItem value="" className="text-gray-900 hover:bg-blue-50">
                    <div className="text-muted-foreground">Tidak ada sub-kategori</div>
                  </SelectItem>
                  {getSubCategoriesForMain(selectedMainCategory).map((subCategory) => (
                    <SelectItem 
                      key={subCategory.id} 
                      value={subCategory.id}
                      className="text-gray-900 hover:bg-blue-50"
                    >
                      <div>
                        <div className="font-medium">{subCategory.name}</div>
                        {subCategory.description && (
                          <div className="text-xs text-muted-foreground">
                            {subCategory.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getSubCategoriesForMain(selectedMainCategory).length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Belum ada sub-kategori tersedia untuk kategori ini
                </p>
              )}
            </div>
          )}
        </div>

        {/* Category Grid Display for reference */}
        {(canChange || forceAllowSelection) && (
          <div>
            <Label className="text-base font-medium mb-3 block">
              Kategori yang Tersedia
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {mainCategories.map((category) => {
                const subCats = getSubCategoriesForMain(category.id);
                return (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMainCategory === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleMainCategorySelect(category.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                          {category.type === 'products' ? (
                            <Package className="h-4 w-4 text-primary" />
                          ) : (
                            <Wrench className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{category.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {category.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={category.type === 'products' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {category.type === 'products' ? 'Produk' : 'Layanan'}
                            </Badge>
                            {subCats.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {subCats.length} sub-kategori
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {!canChange && !currentNatureId && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Silakan pilih kategori bisnis Anda terlebih dahulu.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessNatureSelector;