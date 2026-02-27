import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles } from 'lucide-react';
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

  const isGold = variant === 'default';

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${isGold ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white border-0 shadow-sm shadow-amber-500/20' : 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'} ${className}`}
        onClick={handleClick}
      >
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
