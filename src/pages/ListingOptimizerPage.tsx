import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Type, FileText, Image, TrendingUp, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useListingOptimizer } from '@/hooks/useListingOptimizer';
import { useSecureProperties } from '@/hooks/useSecureProperties';

const gradeConfig = {
  excellent: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Excellent' },
  good: { icon: CheckCircle2, color: 'text-chart-1', bg: 'bg-chart-1/15 border-chart-1/30', label: 'Good' },
  needs_improvement: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Needs Work' },
  poor: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30', label: 'Poor' },
};

interface AnalysisSectionProps {
  title: string;
  icon: React.ElementType;
  score: number;
  maxScore: number;
  grade: string;
  suggestions: string[];
  extra?: React.ReactNode;
}

const AnalysisSection = ({ title, icon: Icon, score, maxScore, grade, suggestions, extra }: AnalysisSectionProps) => {
  const g = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig.poor;
  const GradeIcon = g.icon;
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{score}/{maxScore}</span>
            <Badge variant="outline" className={g.bg}>
              <GradeIcon className={`h-3 w-3 mr-1 ${g.color}`} />
              {g.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={pct} className="h-2" />
        {extra}
        {suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        )}
        {suggestions.length === 0 && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Looking great — no improvements needed!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const ListingOptimizerPage = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const { data: properties, isLoading: propsLoading } = useSecureProperties();
  const { data, isLoading, error } = useListingOptimizer(selectedPropertyId || undefined);

  const overallG = data ? gradeConfig[data.overall_grade as keyof typeof gradeConfig] || gradeConfig.poor : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          Listing Optimizer
        </h1>
        <p className="text-muted-foreground mt-1">AI analysis of your title, description, and photos with actionable suggestions.</p>
      </div>

      {/* Property Selector */}
      <Card>
        <CardContent className="pt-6">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Select Property</label>
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder={propsLoading ? 'Loading...' : 'Choose a property to optimize'} />
            </SelectTrigger>
            <SelectContent>
              {(properties || []).map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.title} — {p.city || p.location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Analyzing your listing...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-center text-destructive">
            {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          {/* Overall Score */}
          <Card className="border-primary/20">
            <CardContent className="pt-6 pb-5">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="h-28 w-28 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{data.overall_score}</p>
                      <p className="text-xs text-muted-foreground">/100</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-foreground">Listing Health Score</h2>
                    {overallG && (
                      <Badge variant="outline" className={overallG.bg}>
                        {overallG.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {data.property_summary.property_type} in {data.property_summary.city} • {data.property_summary.bedrooms} bed, {data.property_summary.bathrooms} bath
                  </p>
                  {data.potential_boost_percent > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Up to {data.potential_boost_percent}% more engagement possible
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Sections */}
          <AnalysisSection
            title="Title Analysis"
            icon={Type}
            score={data.title_analysis.score}
            maxScore={data.title_analysis.max_score}
            grade={data.title_analysis.grade}
            suggestions={data.title_analysis.suggestions}
            extra={
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Current Title</p>
                <p className="text-sm font-medium text-foreground">"{data.title_analysis.current_title}"</p>
              </div>
            }
          />

          <AnalysisSection
            title="Description Analysis"
            icon={FileText}
            score={data.description_analysis.score}
            maxScore={data.description_analysis.max_score}
            grade={data.description_analysis.grade}
            suggestions={data.description_analysis.suggestions}
            extra={
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Length: <strong className="text-foreground">{data.description_analysis.length}</strong> chars</span>
                <span>Optimal: <strong className="text-foreground">{data.description_analysis.optimal_range}</strong></span>
              </div>
            }
          />

          <AnalysisSection
            title="Photo Analysis"
            icon={Image}
            score={data.photo_analysis.score}
            maxScore={data.photo_analysis.max_score}
            grade={data.photo_analysis.grade}
            suggestions={data.photo_analysis.suggestions}
            extra={
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Photos: <strong className="text-foreground">{data.photo_analysis.photo_count}</strong></span>
                <span>Recommended: <strong className="text-foreground">≥{data.photo_analysis.recommended_minimum}</strong></span>
              </div>
            }
          />
        </>
      )}
    </div>
  );
};

export default ListingOptimizerPage;
