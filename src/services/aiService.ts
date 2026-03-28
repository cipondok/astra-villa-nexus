/**
 * AI Service Layer
 * Centralizes all AI edge function calls.
 */
import { supabase } from '@/integrations/supabase/client';

export interface AIResponse {
  response: string;
  recommended_properties?: Array<{ id: string; title: string; price: number; score: number }>;
  insights?: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'neutral' }>;
}

export interface ValuationResult {
  estimated_value: number;
  confidence: number;
  price_position: 'undervalued' | 'fair_price' | 'overpriced';
  deviation_percent: number;
  investment_score: number;
  demand_heat_score: number;
}

export async function sendAssistantMessage(
  query: string,
  conversationHistory: { role: string; content: string }[]
): Promise<AIResponse> {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      mode: 'investment_assistant',
      payload: { query, conversation_history: conversationHistory.slice(-10) },
    },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return {
    response: data.response || 'Unable to process request.',
    recommended_properties: data.recommended_properties || [],
    insights: data.insights || [],
  };
}

export async function getPropertyValuation(propertyId: string): Promise<ValuationResult> {
  const { data, error } = await supabase.functions.invoke('core-engine', {
    body: { mode: 'property_valuation', property_id: propertyId },
  });
  if (error) throw new Error(error.message);
  return data?.data;
}

export async function getDigitalTwin(propertyId: string) {
  const { data, error } = await supabase.functions.invoke('core-engine', {
    body: { mode: 'digital_twin', property_id: propertyId },
  });
  if (error) throw new Error(error.message);
  return data?.data;
}
