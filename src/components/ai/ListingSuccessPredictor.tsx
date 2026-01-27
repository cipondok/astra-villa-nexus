import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Camera,
  FileText,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Loader2,
  Sparkles,
  Home,
  Building,
  MapPin,
  Lightbulb,
  Shield,
  ArrowRight
} from "lucide-react";
import { useListingSuccessPredictor, type ListingInput, type PredictionResult } from "@/hooks/useListingSuccessPredictor";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = ["Villa", "House", "Apartment", "Penthouse", "Townhouse", "Land", "Commercial"];
const CITIES = ["Jakarta", "Bali", "Surabaya", "Bandung", "Medan", "Tangerang", "Bekasi", "Yogyakarta"];
const AMENITIES = ["Pool", "Garden", "Security", "Parking", "Gym", "Ocean View", "City View", "Smart Home", "Concierge"];

const EXAMPLE_SCENARIOS = [
  { id: 1, name: "Premium Bali Villa", description: "Well-optimized luxury listing", icon: "🏝️" },
  { id: 2, name: "Budget Apartment", description: "Needs significant improvements", icon: "🏢" },
  { id: 3, name: "Mid-range House", description: "Average optimization level", icon: "🏠" },
  { id: 4, name: "Luxury Rental", description: "Great photos but overpriced", icon: "🌃" },
  { id: 5, name: "Land Plot", description: "Minimal listing content", icon: "🌿" },
];

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'text-green-500 bg-green-500/10 border-green-500/30';
    case 'B': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    case 'C': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'D': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'F': return 'text-red-500 bg-red-500/10 border-red-500/30';
    default: return 'text-muted-foreground bg-muted';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'pricing': return DollarSign;
    case 'photos': return Camera;
    case 'description': return FileText;
    case 'timing': return Calendar;
    case 'features': return Home;
    default: return Lightbulb;
  }
};

interface ListingFormData {
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  location: string;
  city: string;
  amenities: string[];
  photoCount: number;
  hasVirtualTour: boolean;
  has3DModel: boolean;
  descriptionLength: number;
  descriptionQuality: 'poor' | 'average' | 'good' | 'excellent';
  titleLength: number;
  price: number;
  listingType: 'sale' | 'rent';
  marketAveragePrice: number;
}

