import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to auto-trigger SEO analysis when a property is created or updated.
 * Call `triggerSeoAnalysis(propertyId)` after successful property save.
 */
export function useAutoSeoOptimizer() {
  const triggerSeoAnalysis = useCallback(async (propertyId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('seo-analyzer', {
        body: { action: 'analyze-property', propertyId },
      });

      if (error) {
        console.error('Auto-SEO analysis failed:', error);
        return null;
      }

      if (data?.analysis?.seo_score !== undefined) {
        const score = data.analysis.seo_score;
        const rating = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Poor';
        
        toast.success(`SEO Score: ${score}/100 (${rating})`, {
          description: data.analysis.seo_title ? `Suggested: "${data.analysis.seo_title}"` : undefined,
          duration: 5000,
        });
      }

      return data?.analysis || null;
    } catch (e) {
      console.error('Auto-SEO error:', e);
      return null;
    }
  }, []);

  return { triggerSeoAnalysis };
}
