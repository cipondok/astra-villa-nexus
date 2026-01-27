import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PropertyContext } from '@/hooks/usePropertyListingAssistant';
import { cn } from '@/lib/utils';

interface ListingHealthCheckProps {
  propertyContext: PropertyContext;
  className?: string;
}

interface CheckItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  weight: number;
}

interface SuccessPrediction {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    completeness: number;
    description: number;
    pricing: number;
    photos: number;
    location: number;
  };
  tips: string[];
}

const ListingHealthCheck = ({ propertyContext, className }: ListingHealthCheckProps) => {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [prediction, setPrediction] = useState<SuccessPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const analyzeProperty = useCallback(() => {
    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const newChecks: CheckItem[] = [
        {
          id: 'title',
          label: 'Property Title',
          status: propertyContext.title && propertyContext.title.length >= 10 ? 'pass' : 
                  propertyContext.title ? 'warning' : 'fail',
          message: propertyContext.title && propertyContext.title.length >= 10 
            ? 'Title is descriptive' 
            : propertyContext.title 
              ? 'Title could be more descriptive (10+ characters recommended)'
              : 'Title is required',
          weight: 10
        },
        {
          id: 'type',
          label: 'Property Type',
          status: propertyContext.propertyType ? 'pass' : 'fail',
          message: propertyContext.propertyType ? 'Property type selected' : 'Please select a property type',
          weight: 10
        },
        {
          id: 'location',
          label: 'Location',
          status: propertyContext.location ? 'pass' : 'fail',
          message: propertyContext.location ? 'Location specified' : 'Location is required for visibility',
          weight: 15
        },
        {
          id: 'price',
          label: 'Pricing',
          status: propertyContext.price && propertyContext.price > 0 ? 'pass' : 'fail',
          message: propertyContext.price ? `Listed at ${new Intl.NumberFormat('id-ID').format(propertyContext.price)} IDR` : 'Price is required',
          weight: 15
        },
        {
          id: 'bedrooms',
          label: 'Bedrooms',
          status: propertyContext.bedrooms !== undefined ? 'pass' : 'warning',
          message: propertyContext.bedrooms !== undefined ? `${propertyContext.bedrooms} bedrooms` : 'Add bedroom count for better search matching',
          weight: 5
        },
        {
          id: 'bathrooms',
          label: 'Bathrooms',
          status: propertyContext.bathrooms !== undefined ? 'pass' : 'warning',
          message: propertyContext.bathrooms !== undefined ? `${propertyContext.bathrooms} bathrooms` : 'Add bathroom count',
          weight: 5
        },
        {
          id: 'area',
          label: 'Building Area',
          status: propertyContext.area ? 'pass' : 'warning',
          message: propertyContext.area ? `${propertyContext.area} m² building` : 'Add building area for comparisons',
          weight: 5
        },
        {
          id: 'description',
          label: 'Description',
          status: propertyContext.description && propertyContext.description.length >= 100 ? 'pass' :
                  propertyContext.description && propertyContext.description.length >= 50 ? 'warning' : 'fail',
          message: propertyContext.description && propertyContext.description.length >= 100 
            ? 'Detailed description provided'
            : propertyContext.description 
              ? 'Description is too short (100+ characters recommended)'
              : 'A compelling description is crucial for conversions',
          weight: 20
        },
        {
          id: 'images',
          label: 'Photos',
          status: propertyContext.images && propertyContext.images >= 5 ? 'pass' :
                  propertyContext.images && propertyContext.images >= 1 ? 'warning' : 'fail',
          message: propertyContext.images && propertyContext.images >= 5
            ? `${propertyContext.images} photos uploaded`
            : propertyContext.images
              ? `Only ${propertyContext.images} photo(s). Listings with 5+ photos get 3x more inquiries`
              : 'No photos uploaded. This significantly reduces visibility',
          weight: 15
        }
      ];

      setChecks(newChecks);

      // Calculate success prediction
      let totalWeight = 0;
      let earnedWeight = 0;

      newChecks.forEach(check => {
        totalWeight += check.weight;
        if (check.status === 'pass') earnedWeight += check.weight;
        else if (check.status === 'warning') earnedWeight += check.weight * 0.5;
      });

      const score = Math.round((earnedWeight / totalWeight) * 100);
      
      const getGrade = (s: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
        if (s >= 90) return 'A';
        if (s >= 80) return 'B';
        if (s >= 70) return 'C';
        if (s >= 60) return 'D';
        return 'F';
      };

      const tips: string[] = [];
      newChecks.filter(c => c.status !== 'pass').forEach(c => {
        if (c.id === 'description') tips.push('Use AI to generate a compelling description');
        if (c.id === 'images') tips.push('Upload at least 5 high-quality photos');
        if (c.id === 'price') tips.push('Get AI pricing suggestions based on market data');
        if (c.id === 'location') tips.push('Add precise location for better search matching');
      });

      setPrediction({
        score,
        grade: getGrade(score),
        factors: {
          completeness: Math.round((newChecks.filter(c => c.status === 'pass').length / newChecks.length) * 100),
          description: propertyContext.description ? Math.min(100, propertyContext.description.length) : 0,
          pricing: propertyContext.price ? 100 : 0,
          photos: propertyContext.images ? Math.min(100, propertyContext.images * 20) : 0,
          location: propertyContext.location ? 100 : 0
        },
        tips: tips.slice(0, 3)
      });

      setIsAnalyzing(false);
    }, 800);
  }, [propertyContext]);

  // Auto-analyze when context changes
  useEffect(() => {
    analyzeProperty();
  }, [analyzeProperty]);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  const gradeColors = {
    'A': 'text-green-500 bg-green-500/10',
    'B': 'text-blue-500 bg-blue-500/10',
    'C': 'text-yellow-500 bg-yellow-500/10',
    'D': 'text-orange-500 bg-orange-500/10',
    'F': 'text-red-500 bg-red-500/10'
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Listing Health Check
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={analyzeProperty}
                disabled={isAnalyzing}
              >
                <RefreshCw className={cn("h-3 w-3", isAnalyzing && "animate-spin")} />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 mt-2">
            {prediction && (
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-black",
                gradeColors[prediction.grade]
              )}>
                {prediction.grade}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs mb-1">
                <Badge variant="secondary" className="gap-1 text-green-600 bg-green-500/10">
                  <Check className="h-2.5 w-2.5" /> {passCount}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-yellow-600 bg-yellow-500/10">
                  <AlertTriangle className="h-2.5 w-2.5" /> {warningCount}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-red-600 bg-red-500/10">
                  <X className="h-2.5 w-2.5" /> {failCount}
                </Badge>
              </div>
              {prediction && (
                <Progress value={prediction.score} className="h-2" />
              )}
            </div>
            {prediction && (
              <div className="text-right">
                <div className="text-lg font-bold">{prediction.score}%</div>
                <div className="text-[10px] text-muted-foreground">Success Rate</div>
              </div>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-2">
            {/* Check Items */}
            <div className="space-y-1.5 mb-3">
              {checks.map(check => (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs"
                >
                  {check.status === 'pass' && <Check className="h-3.5 w-3.5 text-green-500" />}
                  {check.status === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
                  {check.status === 'fail' && <X className="h-3.5 w-3.5 text-red-500" />}
                  <span className="font-medium">{check.label}:</span>
                  <span className="text-muted-foreground flex-1 truncate">{check.message}</span>
                </motion.div>
              ))}
            </div>

            {/* Tips */}
            {prediction && prediction.tips.length > 0 && (
              <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-[10px] font-medium text-primary mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Quick Improvements
                </div>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {prediction.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ListingHealthCheck;
