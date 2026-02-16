import { useState, useCallback } from 'react';

export interface ImageHealthResult {
  url: string;
  status: 'pending' | 'loading' | 'ok' | 'broken' | 'slow' | 'format-issue';
  statusCode?: number;
  contentType?: string;
  fileSize?: number;
  loadTime?: number;
  error?: string;
  format?: string;
}

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
const SLOW_THRESHOLD_MS = 5000;

export function useImageHealthCheck() {
  const [results, setResults] = useState<Record<string, ImageHealthResult>>({});
  const [checking, setChecking] = useState(false);

  const checkImage = useCallback((url: string): Promise<ImageHealthResult> => {
    return new Promise((resolve) => {
      const start = Date.now();
      const result: ImageHealthResult = { url, status: 'loading' };

      // Detect format from URL extension
      const extMatch = url.match(/\.(\w+)(\?.*)?$/);
      if (extMatch) {
        result.format = extMatch[1].toLowerCase();
      }

      const img = new Image();
      const timeout = setTimeout(() => {
        img.src = '';
        result.status = 'slow';
        result.loadTime = Date.now() - start;
        result.error = 'Timed out after 10s';
        resolve(result);
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        result.status = 'ok';
        result.loadTime = Date.now() - start;
        if (result.loadTime > SLOW_THRESHOLD_MS) {
          result.status = 'slow';
        }
        resolve(result);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        result.status = 'broken';
        result.loadTime = Date.now() - start;
        result.error = 'Failed to load image';
        resolve(result);
      };

      img.src = url;
    });
  }, []);

  const checkAllImages = useCallback(async (urls: string[]) => {
    setChecking(true);
    const newResults: Record<string, ImageHealthResult> = {};
    
    // Check in batches of 5 to avoid overwhelming the browser
    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5);
      const batchResults = await Promise.all(batch.map(checkImage));
      batchResults.forEach(r => {
        newResults[r.url] = r;
        setResults(prev => ({ ...prev, [r.url]: r }));
      });
    }

    setChecking(false);
    return newResults;
  }, [checkImage]);

  const clearResults = useCallback(() => {
    setResults({});
  }, []);

  return { results, checking, checkImage, checkAllImages, clearResults };
}
