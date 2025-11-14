import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BaseProperty } from '@/types/property';

interface SimilarityWeights {
  propertyType: number;
  style: number;
  architecture: number;
  bedrooms: number;
  amenities: number;
}

interface ImageSearchResult extends BaseProperty {
  similarityScore: number;
  similarityBreakdown: {
    propertyType: number;
    style: number;
    architecture: number;
    bedrooms: number;
    amenities: number;
  };
}

interface ImageFeatures {
  propertyType: string;
  style: string;
  architecture: string;
  bedrooms: number;
  amenities: string[];
  visualFeatures: any;
  condition: string;
  size: string;
}

export const useImageSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);
  const [imageFeatures, setImageFeatures] = useState<ImageFeatures | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const searchByImage = useCallback(async (
    imageFile: File,
    weights: SimilarityWeights = {
      propertyType: 30,
      style: 20,
      architecture: 15,
      bedrooms: 10,
      amenities: 25
    }
  ) => {
    setIsSearching(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Convert image to base64
      setUploadProgress(20);
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      setUploadProgress(40);

      // Step 2: Call the edge function
      const { data, error: functionError } = await supabase.functions.invoke('search-by-image', {
        body: {
          imageUrl: imageDataUrl,
          weights
        }
      });

      setUploadProgress(80);

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Failed to call search function');
      }

      if (!data) {
        throw new Error('No response from search function');
      }

      if (!data.success) {
        console.error('Search failed:', data.error);
        throw new Error(data.error || 'Search failed');
      }

      setImageFeatures(data.imageFeatures);
      setSearchResults(data.properties);
      setUploadProgress(100);

      return {
        properties: data.properties,
        imageFeatures: data.imageFeatures,
        totalMatches: data.totalMatches
      };

    } catch (err) {
      console.error('Image search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search by image';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setImageFeatures(null);
    setError(null);
    setUploadProgress(0);
  }, []);

  return {
    searchByImage,
    isSearching,
    searchResults,
    imageFeatures,
    error,
    uploadProgress,
    clearResults
  };
};
