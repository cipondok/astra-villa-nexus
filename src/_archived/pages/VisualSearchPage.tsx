import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, X, Sparkles, MapPin, Bed, Bath, Maximize,
  Eye, Droplets, TreePine, Car, Building2, Palette, Layers,
  Mountain, RefreshCw, ImageIcon, ChevronRight,
} from 'lucide-react';
import { useVisualPropertySearch, DetectedAttributes, VisualSearchMatch } from '@/hooks/useVisualPropertySearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${price.toLocaleString('id-ID')}`;
};

const ATTR_ICONS: Record<string, React.ElementType> = {
  property_type: Building2,
  architecture_style: Palette,
  has_pool: Droplets,
  estimated_floors: Layers,
  environment: Mountain,
  exterior_color: Eye,
  condition: Sparkles,
  size_impression: Maximize,
  has_garden: TreePine,
  has_parking: Car,
};

const ATTR_LABELS: Record<string, string> = {
  property_type: 'Property Type',
  architecture_style: 'Architecture',
  has_pool: 'Pool',
  estimated_floors: 'Floors',
  environment: 'Environment',
  exterior_color: 'Exterior Color',
  condition: 'Condition',
  size_impression: 'Size',
  has_garden: 'Garden',
  has_parking: 'Parking',
};

export default function VisualSearchPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { search, results, detectedAttributes, matchedProperties, isSearching, previewUrl, reset } = useVisualPropertySearch();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    search(file);
  }, [search]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-primary/5" />
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10 relative">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
                <Camera className="h-5 w-5 text-gold-primary" />
              </div>
              <Badge variant="outline" className="border-gold-primary/30 text-gold-primary text-xs">Vision AI</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Visual Property Search</h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Upload a photo of any property and AI will find similar listings in our database.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Upload Area */}
        {!previewUrl && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative rounded-2xl border-2 border-dashed p-8 md:p-16 flex flex-col items-center justify-center cursor-pointer transition-all',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border/50 bg-card hover:border-primary/40 hover:bg-muted/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted/50'
            )}>
              <Upload className={cn('h-8 w-8', isDragging ? 'text-primary' : 'text-muted-foreground/50')} />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">
              {isDragging ? 'Drop your image here' : 'Upload a property photo'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">Drag & drop or click to browse • JPG, PNG, WebP</p>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl pointer-events-none">
              <ImageIcon className="h-4 w-4" /> Choose Image
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-border/50 bg-card p-8 md:p-12 text-center space-y-5"
          >
            {previewUrl && (
              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-border/30 shadow-lg">
                <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-3 max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-primary animate-pulse" />
                <p className="text-sm font-semibold text-foreground">Analyzing image...</p>
              </div>
              <Progress value={undefined} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Detecting property type, architecture, features, and searching for matches
              </p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && !isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Image + Detected Attributes */}
            <div className="grid md:grid-cols-[280px_1fr] gap-5">
              {/* Uploaded Image */}
              <div className="space-y-3">
                {previewUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-border/40 shadow-md">
                    <img src={previewUrl} alt="Search image" className="w-full aspect-[4/3] object-cover" />
                    <button
                      onClick={reset}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 hover:bg-background transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-foreground" />
                    </button>
                  </div>
                )}
                <Button onClick={reset} variant="outline" size="sm" className="w-full gap-2 rounded-xl text-xs">
                  <RefreshCw className="h-3.5 w-3.5" /> Search another image
                </Button>
              </div>

              {/* Detected Attributes */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> Detected Attributes
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {detectedAttributes && Object.entries(detectedAttributes).map(([key, value]) => {
                    const Icon = ATTR_ICONS[key] || Sparkles;
                    const label = ATTR_LABELS[key] || key;
                    const displayVal = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
                    return (
                      <div key={key} className="rounded-xl bg-muted/30 border border-border/30 p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 text-primary shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{label}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground capitalize truncate">{displayVal}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {results.total_candidates} properties scanned • {matchedProperties?.length || 0} matches found
                </p>
              </div>
            </div>

            {/* Matched Properties */}
            {matchedProperties && matchedProperties.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Similar Properties
                  <Badge variant="secondary" className="text-[10px] h-5">{matchedProperties.length}</Badge>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchedProperties.map((prop, idx) => (
                    <PropertyMatchCard key={prop.id} property={prop} rank={idx + 1} onClick={() => navigate(`/properties/${prop.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {matchedProperties && matchedProperties.length === 0 && (
              <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
                <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No similar properties found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try uploading a different photo</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PropertyMatchCard({ property, rank, onClick }: { property: VisualSearchMatch; rank: number; onClick: () => void }) {
  const scoreColor = property.similarity_score >= 75 ? 'text-primary' : property.similarity_score >= 50 ? 'text-gold-primary' : 'text-muted-foreground';
  const scoreBg = property.similarity_score >= 75 ? 'bg-primary/10 border-primary/20' : property.similarity_score >= 50 ? 'bg-gold-primary/10 border-gold-primary/20' : 'bg-muted/30 border-border/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      onClick={onClick}
      className="group rounded-2xl border border-border/40 bg-card overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={property.thumbnail_url || '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Similarity Score */}
        <div className={cn('absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg border backdrop-blur-sm', scoreBg)}>
          <Sparkles className={cn('h-3 w-3', scoreColor)} />
          <span className={cn('text-xs font-bold', scoreColor)}>{property.similarity_score}%</span>
        </div>

        {/* Listing Type */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm">
          <span className="text-[10px] font-semibold text-foreground uppercase">
            {property.listing_type === 'rent' ? 'Sewa' : 'Dijual'}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-2 left-2">
          <span className="text-lg font-bold text-white drop-shadow-lg">{formatPrice(property.price)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{property.title}</h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{[property.city, property.state].filter(Boolean).join(', ')}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {property.bedrooms}</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {property.bathrooms}</span>}
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
