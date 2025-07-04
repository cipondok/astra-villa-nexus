import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import DynamicFormGenerator from "./DynamicFormGenerator";
import AutoPricingCalculator from "./AutoPricingCalculator";

const PropertyTypeToggleDemo = () => {
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [selectedCategory, setSelectedCategory] = useState('cleaning_residential');
  const [formData, setFormData] = useState({});
  const [pricingData, setPricingData] = useState({});

  const categories = [
    { code: 'cleaning_residential', name: 'Cleaning Services', icon: '🧹' },
    { code: 'ac_repair', name: 'AC Repair', icon: '❄️' },
    { code: 'shifting_services', name: 'Moving Services', icon: '📦' }
  ];

  const location = {
    province: 'DKI',
    city: 'Jakarta Pusat'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏗️ Commercial/Residential Toggle Demo
            <Badge variant={propertyType === 'commercial' ? 'destructive' : 'default'}>
              {propertyType === 'commercial' ? 'Commercial' : 'Residential'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={propertyType}
                onValueChange={(value) => setPropertyType(value as 'residential' | 'commercial')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">🏠 Residential</SelectItem>
                  <SelectItem value="commercial">🏢 Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Pricing Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📋 Dynamic Requirements</h3>
              <DynamicFormGenerator
                categoryId="demo-category"
                categoryCode={selectedCategory}
                propertyType={propertyType}
                onFormChange={setFormData}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">💰 Smart Pricing</h3>
              <AutoPricingCalculator
                categoryCode={selectedCategory}
                location={location}
                onPriceChange={setPricingData}
              />
            </div>
          </div>

          {/* Business Rules Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">📊 Business Rules Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Property Type Impact:</h4>
                  <ul className="space-y-1">
                    {propertyType === 'commercial' ? (
                      <>
                        <li className="text-orange-600">• Surat Izin Usaha required</li>
                        <li className="text-orange-600">• +50% pricing multiplier</li>
                        <li className="text-orange-600">• Additional insurance needed</li>
                        <li className="text-orange-600">• Extended review process</li>
                      </>
                    ) : (
                      <>
                        <li className="text-green-600">• Standard documents only</li>
                        <li className="text-green-600">• Base pricing applied</li>
                        <li className="text-green-600">• Basic insurance sufficient</li>
                        <li className="text-green-600">• Faster approval process</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Category Requirements:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Specific certifications</li>
                    <li>• Equipment validation</li>
                    <li>• Experience verification</li>
                    <li>• Service area coverage</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Compliance Checks:</h4>
                  <ul className="space-y-1 text-blue-600">
                    <li>• Indonesian document format</li>
                    <li>• Provincial minimum wage</li>
                    <li>• File size & type validation</li>
                    <li>• Business registration rules</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyTypeToggleDemo;