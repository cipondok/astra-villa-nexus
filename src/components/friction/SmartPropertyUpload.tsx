import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, Image, X, Check, Sparkles, 
  Mic, MicOff, MapPin, DollarSign, Bed, Bath,
  Square, Star, AlertCircle, Loader2, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * Smart Property Upload
 * Solves: Uploading property photos and filling extensive property details
 * 
 * Technical: Bulk upload, AI auto-tagging, auto-save, compression
 * Psychological: Progress bar, gamified completion, live preview
 * Alternative: Professional photography, AI-assisted listing
 */

interface PropertyPhoto {
  id: string;
  file: File;
  preview: string;
  aiTag?: string;
  isProcessing?: boolean;
}

const SmartPropertyUpload: React.FC = () => {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate completion percentage
  const completionScore = calculateCompletion({
    photos: photos.length,
    title,
    description,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
  });

  // Simulate AI room tagging
  const roomTags = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garden', 'Pool'];
  
  const handlePhotoUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPhotos: PropertyPhoto[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      file,
      preview: URL.createObjectURL(file),
      isProcessing: true,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);

    // Simulate AI auto-tagging
    newPhotos.forEach((photo, idx) => {
      setTimeout(() => {
        setPhotos(prev => prev.map(p => 
          p.id === photo.id 
            ? { ...p, aiTag: roomTags[idx % roomTags.length], isProcessing: false }
            : p
        ));
      }, 1000 + idx * 500);
    });
  }, []);

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Auto-save simulation
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (title || description || photos.length > 0) {
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [title, description, photos.length]);

  // AI description suggestion
  const generateAIDescription = () => {
    setShowAISuggestion(true);
    setTimeout(() => {
      setDescription(`Beautiful ${bedrooms || '3'}-bedroom property in ${location || 'prime location'} featuring modern amenities, spacious living areas, and stunning views. Perfect for families seeking comfort and luxury.`);
      setShowAISuggestion(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">List Your Property</h1>
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Gamified progress bar (Psychological) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Listing Quality</span>
            <span className={cn(
              "font-semibold",
              completionScore >= 80 ? "text-green-500" : 
              completionScore >= 50 ? "text-yellow-500" : "text-muted-foreground"
            )}>
              {completionScore >= 80 ? '⭐ Featured Ready!' : 
               completionScore >= 50 ? '📈 Good Progress' : 'Just starting'}
            </span>
          </div>
          <Progress value={completionScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completionScore < 80 
              ? `Add more details to reach Featured status (+${80 - completionScore}%)`
              : 'Your listing is ready for maximum visibility!'}
          </p>
        </div>
      </div>

      {/* Photo Upload Section (Technical - Bulk Upload) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Property Photos</h2>
          <span className="text-xs text-muted-foreground">{photos.length}/12</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              <img 
                src={photo.preview} 
                alt="Property" 
                className="w-full h-full object-cover"
              />
              
              {/* AI auto-tag badge */}
              {photo.aiTag && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-1 left-1 right-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg"
                >
                  <span className="text-[10px] text-white flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                    {photo.aiTag}
                  </span>
                </motion.div>
              )}

              {/* Processing indicator */}
              {photo.isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </motion.div>
          ))}

          {/* Upload button */}
          {photos.length < 12 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-border",
                "flex flex-col items-center justify-center gap-1",
                "hover:border-primary hover:bg-primary/5 transition-colors",
                "active:scale-95"
              )}
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add Photos</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handlePhotoUpload(e.target.files)}
        />

        {/* Alternative: Professional photography */}
        {photos.length === 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-9"
          >
            <Camera className="h-3.5 w-3.5 mr-2" />
            Book Professional Photography
          </Button>
        )}
      </div>

      {/* Property Details with Smart Suggestions */}
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Property Title</label>
          <Input
            placeholder="e.g., Modern Villa in Seminyak"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Location with auto-suggest */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Start typing area name..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Quick specs row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Beds</label>
            <div className="relative">
              <Bed className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="h-10 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Baths</label>
            <div className="relative">
              <Bath className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="2"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="h-10 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Area (m²)</label>
            <div className="relative">
              <Square className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                placeholder="150"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-10 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Price/mo</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
              <Input
                placeholder="25jt"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Description with AI assist */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Description</label>
            <div className="flex gap-2">
              {/* Voice input (Alternative) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
                className={cn("h-7 px-2", isRecording && "text-red-500")}
              >
                {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
              {/* AI generate (Alternative) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={generateAIDescription}
                disabled={showAISuggestion}
                className="h-7 px-2"
              >
                {showAISuggestion ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                <span className="text-xs ml-1">AI Write</span>
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="Describe your property's best features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-red-500"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening... speak now
            </motion.div>
          )}
        </div>
      </div>

      {/* Submit Section */}
      <div className="pt-4 border-t border-border space-y-3">
        <Button className="w-full h-12 active:scale-95">
          <Check className="h-4 w-4 mr-2" />
          Publish Listing
        </Button>
        <Button variant="outline" className="w-full h-10">
          Save as Draft
        </Button>
      </div>
    </div>
  );
};

function calculateCompletion(data: {
  photos: number;
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
}): number {
  let score = 0;
  if (data.photos >= 3) score += 25;
  else if (data.photos >= 1) score += 10;
  if (data.title.length > 10) score += 15;
  if (data.description.length > 50) score += 20;
  if (data.price) score += 10;
  if (data.location) score += 10;
  if (data.bedrooms) score += 5;
  if (data.bathrooms) score += 5;
  if (data.area) score += 10;
  return Math.min(score, 100);
}

export default SmartPropertyUpload;
