
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, User, UserCheck, Calendar, DollarSign, Edit2, Image as ImageIcon } from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface PropertyViewModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (property: any) => void;
}

const PropertyViewModal = ({ property, isOpen, onClose, onEdit }: PropertyViewModalProps) => {
  if (!property) return null;

  const handleEdit = () => {
    onEdit?.(property);
    onClose();
  };

  // Parse images - handle both string and array formats
  const getPropertyImages = () => {
    if (!property.images) return [];
    
    if (typeof property.images === 'string') {
      try {
        return JSON.parse(property.images);
      } catch {
        return [property.images];
      }
    }
    
    return Array.isArray(property.images) ? property.images : [];
  };

  const propertyImages = getPropertyImages();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              {property.title}
            </div>
            {onEdit && (
              <Button onClick={handleEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Property
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Property details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              Property Images ({propertyImages.length})
            </h3>
            
            {propertyImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyImages.map((image: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image, '_blank')}
                      >
                        View Full Size
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No images available for this property</p>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Basic Information
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    {property.price ? formatIDR(property.price) : 'Price not set'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {property.property_type}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {property.listing_type}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600" />
                Property Details
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <span className="font-medium text-gray-900">Bedrooms:</span>
                    <p className="text-lg">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Bathrooms:</span>
                    <p className="text-lg">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-900">Area:</span>
                    <p className="text-lg">{property.area_sqm || 'N/A'} sqm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Status Information</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={property.status === 'active' ? 'default' : 'secondary'} 
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                Status: {property.status || 'pending_approval'}
              </Badge>
              <Badge 
                variant="outline" 
                className="bg-green-100 text-green-800 border-green-200"
              >
                Created: {new Date(property.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            </div>
          )}

          {/* Location Details */}
          {(property.city || property.state || property.area) && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Location Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                  {property.city && (
                    <div>
                      <span className="font-medium text-gray-900">City:</span>
                      <p>{property.city}</p>
                    </div>
                  )}
                  {property.state && (
                    <div>
                      <span className="font-medium text-gray-900">State:</span>
                      <p>{property.state}</p>
                    </div>
                  )}
                  {property.area && (
                    <div>
                      <span className="font-medium text-gray-900">Area:</span>
                      <p>{property.area}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewModal;
