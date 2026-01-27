import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Home,
  ChevronRight, 
  ChevronLeft,
  Bot,
  Heart,
  Calculator,
  Sparkles
} from "lucide-react";

interface OnboardingFlowProps {
  step: number;
  formData: Record<string, any>;
  updateFormData: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
}

const BuyerOnboarding = ({ 
  step, 
  formData, 
  updateFormData, 
  nextStep, 
  prevStep,
  onComplete 
}: OnboardingFlowProps) => {
  const [budgetRange, setBudgetRange] = useState([formData.budgetMin || 500, formData.budgetMax || 5000]);

  const handleBudgetChange = (values: number[]) => {
    setBudgetRange(values);
    updateFormData("budgetMin", values[0]);
    updateFormData("budgetMax", values[1]);
  };

  const formatBudget = (value: number) => {
    if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(1)}B`;
    }
    return `Rp ${value}M`;
  };
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Find Your Dream Home</h3>
              <p className="text-sm text-muted-foreground">Tell us what you're looking for</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Looking In</Label>
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
                    <SelectItem value="anywhere">Anywhere in Indonesia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">
                  Budget: {formatBudget(budgetRange[0])} - {formatBudget(budgetRange[1])}
                </Label>
                <Slider
                  value={budgetRange}
                  onValueChange={handleBudgetChange}
                  min={100}
                  max={10000}
                  step={100}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-xs">Property Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["House", "Apartment", "Villa", "Land"].map((type) => (
                    <div key={type} className="flex items-center space-x-1">
                      <Checkbox
                        id={type}
                        checked={(formData.propertyTypes || []).includes(type)}
                        onCheckedChange={(checked) => {
                          const current = formData.propertyTypes || [];
                          if (checked) {
                            updateFormData("propertyTypes", [...current, type]);
                          } else {
                            updateFormData("propertyTypes", current.filter((t: string) => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={type} className="text-xs">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">23 Properties Match!</h3>
              <p className="text-sm text-muted-foreground">Based on your preferences</p>
            </div>

            {/* Sample Property Cards */}
            <div className="space-y-2">
              {[
                { title: "Modern Villa in Seminyak", price: "Rp 3.5B", beds: 4 },
                { title: "Cozy Apartment in Menteng", price: "Rp 1.2B", beds: 2 },
                { title: "Family Home in Kemang", price: "Rp 4.8B", beds: 5 }
              ].map((prop, i) => (
                <Card key={i} className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prop.title}</p>
                      <p className="text-xs text-muted-foreground">{prop.beds} bedrooms</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{prop.price}</p>
                      <Heart className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="saveSearch"
                checked={formData.saveSearch}
                onCheckedChange={(checked) => updateFormData("saveSearch", checked)}
              />
              <label htmlFor="saveSearch" className="text-xs">Save this search for alerts</label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">You're Ready to Find Your Home!</h3>
              <p className="text-sm text-muted-foreground">Here's what you've unlocked</p>
            </div>

            {/* AI Assistant Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">AI Property Assistant</p>
                    <p className="text-xs text-muted-foreground">
                      "I can help you find properties matching your exact needs!"
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      Chat with AI →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Action */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">First Action</p>
                    <p className="text-xs text-muted-foreground">
                      Save 1 property or Book a survey
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-orange-100 text-orange-700">+25 ASTRA</Badge>
              <Badge className="bg-blue-100 text-blue-700">KPR Calculator</Badge>
              <Badge className="bg-purple-100 text-purple-700">AI Assistant</Badge>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.location;
      case 1:
        return true;
      case 2:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-4">
      {renderStep()}

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
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600"
        >
          {step === 0 ? "Show Properties" : step === 2 ? "Complete Setup" : "Continue"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default BuyerOnboarding;
