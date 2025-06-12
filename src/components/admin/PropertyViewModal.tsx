
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, User, UserCheck } from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface PropertyViewModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyViewModal = ({ property, isOpen, onClose }: PropertyViewModalProps) => {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-800">
            <Home className="h-5 w-5" />
            {property.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-700">
            Property details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 text-gray-900 dark:text-gray-800">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-800">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-600">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-600">
                  <span className="font-medium">Price:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {property.price ? formatIDR(property.price) : 'Price not set'}
                  </span>
                </div>
                <div className="flex gap-2">
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
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-800">Property Details</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-600">
                <p><span className="font-medium">Bedrooms:</span> {property.bedrooms || 'N/A'}</p>
                <p><span className="font-medium">Bathrooms:</span> {property.bathrooms || 'N/A'}</p>
                <p><span className="font-medium">Area:</span> {property.area_sqm || 'N/A'} sqm</p>
              </div>
            </div>
          </div>

          {/* Owner & Agent Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-800">
                <User className="h-4 w-4" />
                Property Owner
              </h3>
              <div className="space-y-1 text-gray-700 dark:text-gray-600">
                <p className="font-medium">{property.owner?.full_name || 'Unknown Owner'}</p>
                <p className="text-sm text-muted-foreground">{property.owner?.email}</p>
              </div>
            </div>
            
            {property.agent && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-800">
                  <UserCheck className="h-4 w-4" />
                  Agent
                </h3>
                <div className="space-y-1 text-gray-700 dark:text-gray-600">
                  <p className="font-medium">{property.agent.full_name}</p>
                  <p className="text-sm text-muted-foreground">{property.agent.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-800">Status Information</h3>
            <div className="flex gap-2">
              <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                Status: {property.status || 'pending_approval'}
              </Badge>
              <Badge variant={property.approval_status === 'approved' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                Approval: {property.approval_status || 'pending'}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-800">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-700">{property.description}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 dark:text-gray-600">
            <p>Created: {property.created_at ? new Date(property.created_at).toLocaleString() : 'N/A'}</p>
            <p>Updated: {property.updated_at ? new Date(property.updated_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewModal;
