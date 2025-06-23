
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import PropertyAlert from "./PropertyAlert";

interface PropertyNotification {
  id: string;
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
  timestamp: Date;
}

interface PropertyNotificationManagerProps {
  notifications: PropertyNotification[];
  onNotificationDismiss: (notificationId: string) => void;
}

const PropertyNotificationManager = ({ 
  notifications, 
  onNotificationDismiss 
}: PropertyNotificationManagerProps) => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Approve property mutation
  const approvePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'active', 
          approval_status: 'approved' 
        })
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Approved", "Property has been approved and is now active.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['featured-properties'] });
    },
    onError: (error: any) => {
      showError("Approval Failed", error.message);
    },
  });

  const handleApprove = (propertyId: string) => {
    approvePropertyMutation.mutate(propertyId);
  };

  const handleView = (propertyId: string) => {
    // Scroll to property or show property details inline
    console.log('Viewing property:', propertyId);
    
    // Find the property element and scroll to it if it exists
    const propertyElement = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (propertyElement) {
      propertyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      propertyElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        propertyElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 3000);
    } else {
      // Navigate to the home page where properties are displayed
      window.location.href = '/';
    }
  };

  const handleEdit = (propertyId: string) => {
    // For now, show an alert that edit functionality is coming
    showSuccess("Edit Feature", "Property editing feature will be available soon. Use the Property Management section to edit properties.");
    
    // Navigate to admin property management
    const currentUrl = window.location.pathname;
    if (!currentUrl.includes('/admin')) {
      window.location.href = '/admin';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.map((notification) => (
        <PropertyAlert
          key={notification.id}
          property={notification.property}
          onApprove={handleApprove}
          onView={handleView}
          onEdit={handleEdit}
          onDismiss={() => onNotificationDismiss(notification.id)}
          showActions={true}
        />
      ))}
    </div>
  );
};

export default PropertyNotificationManager;
