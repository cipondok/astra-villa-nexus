import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoryStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const serviceCategories = [
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    subcategories: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning']
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Repair',
    subcategories: ['Plumbing', 'Electrical', 'Air Conditioning', 'Appliance Repair', 'General Maintenance']
  },
  {
    id: 'renovation',
    name: 'Renovation & Construction',
    subcategories: ['Kitchen Renovation', 'Bathroom Renovation', 'Painting', 'Flooring', 'Interior Design']
  },
  {
    id: 'gardening',
    name: 'Gardening & Landscaping',
    subcategories: ['Garden Maintenance', 'Landscaping', 'Tree Services', 'Pest Control', 'Irrigation']
  },
  {
    id: 'security',
    name: 'Security Services',
    subcategories: ['Security Systems', 'CCTV Installation', 'Access Control', 'Security Guard', 'Alarm Systems']
  },
  {
    id: 'other',
    name: 'Other Services',
    subcategories: ['Moving Services', 'Pet Care', 'Event Planning', 'Catering', 'Photography']
  }
];

const CategoryStep: React.FC<CategoryStepProps> = ({ formData, updateFormData }) => {
  const selectedCategory = serviceCategories.find(cat => cat.id === formData.category);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-4 block">Select Service Category</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceCategories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.category === category.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => updateFormData({ 
                category: category.id, 
                subcategory: '' // Reset subcategory when changing category
              })}
            >
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{category.name}</h3>
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>
                  ))}
                  {category.subcategories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.subcategories.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedCategory && (
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
              {selectedCategory.subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a Great Service Listing</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose the most specific category that matches your service</li>
          <li>• Use a clear, descriptive service name</li>
          <li>• Highlight what makes your service unique in the description</li>
          <li>• Mention any certifications or experience you have</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoryStep;