/**
 * AI Property Intelligence Service
 * Provides ML-powered features: recommendations, price predictions, smart matching
 */

import { supabase } from '@/integrations/supabase/client';

export interface PropertyPrediction {
  predictedPrice: number;
  confidenceScore: number;
  priceTrend: 'up' | 'stable' | 'down';
  priceChangePercent: number;
  comparableProperties: string[];
  marketInsights: string[];
}

export interface SmartMatch {
  propertyId: string;
  matchScore: number;
  matchReasons: MatchReason[];
  isDiscoveryMatch: boolean;
}

export interface MatchReason {
  factor: string;
  score: number;
  explanation: string;
}

export interface UserPreferenceProfile {
  budget: { min: number; max: number };
  locations: string[];
  propertyTypes: string[];
  bedrooms: { min: number; max: number };
  features: string[];
  discoveryOpenness: number;
}

export interface AIInsight {
  type: 'recommendation' | 'alert' | 'tip' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

class AIPropertyService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get personalized property recommendations
   */
  async getRecommendations(
    userId: string,
    options: { limit?: number; includeDiscovery?: boolean } = {}
  ): Promise<SmartMatch[]> {
    const { limit = 10, includeDiscovery = true } = options;
    const cacheKey = `recommendations_${userId}_${limit}_${includeDiscovery}`;
    
    const cached = this.getCached<SmartMatch[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: { 
          action: 'get_recommendations', 
          userId, 
          limit,
          includeDiscovery
        }
      });

      if (error) throw error;
      
      const recommendations = data?.recommendations || [];
      this.setCache(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * Predict property price based on market data and ML
   */
  async predictPrice(propertyId: string): Promise<PropertyPrediction | null> {
    const cacheKey = `prediction_${propertyId}`;
    
    const cached = this.getCached<PropertyPrediction>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.functions.invoke('predictive-pricing', {
        body: { propertyId }
      });

      if (error) throw error;
      
      const prediction = data?.prediction;
      if (prediction) {
        const result: PropertyPrediction = {
          predictedPrice: prediction.predictedPrice || 0,
          confidenceScore: prediction.confidence || 0,
          priceTrend: prediction.trend || 'stable',
          priceChangePercent: parseFloat(prediction.next12Months?.replace(/[^0-9.-]/g, '') || '0'),
          comparableProperties: prediction.comparables || [],
          marketInsights: prediction.insights || []
        };
        this.setCache(cacheKey, result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Failed to predict price:', error);
      return null;
    }
  }

  /**
   * Get AI-generated insights for a property
   */
  async getPropertyInsights(propertyId: string): Promise<AIInsight[]> {
    const cacheKey = `insights_${propertyId}`;
    
    const cached = this.getCached<AIInsight[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.functions.invoke('ai-property-assistant', {
        body: { 
          action: 'analyze_property',
          propertyId
        }
      });

      if (error) throw error;
      
      const insights: AIInsight[] = data?.insights || [];
      this.setCache(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error('Failed to get property insights:', error);
      return [];
    }
  }

  /**
   * Generate AI-powered property description
   */
  async generateDescription(propertyData: {
    title: string;
    propertyType: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    features: string[];
    price: number;
  }): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          type: 'property_description',
          context: propertyData
        }
      });

