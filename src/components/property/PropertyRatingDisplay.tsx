import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyRatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const PropertyRatingDisplay: React.FC<PropertyRatingDisplayProps> = ({
  averageRating,
  totalRatings,
  size = 'md',
  showCount = true,
  className
}) => {
  const sizeConfig = {
    sm: {
      star: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      star: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-1.5'
    },
    lg: {
      star: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2'
    }
  };

  const config = sizeConfig[size];
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star 
            key={i} 
            className={cn(config.star, 'fill-yellow-400 text-yellow-400')} 
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={cn(config.star, 'text-gray-300')} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={cn(config.star, 'fill-yellow-400 text-yellow-400')} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            className={cn(config.star, 'text-gray-300')} 
          />
        );
      }
    }
    
    return stars;
  };

  if (totalRatings === 0) {
    return (
      <div className={cn('flex items-center', config.gap, className)}>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn(config.star, 'text-gray-300')} />
          ))}
        </div>
        <span className={cn(config.text, 'text-muted-foreground')}>
          No ratings yet
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      <div className="flex">
        {renderStars()}
      </div>
      <span className={cn(config.text, 'font-medium')}>
        {averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={cn(config.text, 'text-muted-foreground')}>
          ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default PropertyRatingDisplay;