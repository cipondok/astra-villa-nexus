import { X, CheckCircle2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface VisualComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchImage: string;
  propertyImage: string;
  propertyTitle: string;
  similarityScore?: number;
  similarityBreakdown?: {
    propertyType?: number;
    style?: number;
    architecture?: number;
    bedrooms?: number;
    amenities?: number;
  };
}

export const VisualComparisonModal = ({
  isOpen,
  onClose,
  searchImage,
  propertyImage,
  propertyTitle,
  similarityScore = 0,
  similarityBreakdown
}: VisualComparisonModalProps) => {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-orange-100 dark:bg-orange-900/30";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Visual Comparison
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare your search image with this property
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Overall Similarity Score */}
            <div className={cn(
              "p-4 rounded-xl border-2",
              getScoreBgColor(similarityScore)
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={cn("h-6 w-6", getScoreColor(similarityScore))} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall Match</p>
                    <p className={cn("text-2xl font-bold", getScoreColor(similarityScore))}>
                      {similarityScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getScoreColor(similarityScore))}
                >
                  {similarityScore >= 80 ? "Excellent Match" : 
                   similarityScore >= 60 ? "Good Match" : "Fair Match"}
                </Badge>
              </div>
            </div>

            {/* Image Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Your Search Image</p>
                  <Badge variant="outline" className="text-xs">
                    Reference
                  </Badge>
                </div>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg">
                  <img
                    src={searchImage}
                    alt="Search reference"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="bg-purple-500 text-white">
                      Search Reference
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Property Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Matched Property</p>
                  <Badge variant="outline" className="text-xs">
                    Result
                  </Badge>
                </div>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                  <img
                    src={propertyImage}
                    alt={propertyTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {propertyTitle}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Similarity Breakdown */}
            {similarityBreakdown && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Similarity Breakdown
                </h3>
                <div className="space-y-2">
                  {Object.entries(similarityBreakdown).map(([key, value]) => {
                    if (typeof value !== 'number') return null;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={cn("font-bold", getScoreColor(value))}>
                            {value.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              value >= 80 ? "bg-green-500" :
                              value >= 60 ? "bg-yellow-500" : "bg-orange-500"
                            )}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Higher percentages indicate stronger similarity in that category. 
                Properties with 80%+ overall match are excellent candidates!
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
