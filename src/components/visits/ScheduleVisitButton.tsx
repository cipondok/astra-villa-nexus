import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ScheduleVisitDialog from '@/components/visits/ScheduleVisitDialog';

interface ScheduleVisitButtonProps {
  propertyId: string;
  agentId: string;
  propertyTitle?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function ScheduleVisitButton({ propertyId, agentId, propertyTitle, variant = 'outline', size = 'sm', className }: ScheduleVisitButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      toast.error('Please sign in to schedule a visit');
      return;
    }
    if (user.id === agentId) {
      toast.info("You can't schedule a visit for your own property");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={handleClick}>
        <Calendar className="h-3.5 w-3.5 mr-1" />
        Schedule Visit
      </Button>
      <ScheduleVisitDialog
        open={open}
        onOpenChange={setOpen}
        propertyId={propertyId}
        agentId={agentId}
        propertyTitle={propertyTitle}
      />
    </>
  );
}
