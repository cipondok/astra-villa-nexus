import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronDown, 
  ChevronRight, 
  FolderTree, 
  Package, 
  Wrench, 
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  type: 'service' | 'product';
  display_order: number;
  is_active: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  main_category_id?: string;
  display_order: number;
  is_active: boolean;
}

const VendorCategoryTree = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch main categories with their subcategories
  const { data: categoryTree, isLoading } = useQuery({
    queryKey: ['vendor-category-tree'],
    queryFn: async () => {
      // Fetch main categories
      const { data: mainCategories, error: mainError } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (mainError) throw mainError;

      // Fetch subcategories
      const { data: subcategories, error: subError } = await supabase
        .from('vendor_sub_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (subError) throw subError;

      // Group subcategories by main category
      const categoryMap = new Map<string, MainCategory>();
      
      mainCategories.forEach((category) => {
        categoryMap.set(category.id, {
          ...category,
          type: category.type as 'service' | 'product',
          subcategories: []
        });
      });

      subcategories.forEach((sub) => {
        if (sub.main_category_id && categoryMap.has(sub.main_category_id)) {
          categoryMap.get(sub.main_category_id)!.subcategories!.push(sub);
        }
      });

      return Array.from(categoryMap.values());
    }
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    if (categoryTree) {
      setExpandedCategories(new Set(categoryTree.map(cat => cat.id)));
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading category tree...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Category Tree Structure</h2>
          <p className="text-muted-foreground">
            Hierarchical view of all vendor categories and subcategories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Category Tree ({categoryTree?.length || 0} main categories)
          </CardTitle>
          <CardDescription>
            Browse and manage the complete category hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryTree && categoryTree.length > 0 ? (
            <div className="space-y-2">
              {categoryTree.map((category) => (
                <div key={category.id} className="border rounded-lg">
                  <Collapsible
                    open={expandedCategories.has(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="text-lg">{category.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{category.name}</h3>
                              <Badge variant={category.type === 'product' ? 'default' : 'outline'} className="flex items-center gap-1">
                                {category.type === 'product' ? (
                                  <>
                                    <Package className="h-3 w-3" />
                                    Product
                                  </>
                                ) : (
                                  <>
                                    <Wrench className="h-3 w-3" />
                                    Service
                                  </>
                                )}
                              </Badge>
                              <Badge variant={category.is_active ? "default" : "secondary"}>
                                {category.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                ({category.subcategories?.length || 0} subcategories)
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit main category
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle add subcategory
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-muted/20">
                        {category.subcategories && category.subcategories.length > 0 ? (
                          <div className="p-4 space-y-2">
                            {category.subcategories.map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="flex items-center justify-between p-3 bg-background rounded border ml-6"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{subcategory.icon}</span>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-medium">{subcategory.name}</h4>
                                      <Badge variant={subcategory.is_active ? "default" : "secondary"}>
                                        {subcategory.is_active ? "Active" : "Inactive"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Order: {subcategory.display_order}
                                      </span>
                                    </div>
                                    {subcategory.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {subcategory.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Handle edit subcategory
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Handle delete subcategory
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            <p>No subcategories found</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Subcategory
                            </Button>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories found. Create your first main category to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCategoryTree;