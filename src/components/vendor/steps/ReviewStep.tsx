import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Camera, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

interface ReviewStepProps {
  formData: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const updateFormData = (data: any) => {
    // This will be handled by the parent component
  };

  return (
    <div className="space-y-6">
      {/* Service Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Service Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium">Service Name</Label>
            <p className="text-sm text-muted-foreground mt-1">{formData.serviceName}</p>
          </div>
          
          <div>
            <Label className="font-medium">Category</Label>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{formData.category}</Badge>
              {formData.subcategory && <Badge variant="outline">{formData.subcategory}</Badge>}
            </div>
          </div>

          {formData.serviceDescription && (
            <div>
              <Label className="font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{formData.serviceDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Service Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium">Service Type</Label>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {formData.locationType === 'on_site' ? 'On-site service' :
               formData.locationType === 'remote' ? 'Remote service' :
               'Both on-site and remote'}
            </p>
          </div>

          <div>
            <Label className="font-medium">Service Areas</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.serviceAreas.map((area: string) => (
                <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
              ))}
            </div>
          </div>

          {(formData.locationType === 'on_site' || formData.locationType === 'both') && (
            <div>
              <Label className="font-medium">Travel Distance</Label>
              <p className="text-sm text-muted-foreground mt-1">Up to {formData.travelRadius} km</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      {formData.serviceImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-500" />
              Service Images ({formData.serviceImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {formData.imageUrls.slice(0, 5).map((url: string, index: number) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden">
                  <img
                    src={url}
                    alt={`Service image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {formData.serviceImages.length > 5 && (
                <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{formData.serviceImages.length - 5} more
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Pricing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium">Pricing Structure</Label>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {formData.priceType === 'fixed' ? 'Fixed Price' :
               formData.priceType === 'hourly' ? 'Hourly Rate' :
               'Service Packages'}
            </p>
          </div>

          {formData.priceType === 'fixed' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Total Price</Label>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {formatIDR(formData.basePrice)}
                </p>
              </div>
              <div>
                <Label className="font-medium">Duration</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.duration} {formData.durationUnit}
                </p>
              </div>
            </div>
          )}

          {formData.priceType === 'hourly' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Hourly Rate</Label>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {formatIDR(formData.basePrice)}/hour
                </p>
              </div>
              <div>
                <Label className="font-medium">Minimum Duration</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.duration} {formData.durationUnit}
                </p>
              </div>
            </div>
          )}

          {formData.priceType === 'package' && formData.packages.length > 0 && (
            <div>
              <Label className="font-medium">Service Packages</Label>
              <div className="space-y-2 mt-2">
                {formData.packages.map((pkg: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatIDR(pkg.price)}</p>
                      <p className="text-xs text-muted-foreground">{pkg.duration} hours</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => updateFormData({ requirements: e.target.value })}
              placeholder="Any special requirements or preparation needed from the customer"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={(e) => updateFormData({ cancellationPolicy: e.target.value })}
              placeholder="Your cancellation and refund policy"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">Service Review Process</h4>
              <p className="text-sm text-amber-800">
                Your service will be reviewed by our team before going live. This usually takes 1-2 business days. 
                You'll receive an email notification once your service is approved and visible to customers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Check */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Ready to Submit</h4>
              <p className="text-sm text-green-800">
                Please review all information above. Once submitted, you can edit your service from your dashboard 
                at any time. Click "Create Service" to submit your service for review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;