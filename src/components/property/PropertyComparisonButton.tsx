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
  const comparison = usePropertyComparison();
  
  if (!comparison) {
    return null; // Return null if context is not available
  }

  const { 
    addToComparison, 
    removeFromComparison, 
    isInComparison, 
    canAddMore,
    maxCompareLimit 
  } = comparison;
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
      variant={inComparison ? 'default' : variant}
      size={size}
      onClick={handleClick}
      className={`relative ${inComparison ? 'bg-primary text-primary-foreground' : ''}`}
    >
      {inComparison ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Compare
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-1" />
          Compare
        </>
      )}
    </Button>
  );
};

export default PropertyComparisonButton;