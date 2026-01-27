import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropertyValuationInput {
  propertyId?: string;
  propertyType: string;
  location: {
    city: string;
    district?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  };
  specifications: {
    landArea: number;
    buildingArea: number;
    bedrooms: number;
    bathrooms: number;
    floors?: number;
    yearBuilt?: number;
    condition?: string;
  };
  features?: string[];
  currentPrice?: number;
}

export interface ValuationResult {
  estimatedValue: number;
  confidenceScore: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  comparableProperties: Array<{
    id: string;
    title: string;
    price: number;
    similarity: number;
    distance?: number;
  }>;
  valuationFactors: Array<{
    name: string;
    impact: 'positive' | 'neutral' | 'negative';
    weight: number;
    description: string;
  }>;
  methodology: string;
  validUntil: string;
}

export interface ValuationHistory {
  id: string;
  property_id: string;
  estimated_value: number;
  confidence_score: number;
  market_trend: string;
  created_at: string;
  valid_until: string;
}

export function usePropertyValuation() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getValuation = useCallback(async (input: PropertyValuationInput): Promise<ValuationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('property-valuation', {
        body: input,
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success('Property valuation completed');
      return data;
    } catch (err: any) {
      const message = err.message || 'Failed to get property valuation';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getValuationHistory = useCallback(async (propertyId: string): Promise<ValuationHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('property_valuations')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []) as unknown as ValuationHistory[];
    } catch (err: any) {
      console.error('Error fetching valuation history:', err);
      return [];
    }
  }, []);

  const formatCurrency = useCallback((value: number, currency: string = 'IDR'): string => {
    if (currency === 'IDR') {
      if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)}M`;
      } else if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(0)} Jt`;
      }
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  }, []);

  return {
    isLoading,
    result,
    error,
    getValuation,
    getValuationHistory,
    formatCurrency,
  };
}
