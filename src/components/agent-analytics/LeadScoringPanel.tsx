import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePropertyLeads, computeLeadScore } from '@/hooks/usePropertyLeads';
import { 
  Users, Phone, Mail, Star, TrendingUp, 
  Flame, ArrowUpRight, UserCheck, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-chart-1 bg-chart-1/10 border-chart-1/30';
  if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  if (score >= 40) return 'text-primary bg-primary/10 border-primary/30';
  return 'text-muted-foreground bg-muted/50 border-border/50';
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    new: 'bg-primary/10 text-primary border-primary/30',
    contacted: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    qualified: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
    converted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    lost: 'bg-destructive/10 text-destructive border-destructive/30',
  };
  return map[status] || 'bg-muted text-muted-foreground';
};

const LeadScoringPanel: React.FC = () => {
  const { leads, summary, isLoading, updateLead } = usePropertyLeads();

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lead Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Leads', value: summary.total, icon: Users, color: 'text-primary' },
          { label: 'New', value: summary.newLeads, icon: UserPlus, color: 'text-primary' },
          { label: 'Qualified', value: summary.qualified, icon: UserCheck, color: 'text-chart-1' },
          { label: 'Converted', value: summary.converted, icon: ArrowUpRight, color: 'text-emerald-500' },
          { label: 'Hot Leads', value: summary.hotLeads, icon: Flame, color: 'text-destructive' },
          { label: 'Avg Score', value: summary.avgScore, icon: Star, color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/60 border-border/50">
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Lead List */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Lead Scoring Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No leads yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Leads from property inquiries will appear here with automatic scoring</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.slice(0, 10).map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30"
                >
                  {/* Score Badge */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border ${scoreColor(lead.lead_score)}`}>
                    {lead.lead_score}
                  </div>

                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{lead.lead_name}</span>
                      <Badge className={`text-[9px] px-1.5 py-0 ${statusBadge(lead.status)}`}>
                        {lead.status}
                      </Badge>
                      {lead.lead_score >= 70 && (
                        <Flame className="h-3 w-3 text-destructive shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {lead.lead_email && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Mail className="h-2.5 w-2.5" />{lead.lead_email}
                        </span>
                      )}
                      {lead.lead_phone && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" />{lead.lead_phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="w-20 hidden sm:block">
                    <Progress value={lead.lead_score} className="h-1.5" />
                  </div>

                  {/* Source */}
                  <Badge variant="outline" className="text-[9px] shrink-0">
                    {lead.lead_source}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadScoringPanel;
