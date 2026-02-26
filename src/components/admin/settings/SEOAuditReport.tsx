import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
  Sparkles, Play, Loader2, CheckCircle2, XCircle, AlertTriangle, Info,
  Globe, FileText, Image, Link2, Zap, Smartphone, Type, BarChart3
} from 'lucide-react';

interface PageAudit {
  url: string;
  path: string;
  pageName: string;
  status: number;
  loadTimeMs: number;
  issues: { category: string; severity: 'critical' | 'warning' | 'info'; message: string; recommendation: string }[];
  scores: Record<string, number>;
  meta: Record<string, any>;
}

interface AuditReport {
  auditedAt: string;
  overallScore: number;
  avgScores: Record<string, number>;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  pages: PageAudit[];
}

const PAGES_TO_AUDIT = [
  { name: 'Home', path: '/' },
  { name: 'Dijual', path: '/dijual' },
  { name: 'Disewa', path: '/disewa' },
  { name: 'Search', path: '/search' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  meta: <FileText className="h-3 w-3" />,
  headings: <Type className="h-3 w-3" />,
  images: <Image className="h-3 w-3" />,
  links: <Link2 className="h-3 w-3" />,
  performance: <Zap className="h-3 w-3" />,
  mobile: <Smartphone className="h-3 w-3" />,
  content: <BarChart3 className="h-3 w-3" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  meta: 'Meta Tags',
  headings: 'Headings',
  images: 'Images',
  links: 'Links',
  performance: 'Performance',
  mobile: 'Mobile',
  content: 'Content',
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-chart-3';
  if (score >= 50) return 'text-chart-4';
  return 'text-destructive';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-chart-3/10 border-chart-3/20';
  if (score >= 50) return 'bg-chart-4/10 border-chart-4/20';
  return 'bg-destructive/10 border-destructive/20';
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return <XCircle className="h-3 w-3 text-destructive shrink-0" />;
    case 'warning': return <AlertTriangle className="h-3 w-3 text-chart-4 shrink-0" />;
    default: return <Info className="h-3 w-3 text-muted-foreground shrink-0" />;
  }
};

const getSeverityBg = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-destructive/5 border-destructive/20';
    case 'warning': return 'bg-chart-4/5 border-chart-4/20';
    default: return 'bg-muted/30 border-border/30';
  }
};

