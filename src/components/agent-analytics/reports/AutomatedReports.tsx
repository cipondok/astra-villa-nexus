import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Calendar, Clock, Mail, 
  Settings, Check, ChevronRight, BarChart3,
  TrendingUp, Users, MapPin, DollarSign, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastGenerated?: string;
  sections: string[];
}

const AutomatedReports: React.FC<{ className?: string }> = ({ className }) => {
  const [reports, setReports] = useState<ReportType[]>([
    {
      id: 'performance',
      name: 'Performance Summary',
      description: 'Weekly overview of listing views, inquiries, and conversions',
      icon: BarChart3,
      frequency: 'weekly',
      enabled: true,
      lastGenerated: '2024-01-20',
      sections: ['Views & Engagement', 'Inquiry Analysis', 'Conversion Metrics', 'Top Performers'],
    },
    {
      id: 'market',
      name: 'Market Intelligence',
      description: 'Monthly market trends, pricing analysis, and competitive landscape',
      icon: TrendingUp,
      frequency: 'monthly',
      enabled: true,
      lastGenerated: '2024-01-01',
      sections: ['Price Trends', 'Demand Analysis', 'Competitor Activity', 'Market Forecast'],
    },
    {
      id: 'lead',
      name: 'Lead Pipeline Report',
      description: 'Daily summary of new leads, follow-ups needed, and pipeline health',
      icon: Users,
      frequency: 'daily',
      enabled: true,
      lastGenerated: '2024-01-21',
      sections: ['New Leads', 'Follow-up Queue', 'Pipeline Status', 'Conversion Probability'],
    },
    {
      id: 'roi',
      name: 'ROI & Financial Report',
      description: 'Monthly analysis of investments, revenue, and profitability by listing',
      icon: DollarSign,
      frequency: 'monthly',
      enabled: false,
      lastGenerated: '2024-01-01',
      sections: ['Investment Summary', 'Revenue Breakdown', 'Cost Analysis', 'ROI by Listing'],
    },
    {
      id: 'area',
      name: 'Area Performance Report',
      description: 'Weekly breakdown of performance across different locations',
      icon: MapPin,
      frequency: 'weekly',
      enabled: true,
      lastGenerated: '2024-01-20',
      sections: ['Area Rankings', 'Price Comparisons', 'Demand Hotspots', 'Opportunity Zones'],
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  const toggleReport = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const frequencyColors = {
    daily: 'bg-green-500/10 text-green-600 border-green-500/30',
    weekly: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    monthly: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Automated Reports</h3>
          <p className="text-[10px] text-muted-foreground">
            Configure and download your analytics reports
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Settings className="h-3 w-3 mr-1" />
          Configure All
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-2">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden",
              "hover:border-primary/30 transition-colors"
            )}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  report.enabled ? "bg-primary/10" : "bg-muted"
                )}>
                  <report.icon className={cn(
                    "h-5 w-5",
                    report.enabled ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">{report.name}</h4>
                    <span className={cn(
                      "px-2 py-0.5 text-[9px] font-medium rounded-full border",
                      frequencyColors[report.frequency]
                    )}>
                      {report.frequency}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{report.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={report.enabled}
                    onCheckedChange={() => toggleReport(report.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    selectedReport?.id === report.id && "rotate-90"
                  )} />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedReport?.id === report.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/30"
                >
                  <div className="p-4 space-y-4">
                    {/* Report Sections */}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-2">Report Sections</p>
                      <div className="flex flex-wrap gap-2">
                        {report.sections.map((section) => (
                          <span 
                            key={section}
                            className="px-2 py-1 bg-muted/50 text-[10px] text-foreground rounded-md"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Last Generated */}
                    {report.lastGenerated && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8 text-xs flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download Latest
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Email Schedule Settings */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Email Delivery</h4>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-muted/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Delivery Email</p>
            <p className="text-xs font-medium text-foreground">agent@example.com</p>
          </div>
          <div className="p-2 bg-muted/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Delivery Time</p>
            <p className="text-xs font-medium text-foreground">8:00 AM (WIB)</p>
          </div>
        </div>
      </div>

      {/* Quick Generate */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Generate Custom Report</h4>
        <p className="text-[10px] text-muted-foreground mb-3">
          Create a one-time report with custom date range and metrics
        </p>
        <Button size="sm" className="h-8 text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Create Custom Report
        </Button>
      </div>
    </div>
  );
};

export default AutomatedReports;
