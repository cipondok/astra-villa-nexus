import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Shield,
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

const LandlordOnboarding = ({ 
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Find Quality Tenants Faster</h3>
              <p className="text-sm text-muted-foreground">Set up your landlord profile</p>
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
                <Label className="text-xs">Contact Number</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Properties to Rent</Label>
                <Select 
                  value={formData.propertyCount || ""} 
                  onValueChange={(v) => updateFormData("propertyCount", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How many?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 property</SelectItem>
                    <SelectItem value="2-5">2-5 properties</SelectItem>
                    <SelectItem value="5+">5+ properties</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Preferred Rental Type</Label>
                <Select 
                  value={formData.rentalType || ""} 
                  onValueChange={(v) => updateFormData("rentalType", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Add Your First Rental</h3>
              <p className="text-sm text-muted-foreground">List your property for rent</p>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-3 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Add availability dates to get <strong>3x more inquiries</strong>
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Property Title</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="e.g., Cozy 2BR Apartment in Menteng"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Monthly Rent (IDR)</Label>
                <Input
                  type="number"
                  value={formData.rent || ""}
                  onChange={(e) => updateFormData("rent", e.target.value)}
                  placeholder="15,000,000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Key Features</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Furnished", "AC", "Parking", "Security"].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={(formData.features || []).includes(feature)}
                        onCheckedChange={(checked) => {
                          const current = formData.features || [];
                          if (checked) {
                            updateFormData("features", [...current, feature]);
                          } else {
                            updateFormData("features", current.filter((f: string) => f !== feature));
                          }
                        }}
                      />
                      <label htmlFor={feature} className="text-xs">{feature}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Upload Photos</Label>
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Tenant Matching Ready!</h3>
              <p className="text-sm text-muted-foreground">Active renters looking for properties like yours</p>
            </div>

            {/* Tenant Matches */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Potential Tenants Nearby</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Active Renters</div>
                    <div className="text-sm font-bold">15 people</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Budget Match</div>
                    <div className="text-sm font-bold">12 renters</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Preferences */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold">Set Tenant Preferences</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Students OK", "Families", "Professionals"].map((pref) => (
                    <div key={pref} className="flex items-center space-x-1">
                      <Checkbox
                        id={pref}
                        checked={(formData.tenantPrefs || []).includes(pref)}
                        onCheckedChange={(checked) => {
                          const current = formData.tenantPrefs || [];
                          if (checked) {
                            updateFormData("tenantPrefs", [...current, pref]);
                          } else {
                            updateFormData("tenantPrefs", current.filter((p: string) => p !== pref));
                          }
                        }}
                      />
                      <label htmlFor={pref} className="text-[10px]">{pref}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700">+50 ASTRA</Badge>
              <span className="text-xs text-muted-foreground">+ Tenant Screening Tool</span>
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
        return formData.name && formData.phone;
      case 1:
        return formData.title && formData.rent;
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
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600"
        >
          {step === 2 ? "Complete Setup" : "Continue"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default LandlordOnboarding;
