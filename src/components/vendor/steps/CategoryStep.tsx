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
        setMainCategories(data || []);
      } catch (error: any) {
        console.error('Error fetching main categories:', error);
        toast.error('Failed to load categories');
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
      } catch (error: any) {
        console.error('Error fetching subcategories:', error);
        toast.error('Failed to load subcategories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubCategories();
  }, [formData.mainCategory]);

  const selectedMainCategory = mainCategories.find(cat => cat.id === formData.mainCategory);
  const isProductCategory = selectedMainCategory?.type === 'products' || selectedMainCategory?.type === 'mixed';

  const getDefaultCategoryImage = (categoryName: string) => {
    // Generate a default image URL based on category name
    const categoryImages: { [key: string]: string } = {
      'construction': '/api/placeholder/400/300',
      'maintenance': '/api/placeholder/400/300',
      'professional': '/api/placeholder/400/300',
      'home': '/api/placeholder/400/300',
      'creative': '/api/placeholder/400/300',
      'technology': '/api/placeholder/400/300',
      'cleaning': '/api/placeholder/400/300',
      'default': '/api/placeholder/400/300'
    };
    
    const key = categoryName.toLowerCase().split(' ')[0];
    return categoryImages[key] || categoryImages.default;
  };

  return (
    <div className="space-y-6">
      {/* Main Category Selection */}
      <div>
        <Label className="text-base font-medium mb-4 block">Select Main Category</Label>
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
                <div className="mt-3 w-full h-24 bg-muted rounded-md flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-2">Default Image</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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