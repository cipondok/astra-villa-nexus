import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ListingTip {
  id: string;
  property_id: string;
  property_title: string;
  tip_type: 'description' | 'photos' | 'price' | 'features' | 'title';
  tip_title: string;
  tip_description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

/** Rule-based AI tips generated from property data analysis */
function generateTipsForProperty(property: any): Omit<ListingTip, 'id'>[] {
  const tips: Omit<ListingTip, 'id'>[] = [];
  const pid = property.id;
  const title = property.title || '';

  // Description analysis
  const desc = property.description || '';
  if (desc.length < 50) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'description',
      tip_title: 'Add a detailed description',
      tip_description: 'Listings with 200+ character descriptions get 3x more inquiries. Describe the layout, views, neighborhood, and unique features.',
      priority: 'high',
      impact: '+180% clicks',
    });
  } else if (desc.length < 200) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'description',
      tip_title: 'Expand your description',
      tip_description: 'Your description is short. Add details about nearby amenities, transport access, and lifestyle benefits to increase engagement.',
      priority: 'medium',
      impact: '+60% clicks',
    });
  }

  // Photo analysis
  const imageCount = (property.images?.length || 0) + (property.image_urls?.length || 0);
  if (imageCount === 0) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'photos',
      tip_title: 'Add property photos',
      tip_description: 'Listings without photos are skipped by 95% of buyers. Upload at least 5 high-quality images to dramatically increase views.',
      priority: 'high',
      impact: '+400% views',
    });
  } else if (imageCount < 5) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'photos',
      tip_title: 'Add more photos',
      tip_description: `You have ${imageCount} photo${imageCount > 1 ? 's' : ''}. Properties with 8+ photos get 2x more saves. Include exterior, rooms, kitchen, bathroom, and neighborhood shots.`,
      priority: 'medium',
      impact: '+120% saves',
    });
  }

  // Price analysis
  if (!property.price || property.price === 0) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'price',
      tip_title: 'Set a price',
      tip_description: 'Listings without a price get 70% fewer inquiries. Even a range helps buyers filter and find your property.',
      priority: 'high',
      impact: '+200% inquiries',
    });
  }

  // Title analysis
  if (title.length < 15) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'title',
      tip_title: 'Improve your listing title',
      tip_description: 'Use descriptive titles with location and key features (e.g., "3BR Modern Villa with Pool in Seminyak"). Titles with 6+ words get 45% more clicks.',
      priority: 'medium',
      impact: '+45% clicks',
    });
  }

  // Features analysis
  const features = property.property_features || {};
  const featureCount = Object.keys(features).filter(k => features[k] && features[k] !== false).length;
  if (featureCount < 3) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'features',
      tip_title: 'Add property features',
      tip_description: 'Buyers filter by amenities like pool, parking, AC, and furnished. Adding features makes your listing appear in more search results.',
      priority: 'medium',
      impact: '+80% search visibility',
    });
  }

  // Virtual tour
  if (!property.virtual_tour_url && !property.three_d_model_url) {
    tips.push({
      property_id: pid,
      property_title: title,
      tip_type: 'photos',
      tip_title: 'Add a virtual tour',
      tip_description: 'Properties with virtual tours get 87% more engagement and attract international buyers who can\'t visit in person.',
      priority: 'low',
      impact: '+87% engagement',
    });
  }

  return tips;
}

export const useListingTips = () => {
  const { user } = useAuth();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-for-tips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Match both agent_id and owner_id so tips work for agents AND owners
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, description, price, images, image_urls, property_features, virtual_tour_url, three_d_model_url, status')
        .or(`agent_id.eq.${user.id},owner_id.eq.${user.id}`)
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const tips = useMemo(() => {
    if (!properties) return [];
    const allTips: ListingTip[] = [];
    properties.forEach(p => {
      const propertyTips = generateTipsForProperty(p);
      propertyTips.forEach((tip, i) => {
        allTips.push({ ...tip, id: `${p.id}-${i}` } as ListingTip);
      });
    });
    // Sort: high priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return allTips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [properties]);

  const summary = {
    total: tips.length,
    high: tips.filter(t => t.priority === 'high').length,
    medium: tips.filter(t => t.priority === 'medium').length,
    low: tips.filter(t => t.priority === 'low').length,
    propertiesAnalyzed: properties?.length || 0,
  };

  return { tips, summary, isLoading };
};
