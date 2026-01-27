import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Home, 
  MapPin, 
  Camera, 
  DollarSign,
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Share2,
  Lightbulb
} from "lucide-react";
import SimpleImageUpload from "@/components/property/SimpleImageUpload";

interface OnboardingFlowProps {
  step: number;
  formData: Record<string, any>;
  updateFormData: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
}

const HomeownerOnboarding = ({ 
  step, 
  formData, 
  updateFormData, 
  nextStep, 
  prevStep,
  onComplete 
}: OnboardingFlowProps) => {
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Let's Get Your Property Sold!</h3>
              <p className="text-sm text-muted-foreground">Quick profile setup - takes 30 seconds</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Your Name</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">WhatsApp Number</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Property Location</Label>
                <Select 
                  value={formData.location || ""} 
                  onValueChange={(v) => updateFormData("location", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jakarta">Jakarta</SelectItem>
                    <SelectItem value="bali">Bali</SelectItem>
                    <SelectItem value="surabaya">Surabaya</SelectItem>
                    <SelectItem value="bandung">Bandung</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Add Your Property</h3>
              <p className="text-sm text-muted-foreground">60-second quick listing</p>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-3 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Properties with photos get <strong>10x more views</strong>
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Property Title</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="e.g., Beautiful 3BR House in Kemang"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Property Type</Label>
                <Select 
                  value={formData.propertyType || ""} 
                  onValueChange={(v) => updateFormData("propertyType", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Asking Price (IDR)</Label>
                <Input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  placeholder="2,500,000,000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Upload Photos (1-3)</Label>
                <div className="mt-1">
                  <SimpleImageUpload
                    images={formData.images || []}
                    onImagesChange={(images) => updateFormData("images", images)}
                    maxImages={3}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Your Property is Ready!</h3>
              <p className="text-sm text-muted-foreground">Here's your instant market analysis</p>
            </div>

            {/* Market Analysis Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Market Analysis</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Avg. Price/m²</div>
                    <div className="text-sm font-bold">Rp 15-20M</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Similar Listings</div>
                    <div className="text-sm font-bold">23 active</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Est. Time to Sell</div>
                    <div className="text-sm font-bold">45-60 days</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Demand Level</div>
                    <div className="text-sm font-bold text-emerald-600">High</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Action */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Share on WhatsApp</div>
                    <div className="text-xs text-muted-foreground">
                      Complete this to unlock your Featured boost!
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">+50 ASTRA</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.name && formData.phone;
      case 1:
        return formData.title && formData.propertyType;
      case 2:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-4">
      {renderStep()}

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button variant="outline" onClick={prevStep} className="flex-1">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <Button 
          onClick={step === 2 ? onComplete : nextStep} 
          disabled={!canProceed()}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600"
        >
          {step === 2 ? "Complete Setup" : "Continue"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default HomeownerOnboarding;
