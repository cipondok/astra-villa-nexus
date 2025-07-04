import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, Clock, Square } from "lucide-react";
import { CategoryLoader, CategoryNode } from "@/utils/categoryLoader";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicSubcategorySelectorProps {
  parentCategoryId: string;
  vendorType: 'product' | 'service';
  selectedSubcategory?: string;
  onSelect: (subcategory: CategoryNode) => void;
}

const DynamicSubcategorySelector = ({ 
  parentCategoryId, 
  vendorType, 
  selectedSubcategory,
  onSelect 
}: DynamicSubcategorySelectorProps) => {
  const [subcategories, setSubcategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricingInfo, setPricingInfo] = useState<{[key: string]: any}>({});

  useEffect(() => {
    loadSubcategories();
  }, [parentCategoryId, vendorType]);

  const loadSubcategories = async () => {
    if (!parentCategoryId) return;
    
    setLoading(true);
    try {
      // Dynamic loading - only get relevant subcategories
      const categories = await CategoryLoader.getSubcategories(parentCategoryId, vendorType);
      setSubcategories(categories);
      
      // Load pricing info for each category
      const pricingData: {[key: string]: any} = {};
      for (const category of categories) {
        const pricing = await CategoryLoader.getPricingModel(category.id);
        if (pricing) {
          pricingData[category.id] = pricing;
        }
      }
      setPricingInfo(pricingData);
      
    } catch (error) {
      console.error('Error loading subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPriceRange = (pricing: any) => {
    if (!pricing?.priceRange) return '';
    
    const { min, max, currency } = pricing.priceRange;
    const formatPrice = (price: number) => {
      if (currency === 'IDR') {
        return `Rp ${(price / 1000).toFixed(0)}k`;
      }
      return `${currency} ${price}`;
    };
    
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const getPricingIcon = (model: string) => {
    switch (model) {
      case 'hourly': return <Clock className="h-3 w-3" />;
      case 'sqm': return <Square className="h-3 w-3" />;
      case 'project': return <DollarSign className="h-3 w-3" />;
      default: return <DollarSign className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading subcategories...</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (subcategories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subcategories available for this selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Pilih Subkategori</h3>
        <p className="text-sm text-muted-foreground">
          {subcategories.length} options available for your {vendorType}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subcategories.map((category) => {
          const pricing = pricingInfo[category.id];
          const isSelected = selectedSubcategory === category.id;
          
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 shadow-lg' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => onSelect(category)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <h4 className="font-semibold text-sm">{category.name_en}</h4>
                      <p className="text-xs text-muted-foreground">{category.name_id}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>

                {/* Pricing Information */}
                {pricing && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                      {getPricingIcon(pricing.model)}
                      <span className="font-medium">{formatPriceRange(pricing)}</span>
                      <span className="text-muted-foreground">/ {pricing.unit}</span>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {category.requirements && Object.keys(category.requirements).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {category.requirements.docs?.map((doc: string) => (
                        <Badge key={doc} variant="outline" className="text-xs">
                          {doc.toUpperCase()}
                        </Badge>
                      ))}
                      {category.requirements.license && (
                        <Badge variant="outline" className="text-xs">Lisensi</Badge>
                      )}
                      {category.requirements.insurance && (
                        <Badge variant="outline" className="text-xs">Asuransi</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Commission Rate */}
                <div className="mt-2 pt-2 border-t border-muted">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Komisi Platform</span>
                    <span className="font-medium text-primary">{category.commission_rate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Smart Suggestions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Smart Suggestions</h4>
        <div className="flex flex-wrap gap-2">
          {CategoryLoader.getSmartSuggestions(vendorType).slice(0, 5).map((suggestion) => (
            <Badge key={suggestion} variant="secondary" className="text-xs">
              {suggestion.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicSubcategorySelector;