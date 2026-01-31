import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoTourViewer from './VideoTourViewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Video, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyVideoTourButtonProps {
  propertyId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'card';
  className?: string;
}

const PropertyVideoTourButton: React.FC<PropertyVideoTourButtonProps> = ({
  propertyId,
  variant = 'default',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if property has a published tour
  const { data: tour, isLoading } = useQuery({
    queryKey: ['property-tour', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_tours')
        .select('id, title, thumbnail_url, view_count')
        .eq('property_id', propertyId)
        .eq('is_published', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  if (isLoading || !tour) {
    return null;
  }

  if (variant === 'card') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "relative w-full aspect-video rounded-lg overflow-hidden group cursor-pointer",
              className
            )}
          >
            {tour.thumbnail_url ? (
              <img
                src={tour.thumbnail_url}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="flex flex-col items-center text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
                <span className="text-sm font-medium">360° Virtual Tour</span>
                <span className="text-xs opacity-80">{tour.view_count} views</span>
              </div>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{tour.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <VideoTourViewer tourId={tour.id} autoStart />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant === 'default' ? 'default' : variant} className={className}>
          <Video className="h-4 w-4 mr-2" />
          360° Tour
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{tour.title}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <VideoTourViewer tourId={tour.id} autoStart />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyVideoTourButton;