const ListingSuccessPredictor = () => {
  const { isLoading, prediction, inputData, predictSuccess, loadExample, clearPrediction } = useListingSuccessPredictor();
  const [activeTab, setActiveTab] = useState("examples");
  
  const [formData, setFormData] = useState<ListingFormData>({
    propertyType: "House",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 150,
    location: "",
    city: "Jakarta",
    amenities: [],
    photoCount: 10,
    hasVirtualTour: false,
    has3DModel: false,
    descriptionLength: 300,
    descriptionQuality: "average",
    titleLength: 50,
    price: 2000000000,
    listingType: "sale",
    marketAveragePrice: 1800000000
  });

  const handleAnalyze = async () => {
    await predictSuccess(formData);
  };

  const handleLoadExample = async (exampleId: 1 | 2 | 3 | 4 | 5) => {
    await loadExample(exampleId);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            AI Listing Success Predictor
          </h2>
          <p className="text-muted-foreground mt-1">
            Analyze your listing's potential and get AI-powered recommendations
          </p>
        </div>
        {prediction && (
          <Button variant="outline" onClick={clearPrediction}>
            New Analysis
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Example Scenarios
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Custom Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="examples" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Try Example Scenarios</CardTitle>
                  <CardDescription>
                    See how different listing configurations affect success probability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {EXAMPLE_SCENARIOS.map((scenario) => (
                    <Button
                      key={scenario.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4"
                      onClick={() => handleLoadExample(scenario.id as 1 | 2 | 3 | 4 | 5)}
                      disabled={isLoading}
                    >
                      <span className="text-2xl mr-3">{scenario.icon}</span>
                      <div className="text-left">
                        <p className="font-medium">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground">{scenario.description}</p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {/* Property Attributes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Property Attributes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Property Type</Label>
                          <Select 
                            value={formData.propertyType}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, propertyType: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROPERTY_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Select 
                            value={formData.city}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, city: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CITIES.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Bedrooms</Label>
                          <Input 
                            type="number" 
                            value={formData.bedrooms}
                            onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bathrooms</Label>
                          <Input 
                            type="number" 
                            value={formData.bathrooms}
                            onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Area (m²)</Label>
                          <Input 
                            type="number" 
                            value={formData.areaSqm}
                            onChange={(e) => setFormData(prev => ({ ...prev, areaSqm: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Location/Area</Label>
                        <Input 
                          placeholder="e.g., Seminyak, BSD City, SCBD"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Amenities</Label>
                        <div className="flex flex-wrap gap-2">
                          {AMENITIES.map(amenity => (
                            <Badge
                              key={amenity}
                              variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleAmenity(amenity)}
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Listing Quality */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Listing Quality
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Photo Count</Label>
                          <span className="text-sm text-muted-foreground">{formData.photoCount} photos</span>
                        </div>
                        <Slider
                          value={[formData.photoCount]}
                          onValueChange={([v]) => setFormData(prev => ({ ...prev, photoCount: v }))}
                          max={50}
                          step={1}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Has Virtual Tour</Label>
                        <Switch
                          checked={formData.hasVirtualTour}
                          onCheckedChange={(v) => setFormData(prev => ({ ...prev, hasVirtualTour: v }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Has 3D Model</Label>
                        <Switch
                          checked={formData.has3DModel}
                          onCheckedChange={(v) => setFormData(prev => ({ ...prev, has3DModel: v }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description Quality</Label>
                        <Select 
                          value={formData.descriptionQuality}
                          onValueChange={(v: 'poor' | 'average' | 'good' | 'excellent') => 
                            setFormData(prev => ({ ...prev, descriptionQuality: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="poor">Poor</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="excellent">Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Description Length</Label>
                          <span className="text-sm text-muted-foreground">{formData.descriptionLength} chars</span>
                        </div>
                        <Slider
                          value={[formData.descriptionLength]}
                          onValueChange={([v]) => setFormData(prev => ({ ...prev, descriptionLength: v }))}
                          max={1500}
                          step={50}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pricing Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Listing Type</Label>
                          <Select 
                            value={formData.listingType}
                            onValueChange={(v: 'sale' | 'rent') => setFormData(prev => ({ ...prev, listingType: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sale">For Sale</SelectItem>
                              <SelectItem value="rent">For Rent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Your Price (IDR)</Label>
                          <Input 
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Market Average Price (IDR)</Label>
                        <Input 
                          type="number" 
                          value={formData.marketAveragePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, marketAveragePrice: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-5 w-5" />
                        Predict Success
                      </>
                    )}
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div>
                  <p className="font-medium">Analyzing Listing...</p>
                  <p className="text-sm text-muted-foreground">AI is evaluating all factors</p>
                </div>
              </div>
            </Card>
          ) : prediction ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {/* Score Card */}
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className={cn(
                          "text-5xl font-bold",
                          getScoreColor(prediction.successScore)
                        )}>
                          {prediction.successScore}
                        </div>
                        <p className="text-sm text-muted-foreground">Success Score</p>
                      </div>
                      
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center border-2 text-3xl font-bold",
                        getGradeColor(prediction.grade)
                      )}>
                        {prediction.grade}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-muted-foreground">
                          {prediction.confidenceInterval.low}-{prediction.confidenceInterval.high}
                        </div>
                        <p className="text-sm text-muted-foreground">Confidence Range</p>
                      </div>
                    </div>

                    <p className="text-sm text-center text-muted-foreground border-t pt-4">
                      {prediction.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Timeline Prediction */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Timeline Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{prediction.timelinePrediction.estimatedDays} days</p>
                        <p className="text-sm text-muted-foreground">Estimated time to close</p>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {prediction.timelinePrediction.range}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Strength Analysis */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      Strength Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(prediction.strengthAnalysis).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('Score', '').replace(/([A-Z])/g, ' $1')}</span>
                          <span className={getScoreColor(value)}>{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Top 3 Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {prediction.recommendations.slice(0, 3).map((rec, idx) => {
                      const Icon = getCategoryIcon(rec.category);
                      return (
                        <div key={idx} className="p-3 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{rec.priority}
                            </Badge>
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium capitalize">{rec.category}</span>
                          </div>
                          <p className="text-sm"><strong>Issue:</strong> {rec.issue}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <strong>Action:</strong> {rec.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Expected Impact:</strong> {rec.impact}
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Demographics & Risks */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Target Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {prediction.buyerDemographicFit.map((demo, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {demo}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {prediction.riskFactors.map((risk, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-orange-500 mt-0.5">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Competitive Position */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Competitive Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge 
                      variant={prediction.competitivePosition === 'above_average' ? 'default' : 
                               prediction.competitivePosition === 'average' ? 'secondary' : 'destructive'}
                    >
                      {prediction.competitivePosition.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4 p-6">
                <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="font-medium text-lg">Ready to Analyze</p>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                    Try an example scenario or enter your listing details to get AI-powered predictions
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingSuccessPredictor;
