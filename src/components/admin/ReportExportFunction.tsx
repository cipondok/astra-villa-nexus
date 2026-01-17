import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3, 
  Users, 
  Building, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';

interface ExportOptions {
  reportType: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  dateRange: string;
  includeCharts: boolean;
}

const ReportExportFunction = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    reportType: '',
    format: 'pdf',
    dateRange: '30d',
    includeCharts: true,
  });

  const reportTypes = [
    { value: 'user-analytics', label: 'User Analytics', icon: Users },
    { value: 'property-performance', label: 'Property Performance', icon: Building },
    { value: 'financial-summary', label: 'Financial Summary', icon: DollarSign },
    { value: 'security-logs', label: 'Security Logs', icon: AlertTriangle },
    { value: 'system-performance', label: 'System Performance', icon: BarChart3 },
    { value: 'vendor-analytics', label: 'Vendor Analytics', icon: Users },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Formatted report' },
    { value: 'csv', label: 'CSV', icon: Table, description: 'Raw data' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Spreadsheet' },
    { value: 'json', label: 'JSON', icon: FileText, description: 'Structured data' },
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  const generateReport = async () => {
    if (!exportOptions.reportType) {
      toast({
        title: "Select Report Type",
        description: "Please select a report type to export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reportData = {
        type: exportOptions.reportType,
        format: exportOptions.format,
        dateRange: exportOptions.dateRange,
        generatedAt: new Date().toISOString(),
        includeCharts: exportOptions.includeCharts,
      };

      const filename = `${exportOptions.reportType}-${exportOptions.dateRange}.${exportOptions.format}`;
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: `${filename} has been downloaded.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the report.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Download className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Report Export</h1>
            <p className="text-[10px] text-muted-foreground">Generate and download comprehensive reports</p>
          </div>
        </div>
      </div>

      {/* Export Configuration */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-xs">
            <Download className="h-3.5 w-3.5 text-primary" />
            Configure Export
          </CardTitle>
          <CardDescription className="text-[10px]">Select report type, format, and date range</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-4">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label className="text-[10px]">Report Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.value}
                    className={`cursor-pointer transition-all p-2 ${
                      exportOptions.reportType === report.value
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, reportType: report.value }))}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-medium">{report.label}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-[10px]">Export Format</Label>
            <div className="grid grid-cols-4 gap-2">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all p-2 text-center ${
                      exportOptions.format === format.value
                        ? 'ring-2 ring-accent bg-accent/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <Icon className="h-4 w-4 text-accent-foreground mx-auto mb-1" />
                    <div className="text-[9px] font-medium">{format.label}</div>
                    <div className="text-[8px] text-muted-foreground">{format.description}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-[10px]">Date Range</Label>
            <Select 
              value={exportOptions.dateRange} 
              onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger className="h-7 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[10px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button
            onClick={generateReport}
            disabled={!exportOptions.reportType || isExporting}
            className="w-full h-8 text-[10px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Export Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card className="border-l-4 border-l-secondary">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs">Recent Exports</CardTitle>
          <CardDescription className="text-[10px]">Your recently generated reports</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { name: 'User Analytics - 30 days.pdf', date: '2024-01-15 14:30', size: '2.4 MB' },
              { name: 'Property Performance - 7 days.xlsx', date: '2024-01-14 09:15', size: '1.8 MB' },
              { name: 'Financial Summary - Q4.pdf', date: '2024-01-10 16:45', size: '3.2 MB' },
            ].map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <div className="text-[10px] font-medium">{file.name}</div>
                    <div className="text-[8px] text-muted-foreground">{file.date} • {file.size}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportExportFunction;
