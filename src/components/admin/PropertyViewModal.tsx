
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home, User, UserCheck, Calendar, DollarSign } from "lucide-react";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {property.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Property details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 text-gray-900 dark:text-gray-100">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Basic Information
              </h3>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {property.price ? formatIDR(property.price) : 'Price not set'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    {property.property_type}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                    {property.listing_type}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Property Details
              </h3>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Bedrooms:</span>
                    <p className="text-lg">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Bathrooms:</span>
                    <p className="text-lg">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Area:</span>
                    <p className="text-lg">{property.area_sqm || 'N/A'} sqm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner & Agent Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Property Owner
              </h3>
              <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {property.owner?.full_name || 'Unknown Owner'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{property.owner?.email}</p>
                  {property.owner?.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{property.owner.phone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {property.agent && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Agent
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-gray-700 dark:text-gray-300">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{property.agent.full_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{property.agent.email}</p>
                    {property.agent.phone && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{property.agent.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status & Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Status Information</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={property.status === 'active' ? 'default' : 'secondary'} 
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                >
                  Status: {property.status || 'pending_approval'}
                </Badge>
                <Badge 
                  variant={property.approval_status === 'approved' ? 'default' : 'secondary'} 
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"
                >
                  Approval: {property.approval_status || 'pending'}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Timestamps
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><span className="font-medium">Created:</span> {property.created_at ? new Date(property.created_at).toLocaleString() : 'N/A'}</p>
                <p><span className="font-medium">Updated:</span> {property.updated_at ? new Date(property.updated_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Description</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{property.description}</p>
              </div>
            </div>
          )}

          {/* Property Features */}
          {property.property_features && Object.keys(property.property_features).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Features & Amenities</h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(property.property_features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize text-gray-700 dark:text-gray-300">{key.replace('_', ' ')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{String(value)}</span>
                    </div>
                  ))}
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
