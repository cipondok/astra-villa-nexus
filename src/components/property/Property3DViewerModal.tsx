import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, Eye, Box, MapPin, Heart, Share2 } from 'lucide-react';
import { BaseProperty } from '@/types/property';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Property3DViewerModalProps {
  property: BaseProperty;
  isOpen: boolean;
  onClose: () => void;
  threeDModelUrl?: string;
  virtualTourUrl?: string;
}

const Property3DViewerModal: React.FC<Property3DViewerModalProps> = ({
  property,
  isOpen,
  onClose,
  threeDModelUrl,
  virtualTourUrl
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tour' | 'model'>('tour');
  const [isSaved, setIsSaved] = useState(false);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)} M`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)} Jt`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const tourUrl = virtualTourUrl || property.virtual_tour_url;
  const modelUrl = threeDModelUrl || property.three_d_model_url;

  if (!isOpen) return null;

  const contentHeight = isFullscreen ? 'h-screen' : 'h-[70vh]';

  const renderViewer = (url: string | undefined, type: 'tour' | 'model') => {
    if (!url) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-b from-navy-primary/50 to-dark-bg">
          <div className="text-center space-y-4 p-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold-primary/20 to-gold-secondary/10 flex items-center justify-center border border-gold-primary/20">
              {type === 'tour' ? <Eye className="h-10 w-10 text-gold-primary" /> : <Box className="h-10 w-10 text-gold-primary" />}
            </div>
            <h3 className="text-lg font-semibold text-text-light">
              {type === 'tour' ? 'Virtual Tour Coming Soon' : '3D Model Coming Soon'}
            </h3>
            <p className="text-text-muted text-sm">
              {type === 'tour' ? 'Experience this property in immersive 360°' : 'Explore interactive 3D models'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <iframe
        src={url}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; vr; xr-spatial-tracking"
        allowFullScreen
        loading="lazy"
      />
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[9999] flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}
      >
        <motion.div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative glass-card overflow-hidden shadow-2xl ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl rounded-2xl'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-navy-primary/90 to-navy-secondary/90 border-b border-glass-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-primary/30 to-gold-secondary/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-gold-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-text-light">{property.title}</h2>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <MapPin className="h-3 w-3" />
                  {property.location}
                </div>
              </div>
              <Badge className="bg-gold-primary/20 text-gold-primary border-gold-primary/30 ml-2">
                {formatPrice(property.price)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0" onClick={() => setIsSaved(!isSaved)}>
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-400 text-red-400' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tour' | 'model')}>
            <div className="px-4 py-2 bg-navy-primary/50 border-b border-glass-border">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-navy-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="tour" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-primary/20 data-[state=active]:to-gold-secondary/10 data-[state=active]:text-gold-primary rounded-lg">
                  <Eye className="h-4 w-4" />
                  Virtual Tour
                </TabsTrigger>
                <TabsTrigger value="model" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-primary/20 data-[state=active]:to-gold-secondary/10 data-[state=active]:text-gold-primary rounded-lg">
                  <Box className="h-4 w-4" />
                  3D Model
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="tour" className={`m-0 ${contentHeight}`}>
              {renderViewer(tourUrl, 'tour')}
            </TabsContent>
            
            <TabsContent value="model" className={`m-0 ${contentHeight}`}>
              {renderViewer(modelUrl, 'model')}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Property3DViewerModal;
