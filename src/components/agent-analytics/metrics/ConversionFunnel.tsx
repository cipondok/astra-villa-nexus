import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageSquare, Calendar, Handshake, CheckCircle, ArrowDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversionData } from '@/hooks/useAgentAnalytics';

interface ConversionFunnelProps {
  data: ConversionData;
  className?: string;
}

const stageIcons = [Eye, MessageSquare, Calendar, Handshake, CheckCircle];
const stageColors = [
  'from-blue-500 to-blue-400',
  'from-purple-500 to-purple-400',
  'from-orange-500 to-orange-400',
  'from-green-500 to-green-400',
  'from-primary to-primary/80',
];

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data, className }) => {
  const maxCount = data.stages[0]?.count || 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{(data.overallRate * 100).toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground">Overall Conversion Rate</p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.avgTimeToConvert}</p>
          <p className="text-xs text-muted-foreground">Avg. Days to Convert</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-4">Conversion Funnel</h4>
        <div className="space-y-2">
          {data.stages.map((stage, idx) => {
            const Icon = stageIcons[idx] || Eye;
            const widthPercentage = (stage.count / maxCount) * 100;
            const dropOff = idx > 0 
              ? (((data.stages[idx - 1].count - stage.count) / data.stages[idx - 1].count) * 100).toFixed(1)
              : null;

            return (
              <React.Fragment key={stage.name}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                      stageColors[idx]
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-foreground">{stage.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {stage.count.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={cn("h-full rounded-full bg-gradient-to-r", stageColors[idx])}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Drop-off indicator */}
                {dropOff && idx < data.stages.length && (
                  <div className="flex items-center gap-3 pl-10 py-1">
                    <ArrowDown className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] text-destructive">
                      {dropOff}% drop-off
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage-to-Stage Conversion */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Stage Conversion Rates</h4>
        <div className="grid grid-cols-4 gap-2">
          {data.stages.slice(1).map((stage, idx) => {
            const prevStage = data.stages[idx];
            const convRate = ((stage.count / prevStage.count) * 100).toFixed(1);
            
            return (
              <div key={stage.name} className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-sm font-bold text-foreground">{convRate}%</p>
                <p className="text-[9px] text-muted-foreground">
                  {prevStage.name} → {stage.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;
