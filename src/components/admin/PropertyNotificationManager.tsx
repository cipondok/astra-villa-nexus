import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import PropertyAlert from "./PropertyAlert";
import PropertyModal from "./PropertyModal";

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
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    mode: 'view' | 'edit';
  }>({
    isOpen: false,
    propertyId: null,
    mode: 'view'
  });

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
    setModalState({
      isOpen: true,
      propertyId,
      mode: 'view'
    });
  };

  const handleEdit = (propertyId: string) => {
    setModalState({
      isOpen: true,
      propertyId,
      mode: 'edit'
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      propertyId: null,
      mode: 'view'
    });
  };

  if (notifications.length === 0) return null;

  return (
    <>
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

      <PropertyModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        propertyId={modalState.propertyId}
        mode={modalState.mode}
      />
    </>
  );
};

export default PropertyNotificationManager;
