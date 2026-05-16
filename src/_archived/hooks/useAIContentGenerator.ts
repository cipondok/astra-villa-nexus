import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ContentType = 
  | 'property_description'
  | 'neighborhood_highlights'
  | 'market_report'
  | 'how_to_guide'
  | 'success_story'
  | 'social_media'
  | 'newsletter'
  | 'blog_article';

export interface ContentTemplate {
  id: ContentType;
  name: string;
  description: string;
  icon: string;
  variables: TemplateVariable[];
  estimatedTime: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'property_description',
    name: 'Property Description',
    description: 'Generate compelling listing descriptions from basic property facts',
    icon: '🏠',
    estimatedTime: '~30 seconds',
    variables: [
      { key: 'property_type', label: 'Property Type', type: 'select', options: ['Villa', 'Apartment', 'House', 'Land', 'Commercial'], required: true },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Seminyak, Bali', required: true },
      { key: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '3', required: true },
      { key: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: '2', required: true },
      { key: 'size_sqm', label: 'Building Size (sqm)', type: 'number', placeholder: '250' },
      { key: 'land_area', label: 'Land Area (sqm)', type: 'number', placeholder: '500' },
      { key: 'price', label: 'Price', type: 'text', placeholder: 'IDR 5,500,000,000', required: true },
      { key: 'features', label: 'Key Features', type: 'textarea', placeholder: 'Pool, garden, modern kitchen...' },
      { key: 'year_built', label: 'Year Built', type: 'number', placeholder: '2020' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Excellent', 'Good', 'Needs Renovation'] }
    ]
  },
  {
    id: 'neighborhood_highlights',
    name: 'Neighborhood Guide',
    description: 'Create comprehensive area guides highlighting local amenities',
    icon: '📍',
    estimatedTime: '~45 seconds',
    variables: [
      { key: 'area_name', label: 'Area Name', type: 'text', placeholder: 'Canggu', required: true },
      { key: 'city', label: 'City/Region', type: 'text', placeholder: 'Bali', required: true },
      { key: 'property_types', label: 'Common Property Types', type: 'text', placeholder: 'Villas, apartments' },
      { key: 'price_range', label: 'Price Range', type: 'text', placeholder: 'IDR 2B - 15B' },
      { key: 'target_audience', label: 'Target Audience', type: 'select', options: ['Families', 'Expats', 'Investors', 'Digital Nomads', 'Retirees'] }
    ]
  },
  {
    id: 'market_report',
    name: 'Market Trend Report',
    description: 'Generate professional market analysis and forecasts',
    icon: '📊',
    estimatedTime: '~60 seconds',
    variables: [
      { key: 'location', label: 'Location', type: 'text', placeholder: 'South Jakarta', required: true },
      { key: 'property_type', label: 'Property Type', type: 'select', options: ['All', 'Residential', 'Commercial', 'Land'], required: true },
      { key: 'time_period', label: 'Time Period', type: 'select', options: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Full Year 2024'] },
      { key: 'avg_price', label: 'Average Price', type: 'text', placeholder: 'IDR 3.5B' },
      { key: 'price_change_percent', label: 'Price Change (%)', type: 'number', placeholder: '5.2' },
      { key: 'inventory_level', label: 'Inventory Level', type: 'select', options: ['Low', 'Moderate', 'High'] },
      { key: 'avg_dom', label: 'Avg Days on Market', type: 'number', placeholder: '45' },
      { key: 'demand_level', label: 'Demand Level', type: 'select', options: ['Very High', 'High', 'Moderate', 'Low'] }
    ]
  },
  {
    id: 'how_to_guide',
    name: 'How-To Guide',
    description: 'Create step-by-step guides for different user types',
    icon: '📚',
    estimatedTime: '~45 seconds',
    variables: [
      { key: 'user_type', label: 'User Type', type: 'select', options: ['First-time Buyer', 'Property Investor', 'Foreign Buyer', 'Seller', 'Renter', 'Agent'], required: true },
      { key: 'topic', label: 'Guide Topic', type: 'text', placeholder: 'Buying property in Bali as a foreigner', required: true },
      { key: 'experience_level', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
      { key: 'goal', label: 'Main Goal', type: 'text', placeholder: 'Successfully purchase a villa' },
      { key: 'pain_points', label: 'Common Pain Points', type: 'textarea', placeholder: 'Legal complexities, finding trusted agents...' }
    ]
  },
  {
    id: 'success_story',
    name: 'Success Story',
    description: 'Generate compelling client testimonials and case studies',
    icon: '🏆',
    estimatedTime: '~40 seconds',
    variables: [
      { key: 'client_type', label: 'Client Type', type: 'select', options: ['Family', 'Investor', 'Expat', 'Business Owner', 'First-time Buyer'], required: true },
      { key: 'transaction_type', label: 'Transaction', type: 'select', options: ['Purchase', 'Sale', 'Rental', 'Investment'], required: true },
      { key: 'property_type', label: 'Property Type', type: 'text', placeholder: 'Beachfront villa' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Uluwatu, Bali' },
      { key: 'challenge', label: 'Main Challenge', type: 'textarea', placeholder: 'Finding a property with ocean views under budget' },
      { key: 'solution', label: 'Solution Provided', type: 'textarea', placeholder: 'Exclusive off-market listing access' },
      { key: 'result', label: 'Result Achieved', type: 'textarea', placeholder: 'Closed 15% below asking, moved in 30 days' },
      { key: 'timeline', label: 'Timeline', type: 'text', placeholder: '3 months' }
    ]
  },
  {
    id: 'social_media',
    name: 'Social Media Posts',
    description: 'Create platform-optimized posts for new listings',
    icon: '📱',
    estimatedTime: '~35 seconds',
    variables: [
      { key: 'property_type', label: 'Property Type', type: 'text', placeholder: 'Modern Villa', required: true },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Pererenan, Bali', required: true },
      { key: 'price', label: 'Price', type: 'text', placeholder: 'IDR 8.5B' },
      { key: 'key_feature', label: 'Standout Feature', type: 'text', placeholder: 'Infinity pool with rice field views' },
      { key: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '4' },
      { key: 'size_sqm', label: 'Size (sqm)', type: 'number', placeholder: '350' },
      { key: 'target_audience', label: 'Target Audience', type: 'select', options: ['Luxury Buyers', 'Investors', 'Expats', 'Families'] },
      { key: 'platform', label: 'Primary Platform', type: 'select', options: ['All Platforms', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok'] }
    ]
  },
  {
    id: 'newsletter',
    name: 'Email Newsletter',
    description: 'Generate engaging email newsletters for subscribers',
    icon: '📧',
    estimatedTime: '~50 seconds',
    variables: [
      { key: 'theme', label: 'Newsletter Theme', type: 'text', placeholder: 'Summer Investment Opportunities', required: true },
      { key: 'featured_count', label: 'Featured Listings', type: 'number', placeholder: '3' },
      { key: 'audience', label: 'Target Audience', type: 'select', options: ['Buyers', 'Sellers', 'Investors', 'General Subscribers'] },
      { key: 'market_summary', label: 'Market Summary', type: 'textarea', placeholder: 'Brief market update points...' },
      { key: 'season', label: 'Season/Month', type: 'text', placeholder: 'January 2024' },
      { key: 'promotions', label: 'Special Promotions', type: 'textarea', placeholder: 'Free property valuation, reduced commission...' },
      { key: 'events', label: 'Upcoming Events', type: 'textarea', placeholder: 'Open house dates, webinars...' }
    ]
  },
  {
    id: 'blog_article',
    name: 'SEO Blog Article',
    description: 'Write keyword-optimized articles for local SEO',
    icon: '✍️',
    estimatedTime: '~90 seconds',
    variables: [
      { key: 'topic', label: 'Article Topic', type: 'text', placeholder: 'Best areas to buy property in Bali 2024', required: true },
      { key: 'primary_keyword', label: 'Primary Keyword', type: 'text', placeholder: 'buy property Bali', required: true },
      { key: 'secondary_keywords', label: 'Secondary Keywords', type: 'textarea', placeholder: 'Bali real estate, villa investment Bali...' },
      { key: 'location', label: 'Location Focus', type: 'text', placeholder: 'Bali, Indonesia' },
      { key: 'target_reader', label: 'Target Reader', type: 'select', options: ['Foreign Investors', 'Local Buyers', 'Expats', 'First-time Buyers'] },
      { key: 'word_count', label: 'Target Word Count', type: 'select', options: ['800', '1200', '1500', '2000'] },
      { key: 'unique_angle', label: 'Unique Angle', type: 'textarea', placeholder: 'Focus on ROI data and rental yields...' }
    ]
  }
];

const CONTENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-content-generator`;

export const useAIContentGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [contentHistory, setContentHistory] = useState<Array<{
    type: ContentType;
    content: string;
    timestamp: Date;
    variables: Record<string, any>;
  }>>([]);

  const generateContent = useCallback(async (
    type: ContentType,
    variables: Record<string, any>,
    language: 'en' | 'id' = 'en',
    tone: 'professional' | 'friendly' | 'luxury' | 'casual' = 'professional'
  ) => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await fetch(CONTENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ type, variables, language, tone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Please wait a moment before generating more content.",
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
        
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      
      // Add to history
      setContentHistory(prev => [{
        type,
        content: data.content,
        timestamp: new Date(),
        variables
      }, ...prev.slice(0, 19)]); // Keep last 20 items

      toast({
        title: "Content Generated!",
        description: `Your ${type.replace(/_/g, ' ')} is ready.`,
      });

      return data.content;

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearContent = useCallback(() => {
    setGeneratedContent(null);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please select and copy manually.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    generateContent,
    isGenerating,
    generatedContent,
    contentHistory,
    clearContent,
    copyToClipboard,
    templates: CONTENT_TEMPLATES
  };
};

export default useAIContentGenerator;
