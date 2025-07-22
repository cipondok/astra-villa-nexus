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
    { value: 'user-analytics', label: 'User Analytics Report', icon: Users },
    { value: 'property-performance', label: 'Property Performance Report', icon: Building },
    { value: 'financial-summary', label: 'Financial Summary Report', icon: DollarSign },
    { value: 'security-logs', label: 'Security Logs Report', icon: AlertTriangle },
    { value: 'system-performance', label: 'System Performance Report', icon: BarChart3 },
    { value: 'vendor-analytics', label: 'Vendor Analytics Report', icon: Users },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Professional formatted report' },
    { value: 'csv', label: 'CSV Spreadsheet', icon: Table, description: 'Raw data for analysis' },
    { value: 'excel', label: 'Excel Workbook', icon: Table, description: 'Formatted spreadsheet with charts' },
    { value: 'json', label: 'JSON Data', icon: FileText, description: 'Structured data format' },
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' },
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
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would call an API endpoint
      const reportData = {
        type: exportOptions.reportType,
        format: exportOptions.format,
        dateRange: exportOptions.dateRange,
        generatedAt: new Date().toISOString(),
        includeCharts: exportOptions.includeCharts,
      };

      // Simulate file download
      const filename = `${exportOptions.reportType}-${exportOptions.dateRange}.${exportOptions.format}`;
      
      // Create a mock download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported Successfully",
        description: `${filename} has been downloaded to your device.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getReportDescription = () => {
    const reportType = reportTypes.find(r => r.value === exportOptions.reportType);
    if (!reportType) return '';

    const descriptions: Record<string, string> = {
      'user-analytics': 'User registration, activity, and engagement metrics with behavioral insights.',
      'property-performance': 'Property views, inquiries, and conversion rates with market analysis.',
      'financial-summary': 'Revenue, transactions, and financial KPIs with trend analysis.',
      'security-logs': 'Security events, login attempts, and threat detection logs.',
      'system-performance': 'Application performance metrics, load times, and system health.',
      'vendor-analytics': 'Vendor performance, ratings, and service delivery metrics.',
    };

    return descriptions[exportOptions.reportType] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Report Export</h2>
        <p className="text-gray-400">Generate and download comprehensive reports</p>
      </div>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Configure Export
          </CardTitle>
          <CardDescription>Select report type, format, and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label>Report Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.value}
                    className={`cursor-pointer transition-all ${
                      exportOptions.reportType === report.value
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, reportType: report.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">{report.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {exportOptions.reportType && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {getReportDescription()}
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      exportOptions.format === format.value
                        ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <Icon className="h-6 w-6 text-green-600 mx-auto" />
                        <div>
                          <div className="text-sm font-medium">{format.label}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select 
              value={exportOptions.dateRange} 
              onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={generateReport}
              disabled={!exportOptions.reportType || isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>Your recently generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'User Analytics Report - Last 30 days.pdf', date: '2024-01-15 14:30', size: '2.4 MB' },
              { name: 'Property Performance Report - Last 7 days.xlsx', date: '2024-01-14 09:15', size: '1.8 MB' },
              { name: 'Financial Summary - Q4 2023.pdf', date: '2024-01-10 16:45', size: '3.2 MB' },
            ].map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">{file.date} • {file.size}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
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