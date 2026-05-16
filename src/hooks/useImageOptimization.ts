import { useState, useCallback } from 'react';
import { compressImage, generateThumbnail, getImageDimensions } from '@/utils/imageOptimization';

export interface OptimizedImageData {
  id: string;
  originalFile: File;
  webpFile?: File;
  jpegFile?: File;
  thumbnailFile?: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
  webpUrl?: string;
  jpegUrl?: string;
  thumbnailUrl?: string;
  isOptimizing: boolean;
  error?: string;
}

export const useImageOptimization = () => {
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImageData[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImages = useCallback(async (files: File[]) => {
    setIsOptimizing(true);
    
    const results: OptimizedImageData[] = [];
    
    for (const file of files) {
      const id = Math.random().toString(36).substring(2, 15);
      
      // Initialize the image data
      const imageData: OptimizedImageData = {
        id,
        originalFile: file,
        originalSize: file.size,
        optimizedSize: 0,
        compressionRatio: 0,
        dimensions: { width: 0, height: 0 },
        isOptimizing: true
      };
      
      results.push(imageData);
      setOptimizedImages(prev => [...prev, imageData]);
      
      try {
        // Get dimensions
        const dimensions = await getImageDimensions(file);
        
        // Create WebP version (primary format)
        const webpFile = await createWebPImage(file, 0.85);
        const webpUrl = URL.createObjectURL(webpFile);
        
        // Create JPEG fallback
        const jpegFile = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebpIfSupported: false,
          quality: 0.85
        });
        const jpegUrl = URL.createObjectURL(jpegFile);
        
        // Generate thumbnail
        const thumbnailFile = await generateThumbnail(webpFile, 300);
        const thumbnailUrl = URL.createObjectURL(thumbnailFile);
        
        const optimizedSize = webpFile.size;
        const compressionRatio = Math.round(((file.size - optimizedSize) / file.size) * 100);
        
        // Update the image data
        const updatedData: OptimizedImageData = {
          ...imageData,
          webpFile,
          jpegFile,
          thumbnailFile,
          optimizedSize,
          compressionRatio,
          dimensions,
          webpUrl,
          jpegUrl,
          thumbnailUrl,
          isOptimizing: false
        };
        
        setOptimizedImages(prev => 
          prev.map(img => img.id === id ? updatedData : img)
        );
        
      } catch (error) {
        console.error(`Failed to optimize image ${file.name}:`, error);
        setOptimizedImages(prev => 
          prev.map(img => 
            img.id === id 
              ? { ...img, error: error instanceof Error ? error.message : 'Optimization failed', isOptimizing: false }
              : img
          )
        );
      }
    }
    
    setIsOptimizing(false);
    return results;
  }, []);

  const createWebPImage = useCallback((file: File, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate optimized dimensions
        let { width, height } = img;
        const maxDimension = 1920;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp'
              });
              resolve(webpFile);
            } else {
              reject(new Error('Failed to create WebP blob'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const clearOptimizedImages = useCallback(() => {
    // Clean up URLs to prevent memory leaks
    optimizedImages.forEach(img => {
      if (img.webpUrl) URL.revokeObjectURL(img.webpUrl);
      if (img.jpegUrl) URL.revokeObjectURL(img.jpegUrl);
      if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl);
    });
    
    setOptimizedImages([]);
  }, [optimizedImages]);

  const removeImage = useCallback((id: string) => {
    setOptimizedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        // Clean up URLs
        if (imageToRemove.webpUrl) URL.revokeObjectURL(imageToRemove.webpUrl);
        if (imageToRemove.jpegUrl) URL.revokeObjectURL(imageToRemove.jpegUrl);
        if (imageToRemove.thumbnailUrl) URL.revokeObjectURL(imageToRemove.thumbnailUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  return {
    optimizedImages,
    isOptimizing,
    optimizeImages,
    clearOptimizedImages,
    removeImage
  };
};