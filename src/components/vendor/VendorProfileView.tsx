
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Edit,
  Calendar,
  Shield,
  Star,
  CheckCircle
} from "lucide-react";

interface VendorProfileViewProps {
  profile: any;
  businessNature: any;
  onEdit: () => void;
  canChangeNature: boolean;
}

const VendorProfileView = ({ profile, businessNature, onEdit, canChangeNature }: VendorProfileViewProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.business_name || 'Business Name Not Set'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant={profile.is_active ? "default" : "secondary"}>
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {profile.is_verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile.business_finalized_at && (
                    <Badge variant="outline">
                      Setup Completed
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button onClick={onEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Business Type & Nature */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Business Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Type:</span> {profile.business_type || 'Not specified'}</p>
                <p><span className="text-gray-500">Nature:</span> {businessNature?.name || 'Not selected'}</p>
                {!canChangeNature && profile.business_finalized_at && (
                  <p className="text-xs text-amber-600">
                    Business nature locked until {formatDate(profile.business_finalized_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Contact Details</h4>
              <div className="space-y-2">
                {profile.business_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{profile.business_email}</span>
                  </div>
                )}
                {profile.business_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{profile.business_phone}</span>
                  </div>
                )}
                {profile.business_website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={profile.business_website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{profile.rating || 0} / 5.0</span>
                </div>
                <p><span className="text-gray-500">Reviews:</span> {profile.total_reviews || 0}</p>
                <p><span className="text-gray-500">Member since:</span> {formatDate(profile.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {profile.business_address && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Business Address</p>
                  <p className="text-sm text-gray-600">{profile.business_address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {profile.business_description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">About</p>
              <p className="text-sm text-gray-600">{profile.business_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Compliance */}
      {(profile.license_number || profile.tax_id) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Business Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.license_number && (
                <div>
                  <p className="text-sm font-medium">License Number</p>
                  <p className="text-sm text-gray-600">{profile.license_number}</p>
                </div>
              )}
              {profile.tax_id && (
                <div>
                  <p className="text-sm font-medium">Tax ID</p>
                  <p className="text-sm text-gray-600">{profile.tax_id}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorProfileView;
