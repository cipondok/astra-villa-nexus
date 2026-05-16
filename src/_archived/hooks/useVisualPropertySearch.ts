import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import browserImageCompression from 'browser-image-compression';

export interface DetectedAttributes {
  property_type: string;
  architecture_style: string;
  has_pool: boolean;
  estimated_floors: number;
  environment: string;
  exterior_color: string;
  condition: string;
  size_impression: string;
  has_garden: boolean;
  has_parking: boolean;
}

export interface VisualSearchMatch {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  thumbnail_url: string;
  listing_type: string;
  similarity_score: number;
}

export interface VisualSearchResult {
  detected_attributes: DetectedAttributes;
  matched_properties: VisualSearchMatch[];
  total_candidates: number;
}

export const useVisualPropertySearch = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const search = useMutation({
    mutationFn: async (file: File): Promise<VisualSearchResult> => {
      // Compress image before sending
      const compressed = await browserImageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      // Convert to base64
      const buffer = await compressed.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const { data, error } = await supabase.functions.invoke('visual-search', {
        body: { image_base64: base64, limit: 12 },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.matched_properties.length} similar properties`);
    },
    onError: (error: any) => {
      if (error?.status === 429) {
        toast.error('Rate limited. Please try again shortly.');
      } else if (error?.status === 402) {
        toast.error('AI credits exhausted. Please add funds.');
      } else {
        toast.error('Visual search failed. Try another image.');
      }
    },
  });

  const handleFileSelect = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    search.mutate(file);
  };

  return {
    search: handleFileSelect,
    results: search.data,
    detectedAttributes: search.data?.detected_attributes,
    matchedProperties: search.data?.matched_properties,
    isSearching: search.isPending,
    previewUrl,
    reset: () => {
      search.reset();
      setPreviewUrl(null);
    },
  };
};
