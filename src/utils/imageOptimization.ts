import imageCompression from 'browser-image-compression';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1920; // Increased for better quality
const THUMBNAIL_SIZE = 300;
const COMPRESSION_QUALITY = 0.85; // Improved quality
const WEBP_QUALITY = 0.85;

export interface ImageOptimizationOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebpIfSupported?: boolean;
  forceWebP?: boolean;
  removeBackground?: boolean;
  generateThumbnail?: boolean;
  quality?: number;
  webpQuality?: number;
  enableProgressiveJPEG?: boolean;
}

export interface OptimizedImageResult {
  originalFile: File;
  optimizedFile: File;
  webpFile?: File;
  jpegFile?: File;
  thumbnailFile?: File;
  backgroundRemovedFile?: File;
  previewUrl: string;
  webpUrl?: string;
  jpegUrl?: string;
  thumbnailUrl?: string;
  backgroundRemovedUrl?: string;
  compressionRatio: number;
  webpCompressionRatio?: number;
  dimensions: { width: number; height: number };
  formats: string[];
}

// Create WebP image with better quality settings
export const createWebPImage = async (
  file: File,
  quality: number = WEBP_QUALITY
): Promise<File> => {
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
      const maxDimension = MAX_IMAGE_DIMENSION;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Enable high-quality image rendering
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
};

// Enhanced image compression function
export const compressImage = async (
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: MAX_IMAGE_DIMENSION,
    useWebpIfSupported: !options.forceWebP, // Disable if forcing WebP separately
    quality: options.quality || COMPRESSION_QUALITY,
    initialQuality: options.quality || COMPRESSION_QUALITY
  };

  try {
    const compressedFile = await imageCompression(file, {
      ...defaultOptions,
      ...options
    });
    
    // Ensure filename has correct extension
    const extension = compressedFile.type.split('/')[1];
    const nameWithoutExt = file.name.split('.')[0];
    
    return new File([compressedFile], `${nameWithoutExt}_optimized.${extension}`, {
      type: compressedFile.type
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
};

// Background removal function
function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageFile: File): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Load image
    const image = await loadImageFromFile(imageFile);
    
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, image);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

// Load image from file
export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Generate thumbnail
export const generateThumbnail = async (file: File, size: number = THUMBNAIL_SIZE): Promise<File> => {
  const image = await loadImageFromFile(file);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Calculate dimensions maintaining aspect ratio
  let { width, height } = image;
  if (width > height) {
    height = (height * size) / width;
    width = size;
  } else {
    width = (width * size) / height;
    height = size;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, 0, 0, width, height);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const thumbnailFile = new File([blob], `thumb_${file.name}`, {
          type: 'image/jpeg'
        });
        resolve(thumbnailFile);
      } else {
        reject(new Error('Failed to generate thumbnail'));
      }
    }, 'image/jpeg', COMPRESSION_QUALITY);
  });
};

// Get image dimensions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Comprehensive image optimization
export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> => {
  try {
    const startTime = Date.now();
    
    // Get original dimensions
    const dimensions = await getImageDimensions(file);
    
    // Compress image
    const optimizedFile = await compressImage(file, options);
    
    // Generate preview URL
    const previewUrl = URL.createObjectURL(optimizedFile);
    
    // Create WebP version if requested
    let webpFile: File | undefined;
    let webpUrl: string | undefined;
    let webpCompressionRatio: number | undefined;
    
    if (options.useWebpIfSupported !== false) {
      try {
        webpFile = await createWebPImage(file, options.webpQuality || WEBP_QUALITY);
        webpUrl = URL.createObjectURL(webpFile);
        webpCompressionRatio = Math.round(((file.size - webpFile.size) / file.size) * 100);
      } catch (error) {
        console.warn('WebP conversion failed:', error);
      }
    }

    // Initialize result
    const result: OptimizedImageResult = {
      originalFile: file,
      optimizedFile,
      webpFile,
      jpegFile: optimizedFile,
      previewUrl,
      webpUrl,
      jpegUrl: URL.createObjectURL(optimizedFile),
      compressionRatio: Math.round(((file.size - optimizedFile.size) / file.size) * 100),
      webpCompressionRatio,
      dimensions,
      formats: ['jpeg', ...(webpFile ? ['webp'] : [])]
    };
    
    // Generate thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnailFile = await generateThumbnail(optimizedFile);
      result.thumbnailFile = thumbnailFile;
      result.thumbnailUrl = URL.createObjectURL(thumbnailFile);
    }
    
    // Remove background if requested
    if (options.removeBackground) {
      try {
        const backgroundRemovedBlob = await removeBackground(optimizedFile);
        const backgroundRemovedFile = new File([backgroundRemovedBlob], `bg_removed_${file.name}`, {
          type: 'image/png'
        });
        result.backgroundRemovedFile = backgroundRemovedFile;
        result.backgroundRemovedUrl = URL.createObjectURL(backgroundRemovedFile);
      } catch (error) {
        console.warn('Background removal failed:', error);
        // Continue without background removal
      }
    }
    
    const endTime = Date.now();
    console.log(`Image optimization completed in ${endTime - startTime}ms`);
    
    return result;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
};

// Batch process multiple images
export const optimizeImages = async (
  files: File[],
  options: ImageOptimizationOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<OptimizedImageResult[]> => {
  const results: OptimizedImageResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await optimizeImage(files[i], options);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to optimize image ${files[i].name}:`, error);
      // Continue with other images
    }
  }
  
  return results;
};

// Cleanup URLs to prevent memory leaks
export const cleanupImageUrls = (results: OptimizedImageResult[]) => {
  results.forEach(result => {
    URL.revokeObjectURL(result.previewUrl);
    if (result.thumbnailUrl) URL.revokeObjectURL(result.thumbnailUrl);
    if (result.backgroundRemovedUrl) URL.revokeObjectURL(result.backgroundRemovedUrl);
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
