import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageAnalysisResult {
  image_url: string;
  detected_features: string[];
  confidence_scores: Record<string, number>;
}

interface ImageIntelligenceResponse {
  property_id: string;
  detected_features: string[];
  image_results: ImageAnalysisResult[];
  total_images_analyzed: number;
}

export const useImageIntelligence = (propertyId?: string) => {
  const queryClient = useQueryClient();

  // Fetch existing detected features for a property
  const { data: features, isLoading } = useQuery({
    queryKey: ['image-features', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_image_features')
        .select('*')
        .eq('property_id', propertyId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });

  // Aggregate unique features across all images
  const allFeatures = features
    ? [...new Set(features.flatMap((f: any) => f.detected_features))]
    : [];

  // Run analysis
  const analyze = useMutation({
    mutationFn: async ({
      property_id,
      image_urls,
    }: {
      property_id: string;
      image_urls: string[];
    }): Promise<ImageIntelligenceResponse> => {
      const { data, error } = await supabase.functions.invoke('image-intelligence', {
        body: { property_id, image_urls },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['image-features', data.property_id] });
      toast.success(`Detected ${data.detected_features.length} features across ${data.total_images_analyzed} images`);
    },
    onError: (error: any) => {
      if (error?.status === 402) {
        toast.error('AI credits exhausted. Please add funds.');
      } else if (error?.status === 429) {
        toast.error('Rate limited. Please try again later.');
      } else {
        toast.error('Image analysis failed');
      }
    },
  });

  return {
    features,
    allFeatures,
    isLoading,
    analyze: analyze.mutate,
    analyzeAsync: analyze.mutateAsync,
    isAnalyzing: analyze.isPending,
  };
};
