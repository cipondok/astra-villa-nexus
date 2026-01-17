import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Image as ImageIcon, 
  Check, 
  X, 
  Loader2, 
  FileImage,
  Trash2,
  Download,
  Zap
} from 'lucide-react';
import { optimizeImage, formatFileSize, OptimizedImageResult } from '@/utils/imageOptimization';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageCompressorProps {
  onImageOptimized?: (result: OptimizedImageResult) => void;
  onImagesOptimized?: (results: OptimizedImageResult[]) => void;
  maxFiles?: number;
  showPreview?: boolean;
  autoCompress?: boolean;
  forceWebP?: boolean;
  generateThumbnail?: boolean;
  compact?: boolean;
  className?: string;
}

export const ImageCompressor: React.FC<ImageCompressorProps> = ({
  onImageOptimized,
  onImagesOptimized,
  maxFiles = 5,
  showPreview = true,
  autoCompress = true,
  forceWebP = true,
  generateThumbnail = false,
  compact = false,
  className
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<OptimizedImageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useWebP, setUseWebP] = useState(forceWebP);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }
    
    setFiles(droppedFiles);
    if (autoCompress) {
      processImages(droppedFiles);
    }
  }, [maxFiles, autoCompress]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }
    
    setFiles(selectedFiles);
    if (autoCompress) {
      processImages(selectedFiles);
    }
  }, [maxFiles, autoCompress]);

  const processImages = async (imagesToProcess: File[]) => {
    if (imagesToProcess.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    const processedResults: OptimizedImageResult[] = [];
    
    for (let i = 0; i < imagesToProcess.length; i++) {
      try {
        const result = await optimizeImage(imagesToProcess[i], {
          forceWebP: useWebP,
          useWebpIfSupported: useWebP,
          generateThumbnail,
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          quality: 0.85,
          webpQuality: 0.85
        });
        
        processedResults.push(result);
        setProgress(((i + 1) / imagesToProcess.length) * 100);
        
        if (onImageOptimized) {
          onImageOptimized(result);
        }
      } catch (error) {
        console.error(`Failed to process ${imagesToProcess[i].name}:`, error);
        toast({
          title: "Compression failed",
          description: `Could not compress ${imagesToProcess[i].name}`,
          variant: "destructive"
        });
      }
    }
    
    setResults(processedResults);
    setIsProcessing(false);
    
    if (onImagesOptimized && processedResults.length > 0) {
      onImagesOptimized(processedResults);
    }
    
    if (processedResults.length > 0) {
      const totalOriginal = processedResults.reduce((acc, r) => acc + r.originalFile.size, 0);
      const totalOptimized = processedResults.reduce((acc, r) => acc + (r.webpFile?.size || r.optimizedFile.size), 0);
      const savings = Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100);
      
      toast({
        title: "Images optimized!",
        description: `Saved ${savings}% (${formatFileSize(totalOriginal - totalOptimized)}) with WebP compression`,
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  };

  const downloadOptimized = (result: OptimizedImageResult) => {
    const file = result.webpFile || result.optimizedFile;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-3 text-center transition-all cursor-pointer",
            isDragging ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50",
            isProcessing && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('compact-file-input')?.click()}
        >
          <input
            id="compact-file-input"
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex items-center justify-center gap-2">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-[11px] text-muted-foreground">
              {isProcessing ? 'Compressing...' : 'Drop images or click to upload (WebP)'}
            </span>
          </div>
        </div>
        
        {isProcessing && (
          <Progress value={progress} className="h-1" />
        )}
        
        {results.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {results.map((result, idx) => (
              <Badge key={idx} variant="secondary" className="text-[9px] gap-1">
                <Check className="h-2.5 w-2.5 text-primary" />
                {result.webpFile?.name || result.optimizedFile.name}
                <span className="text-primary">-{result.webpCompressionRatio || result.compressionRatio}%</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Image Compression</span>
            <Badge variant="outline" className="text-[9px]">WebP</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="webp-toggle" className="text-[10px] text-muted-foreground">WebP Format</Label>
            <Switch
              id="webp-toggle"
              checked={useWebP}
              onCheckedChange={setUseWebP}
              className="scale-75"
            />
          </div>
        </div>
        
        {/* Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer",
            isDragging ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50",
            isProcessing && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div className="flex flex-col items-center gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Compressing images...</span>
                <Progress value={progress} className="w-32 h-1.5" />
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">Drop images here or click to upload</p>
                  <p className="text-[10px] text-muted-foreground">
                    Automatically compressed to WebP for optimal performance
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Optimized Images ({results.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 border border-border/50"
                >
                  {showPreview && (
                    <img
                      src={result.webpUrl || result.previewUrl}
                      alt={result.originalFile.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">
                      {result.webpFile?.name || result.optimizedFile.name}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span>{formatFileSize(result.originalFile.size)}</span>
                      <span>→</span>
                      <span className="text-primary font-medium">
                        {formatFileSize(result.webpFile?.size || result.optimizedFile.size)}
                      </span>
                      <Badge variant="secondary" className="text-[8px] h-4">
                        -{result.webpCompressionRatio || result.compressionRatio}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadOptimized(result)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(idx)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tips */}
        <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-[10px] text-muted-foreground">
          <FileImage className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            WebP format reduces file size by 25-35% compared to JPEG/PNG while maintaining quality. 
            Recommended for better page load performance.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCompressor;
