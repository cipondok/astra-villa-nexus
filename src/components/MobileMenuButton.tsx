import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  ariaControls?: string;
}

const MobileMenuButton = ({ isOpen, onToggle, className, ariaControls }: MobileMenuButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn(
        // Mobile-first design
        "md:hidden",
        // Touch-friendly size
        "h-10 w-10 p-0",
        // Smooth transitions
        "transition-all duration-200 motion-reduce:transition-none",
        // Touch manipulation
        "touch-manipulation hover-scale active:scale-95",
        // Focus styles for accessibility
        "focus:ring-2 focus:ring-primary/50",
        className
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      aria-controls={ariaControls}
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );
};

export default MobileMenuButton;