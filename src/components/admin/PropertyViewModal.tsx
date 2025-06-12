
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Home, User, UserCheck } from "lucide-react";

interface PropertyViewModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyViewModal = ({ property, isOpen, onClose }: PropertyViewModalProps) => {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {property.title}
          </DialogTitle>
          <DialogDescription>
            Property details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{property.price ? property.price.toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{property.property_type}</Badge>
                  <Badge variant="outline">{property.listing_type}</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Property Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Bedrooms:</span> {property.bedrooms || 'N/A'}</p>
                <p><span className="font-medium">Bathrooms:</span> {property.bathrooms || 'N/A'}</p>
                <p><span className="font-medium">Area:</span> {property.area_sqm || 'N/A'} sqm</p>
              </div>
            </div>
          </div>

          {/* Owner & Agent Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Property Owner
              </h3>
              <div className="space-y-1">
                <p className="font-medium">{property.owner?.full_name || 'Unknown Owner'}</p>
                <p className="text-sm text-muted-foreground">{property.owner?.email}</p>
              </div>
            </div>
            
            {property.agent && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Agent
                </h3>
                <div className="space-y-1">
                  <p className="font-medium">{property.agent.full_name}</p>
                  <p className="text-sm text-muted-foreground">{property.agent.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold mb-2">Status Information</h3>
            <div className="flex gap-2">
              <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                Status: {property.status || 'pending_approval'}
              </Badge>
              <Badge variant={property.approval_status === 'approved' ? 'default' : 'secondary'}>
                Approval: {property.approval_status || 'pending'}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{property.description}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground">
            <p>Created: {property.created_at ? new Date(property.created_at).toLocaleString() : 'N/A'}</p>
            <p>Updated: {property.updated_at ? new Date(property.updated_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewModal;
