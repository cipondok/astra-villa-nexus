
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Eye, 
  Clock, 
  Building2, 
  MapPin, 
  DollarSign,
  Edit,
  X
} from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface PropertyAlertProps {
  property: {
    id: string;
    title: string;
    property_type: string;
    listing_type: string;
    location: string;
    price?: number;
    status: string;
    owner?: {
      full_name: string;
      email: string;
    };
  };
  onApprove?: (propertyId: string) => void;
  onView?: (propertyId: string) => void;
  onEdit?: (propertyId: string) => void;
  onDismiss?: () => void;
  showActions?: boolean;
}

const PropertyAlert = ({ 
  property, 
  onApprove, 
  onView, 
  onEdit,
  onDismiss,
  showActions = true 
}: PropertyAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <Card className={`
      border-l-4 border-l-blue-500 shadow-lg transition-all duration-300 
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">New Property Listing</h3>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(property.status)}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-lg text-gray-900">{property.title}</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4" />
              <span className="capitalize">{property.property_type}</span>
              <span className="text-gray-400">•</span>
              <span className="capitalize">{property.listing_type}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{property.location}</span>
            </div>
            
            {property.price && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-green-600">
                  {formatIDR(property.price)}
                </span>
              </div>
            )}
            
            {property.owner && (
              <div className="text-gray-600">
                <span className="font-medium">Owner:</span> {property.owner.full_name}
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(property.id)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(property.id)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            
            {property.status === 'pending_approval' && onApprove && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onApprove(property.id)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyAlert;
