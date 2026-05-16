import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles, Loader2, FileText, TrendingUp, Globe, CheckCircle2,
  AlertTriangle, Clock, Zap, BarChart3, MapPin
} from 'lucide-react';
import {
  useSeoContentPipelinePreview,
  useSeoContentPipelineStatus,
  useSeoContentPipelineGenerate,
} from '@/hooks/useSeoContentPipeline';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SeoContentPipelineDashboard = () => {
  const [batchSize, setBatchSize] = useState('5');
  const queryClient = useQueryClient();

  const { data: preview, isLoading: previewLoading } = useSeoContentPipelinePreview();
  const { data: status, isLoading: statusLoading } = useSeoContentPipelineStatus();
  const generateMutation = useSeoContentPipelineGenerate();

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync(Number(batchSize));
      toast.success(`Generated ${result.generated} SEO pages`, {
        description: `${result.total_attempted} cities processed`,
      });
      queryClient.invalidateQueries({ queryKey: ['seo-content-pipeline-preview'] });
      queryClient.invalidateQueries({ queryKey: ['seo-content-pipeline-status'] });
    } catch (e: any) {
      toast.error('Generation failed', { description: e?.message });
    }
  };

  const demandBadge = (score: number | null) => {
    if (!score) return <Badge variant="outline" className="text-[9px]">N/A</Badge>;
    if (score >= 80) return <Badge className="bg-chart-3/20 text-chart-3 text-[9px] border-chart-3/30">Hot {score}</Badge>;
    if (score >= 60) return <Badge className="bg-chart-4/20 text-chart-4 text-[9px] border-chart-4/30">Warm {score}</Badge>;
    return <Badge variant="outline" className="text-[9px]">{score}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Hotspot Cities</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {previewLoading ? '—' : preview?.total_hotspots || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3.5 w-3.5 text-chart-3" />
              <span className="text-[10px] text-muted-foreground">Generated</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {statusLoading ? '—' : status?.total_generated || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-chart-4" />
              <span className="text-[10px] text-muted-foreground">Published</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {statusLoading ? '—' : status?.total_published || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {previewLoading ? '—' : preview?.candidates || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generator Controls */}
      <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Automated Content Pipeline
          </CardTitle>
          <CardDescription className="text-[11px]">
            Generate SEO investment pages from market intelligence data. Each page includes investment overview, price trends, and curated listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex items-center gap-3">
            <Select value={batchSize} onValueChange={setBatchSize}>
              <SelectTrigger className="w-28 h-8 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 cities</SelectItem>
                <SelectItem value="5">5 cities</SelectItem>
                <SelectItem value="10">10 cities</SelectItem>
                <SelectItem value="20">20 cities</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || (preview?.candidates || 0) === 0}
              className="h-8 text-[11px] gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Batch
                </>
              )}
            </Button>
          </div>

          {/* Generation results */}
          {generateMutation.data && (
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-chart-3" />
                <span className="text-[11px] font-medium text-foreground">
                  {generateMutation.data.generated} pages generated
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {generateMutation.data.results.map((r, i) => (
                  <Badge
                    key={i}
                    variant={r.status === 'generated' ? 'default' : 'destructive'}
                    className="text-[9px]"
                  >
                    {r.city} {r.status === 'generated' ? '✓' : `✗ ${r.error}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Cities */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-chart-4" />
            Pending Cities
            {preview?.candidates ? (
              <Badge variant="outline" className="text-[9px]">{preview.candidates}</Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {previewLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading candidates...
            </div>
          ) : (preview?.cities?.length || 0) === 0 ? (
            <p className="text-[11px] text-muted-foreground">All hotspot cities have content ✓</p>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-1.5">
                {preview!.cities.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/20 border border-border/20">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-foreground">{c.city}</span>
                      <span className="text-[10px] text-muted-foreground">{c.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {demandBadge(c.demand_score)}
                      <span className="text-[10px] text-muted-foreground">
                        {c.avg_yield ? `${c.avg_yield.toFixed(1)}%` : '—'} yield
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {c.property_count || 0} listings
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Generated Content */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Generated Content
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {statusLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          ) : (status?.recent?.length || 0) === 0 ? (
            <p className="text-[11px] text-muted-foreground">No content generated yet. Run the pipeline to start.</p>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {status!.recent.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-medium text-foreground leading-snug line-clamp-1">
                        {item.title}
                      </span>
                      <Badge
                        variant={item.status === 'published' ? 'default' : 'secondary'}
                        className="text-[9px] shrink-0"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {item.primary_keyword}
                      </span>
                      {item.seo_score ? (
                        <span>SEO: {item.seo_score}</span>
                      ) : null}
                      {item.organic_traffic ? (
                        <span>{item.organic_traffic} visits</span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeoContentPipelineDashboard;
