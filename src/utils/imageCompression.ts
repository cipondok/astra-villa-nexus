import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * Compresses an image file to WebP format for optimal performance
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image as Blob
 */
export const compressImageToWebP = async (
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    fileType = 'image/webp'
  } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType,
      initialQuality: 0.8,
    });

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Converts a Blob to File with proper naming
 * @param blob - The blob to convert
 * @param fileName - Original file name
 * @returns File object
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  const webpFileName = fileName.replace(/\.[^/.]+$/, '.webp');
  return new File([blob], webpFileName, { type: 'image/webp' });
};

/**
 * Complete image optimization pipeline
 * @param file - Original image file
 * @param options - Compression options
 * @returns Optimized File ready for upload
 */
export const optimizeImageForUpload = async (
  file: File,
  options?: CompressionOptions
): Promise<File> => {
  const compressedBlob = await compressImageToWebP(file, options);
  return blobToFile(compressedBlob, file.name);
};

/**
 * Get estimated file size reduction
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Percentage reduction
 */
export const getCompressionRatio = (
  originalSize: number,
  compressedSize: number
): number => {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};
