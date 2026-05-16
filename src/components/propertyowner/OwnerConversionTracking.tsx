import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePropertyAnalytics } from '@/hooks/usePropertyAnalytics';
import { usePropertyLeads } from '@/hooks/usePropertyLeads';
import { Eye, MessageSquare, UserCheck, TrendingUp, Target } from 'lucide-react';

const OwnerConversionTracking: React.FC = () => {
  const { data: analytics, isLoading: analyticsLoading } = usePropertyAnalytics('30d');
  const { summary, isLoading: leadsLoading } = usePropertyLeads();

  const isLoading = analyticsLoading || leadsLoading;

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  const views = analytics?.totalViews || 0;
  const contacts = analytics?.totalContacts || 0;
  const leads = summary.total;
  const qualified = summary.qualified;
  const converted = summary.converted;

  const stages = [
    { label: 'Views', count: views, icon: Eye, color: 'bg-primary' },
    { label: 'Inquiries', count: contacts, icon: MessageSquare, color: 'bg-chart-1' },
    { label: 'Leads', count: leads, icon: Target, color: 'bg-amber-500' },
    { label: 'Qualified', count: qualified, icon: UserCheck, color: 'bg-emerald-500' },
    { label: 'Converted', count: converted, icon: TrendingUp, color: 'bg-chart-3' },
  ];

  const maxCount = Math.max(views, 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Conversion Funnel (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, i) => {
          const pct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const prevCount = i > 0 ? stages[i - 1].count : stage.count;
          const convRate = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '—';

          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <stage.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{stage.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stage.count.toLocaleString()}</span>
                  {i > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      ({convRate}%)
                    </span>
                  )}
                </div>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {views > 0 ? ((contacts / views) * 100).toFixed(1) : '0'}%
            </p>
            <p className="text-[10px] text-muted-foreground">View→Inquiry</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-chart-1">
              {contacts > 0 ? ((qualified / Math.max(contacts, 1)) * 100).toFixed(1) : '0'}%
            </p>
            <p className="text-[10px] text-muted-foreground">Inquiry→Qualified</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-500">
              {views > 0 ? ((converted / views) * 100).toFixed(2) : '0'}%
            </p>
            <p className="text-[10px] text-muted-foreground">Overall Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerConversionTracking;
