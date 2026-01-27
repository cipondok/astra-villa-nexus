import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Key, 
  Home,
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Zap,
  Bell,
  Heart,
  Flame
} from "lucide-react";

interface OnboardingFlowProps {
  step: number;
  formData: Record<string, any>;
  updateFormData: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
}

const RenterOnboarding = ({ 
  step, 
  formData, 
  updateFormData, 
  nextStep, 
  prevStep,
  onComplete 
}: OnboardingFlowProps) => {
  const [budgetRange, setBudgetRange] = useState([formData.budgetMin || 5, formData.budgetMax || 25]);

  const handleBudgetChange = (values: number[]) => {
    setBudgetRange(values);
    updateFormData("budgetMin", values[0]);
    updateFormData("budgetMax", values[1]);
  };

  const formatBudget = (value: number) => `Rp ${value}M`;
  
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Find Your Perfect Rental</h3>
              <p className="text-sm text-muted-foreground">Set your rental preferences</p>
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">
                  Monthly Budget: {formatBudget(budgetRange[0])} - {formatBudget(budgetRange[1])}
                </Label>
                <Slider
                  value={budgetRange}
                  onValueChange={handleBudgetChange}
                  min={2}
                  max={50}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-xs">Move-in Timeline</Label>
                <Select 
                  value={formData.moveIn || ""} 
                  onValueChange={(v) => updateFormData("moveIn", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="When do you need it?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="1month">Within 1 month</SelectItem>
                    <SelectItem value="3months">Within 3 months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Rental Period</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["Monthly", "6 Months", "Yearly"].map((period) => (
                    <div key={period} className="flex items-center space-x-1">
                      <Checkbox
                        id={period}
                        checked={(formData.rentalPeriods || []).includes(period)}
                        onCheckedChange={(checked) => {
                          const current = formData.rentalPeriods || [];
                          if (checked) {
                            updateFormData("rentalPeriods", [...current, period]);
                          } else {
                            updateFormData("rentalPeriods", current.filter((p: string) => p !== period));
                          }
                        }}
                      />
                      <label htmlFor={period} className="text-[10px]">{period}</label>
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">18 Rentals Available!</h3>
              <p className="text-sm text-muted-foreground">Here are some matches</p>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-orange-700 dark:text-orange-300">
                3 new listings in the last 24 hours!
              </span>
            </div>

            {/* Sample Rental Cards */}
            <div className="space-y-2">
              {[
                { title: "Studio in Sudirman", price: "Rp 8M/mo", features: ["Furnished", "AC"] },
                { title: "2BR Apartment in BSD", price: "Rp 12M/mo", features: ["Parking", "Pool"] },
                { title: "Cozy Room in Menteng", price: "Rp 6M/mo", features: ["Near MRT"] }
              ].map((prop, i) => (
                <Card key={i} className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prop.title}</p>
                      <div className="flex gap-1 mt-0.5">
                        {prop.features.map(f => (
                          <Badge key={f} variant="secondary" className="text-[8px] px-1 py-0">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{prop.price}</p>
                      <Heart className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div>
              <Label className="text-xs">Quick Filters</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {["Furnished", "Near MRT", "Pet-friendly", "Parking"].map((filter) => (
                  <Badge 
                    key={filter}
                    variant={(formData.filters || []).includes(filter) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => {
                      const current = formData.filters || [];
                      if (current.includes(filter)) {
                        updateFormData("filters", current.filter((f: string) => f !== filter));
                      } else {
                        updateFormData("filters", [...current, filter]);
                      }
                    }}
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Ready to Find Your Rental!</h3>
              <p className="text-sm text-muted-foreground">Here's what you've unlocked</p>
            </div>

            {/* Quick Apply Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Quick Apply Feature</p>
                    <p className="text-xs text-muted-foreground">
                      Create your renter profile once, apply to multiple properties instantly!
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      Create Profile →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Action */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">First Action</p>
                    <p className="text-xs text-muted-foreground">
                      Save 1 rental or Contact a landlord
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-pink-100 text-pink-700">+25 ASTRA</Badge>
              <Badge className="bg-blue-100 text-blue-700">Priority Viewing</Badge>
              <Badge className="bg-purple-100 text-purple-700">Quick Apply</Badge>
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
          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600"
        >
          {step === 0 ? "Find Rentals" : step === 2 ? "Complete Setup" : "Continue"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default RenterOnboarding;
