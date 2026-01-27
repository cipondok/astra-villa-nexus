import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Clock, Users, AlertTriangle, 
  Sparkles, ArrowRight, Target, Brain,
  Calendar, DollarSign, MapPin, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PredictiveInsight } from '@/hooks/useAgentAnalytics';

interface PredictiveInsightsProps {
  insights: PredictiveInsight[];
  className?: string;
}

const insightConfig = {
  price: {
    icon: DollarSign,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  timing: {
    icon: Clock,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  demographic: {
    icon: Users,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  competitor: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
};

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ insights, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border border-primary/30 rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI-Powered Insights</h3>
            <p className="text-[10px] text-muted-foreground">
              Personalized recommendations based on your performance data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Updated hourly • Based on market data from 10,000+ listings</span>
        </div>
      </motion.div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const config = insightConfig[insight.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "bg-card/50 backdrop-blur-sm border rounded-xl p-4",
                config.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className={cn(
                        "text-[10px] font-medium",
                        insight.confidence >= 90 ? "text-green-500" :
                        insight.confidence >= 75 ? "text-primary" :
                        "text-orange-500"
                      )}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{insight.description}</p>
                  
                  {/* Insight-specific data visualization */}
                  {insight.type === 'price' && insight.data && (
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg mb-3">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Current</p>
                        <p className="text-xs font-semibold text-foreground">
                          Rp {(insight.data.currentPrice / 1_000_000_000).toFixed(2)}B
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-green-500" />
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Suggested</p>
                        <p className="text-xs font-semibold text-green-500">
                          Rp {(insight.data.suggestedPrice / 1_000_000_000).toFixed(2)}B
                        </p>
                      </div>
                    </div>
                  )}

                  {insight.type === 'timing' && insight.data && (
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg mb-3">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-foreground">
                        {insight.data.bestDay}, {insight.data.bestTime}
                      </span>
                    </div>
                  )}

                  {insight.type === 'demographic' && insight.data && (
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg mb-3">
                      <Users className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{insight.data.segment}</p>
                        <p className="text-[10px] text-muted-foreground">{insight.data.preference}</p>
                      </div>
                    </div>
                  )}

                  {insight.type === 'competitor' && insight.data && (
                    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg mb-3">
                      <Eye className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {insight.data.newListings} new listings
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {insight.data.priceDiff}% price difference
                        </p>
                      </div>
                    </div>
                  )}

                  {insight.action && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn("h-8 text-xs", config.color)}
                    >
                      {insight.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Prediction Accuracy */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Prediction Accuracy History</h4>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Price', accuracy: 89 },
            { label: 'Timing', accuracy: 94 },
            { label: 'Demographics', accuracy: 78 },
            { label: 'Competitors', accuracy: 91 },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-1">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--muted))"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--primary))"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${item.accuracy * 1.26} 126`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                  {item.accuracy}%
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsights;
