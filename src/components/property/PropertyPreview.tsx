
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, MapPin, Home, DollarSign, User } from "lucide-react";

interface PropertyPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyData: any;
  isSubmitting: boolean;
}

const PropertyPreview = ({ isOpen, onClose, onConfirm, propertyData, isSubmitting }: PropertyPreviewProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Property Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{propertyData.title}</span>
                <Badge variant="outline">
                  {propertyData.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                {propertyData.area && (
                  <span>{propertyData.area}, {propertyData.city}, {propertyData.state}</span>
                )}
                {!propertyData.area && propertyData.location && (
                  <span>{propertyData.location}</span>
                )}
              </div>

              {propertyData.price && (
                <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
                  <DollarSign className="h-5 w-5" />
                  {formatPrice(Number(propertyData.price))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Home className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{propertyData.property_type}</p>
                </div>
                {propertyData.bedrooms && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-medium">{propertyData.bedrooms}</p>
                  </div>
                )}
                {propertyData.bathrooms && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-medium">{propertyData.bathrooms}</p>
                  </div>
                )}
                {propertyData.area_sqm && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{propertyData.area_sqm} sqm</p>
                  </div>
                )}
              </div>

              {propertyData.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{propertyData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Images */}
          {propertyData.images && propertyData.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {propertyData.images.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Owner Type:</span>
                <span className="capitalize">{propertyData.owner_type || 'Individual'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge variant="outline">Pending Approval</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Edit Property
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyPreview;
