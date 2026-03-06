import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useImageQualityAnalyzer, ImageAnalysisResult } from "@/hooks/useImageQualityAnalyzer";
import {
  Camera, Sparkles, Loader2, AlertTriangle, CheckCircle2, Star,
  Sun, Layout, Sofa, ArrowUpDown, Eye, XCircle, Lightbulb,
  ImageIcon, ChevronDown, ChevronUp, Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const scoreColor = (s: number) =>
  s >= 80 ? 'text-chart-2' : s >= 60 ? 'text-primary' : s >= 40 ? 'text-yellow-500' : 'text-destructive';

const scoreBg = (s: number) =>
  s >= 80 ? 'bg-chart-2' : s >= 60 ? 'bg-primary' : s >= 40 ? 'bg-yellow-500' : 'bg-destructive';

const scoreLabel = (s: number) =>
  s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor';

const ImageQualityAnalyzerPage = () => {
  const [urls, setUrls] = useState<string[]>([""]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { mutate, data, isPending } = useImageQualityAnalyzer();

  const addUrl = () => setUrls(prev => [...prev, ""]);
  const removeUrl = (i: number) => setUrls(prev => prev.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, v: string) => setUrls(prev => prev.map((u, idx) => idx === i ? v : u));

  const handleAnalyze = () => {
    const validUrls = urls.filter(u => u.trim().length > 0);
    if (validUrls.length === 0) return;
    mutate(validUrls);
  };

  const summary = data?.summary;
  const images = data?.images || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Image Quality Analyzer</h1>
              <p className="text-sm text-muted-foreground">Analyze property photos for quality, staging, and optimal ordering</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Property Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Image URL ${i + 1} (https://...)`}
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                />
                {urls.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeUrl(i)}>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={addUrl}>+ Add Image URL</Button>
              <Button onClick={handleAnalyze} disabled={isPending || urls.every(u => !u.trim())} className="gap-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isPending ? 'Analyzing...' : 'Analyze Images'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Up to 10 images. Use direct image URLs from your property listings.</p>
          </CardContent>
        </Card>

        {/* Summary */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${scoreColor(summary.average_quality)}`}>
                    {summary.average_quality}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Average Quality</p>
                  <Badge className={`mt-1 text-[10px] ${scoreBg(summary.average_quality)} text-white border-0`}>
                    {scoreLabel(summary.average_quality)}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">{summary.total_analyzed}</div>
                  <p className="text-xs text-muted-foreground mt-1">Images Analyzed</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-chart-2">
                    {summary.hero_image_index >= 0 ? `#${summary.hero_image_index + 1}` : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Best Hero Image</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${summary.needs_improvement > 0 ? 'text-destructive' : 'text-chart-2'}`}>
                    {summary.needs_improvement}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Need Improvement</p>
                </CardContent>
              </Card>
            </div>

            {/* Suggested Order */}
            {summary.suggested_order.length > 1 && (
              <Card className="mt-4 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpDown className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">AI Suggested Image Order</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {summary.suggested_order.map((idx, pos) => (
                      <div key={idx} className="flex items-center gap-1">
                        {pos > 0 && <span className="text-muted-foreground text-xs">→</span>}
                        <Badge variant={pos === 0 ? "default" : "secondary"} className="gap-1">
                          {pos === 0 && <Trophy className="h-3 w-3" />}
                          Image #{idx + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Image Results */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img: ImageAnalysisResult, idx: number) => {
              const isExpanded = expandedCard === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`overflow-hidden ${img.hero_potential ? 'ring-2 ring-chart-2/50' : ''}`}>
                    {/* Image Preview */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img src={img.url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                      
                      {/* Score overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Badge className={`${scoreBg(img.quality_score)} text-white border-0 text-sm font-bold`}>
                          {img.quality_score}/100
                        </Badge>
                        {img.hero_potential && (
                          <Badge className="bg-chart-2 text-white border-0 gap-1">
                            <Star className="h-3 w-3" /> Hero
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs">
                          {img.room_type || 'Unknown'}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {img.tags && img.tags.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                          {img.tags.slice(0, 4).map((tag, ti) => (
                            <Badge key={ti} variant="outline" className="text-[10px] bg-background/70 backdrop-blur-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Score Bars */}
                      <div className="grid grid-cols-3 gap-3">
                        {img.lighting && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Sun className="h-3 w-3" /> Lighting
                            </div>
                            <Progress value={img.lighting.score} className="h-1.5" />
                            <span className={`text-xs font-medium ${scoreColor(img.lighting.score)}`}>{img.lighting.score}</span>
                          </div>
                        )}
                        {img.composition && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Layout className="h-3 w-3" /> Composition
                            </div>
                            <Progress value={img.composition.score} className="h-1.5" />
                            <span className={`text-xs font-medium ${scoreColor(img.composition.score)}`}>{img.composition.score}</span>
                          </div>
                        )}
                        {img.staging && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Sofa className="h-3 w-3" /> Staging
                            </div>
                            <Progress value={img.staging.score} className="h-1.5" />
                            <span className={`text-xs font-medium ${scoreColor(img.staging.score)}`}>{img.staging.score}</span>
                          </div>
                        )}
                      </div>

                      {/* Issues summary */}
                      {img.issues && img.issues.length > 0 && (
                        <div className="flex items-start gap-2 text-xs p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{img.issues[0]}</span>
                        </div>
                      )}

                      {img.error && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          {img.error}
                        </div>
                      )}

                      {/* Expand details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-xs"
                        onClick={() => setExpandedCard(isExpanded ? null : idx)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {isExpanded ? 'Hide Details' : 'View Full Analysis'}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Separator className="mb-3" />
                            <div className="space-y-3">
                              {/* All issues */}
                              {img.issues && img.issues.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-destructive" /> Issues Detected
                                  </p>
                                  <ul className="space-y-1">
                                    {img.issues.map((issue, ii) => (
                                      <li key={ii} className="text-xs text-muted-foreground flex items-start gap-1">
                                        <span className="text-destructive mt-0.5">•</span> {issue}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Improvements */}
                              {img.improvements && img.improvements.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3 text-primary" /> Suggestions
                                  </p>
                                  <ul className="space-y-1">
                                    {img.improvements.map((tip, ti) => (
                                      <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1">
                                        <span className="text-primary mt-0.5">✦</span> {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Staging suggestions */}
                              {img.staging?.suggestions && img.staging.suggestions.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                    <Sofa className="h-3 w-3" /> Staging Tips
                                  </p>
                                  <ul className="space-y-1">
                                    {img.staging.suggestions.map((tip, ti) => (
                                      <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1">
                                        <span className="mt-0.5">🪑</span> {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Lighting suggestions */}
                              {img.lighting?.suggestions && img.lighting.suggestions.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                    <Sun className="h-3 w-3" /> Lighting Tips
                                  </p>
                                  <ul className="space-y-1">
                                    {img.lighting.suggestions.map((tip, ti) => (
                                      <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1">
                                        <span className="mt-0.5">💡</span> {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageQualityAnalyzerPage;
