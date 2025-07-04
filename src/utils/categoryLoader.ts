import { supabase } from "@/integrations/supabase/client";

export interface CategoryNode {
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
  pricing_model?: string;
  service_area_types?: any;
  base_price_range?: any;
}

export interface CategoryTree {
  [key: string]: CategoryNode[];
}

/**
 * Dynamic subcategory loader - returns only relevant subcategories
 * based on parent category selection
 */
export class CategoryLoader {
  private static categoryCache: Map<string, CategoryNode[]> = new Map();
  
  /**
   * Get subcategories for a given parent category
   */
  static async getSubcategories(parentId: string, vendorType?: string): Promise<CategoryNode[]> {
    const cacheKey = `${parentId}_${vendorType || 'all'}`;
    
    // Check cache first
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey)!;
    }

    try {
      let query = supabase
        .from('vendor_categories_hierarchy')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('display_order');

      // Filter by vendor type if specified
      if (vendorType && vendorType !== 'both') {
        query = query.or(`vendor_type.eq.${vendorType},vendor_type.eq.both`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      const categories = data as CategoryNode[];
      
      // Cache the result
      this.categoryCache.set(cacheKey, categories);
      
      return categories;
    } catch (error) {
      console.error('Error loading subcategories:', error);
      return [];
    }
  }

  /**
   * Get category tree structure based on vendor type
   */
  static async getCategoryTree(vendorType: 'product' | 'service'): Promise<CategoryTree> {
    const tree: CategoryTree = {};
    
    try {
      // Get main categories (level 1)
      const mainCategories = await this.getSubcategories('', vendorType);
      
      for (const mainCat of mainCategories) {
        tree[mainCat.category_code] = [];
        
        // Get subcategories for each main category
        const subcategories = await this.getSubcategories(mainCat.id, vendorType);
        tree[mainCat.category_code] = subcategories;
      }
      
      return tree;
    } catch (error) {
      console.error('Error building category tree:', error);
      return {};
    }
  }

  /**
   * Smart category suggestions based on service type
   */
  static getSmartSuggestions(vendorType: 'product' | 'service', searchTerm?: string): string[] {
    const suggestions = {
      product: {
        furniture: ['sofas', 'beds', 'tables', 'chairs'],
        appliances: ['ac_units', 'refrigerators', 'washing_machines', 'televisions']
      },
      service: {
        property: ['cleaning_residential', 'cleaning_commercial', 'installations'],
        transport: ['car_rentals', 'shifting_services'],
        technical: ['split_units', 'central_ac', 'electrical_repair']
      }
    };

    const categoryMap = suggestions[vendorType];
    
    if (!searchTerm) {
      return Object.values(categoryMap).flat();
    }
    
    // Filter by search term
    return Object.values(categoryMap)
      .flat()
      .filter(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }

  /**
   * Get pricing model for a category
   */
  static async getPricingModel(categoryId: string): Promise<{
    model: string;
    priceRange: { min: number; max: number; currency: string };
    unit: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('pricing_model, base_price_range')
        .eq('id', categoryId)
        .single();

      if (error) throw error;

      const unitMap = {
        hourly: 'per hour',
        sqm: 'per m²',
        project: 'per project',
        per_item: 'per item',
        daily: 'per day',
        fixed: 'fixed price'
      };

      return {
        model: data.pricing_model,
        priceRange: data.base_price_range as { min: number; max: number; currency: string },
        unit: unitMap[data.pricing_model as keyof typeof unitMap] || 'per unit'
      };
    } catch (error) {
      console.error('Error getting pricing model:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for admin updates)
   */
  static clearCache(): void {
    this.categoryCache.clear();
  }

  /**
   * Get category requirements for validation
   */
  static async getCategoryRequirements(categoryId: string): Promise<{
    docs: string[];
    license: boolean;
    insurance: boolean;
    equipment: string[];
  }> {
    try {
      const { data, error } = await supabase
        .from('vendor_categories_hierarchy')
        .select('requirements')
        .eq('id', categoryId)
        .single();

      if (error) throw error;

      const requirements = data.requirements as any;
      
      return {
        docs: requirements?.docs || [],
        license: requirements?.license || false,
        insurance: requirements?.insurance || false,
        equipment: requirements?.equipment || []
      };
    } catch (error) {
      console.error('Error getting category requirements:', error);
      return { docs: [], license: false, insurance: false, equipment: [] };
    }
  }
}

/**
 * React Hook for category loading
 */
export const useCategoryLoader = () => {
  return {
    getSubcategories: CategoryLoader.getSubcategories,
    getCategoryTree: CategoryLoader.getCategoryTree,
    getSmartSuggestions: CategoryLoader.getSmartSuggestions,
    getPricingModel: CategoryLoader.getPricingModel,
    getCategoryRequirements: CategoryLoader.getCategoryRequirements,
    clearCache: CategoryLoader.clearCache
  };
};