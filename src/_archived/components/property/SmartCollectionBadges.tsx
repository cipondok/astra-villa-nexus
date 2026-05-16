import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyROIPrediction } from '@/hooks/useSmartCollections';
import { TrendingUp, Home, Gem, BarChart3, Brain, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface SmartCollectionBadgesProps {
  propertyId: string;
}

function usePropertyEngagementScores(propertyId: string | null) {
  return useQuery({
    queryKey: ['property-engagement-scores', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from('property_engagement_scores')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
}

function ScoreBadge({
  icon: Icon,
  label,
  value,
  suffix = '/100',
  tooltip,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
  suffix?: string;
  tooltip: string;
  gradient: string;
  delay?: number;
}) {
  if (value === null || value === undefined || value === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
          >
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border shadow-sm ${gradient}`}>
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-[8px] font-medium opacity-80 uppercase tracking-wider">{label}</span>
                <span className="text-xs font-bold">
                  {typeof value === 'number' ? value.toFixed(1) : value}{suffix}
                </span>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-[200px]">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ConfidenceDots({ confidence }: { confidence: number }) {
  const dots = 5;
  const filled = Math.round(confidence * dots);
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled ? 'bg-primary' : 'bg-muted-foreground/20'
          }`}
        />
      ))}
    </div>
  );
}

const SmartCollectionBadges: React.FC<SmartCollectionBadgesProps> = ({ propertyId }) => {
  const { data: scores, isLoading: scoresLoading } = usePropertyEngagementScores(propertyId);
  const { data: roiPrediction, isLoading: roiLoading } = usePropertyROIPrediction(propertyId);

  const hasScores = scores && (
    (scores.investment_score && scores.investment_score > 0) ||
    (scores.livability_score && scores.livability_score > 0) ||
    (scores.luxury_score && scores.luxury_score > 0) ||
    (scores.engagement_score && scores.engagement_score > 0)
  );

  const hasROI = roiPrediction && roiPrediction.predicted_roi > 0;

  if (scoresLoading || roiLoading) {
    return (
      <div className="flex gap-2 mt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-24 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!hasScores && !hasROI) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-3 pt-3 border-t border-border"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Brain className="h-3 w-3 text-primary" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          AI Smart Scores
        </span>
        <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 border-primary/30 text-primary">
          AI
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ScoreBadge
          icon={TrendingUp}
          label="Investment"
          value={scores?.investment_score ?? null}
          tooltip="AI-computed investment score based on ROI, rental yield, legal status, and market position"
          gradient="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          delay={0}
        />
        <ScoreBadge
          icon={Home}
          label="Livability"
          value={scores?.livability_score ?? null}
          tooltip="Livability score based on amenities, space, furnishing, and view quality"
          gradient="bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-400"
          delay={0.05}
        />
        <ScoreBadge
          icon={Gem}
          label="Luxury"
          value={scores?.luxury_score ?? null}
          tooltip="Luxury tier score based on price, premium amenities, land area, and presentation quality"
          gradient="bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-400"
          delay={0.1}
        />
        <ScoreBadge
          icon={BarChart3}
          label="Engagement"
          value={scores?.engagement_score ?? null}
          tooltip="Popularity score based on views, saves, inquiries, and user engagement"
          gradient="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
          delay={0.15}
        />

        {/* ROI Prediction Badge */}
        {hasROI && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                >
                  <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border shadow-sm bg-primary/10 border-primary/20 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                    <div className="flex flex-col leading-none gap-0.5">
                      <span className="text-[8px] font-medium opacity-80 uppercase tracking-wider">
                        Predicted ROI
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">
                          {roiPrediction!.predicted_roi.toFixed(1)}%
                        </span>
                        <ConfidenceDots confidence={roiPrediction!.confidence} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-[240px]">
                <p className="font-semibold mb-1">
                  AI Predicted ROI: {roiPrediction!.predicted_roi.toFixed(1)}%
                </p>
                <p className="text-muted-foreground mb-1">
                  Confidence: {(roiPrediction!.confidence * 100).toFixed(0)}% • Trend: {roiPrediction!.trend}
                </p>
                {roiPrediction!.explanation && (
                  <p className="text-muted-foreground text-[10px]">{roiPrediction!.explanation}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </motion.div>
  );
};

export default SmartCollectionBadges;
