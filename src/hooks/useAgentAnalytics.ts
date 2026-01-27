import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Agent Analytics Data Hook
 * Fetches and computes analytics data for real estate agents
 */

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadsBySource: { source: string; count: number }[];
  leadsTrend: { date: string; leads: number }[];
}

export interface ListingPerformance {
  totalViews: number;
  totalInquiries: number;
  totalSaves: number;
  avgViewsPerListing: number;
  viewsTrend: { date: string; views: number; inquiries: number }[];
  topListings: { id: string; title: string; views: number; inquiries: number }[];
}

export interface ConversionData {
  stages: { name: string; count: number; percentage: number }[];
  overallRate: number;
  avgTimeToConvert: number;
}

export interface MarketData {
  avgMarketPrice: number;
  yourAvgPrice: number;
  pricePerSqm: number;
  marketPricePerSqm: number;
  competitorCount: number;
  marketShare: number;
  priceComparison: { area: string; yourPrice: number; marketPrice: number }[];
}

export interface ROIData {
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  costBreakdown: { category: string; amount: number }[];
  revenueByMonth: { month: string; revenue: number; cost: number }[];
}

export interface TimeToSellData {
  avgDaysToSell: number;
  avgDaysToRent: number;
  trend: { month: string; daysToSell: number; daysToRent: number }[];
  byPropertyType: { type: string; avgDays: number }[];
}

export interface PredictiveInsight {
  type: 'price' | 'timing' | 'demographic' | 'competitor';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  data?: any;
}

export interface AgentAnalyticsData {
  leads: LeadStats;
  listings: ListingPerformance;
  conversion: ConversionData;
  market: MarketData;
  roi: ROIData;
  timeToSell: TimeToSellData;
  insights: PredictiveInsight[];
  isLoading: boolean;
  error: string | null;
}

// Mock data generator for demo purposes
const generateMockData = (): Omit<AgentAnalyticsData, 'isLoading' | 'error'> => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return {
    leads: {
      totalLeads: 248,
      newLeads: 42,
      qualifiedLeads: 156,
      convertedLeads: 28,
      leadsBySource: [
        { source: 'Website', count: 98 },
        { source: 'WhatsApp', count: 67 },
        { source: 'Referral', count: 45 },
        { source: 'Social Media', count: 28 },
        { source: 'Direct', count: 10 },
      ],
      leadsTrend: days.map(date => ({
        date,
        leads: Math.floor(Math.random() * 15) + 5,
      })),
    },
    listings: {
      totalViews: 12458,
      totalInquiries: 342,
      totalSaves: 891,
      avgViewsPerListing: 518,
      viewsTrend: days.map(date => ({
        date,
        views: Math.floor(Math.random() * 500) + 200,
        inquiries: Math.floor(Math.random() * 20) + 5,
      })),
      topListings: [
        { id: '1', title: 'Villa Sunset Seminyak', views: 2341, inquiries: 67 },
        { id: '2', title: 'Modern Apartment Canggu', views: 1892, inquiries: 54 },
        { id: '3', title: 'Beachfront Villa Sanur', views: 1654, inquiries: 43 },
        { id: '4', title: 'Luxury Penthouse Ubud', views: 1432, inquiries: 38 },
        { id: '5', title: 'Traditional Joglo Home', views: 1210, inquiries: 32 },
      ],
    },
    conversion: {
      stages: [
        { name: 'Views', count: 12458, percentage: 100 },
        { name: 'Inquiries', count: 342, percentage: 2.7 },
        { name: 'Viewings', count: 156, percentage: 45.6 },
        { name: 'Negotiations', count: 68, percentage: 43.6 },
        { name: 'Closed', count: 28, percentage: 41.2 },
      ],
      overallRate: 0.22,
      avgTimeToConvert: 34,
    },
    market: {
      avgMarketPrice: 4500000000,
      yourAvgPrice: 4200000000,
      pricePerSqm: 28000000,
      marketPricePerSqm: 30000000,
      competitorCount: 45,
      marketShare: 8.5,
      priceComparison: [
        { area: 'Seminyak', yourPrice: 5200, marketPrice: 5500 },
        { area: 'Canggu', yourPrice: 4800, marketPrice: 4600 },
        { area: 'Ubud', yourPrice: 3200, marketPrice: 3400 },
        { area: 'Sanur', yourPrice: 4100, marketPrice: 4300 },
        { area: 'Jimbaran', yourPrice: 4500, marketPrice: 4400 },
      ],
    },
    roi: {
      totalInvestment: 125000000,
      totalRevenue: 892000000,
      netProfit: 767000000,
      roi: 613.6,
      costBreakdown: [
        { category: 'Marketing', amount: 45000000 },
        { category: 'Platform Fees', amount: 32000000 },
        { category: 'Photography', amount: 18000000 },
        { category: 'Staging', amount: 15000000 },
        { category: 'Other', amount: 15000000 },
      ],
      revenueByMonth: months.map(month => ({
        month,
        revenue: Math.floor(Math.random() * 200000000) + 100000000,
        cost: Math.floor(Math.random() * 30000000) + 15000000,
      })),
    },
    timeToSell: {
      avgDaysToSell: 67,
      avgDaysToRent: 23,
      trend: months.map(month => ({
        month,
        daysToSell: Math.floor(Math.random() * 30) + 50,
        daysToRent: Math.floor(Math.random() * 15) + 15,
      })),
      byPropertyType: [
        { type: 'Villa', avgDays: 72 },
        { type: 'Apartment', avgDays: 45 },
        { type: 'House', avgDays: 58 },
        { type: 'Land', avgDays: 120 },
        { type: 'Commercial', avgDays: 95 },
      ],
    },
    insights: [
      {
        type: 'price',
        title: 'Price Optimization Opportunity',
        description: 'Your Seminyak villa is priced 5.5% below market. Consider increasing by Rp 250M.',
        confidence: 87,
        action: 'Adjust price',
        data: { currentPrice: 4750000000, suggestedPrice: 5000000000 },
      },
      {
        type: 'timing',
        title: 'Best Reposting Time',
        description: 'Properties reposted on Tuesday 9-11 AM get 34% more views in your area.',
        confidence: 92,
        action: 'Schedule repost',
        data: { bestDay: 'Tuesday', bestTime: '09:00-11:00' },
      },
      {
        type: 'demographic',
        title: 'Target Audience Insight',
        description: '68% of your inquiries come from expats aged 35-50 looking for long-term rentals.',
        confidence: 79,
        action: 'Adjust targeting',
        data: { segment: 'Expat 35-50', preference: 'Long-term rental' },
      },
      {
        type: 'competitor',
        title: 'Competitor Alert',
        description: '3 new similar listings appeared in Canggu this week, average price 8% lower.',
        confidence: 95,
        action: 'View competitors',
        data: { newListings: 3, priceDiff: -8 },
      },
    ],
  };
};

export const useAgentAnalytics = (dateRange?: { start: Date; end: Date }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Omit<AgentAnalyticsData, 'isLoading' | 'error'> | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // In production, fetch real data from Supabase
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = generateMockData();
        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, dateRange?.start, dateRange?.end]);

  return {
    ...data,
    isLoading,
    error,
  } as AgentAnalyticsData;
};

export default useAgentAnalytics;
