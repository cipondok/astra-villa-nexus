import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Home, Building2, UserCheck, ArrowRight, ArrowLeft,
  CheckCircle, MapPin, Phone, User, Briefcase, Shield, Sparkles, SkipForward
} from "lucide-react";

const roles = [
  { id: "buyer", label: "Buyer", desc: "Find your dream property", icon: Home, color: "text-primary" },
  { id: "seller", label: "Seller", desc: "List & sell your property", icon: Building2, color: "text-chart-1" },
  { id: "agent", label: "Agent", desc: "Grow your real estate business", icon: Briefcase, color: "text-chart-2" },
];

const budgetRanges = ["< Rp 500M", "Rp 500M – 1B", "Rp 1B – 3B", "Rp 3B – 5B", "> Rp 5B"];
const propTypes = ["House", "Apartment", "Villa", "Land", "Commercial"];
const districts = ["Seminyak", "Canggu", "Ubud", "Kuta", "Denpasar", "Nusa Dua", "Sanur", "Jimbaran"];

const steps = ["Role", "Profile", "Preferences", "Complete"];

const conversionMetrics = {
  totalStarts: 1248, completionRate: 72, avgTimeToComplete: "1m 42s",
  dropoffStep: "Profile", roleDistribution: { buyer: 58, seller: 24, agent: 18 },
};

const UserOnboardingFlowUI: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [profile, setProfile] = useState({ name: "", phone: "", location: "" });
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const toggleType = (t: string) => setSelectedTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleDistrict = (d: string) => setSelectedDistricts(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const canNext = currentStep === 0 ? !!selectedRole
    : currentStep === 1 ? profile.name.length > 0
    : true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Onboarding Flow
          </h2>
          <p className="text-sm text-muted-foreground mt-1">High-conversion sign-up experience</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">
          {conversionMetrics.completionRate}% Completion Rate
        </Badge>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Total Starts", value: conversionMetrics.totalStarts.toLocaleString() },
          { label: "Completion", value: `${conversionMetrics.completionRate}%` },
          { label: "Avg Time", value: conversionMetrics.avgTimeToComplete },
          { label: "Drop-off", value: `Step: ${conversionMetrics.dropoffStep}` },
          { label: "Buyers", value: `${conversionMetrics.roleDistribution.buyer}%` },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2.5 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step Progress */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-1 mb-3">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  i <= currentStep ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {i < currentStep ? <CheckCircle className="h-3 w-3" /> : <span className="w-3 text-center">{i + 1}</span>}
                  {s}
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${i < currentStep ? "bg-primary" : "bg-border"}`} />}
              </React.Fragment>
            ))}
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-border/50 min-h-[300px]">
        <CardContent className="p-5">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-foreground">Welcome to ASTRA</h3>
                  <p className="text-xs text-muted-foreground">Choose how you want to use the platform</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {roles.map((r) => (
                    <Card key={r.id} onClick={() => setSelectedRole(r.id)}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedRole === r.id ? "border-primary ring-1 ring-primary/20" : "border-border/50"}`}>
                      <CardContent className="p-4 text-center">
                        <r.icon className={`h-8 w-8 mx-auto mb-2 ${r.color}`} />
                        <div className="text-sm font-bold text-foreground">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{r.desc}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Your information is secure and private
                </p>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 max-w-md mx-auto">
                <div className="text-center mb-4">
                  <UserCheck className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-bold text-foreground">Set Up Your Profile</h3>
                  <p className="text-[10px] text-muted-foreground">Just the basics — takes 30 seconds</p>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Full name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="pl-10" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Phone number" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="pl-10" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Your city" value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className="pl-10" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="prefs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="text-center mb-3">
                  <Sparkles className="h-8 w-8 mx-auto text-chart-1 mb-2" />
                  <h3 className="text-lg font-bold text-foreground">Your Preferences</h3>
                  <p className="text-[10px] text-muted-foreground">Help us show you relevant properties</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">Budget Range</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {budgetRanges.map(b => (
                      <Badge key={b} variant={selectedBudget === b ? "default" : "secondary"} onClick={() => setSelectedBudget(b)}
                        className="cursor-pointer text-[10px]">{b}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">Property Types</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {propTypes.map(t => (
                      <Badge key={t} variant={selectedTypes.includes(t) ? "default" : "secondary"} onClick={() => toggleType(t)}
                        className="cursor-pointer text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">Preferred Districts</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {districts.map(d => (
                      <Badge key={d} variant={selectedDistricts.includes(d) ? "default" : "secondary"} onClick={() => toggleDistrict(d)}
                        className="cursor-pointer text-[10px]">{d}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <CheckCircle className="h-16 w-16 mx-auto text-chart-1 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">You're All Set!</h3>
                <p className="text-sm text-muted-foreground mb-4">Welcome to ASTRA — your property journey starts now</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm">Explore Properties</Button>
                  <Button size="sm" variant="outline">Complete Profile Later</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && currentStep < 3 && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="text-muted-foreground">
                <SkipForward className="h-3.5 w-3.5 mr-1" /> Skip
              </Button>
            )}
            <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} disabled={!canNext}>
              {currentStep === 2 ? "Complete" : "Continue"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOnboardingFlowUI;
