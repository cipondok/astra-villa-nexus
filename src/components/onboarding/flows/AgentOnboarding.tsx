import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Award,
  ChevronRight, 
  ChevronLeft,
  Trophy,
  Shield,
  TrendingUp
} from "lucide-react";

interface OnboardingFlowProps {
  step: number;
  formData: Record<string, any>;
  updateFormData: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
}

const AgentOnboarding = ({ 
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Join 500+ Verified Agents</h3>
              <p className="text-sm text-muted-foreground">Set up your agent profile</p>
            </div>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
              <CardContent className="p-3 flex items-start gap-2">
                <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Verified agents get <strong>5x more client inquiries</strong>
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Your professional name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Agency (Optional)</Label>
                <Input
                  value={formData.agency || ""}
                  onChange={(e) => updateFormData("agency", e.target.value)}
                  placeholder="Company name if applicable"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">License Number (Optional)</Label>
                <Input
                  value={formData.license || ""}
                  onChange={(e) => updateFormData("license", e.target.value)}
                  placeholder="For verification badge"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Specialization</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["Residential", "Commercial", "Land"].map((spec) => (
                    <div key={spec} className="flex items-center space-x-1">
                      <Checkbox
                        id={spec}
                        checked={(formData.specialization || []).includes(spec)}
                        onCheckedChange={(checked) => {
                          const current = formData.specialization || [];
                          if (checked) {
                            updateFormData("specialization", [...current, spec]);
                          } else {
                            updateFormData("specialization", current.filter((s: string) => s !== spec));
                          }
                        }}
                      />
                      <label htmlFor={spec} className="text-xs">{spec}</label>
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
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Build Your Profile</h3>
              <p className="text-sm text-muted-foreground">Stand out to potential clients</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Bio (50 words max)</Label>
                <Textarea
                  value={formData.bio || ""}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  placeholder="Describe your expertise and experience..."
                  className="mt-1 min-h-[80px]"
                  maxLength={300}
                />
              </div>

              <div>
                <Label className="text-xs">Years of Experience</Label>
                <Select 
                  value={formData.experience || ""} 
                  onValueChange={(v) => updateFormData("experience", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Coverage Areas</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Jakarta", "Bali", "Surabaya", "Bandung"].map((area) => (
                    <div key={area} className="flex items-center space-x-1">
                      <Checkbox
                        id={area}
                        checked={(formData.areas || []).includes(area)}
                        onCheckedChange={(checked) => {
                          const current = formData.areas || [];
                          if (checked) {
                            updateFormData("areas", [...current, area]);
                          } else {
                            updateFormData("areas", current.filter((a: string) => a !== area));
                          }
                        }}
                      />
                      <label htmlFor={area} className="text-xs">{area}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Welcome to Agent Central!</h3>
              <p className="text-sm text-muted-foreground">Your agent dashboard is ready</p>
            </div>

            {/* Agent Stats Preview */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Your Agent Stats</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Current Rank</div>
                    <div className="text-sm font-bold">New Agent</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">To Gold Tier</div>
                    <div className="text-sm font-bold">2 sales</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Commission Rate</div>
                    <div className="text-sm font-bold">2%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <div className="text-[10px] text-muted-foreground">Status</div>
                    <div className="text-sm font-bold text-emerald-600">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* First Action */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold">🎯 First Action</p>
                  <p className="text-xs text-muted-foreground">
                    Add your first listing via Quick Add to start earning!
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-purple-100 text-purple-700">+100 ASTRA</Badge>
              <Badge className="bg-emerald-100 text-emerald-700">1 Free Featured</Badge>
              <Badge className="bg-blue-100 text-blue-700">Verified Badge</Badge>
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
        return formData.name;
      case 1:
        return true; // Optional step
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
          className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600"
        >
          {step === 2 ? "Complete Setup" : step === 1 ? "Skip / Continue" : "Continue"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default AgentOnboarding;
