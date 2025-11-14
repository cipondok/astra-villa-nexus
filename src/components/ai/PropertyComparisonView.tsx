import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Check, X } from "lucide-react";

interface ComparisonFeature {
  label: string;
  searchValue: string | number;
  propertyValue: string | number;
  score: number;
}

interface PropertyComparisonViewProps {
  searchImage: string;
  propertyImage: string;
  propertyTitle: string;
  similarityScore: number;
  similarityBreakdown: {
    propertyType: number;
    style: number;
    architecture: number;
    bedrooms: number;
    amenities: number;
  };
  imageFeatures?: {
    propertyType: string;
    style: string;
    architecture: string;
    bedrooms: number;
    amenities: string[];
  };
  propertyData?: {
    property_type?: string;
    bedrooms?: number;
  };
}

export const PropertyComparisonView = ({
  searchImage,
  propertyImage,
  propertyTitle,
  similarityScore,
  similarityBreakdown,
  imageFeatures,
  propertyData
}: PropertyComparisonViewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="space-y-6">
      {/* Overall Match Score */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Overall Match Score</h3>
            <div className="relative inline-block">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.round(similarityScore)}%
              </div>
              <Progress value={similarityScore} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Images */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30">
                Your Search Image
              </Badge>
            </div>
            <img 
              src={searchImage} 
              alt="Search query" 
              className="w-full h-64 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-800"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <Badge variant="secondary" className="bg-pink-100 dark:bg-pink-900/30">
                Found Property
              </Badge>
            </div>
            <img 
              src={propertyImage} 
              alt={propertyTitle} 
              className="w-full h-64 object-cover rounded-lg border-2 border-pink-200 dark:border-pink-800"
            />
          </CardContent>
        </Card>
      </div>

      {/* Feature Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-600" />
            Feature Analysis
          </h3>
          
          <div className="space-y-4">
            {/* Property Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Property Type</span>
                <span className={`text-sm font-semibold ${getScoreColor(similarityBreakdown.propertyType)}`}>
                  {Math.round(similarityBreakdown.propertyType)}%
                </span>
              </div>
              <Progress value={similarityBreakdown.propertyType} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{imageFeatures?.propertyType || "Detected"}</span>
                <span>{propertyData?.property_type || "Property"}</span>
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Style</span>
                <span className={`text-sm font-semibold ${getScoreColor(similarityBreakdown.style)}`}>
                  {Math.round(similarityBreakdown.style)}%
                </span>
              </div>
              <Progress value={similarityBreakdown.style} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{imageFeatures?.style || "Detected style"}</span>
                <span>Property style</span>
              </div>
            </div>

            {/* Architecture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Architecture</span>
                <span className={`text-sm font-semibold ${getScoreColor(similarityBreakdown.architecture)}`}>
                  {Math.round(similarityBreakdown.architecture)}%
                </span>
              </div>
              <Progress value={similarityBreakdown.architecture} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{imageFeatures?.architecture || "Detected"}</span>
                <span>Property architecture</span>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bedrooms</span>
                <span className={`text-sm font-semibold ${getScoreColor(similarityBreakdown.bedrooms)}`}>
                  {Math.round(similarityBreakdown.bedrooms)}%
                </span>
              </div>
              <Progress value={similarityBreakdown.bedrooms} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{imageFeatures?.bedrooms || 0} bedrooms</span>
                <span>{propertyData?.bedrooms || 0} bedrooms</span>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amenities</span>
                <span className={`text-sm font-semibold ${getScoreColor(similarityBreakdown.amenities)}`}>
                  {Math.round(similarityBreakdown.amenities)}%
                </span>
              </div>
              <Progress value={similarityBreakdown.amenities} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Summary */}
      <Card className={getScoreBgColor(similarityScore)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {similarityScore >= 70 ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="font-semibold">
                {similarityScore >= 80 ? "Excellent Match!" : 
                 similarityScore >= 60 ? "Good Match" : 
                 "Partial Match"}
              </p>
              <p className="text-sm text-muted-foreground">
                {similarityScore >= 80 ? "This property closely matches your search criteria" :
                 similarityScore >= 60 ? "This property matches several of your criteria" :
                 "This property matches some of your criteria"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
