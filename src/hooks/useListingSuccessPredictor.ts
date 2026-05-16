import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ListingInput {
  // Property attributes
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  landAreaSqm?: number;
  location: string;
  city: string;
  state?: string;
  amenities: string[];
  
  // Listing quality
  photoCount: number;
  hasVirtualTour: boolean;
  has3DModel: boolean;
  descriptionLength: number;
  descriptionQuality: 'poor' | 'average' | 'good' | 'excellent';
  titleLength: number;
  
  // Pricing
  price: number;
  listingType: 'sale' | 'rent';
  marketAveragePrice?: number;
  
  // Timing
  dayOfWeek?: string;
  competitorCount?: number;
}

export interface Recommendation {
  priority: number;
  category: 'pricing' | 'photos' | 'description' | 'timing' | 'features';
  issue: string;
  action: string;
  impact: string;
}

export interface StrengthAnalysis {
  propertyScore: number;
  listingQualityScore: number;
  pricingScore: number;
  marketFitScore: number;
  timingScore: number;
}

export interface PredictionResult {
  successScore: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timelinePrediction: {
    estimatedDays: number;
    range: string;
  };
  recommendations: Recommendation[];
  strengthAnalysis: StrengthAnalysis;
  competitivePosition: 'above_average' | 'average' | 'below_average';
  buyerDemographicFit: string[];
  riskFactors: string[];
  summary: string;
}

const PREDICTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/listing-success-predictor`;

export const useListingSuccessPredictor = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [inputData, setInputData] = useState<ListingInput | null>(null);

  const predictSuccess = useCallback(async (listingData: Partial<ListingInput>) => {
    setIsLoading(true);
    setPrediction(null);

    try {
      const response = await fetch(PREDICTOR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ listingData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Please wait a moment before making another prediction.",
            variant: "destructive"
          });
          return null;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits Depleted",
            description: "AI credits have been used up. Please contact support.",
            variant: "destructive"
          });
          return null;
        }
        
        throw new Error(errorData.error || 'Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setInputData(data.inputData);
      return data.prediction;
    } catch (error: any) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to analyze listing",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadExample = useCallback(async (exampleNumber: 1 | 2 | 3 | 4 | 5) => {
    setIsLoading(true);
    setPrediction(null);

    try {
      const response = await fetch(PREDICTOR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ useExample: exampleNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load example');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setInputData(data.inputData);
      return data.prediction;
    } catch (error: any) {
      console.error('Example load error:', error);
      toast({
        title: "Failed to Load Example",
        description: error.message || "Could not load example scenario",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearPrediction = useCallback(() => {
    setPrediction(null);
    setInputData(null);
  }, []);

  return {
    isLoading,
    prediction,
    inputData,
    predictSuccess,
    loadExample,
    clearPrediction
  };
};

export default useListingSuccessPredictor;
