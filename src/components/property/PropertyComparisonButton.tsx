import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X } from 'lucide-react';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import { BaseProperty } from '@/types/property';
import { useToast } from '@/hooks/use-toast';

interface PropertyComparisonButtonProps {
  property: BaseProperty;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

const PropertyComparisonButton = ({ 
  property, 
  variant = 'outline', 
  size = 'sm' 
}: PropertyComparisonButtonProps) => {
  const { 
    addToComparison, 
    removeFromComparison, 
    isInComparison, 
    canAddMore,
    maxCompareLimit 
  } = usePropertyComparison();
  const { toast } = useToast();

  const inComparison = isInComparison(property.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (inComparison) {
      removeFromComparison(property.id);
      toast({
        title: "Removed from comparison",
        description: `${property.title} has been removed from comparison`,
      });
    } else {
      if (!canAddMore) {
        toast({
          title: "Comparison limit reached",
          description: `You can only compare up to ${maxCompareLimit} properties at once`,
          variant: "destructive",
        });
        return;
      }
      
      addToComparison(property);
      toast({
        title: "Added to comparison",
        description: `${property.title} has been added to comparison`,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`relative h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full border border-white/20 ${inComparison ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-black/30 backdrop-blur-md hover:bg-black/50 text-white'}`}
    >
      {inComparison ? (
        <Check className="h-3 w-3" />
      ) : (
        <Plus className="h-3 w-3" />
      )}
    </Button>
  );
};

export default PropertyComparisonButton;