      if (error) throw error;
      return data?.content || '';
    } catch (error) {
      console.error('Failed to generate description:', error);
      return '';
    }
  }

  /**
   * Analyze property images for quality and features
   */
  async analyzeImages(imageUrls: string[]): Promise<{
    qualityScores: number[];
    detectedFeatures: string[];
    suggestions: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-property-image', {
        body: { imageUrls }
      });

      if (error) throw error;
      return {
        qualityScores: data?.qualityScores || [],
        detectedFeatures: data?.features || [],
        suggestions: data?.suggestions || []
      };
    } catch (error) {
      console.error('Failed to analyze images:', error);
      return { qualityScores: [], detectedFeatures: [], suggestions: [] };
    }
  }

  /**
   * Get user preference profile from behavior
   */
  async getUserProfile(userId: string): Promise<UserPreferenceProfile | null> {
    const cacheKey = `profile_${userId}`;
    
    const cached = this.getCached<UserPreferenceProfile>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase.functions.invoke('user-behavior-analyzer', {
        body: { userId }
      });

      if (error) throw error;
      
      if (data?.profile) {
        this.setCache(cacheKey, data.profile);
        return data.profile;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Get market trends for a location
   */
  async getMarketTrends(location: string): Promise<{
    averagePrice: number;
    priceChange30d: number;
    supplyDemandRatio: number;
    hotness: 'cold' | 'normal' | 'warm' | 'hot';
    topPropertyTypes: string[];
  } | null> {
    const cacheKey = `trends_${location}`;
    
    type TrendData = { averagePrice: number; priceChange30d: number; supplyDemandRatio: number; hotness: 'cold' | 'normal' | 'warm' | 'hot'; topPropertyTypes: string[] };
    const cached = this.getCached<TrendData>(cacheKey);
    if (cached) return cached;

    try {
      // Get properties in location for analysis
      const { data: properties } = await supabase
        .from('properties')
        .select('price, property_type, created_at')
        .eq('status', 'active')
        .ilike('city', `%${location}%`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!properties || properties.length === 0) return null;

      const prices = properties.map(p => p.price).filter(p => p > 0);
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Count property types
      const typeCounts = new Map<string, number>();
      properties.forEach(p => {
        typeCounts.set(p.property_type, (typeCounts.get(p.property_type) || 0) + 1);
      });
      const topPropertyTypes = Array.from(typeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);

      // Calculate activity (simulated)
      const recentCount = properties.filter(p => {
        const created = new Date(p.created_at);
        const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      }).length;

      let hotness: 'cold' | 'normal' | 'warm' | 'hot' = 'normal';
      if (recentCount > 20) hotness = 'hot';
      else if (recentCount > 10) hotness = 'warm';
      else if (recentCount < 3) hotness = 'cold';

      const result = {
        averagePrice: Math.round(averagePrice),
        priceChange30d: Math.round((Math.random() - 0.3) * 10 * 10) / 10, // Simulated
        supplyDemandRatio: 0.7 + Math.random() * 0.6, // Simulated
        hotness,
        topPropertyTypes
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get market trends:', error);
      return null;
    }
  }

  /**
   * Get similar properties based on AI matching
   */
  async getSimilarProperties(propertyId: string, limit = 5): Promise<SmartMatch[]> {
    const cacheKey = `similar_${propertyId}_${limit}`;
    
    const cached = this.getCached<SmartMatch[]>(cacheKey);
    if (cached) return cached;

    try {
      // Get the source property
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (!property) return [];

      // Find similar properties
      const { data: similar } = await supabase
        .from('properties')
        .select('id, title, price, location, property_type, bedrooms, bathrooms, area_sqm')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .neq('id', propertyId)
        .eq('property_type', property.property_type)
        .ilike('city', property.city ? `%${property.city}%` : '%')
        .gte('price', property.price * 0.7)
        .lte('price', property.price * 1.3)
        .limit(limit);

      const matches: SmartMatch[] = (similar || []).map(p => ({
        propertyId: p.id,
        matchScore: this.calculateSimilarity(property, p),
        matchReasons: this.generateMatchReasons(property, p),
        isDiscoveryMatch: false
      }));

      matches.sort((a, b) => b.matchScore - a.matchScore);
      this.setCache(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Failed to get similar properties:', error);
      return [];
    }
  }

  private calculateSimilarity(source: any, target: any): number {
    let score = 0;
    let factors = 0;

    // Price similarity (0-25 points)
    const priceDiff = Math.abs(source.price - target.price) / source.price;
    score += Math.max(0, 25 - priceDiff * 100);
    factors++;

    // Location match (0-25 points)
    if (source.city === target.city) score += 25;
    else if (source.state === target.state) score += 15;
    factors++;

    // Bedroom match (0-25 points)
    const bedroomDiff = Math.abs((source.bedrooms || 0) - (target.bedrooms || 0));
    score += Math.max(0, 25 - bedroomDiff * 10);
    factors++;

    // Area match (0-25 points)
    const areaDiff = Math.abs((source.area_sqm || 100) - (target.area_sqm || 100)) / (source.area_sqm || 100);
    score += Math.max(0, 25 - areaDiff * 100);
    factors++;

    return Math.round(score / factors * 4);
  }

  private generateMatchReasons(source: any, target: any): MatchReason[] {
    const reasons: MatchReason[] = [];

    if (source.property_type === target.property_type) {
      reasons.push({
        factor: 'Property Type',
        score: 100,
        explanation: `Same type: ${target.property_type}`
      });
    }

    if (source.city === target.city) {
      reasons.push({
        factor: 'Location',
        score: 100,
        explanation: `Same city: ${target.city}`
      });
    }

    const priceDiff = Math.abs(source.price - target.price) / source.price * 100;
    if (priceDiff < 20) {
      reasons.push({
        factor: 'Price',
        score: Math.round(100 - priceDiff * 2),
        explanation: `Similar price range (${priceDiff.toFixed(0)}% difference)`
      });
    }

    return reasons;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const aiPropertyService = new AIPropertyService();
export default aiPropertyService;
