
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, X, Upload, Eye, Trash2, Edit3 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  state: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  status: string;
  approval_status: string;
  images: string[];
  owner_id: string;
  agent_id?: string;
  created_at: string;
  updated_at: string;
}

interface StyledPropertyEditModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
}

const StyledPropertyEditModal = ({ property, isOpen, onClose, onSave }: StyledPropertyEditModalProps) => {
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccess, showError } = useAlert();
  const { themeSettings } = useThemeSettings();

  useEffect(() => {
    if (property) {
      setEditedProperty({ ...property });
    }
  }, [property]);

  if (!editedProperty) return null;

  const handleInputChange = (field: keyof Property, value: any) => {
    setEditedProperty(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (editedProperty) {
      onSave(editedProperty);
      onClose();
      showSuccess("Property Updated", "Property has been successfully updated.");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto glass-ios border border-border/30"
        style={{ 
          backgroundColor: `hsl(var(--background) / 0.95)`,
          borderColor: themeSettings.primaryColor + '30'
        }}
      >
        <DialogHeader className="glass-ios rounded-2xl p-4 border border-border/20">
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <Edit3 className="h-5 w-5" style={{ color: themeSettings.primaryColor }} />
            Edit Property Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Make changes to the property listing. All changes will be reviewed before being published.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-2">
          {/* Status Section */}
          <div className="glass-ios rounded-xl p-4 border border-border/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Property Status</h3>
              <Badge variant={getStatusBadgeVariant(editedProperty.approval_status)}>
                {editedProperty.approval_status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Approval Status</Label>
                <Select
                  value={editedProperty.approval_status}
                  onValueChange={(value) => handleInputChange('approval_status', value)}
                >
                  <SelectTrigger className="glass-ios border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-ios border border-border/30">
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Listing Status</Label>
                <Select
                  value={editedProperty.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="glass-ios border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-ios border border-border/30">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="glass-ios rounded-xl p-4 border border-border/20">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Basic Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Property Title</Label>
                <Input
                  value={editedProperty.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="glass-ios border-border/30 text-foreground"
                  placeholder="Enter property title"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Description</Label>
                <Textarea
                  value={editedProperty.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="glass-ios border-border/30 text-foreground min-h-[100px]"
                  placeholder="Enter property description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Property Type</Label>
                  <Select
                    value={editedProperty.property_type}
                    onValueChange={(value) => handleInputChange('property_type', value)}
                  >
                    <SelectTrigger className="glass-ios border-border/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-ios border border-border/30">
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Listing Type</Label>
                  <Select
                    value={editedProperty.listing_type}
                    onValueChange={(value) => handleInputChange('listing_type', value)}
                  >
                    <SelectTrigger className="glass-ios border-border/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-ios border border-border/30">
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="glass-ios rounded-xl p-4 border border-border/20">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Location Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">City</Label>
                <Input
                  value={editedProperty.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">State</Label>
                <Input
                  value={editedProperty.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Area</Label>
                <Input
                  value={editedProperty.area || ''}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Full Location</Label>
                <Input
                  value={editedProperty.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="glass-ios rounded-xl p-4 border border-border/20">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Property Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Price ({themeSettings.currency})</Label>
                <Input
                  type="number"
                  value={editedProperty.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Area (sqm)</Label>
                <Input
                  type="number"
                  value={editedProperty.area_sqm || ''}
                  onChange={(e) => handleInputChange('area_sqm', parseInt(e.target.value))}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Bedrooms</Label>
                <Input
                  type="number"
                  value={editedProperty.bedrooms || ''}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Bathrooms</Label>
                <Input
                  type="number"
                  value={editedProperty.bathrooms || ''}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                  className="glass-ios border-border/30 text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-4 glass-ios rounded-xl border border-border/20">
          <Button
            variant="outline"
            onClick={onClose}
            className="btn-secondary-ios"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="btn-primary-ios"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StyledPropertyEditModal;
