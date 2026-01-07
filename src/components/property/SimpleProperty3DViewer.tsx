import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Eye, Maximize2, Minimize2, VolumeX, Volume2, Share2, Heart, MapPin, Loader2, X } from 'lucide-react';
import { BaseProperty } from '@/types/property';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleProperty3DViewerProps {
  property: BaseProperty;
  threeDModelUrl?: string;
  virtualTourUrl?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  onClose?: () => void;
}

type Platform = 'matterport' | 'sketchfab' | 'kuula' | 'generic';

const SimpleProperty3DViewer: React.FC<SimpleProperty3DViewerProps> = ({
  property, threeDModelUrl, virtualTourUrl, isFullscreen = false, onFullscreenToggle, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'virtual-tour' | '3d-model'>('virtual-tour');
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const tourUrl = virtualTourUrl || property.virtual_tour_url;
  const modelUrl = threeDModelUrl || property.three_d_model_url;

  const detectPlatform = (url: string): Platform => {
    if (url.includes('matterport.com')) return 'matterport';
    if (url.includes('sketchfab.com')) return 'sketchfab';
    if (url.includes('kuula.co')) return 'kuula';
    return 'generic';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)} M`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)} Jt`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const buildEmbedUrl = (url: string, platform: Platform): string => {
    if (platform === 'matterport') {
      const id = url.match(/m=([^&]+)/)?.[1] || url.match(/\/show\/([^/?]+)/)?.[1];
      return `https://my.matterport.com/show/?m=${id}&play=1&qs=1&gt=0&hr=0`;
    }
    if (platform === 'sketchfab') {
      const id = url.match(/models\/([^/?]+)/)?.[1];
      return `https://sketchfab.com/models/${id}/embed?autostart=1&ui_controls=1`;
    }
    if (platform === 'kuula') {
      const id = url.match(/share\/([^/?]+)/)?.[1];
      return `https://kuula.co/share/${id}?fs=1&vr=0&sd=1`;
    }
    return url;
  };

  const handleIframeLoad = useCallback(() => setIsLoading(false), []);

  const getPlatformBadge = (platform: Platform) => ({
    matterport: { label: 'Matterport', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    sketchfab: { label: 'Sketchfab', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    kuula: { label: 'Kuula 360°', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    generic: { label: '3D View', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }
  }[platform]);

  const renderEmptyState = (type: 'tour' | 'model') => (
    <div className="h-full flex items-center justify-center bg-gradient-to-b from-navy-primary/50 to-dark-bg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 p-8">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold-primary/20 to-gold-secondary/10 flex items-center justify-center border border-gold-primary/20">
          {type === 'tour' ? <Eye className="h-10 w-10 text-gold-primary" /> : <Box className="h-10 w-10 text-gold-primary" />}
        </div>
        <h3 className="text-lg font-semibold text-text-light">{type === 'tour' ? 'Virtual Tour Coming Soon' : '3D Model Coming Soon'}</h3>
        <p className="text-text-muted text-sm">Experience this property in immersive 3D</p>
        <Button variant="outline" className="glass-effect border-gold-primary/30 text-gold-primary">Request {type === 'tour' ? 'Tour' : 'Model'}</Button>
      </motion.div>
    </div>
  );

  const renderViewer = (url: string, platform: Platform) => (
    <div className="relative h-full w-full">
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-navy-primary to-dark-bg">
            <Loader2 className="h-12 w-12 text-gold-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      <iframe src={buildEmbedUrl(url, platform)} className="w-full h-full border-0" allow="autoplay; fullscreen; vr" allowFullScreen onLoad={handleIframeLoad} loading="lazy" />
      
      {/* Property Info Overlay */}
      <div className="absolute bottom-4 left-4 glass-card p-4 max-w-xs">
        <h3 className="font-semibold text-text-light mb-2 line-clamp-1">{property.title}</h3>
        <div className="text-lg font-bold text-gold-primary">{formatPrice(property.price)}</div>
        <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
          {property.bedrooms && <span>{property.bedrooms} BR</span>}
          {property.bathrooms && <span>{property.bathrooms} BA</span>}
          {property.area_sqm && <span>{property.area_sqm}m²</span>}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button size="sm" variant="ghost" className={`glass-effect h-9 w-9 p-0 ${isSaved ? 'text-red-400' : ''}`} onClick={() => setIsSaved(!isSaved)}>
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
        <Button size="sm" variant="ghost" className="glass-effect h-9 w-9 p-0"><Share2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );

  const currentPlatform = activeTab === 'virtual-tour' && tourUrl ? detectPlatform(tourUrl) : modelUrl ? detectPlatform(modelUrl) : 'generic';

  return (
    <Card className={`glass-card border-glass-border overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-2xl'}`}>
      <CardHeader className="p-4 bg-gradient-to-r from-navy-primary/80 to-navy-secondary/80 border-b border-glass-border">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-3 text-text-light">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-primary/30 to-gold-secondary/20 flex items-center justify-center">
              <Eye className="h-5 w-5 text-gold-primary" />
            </div>
            <span className="text-lg font-semibold truncate">3D Experience</span>
            <Badge className={`text-xs ${getPlatformBadge(currentPlatform).color}`}>{getPlatformBadge(currentPlatform).label}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {onFullscreenToggle && (
              <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0" onClick={onFullscreenToggle}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            {isFullscreen && onClose && (
              <Button variant="ghost" size="sm" className="glass-effect h-9 w-9 p-0" onClick={onClose}><X className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'virtual-tour' | '3d-model')}>
          <div className="px-4 py-3 bg-navy-primary/50 border-b border-glass-border">
            <TabsList className="grid w-full grid-cols-2 bg-navy-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="virtual-tour" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-primary/20 data-[state=active]:to-gold-secondary/10 data-[state=active]:text-gold-primary rounded-lg">
                <Eye className="h-4 w-4" />Virtual Tour
              </TabsTrigger>
              <TabsTrigger value="3d-model" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-primary/20 data-[state=active]:to-gold-secondary/10 data-[state=active]:text-gold-primary rounded-lg">
                <Box className="h-4 w-4" />3D Model
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="virtual-tour" className="m-0">
            <div className={`${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-96'}`}>
              {tourUrl ? renderViewer(tourUrl, detectPlatform(tourUrl)) : renderEmptyState('tour')}
            </div>
          </TabsContent>
          
          <TabsContent value="3d-model" className="m-0">
            <div className={`${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-96'}`}>
              {modelUrl ? renderViewer(modelUrl, detectPlatform(modelUrl)) : renderEmptyState('model')}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Platform Info */}
        {!isFullscreen && (
          <div className="px-4 py-4 bg-navy-secondary/50 border-t border-glass-border">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="glass-effect p-3 rounded-xl"><div className="w-2 h-2 rounded-full bg-red-400 mx-auto mb-1" /><div className="text-xs font-medium text-text-light">Matterport</div></div>
              <div className="glass-effect p-3 rounded-xl"><div className="w-2 h-2 rounded-full bg-blue-400 mx-auto mb-1" /><div className="text-xs font-medium text-text-light">Sketchfab</div></div>
              <div className="glass-effect p-3 rounded-xl"><div className="w-2 h-2 rounded-full bg-purple-400 mx-auto mb-1" /><div className="text-xs font-medium text-text-light">Kuula 360°</div></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleProperty3DViewer;
