import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, DollarSign, Clock, Package } from 'lucide-react';

interface PricingStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const PricingStep: React.FC<PricingStepProps> = ({ formData, updateFormData }) => {
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 1
  });

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addPackage = () => {
    if (newPackage.name && newPackage.price > 0) {
      updateFormData({
        packages: [...formData.packages, newPackage]
      });
      setNewPackage({ name: '', description: '', price: 0, duration: 1 });
    }
  };

  const removePackage = (index: number) => {
    updateFormData({
      packages: formData.packages.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Pricing Type */}
      <div>
        <Label className="text-base font-medium mb-4 block">Pricing Structure</Label>
        <RadioGroup 
          value={formData.priceType} 
          onValueChange={(value) => updateFormData({ priceType: value })}
        >
          <div className="space-y-3">
            <Card className={`p-4 cursor-pointer transition-colors ${formData.priceType === 'fixed' ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="fixed" id="fixed" />
                <div className="flex-1">
                  <Label htmlFor="fixed" className="font-medium">Fixed Price</Label>
                  <p className="text-sm text-muted-foreground">Set one price for the entire service</p>
                </div>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </Card>

            <Card className={`p-4 cursor-pointer transition-colors ${formData.priceType === 'hourly' ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="hourly" id="hourly" />
                <div className="flex-1">
                  <Label htmlFor="hourly" className="font-medium">Hourly Rate</Label>
                  <p className="text-sm text-muted-foreground">Charge per hour of work</p>
                </div>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </Card>

            <Card className={`p-4 cursor-pointer transition-colors ${formData.priceType === 'package' ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="package" id="package" />
                <div className="flex-1">
                  <Label htmlFor="package" className="font-medium">Service Packages</Label>
                  <p className="text-sm text-muted-foreground">Offer multiple pricing tiers</p>
                </div>
                <Package className="h-5 w-5 text-purple-500" />
              </div>
            </Card>
          </div>
        </RadioGroup>
      </div>

      {/* Base Pricing */}
      {(formData.priceType === 'fixed' || formData.priceType === 'hourly') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {formData.priceType === 'fixed' ? 'Service Price' : 'Hourly Rate'}
            </CardTitle>
            <CardDescription>
              {formData.priceType === 'fixed' 
                ? 'Set the total price for your service' 
                : 'Set your rate per hour of work'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">
                  {formData.priceType === 'fixed' ? 'Total Price (IDR)' : 'Price per Hour (IDR)'}
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => updateFormData({ basePrice: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 150000"
                  className="mt-1"
                />
                {formData.basePrice > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatIDR(formData.basePrice)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="duration">
                  {formData.priceType === 'fixed' ? 'Estimated Duration' : 'Minimum Duration'}
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => updateFormData({ duration: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    className="flex-1"
                  />
                  <Select 
                    value={formData.durationUnit} 
                    onValueChange={(value) => updateFormData({ durationUnit: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Min</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Pricing */}
      {formData.priceType === 'package' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Packages</CardTitle>
            <CardDescription>
              Create different service packages with varying prices and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Packages */}
            {formData.packages.length > 0 && (
              <div className="space-y-3">
                {formData.packages.map((pkg: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{pkg.name}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">{formatIDR(pkg.price)}</Badge>
                          <Badge variant="outline">{pkg.duration} hours</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePackage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Package */}
            <Card className="p-4 border-dashed">
              <h4 className="font-medium mb-3">Add New Package</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    placeholder="Package name (e.g., Basic Cleaning)"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                      placeholder="Price (IDR)"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={newPackage.duration}
                      onChange={(e) => setNewPackage({ ...newPackage, duration: parseInt(e.target.value) || 1 })}
                      placeholder="Hours"
                      className="w-20"
                    />
                  </div>
                </div>
                <Textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                  placeholder="Describe what's included in this package"
                  rows={2}
                />
                <Button 
                  onClick={addPackage}
                  disabled={!newPackage.name || newPackage.price <= 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </div>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Pricing Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing Summary
          </h4>
          <div className="text-sm text-green-800">
            {formData.priceType === 'fixed' && (
              <p>Fixed price: {formatIDR(formData.basePrice)} for {formData.duration} {formData.durationUnit}</p>
            )}
            {formData.priceType === 'hourly' && (
              <p>Hourly rate: {formatIDR(formData.basePrice)}/hour (minimum {formData.duration} {formData.durationUnit})</p>
            )}
            {formData.priceType === 'package' && (
              <div>
                <p>Service packages: {formData.packages.length} package(s)</p>
                {formData.packages.length > 0 && (
                  <p className="mt-1">
                    Price range: {formatIDR(Math.min(...formData.packages.map((p: any) => p.price)))} - {formatIDR(Math.max(...formData.packages.map((p: any) => p.price)))}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Pricing Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Research competitor prices in your area</li>
          <li>• Consider your experience, materials, and travel costs</li>
          <li>• Start competitive and adjust based on demand</li>
          <li>• Package deals can attract more customers</li>
          <li>• Include travel fees if you cover large areas</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingStep;
