import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { AICommandCenterData } from '@/hooks/useAICommandCenter';
import type { HealthAlert } from '@/hooks/useHealthAlerts';
import type { CustomPeriodKPIs } from '@/hooks/useCustomPeriodKPIs';

// ─── CSV Helpers ────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: string[][]): string {
  return [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const ts = () => format(new Date(), 'yyyy-MM-dd_HHmm');

// ─── CSV Exports ────────────────────────────────────────────────────────────

export function exportOverviewCsv(data: AICommandCenterData) {
  const { overview, jobStatus, seo, searchAnalytics } = data;
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Properties', String(overview.totalProperties)],
    ['Avg SEO Score', String(overview.avgSeoScore)],
    ['Avg Investment Score', String(overview.avgInvestmentScore)],
    ['Avg Estimated Value (Rp)', String(overview.avgEstimatedValue)],
    ['Avg Predicted ROI (%)', String(overview.avgPredictedROI)],
    ['Running Jobs', String(jobStatus.running)],
    ['Pending Jobs', String(jobStatus.pending)],
    ['Completed Jobs', String(jobStatus.completed)],
    ['Failed Jobs', String(jobStatus.failed)],
    ['Weak SEO Listings', String(seo.weakListings)],
    ['Total Searches', String(searchAnalytics.totalSearches)],
    ['Search Conversion Rate (%)', String(searchAnalytics.conversionRate)],
  ];
  downloadFile(toCsv(headers, rows), `astra-overview-${ts()}.csv`, 'text/csv');
}

export async function exportJobHistoryCsv() {
  const { data: jobs } = await supabase
    .from('ai_jobs')
    .select('id, job_type, status, priority, progress, total_tasks, completed_tasks, created_at, started_at, completed_at, error_message')
    .order('created_at', { ascending: false })
    .limit(500);

  if (!jobs?.length) return;

  const headers = ['ID', 'Type', 'Status', 'Priority', 'Progress', 'Total Tasks', 'Completed Tasks', 'Created', 'Started', 'Completed', 'Error'];
  const rows = jobs.map(j => [
    j.id, j.job_type, j.status, String(j.priority), String(j.progress),
    String(j.total_tasks), String(j.completed_tasks),
    j.created_at, j.started_at || '', j.completed_at || '', j.error_message || '',
  ]);
  downloadFile(toCsv(headers, rows), `astra-job-history-${ts()}.csv`, 'text/csv');
}

export function exportHealthAlertsCsv(alerts: HealthAlert[]) {
  if (!alerts.length) return;
  const headers = ['ID', 'Type', 'Severity', 'Message', 'Resolved', 'Created', 'Resolved At'];
  const rows = alerts.map(a => [
    a.id, a.alert_type, a.severity, a.message,
    a.resolved ? 'Yes' : 'No', a.created_at, a.resolved_at || '',
  ]);
  downloadFile(toCsv(headers, rows), `astra-health-alerts-${ts()}.csv`, 'text/csv');
}

export function exportSearchAnalyticsCsv(data: AICommandCenterData) {
  const { searchAnalytics } = data;
  const headers = ['Query', 'Count'];
  const rows = searchAnalytics.topQueries.map(q => [q.query, String(q.count)]);
  downloadFile(toCsv(headers, rows), `astra-search-analytics-${ts()}.csv`, 'text/csv');
}

export function exportPriceTrendsCsv(data: AICommandCenterData) {
  const headers = ['Month', 'Avg Price (Rp)', 'Properties'];
  const rows = data.priceTrends.map(p => [p.month, String(p.avgPrice), String(p.count)]);
  downloadFile(toCsv(headers, rows), `astra-price-trends-${ts()}.csv`, 'text/csv');
}

// ─── PDF Export ─────────────────────────────────────────────────────────────

export async function exportFullReportPdf(data: AICommandCenterData, alerts: HealthAlert[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('ASTRA Villa — AI Command Center Report', 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, y);
  y += 10;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  // Overview KPIs
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text('Platform Overview', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Properties', String(data.overview.totalProperties)],
      ['Avg SEO Score', String(data.overview.avgSeoScore)],
      ['Avg Investment Score', String(data.overview.avgInvestmentScore)],
      ['Avg Estimated Value', `Rp ${data.overview.avgEstimatedValue.toLocaleString()}`],
      ['Avg Predicted ROI', `${data.overview.avgPredictedROI}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 100, 60], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Job Status
  doc.setFontSize(13);
  doc.text('Job Queue Status', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Status', 'Count']],
    body: [
      ['Running', String(data.jobStatus.running)],
      ['Pending', String(data.jobStatus.pending)],
      ['Completed', String(data.jobStatus.completed)],
      ['Failed', String(data.jobStatus.failed)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 80, 120], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // SEO & Search
  doc.setFontSize(13);
  doc.text('SEO & Search Analytics', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Weak SEO Listings', String(data.seo.weakListings)],
      ['Avg SEO Score', String(data.seo.avgScore)],
      ['Total Searches', String(data.searchAnalytics.totalSearches)],
      ['Conversion Rate', `${data.searchAnalytics.conversionRate}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [120, 80, 30], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Top Queries
  if (data.searchAnalytics.topQueries.length > 0) {
    doc.setFontSize(11);
    doc.text('Top Search Queries', 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Query', 'Count']],
      body: data.searchAnalytics.topQueries.slice(0, 10).map(q => [q.query, String(q.count)]),
      theme: 'striped',
      headStyles: { fillColor: [80, 80, 80], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // System Health
  if (y > 240) { doc.addPage(); y = 15; }
  doc.setFontSize(13);
  doc.text('System Health', 14, y);
  y += 6;

  const healthRows = [
    ...data.systemHealth.edgeFunctions.map(fn => [fn.name, fn.status, `${fn.latencyMs}ms`]),
    ['Database', data.systemHealth.dbHealth, `${data.systemHealth.dbLatencyMs}ms`],
    ['Scheduler', data.systemHealth.schedulerHealth, `${data.systemHealth.stalledJobs} stalled`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Service', 'Status', 'Detail']],
    body: healthRows,
    theme: 'grid',
    headStyles: { fillColor: [140, 30, 30], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Health Alerts
  const activeAlerts = alerts.filter(a => !a.resolved);
  if (activeAlerts.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }
    doc.setFontSize(11);
    doc.text(`Active Alerts (${activeAlerts.length})`, 14, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Severity', 'Type', 'Message', 'Time']],
      body: activeAlerts.map(a => [
        a.severity.toUpperCase(),
        a.alert_type.replace(/_/g, ' '),
        a.message,
        format(new Date(a.created_at), 'MMM dd HH:mm'),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [180, 50, 50], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: { 2: { cellWidth: 70 } },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`ASTRA Villa AI Report — Page ${i}/${pageCount}`, 14, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`astra-ai-report-${ts()}.pdf`);
}