const SEOAuditReport = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('overview');

  const runAudit = async () => {
    setScanning(true);
    setError(null);
    try {
      const baseUrl = window.location.origin;
      const { data, error: fnError } = await supabase.functions.invoke('seo-audit', {
        body: { baseUrl, pages: PAGES_TO_AUDIT },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || 'Audit failed');

      setReport(data.data);
    } catch (err: any) {
      console.error('Audit error:', err);
      setError(err.message || 'Failed to run SEO audit');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-chart-4">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-chart-4" />
              Real-Time SEO Audit
            </span>
            <Button onClick={runAudit} disabled={scanning} size="sm" className="h-6 text-[10px] px-3 gap-1">
              {scanning ? <><Loader2 className="h-3 w-3 animate-spin" />Scanning...</> : <><Play className="h-3 w-3" />Run Audit</>}
            </Button>
          </CardTitle>
        </CardHeader>
        {!report && !scanning && !error && (
          <CardContent className="px-3 pb-3 pt-0">
            <p className="text-[9px] text-muted-foreground">Click "Run Audit" to scan all pages for SEO issues and generate a comprehensive report.</p>
          </CardContent>
        )}
        {error && (
          <CardContent className="px-3 pb-3 pt-0">
            <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-[10px] text-destructive">
              <XCircle className="h-3 w-3 shrink-0" />
              {error}
            </div>
          </CardContent>
        )}
      </Card>

      {scanning && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Scanning {PAGES_TO_AUDIT.length} pages for SEO issues...</p>
            <p className="text-[8px] text-muted-foreground">Analyzing meta tags, headings, images, links, content, and more</p>
          </CardContent>
        </Card>
      )}

      {report && !scanning && (
        <>
          {/* Overall Score */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${getScoreBg(report.overallScore)}`}>
                    <span className={`text-xl font-bold ${getScoreColor(report.overallScore)}`}>{report.overallScore}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Overall SEO Health</p>
                  <p className="text-[9px] text-muted-foreground">
                    {report.pages.length} pages scanned · {report.totalIssues} issues found
                  </p>
                  <div className="flex gap-2 mt-1">
                    {report.criticalIssues > 0 && (
                      <Badge variant="destructive" className="text-[7px] h-4 px-1.5">{report.criticalIssues} Critical</Badge>
                    )}
                    {report.warningIssues > 0 && (
                      <Badge variant="outline" className="text-[7px] h-4 px-1.5 border-chart-4/50 text-chart-4">{report.warningIssues} Warnings</Badge>
                    )}
                    <Badge variant="secondary" className="text-[7px] h-4 px-1.5">
                      {report.totalIssues - report.criticalIssues - report.warningIssues} Info
                    </Badge>
                  </div>
                </div>
                <div className="text-[8px] text-muted-foreground text-right">
                  <p>Scanned at</p>
                  <p>{new Date(report.auditedAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Category Scores Bar */}
              <div className="grid grid-cols-7 gap-1.5">
                {Object.entries(report.avgScores).map(([key, score]) => (
                  <div key={key} className={`p-1.5 rounded border text-center ${getScoreBg(score)}`}>
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      {CATEGORY_ICONS[key]}
                    </div>
                    <p className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</p>
                    <p className="text-[7px] text-muted-foreground">{CATEGORY_LABELS[key]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Page Tabs */}
          <Tabs value={selectedPage} onValueChange={setSelectedPage} className="space-y-3">
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex h-7 w-auto gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border/30">
                <TabsTrigger value="overview" className="text-[10px] h-6 px-2 gap-1">
                  <Globe className="h-2.5 w-2.5" />All Issues
                </TabsTrigger>
                {report.pages.map(page => (
                  <TabsTrigger key={page.path} value={page.path} className="text-[10px] h-6 px-2 gap-1">
                    {page.pageName}
                    {page.issues.filter(i => i.severity === 'critical').length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Overview: All Issues */}
            <TabsContent value="overview" className="space-y-3">
              {/* Page Summary Table */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs font-semibold text-foreground">Page Summary</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[8px] h-6 px-1">Page</TableHead>
                        <TableHead className="text-[8px] h-6 px-1">Status</TableHead>
                        <TableHead className="text-[8px] h-6 px-1">Load</TableHead>
                        <TableHead className="text-[8px] h-6 px-1">Title</TableHead>
                        <TableHead className="text-[8px] h-6 px-1">Issues</TableHead>
                        <TableHead className="text-[8px] h-6 px-1">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.pages.map(page => {
                        const pageScore = Math.round(Object.values(page.scores).reduce((a, b) => a + b, 0) / 7);
                        return (
                          <TableRow key={page.path} className="cursor-pointer" onClick={() => setSelectedPage(page.path)}>
                            <TableCell className="text-[9px] font-medium px-1 py-1">{page.pageName}</TableCell>
                            <TableCell className="px-1 py-1">
                              <Badge variant={page.status === 200 ? 'secondary' : 'destructive'} className="text-[7px] h-4 px-1">
                                {page.status || 'ERR'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[9px] text-muted-foreground px-1 py-1">{page.loadTimeMs}ms</TableCell>
                            <TableCell className="text-[9px] text-muted-foreground px-1 py-1 max-w-32 truncate">{page.meta.title || '—'}</TableCell>
                            <TableCell className="px-1 py-1">
                              <div className="flex gap-1">
                                {page.issues.filter(i => i.severity === 'critical').length > 0 && (
                                  <Badge variant="destructive" className="text-[7px] h-3.5 px-1">{page.issues.filter(i => i.severity === 'critical').length}</Badge>
                                )}
                                {page.issues.filter(i => i.severity === 'warning').length > 0 && (
                                  <Badge variant="outline" className="text-[7px] h-3.5 px-1 text-chart-4 border-chart-4/40">{page.issues.filter(i => i.severity === 'warning').length}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-1 py-1">
                              <span className={`text-[10px] font-bold ${getScoreColor(pageScore)}`}>{pageScore}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Recommendations */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs font-semibold text-foreground">Top Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
                  {report.pages
                    .flatMap(p => p.issues.map(i => ({ ...i, page: p.pageName })))
                    .filter(i => i.severity === 'critical')
                    .slice(0, 8)
                    .map((issue, idx) => (
                      <div key={idx} className={`flex items-start gap-2 p-2 rounded border ${getSeverityBg(issue.severity)}`}>
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] font-medium text-foreground">{issue.message}</p>
                            <Badge variant="outline" className="text-[7px] h-3.5 px-1 shrink-0">{issue.page}</Badge>
                          </div>
                          <p className="text-[8px] text-muted-foreground mt-0.5">{issue.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  {report.criticalIssues === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-chart-3/5 border border-chart-3/20 rounded">
                      <CheckCircle2 className="h-4 w-4 text-chart-3" />
                      <p className="text-xs text-foreground">No critical issues found. Great job!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Per-Page Detail */}
            {report.pages.map(page => {
              const pageScore = Math.round(Object.values(page.scores).reduce((a, b) => a + b, 0) / 7);
              return (
                <TabsContent key={page.path} value={page.path} className="space-y-3">
                  {/* Page Score Header */}
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getScoreBg(pageScore)}`}>
                          <span className={`text-lg font-bold ${getScoreColor(pageScore)}`}>{pageScore}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground">{page.pageName}</p>
                          <p className="text-[9px] text-muted-foreground">{page.url}</p>
                          <div className="flex gap-2 mt-1 text-[8px] text-muted-foreground">
                            <span>Status: {page.status}</span>
                            <span>·</span>
                            <span>Load: {page.loadTimeMs}ms</span>
                            <span>·</span>
                            <span>Words: {page.meta.wordCount}</span>
                            <span>·</span>
                            <span>Images: {page.meta.imgCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Category bars */}
                      <div className="grid grid-cols-7 gap-1.5 mt-3">
                        {Object.entries(page.scores).map(([key, score]) => (
                          <div key={key} className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[7px] text-muted-foreground">{CATEGORY_LABELS[key]}</span>
                              <span className={`text-[8px] font-bold ${getScoreColor(score)}`}>{score}</span>
                            </div>
                            <Progress value={score} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meta Info */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs font-semibold text-foreground">Page Meta Details</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { label: 'Title', value: page.meta.title || '—', sub: `${page.meta.titleLength} chars` },
                          { label: 'H1 Tags', value: page.meta.h1Count, sub: page.meta.h1Count === 1 ? 'Optimal' : 'Check' },
                          { label: 'Images', value: `${page.meta.imgCount} total`, sub: `${page.meta.imgWithoutAlt} missing alt` },
                          { label: 'Links', value: `${page.meta.internalLinks} int / ${page.meta.externalLinks} ext`, sub: '' },
                        ].map((item, i) => (
                          <div key={i} className="p-1.5 bg-muted/20 rounded border border-border/30">
                            <p className="text-[7px] text-muted-foreground uppercase">{item.label}</p>
                            <p className="text-[9px] font-medium text-foreground truncate">{item.value}</p>
                            {item.sub && <p className="text-[7px] text-muted-foreground">{item.sub}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[
                          { label: 'Canonical', ok: page.meta.hasCanonical },
                          { label: 'Viewport', ok: page.meta.hasViewport },
                          { label: 'OG Tags', ok: page.meta.hasOgTitle },
                          { label: 'OG Image', ok: page.meta.hasOgImage },
                          { label: 'Twitter', ok: page.meta.hasTwitterCard },
                          { label: 'Schema', ok: page.meta.hasStructuredData },
                          { label: 'Favicon', ok: page.meta.hasFavicon },
                          { label: 'Robots', ok: page.meta.hasRobotsMeta },
                        ].map((check, i) => (
                          <div key={i} className="flex items-center gap-0.5 text-[7px]">
                            {check.ok ? <CheckCircle2 className="h-2.5 w-2.5 text-chart-3" /> : <XCircle className="h-2.5 w-2.5 text-destructive" />}
                            <span className={check.ok ? 'text-muted-foreground' : 'text-foreground'}>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues List */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs font-semibold text-foreground">
                        Issues ({page.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0 space-y-1">
                      {page.issues.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 bg-chart-3/5 border border-chart-3/20 rounded">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          <p className="text-xs text-foreground">No issues found on this page!</p>
                        </div>
                      ) : (
                        page.issues
                          .sort((a, b) => {
                            const order = { critical: 0, warning: 1, info: 2 };
                            return order[a.severity] - order[b.severity];
                          })
                          .map((issue, idx) => (
                            <div key={idx} className={`flex items-start gap-2 p-2 rounded border ${getSeverityBg(issue.severity)}`}>
                              {getSeverityIcon(issue.severity)}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[6px] h-3 px-1">{issue.category}</Badge>
                                  <p className="text-[9px] font-medium text-foreground">{issue.message}</p>
                                </div>
                                <p className="text-[8px] text-muted-foreground mt-0.5">{issue.recommendation}</p>
                              </div>
                            </div>
                          ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SEOAuditReport;
