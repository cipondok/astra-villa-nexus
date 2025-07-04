import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, Wrench, Image as ImageIcon } from 'lucide-react';

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
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load main categories
  useEffect(() => {
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

    fetchMainCategories();
  }, []);

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

  const selectedMainCategory = mainCategories.find(cat => cat.id === formData.mainCategory);
  const isProductCategory = selectedMainCategory?.type === 'products' || selectedMainCategory?.type === 'mixed';

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
        <Label className="text-base font-medium mb-4 block">Select Main Category</Label>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading categories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCategories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.mainCategory === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => updateFormData({ 
                mainCategory: category.id,
                subcategory: '', // Reset subcategory when changing main category
                implementationType: category.type // Auto-select implementation type
              })}
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
                        {category.type === 'products' ? 'Product' : 'Service'}
                      </Badge>
                      {category.type === 'mixed' && (
                        <Badge variant="outline" className="text-xs">Mixed</Badge>
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
          <Label htmlFor="subcategory">Select Subcategory</Label>
          <Select 
            value={formData.subcategory} 
            onValueChange={(value) => updateFormData({ subcategory: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Implementation Type Display */}
      {formData.implementationType && (
        <div>
          <Label className="text-sm font-medium">Implementation Type</Label>
          <div className="mt-2">
            <Badge variant="outline" className="capitalize">
              {formData.implementationType}
            </Badge>
          </div>
        </div>
      )}

      {/* Service Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="serviceName">Service Name *</Label>
          <Input
            id="serviceName"
            value={formData.serviceName}
            onChange={(e) => updateFormData({ serviceName: e.target.value })}
            placeholder="e.g., Professional House Cleaning Service"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="serviceDescription">Service Description</Label>
          <Textarea
            id="serviceDescription"
            value={formData.serviceDescription}
            onChange={(e) => updateFormData({ serviceDescription: e.target.value })}
            placeholder="Describe your service in detail. What do you offer? What makes your service special?"
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
            Product Category Selected
          </h4>
          <p className="text-sm text-amber-800">
            Since this is a product category, you'll be able to upload product images in the next step. 
            High-quality images are essential for product listings.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a Great Service Listing</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose the most specific category that matches your service</li>
          <li>• Use a clear, descriptive service name</li>
          <li>• Highlight what makes your service unique in the description</li>
          <li>• Mention any certifications or experience you have</li>
          {isProductCategory && (
            <li>• For products, focus on quality, specifications, and benefits</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CategoryStep;