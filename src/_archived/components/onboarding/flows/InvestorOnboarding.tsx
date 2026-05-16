import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrencyFormatterShort } from "@/stores/currencyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles,
  MapPin,
  TrendingUp,
  Heart,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Brain,
  BarChart3,
  Zap,
  Target,
  Star,
  Shield,
  Home,
  Building2,
  Palmtree,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  step: number;
  formData: Record<string, any>;
  updateFormData: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
}

// ─── City Data ───

const CITIES = [
  { id: "jakarta", label: "Jakarta", growth: "+12%", icon: Building2 },
  { id: "bali", label: "Bali", growth: "+18%", icon: Palmtree },
  { id: "surabaya", label: "Surabaya", growth: "+9%", icon: Building2 },
  { id: "bandung", label: "Bandung", growth: "+11%", icon: MapPin },
  { id: "yogyakarta", label: "Yogyakarta", growth: "+14%", icon: MapPin },
  { id: "makassar", label: "Makassar", growth: "+8%", icon: MapPin },
];

const PROPERTY_TYPES = [
  { id: "villa", label: "Villa", icon: Palmtree },
  { id: "apartment", label: "Apartment", icon: Building2 },
  { id: "house", label: "House", icon: Home },
  { id: "land", label: "Land", icon: MapPin },
];

// ─── Elite Showcase Data ───

const ELITE_LISTINGS = [
  {
    title: "Oceanfront Villa Seminyak",
    city: "Bali",
    price: 8_500_000_000,
    yield: "9.2%",
    score: 92,
    type: "Villa",
    img: "🏝️",
  },
  {
    title: "Sky Penthouse Sudirman",
    city: "Jakarta",
    price: 12_000_000_000,
    yield: "7.8%",
    score: 88,
    type: "Apartment",
    img: "🏙️",
  },
  {
    title: "Heritage Estate Ubud",
    city: "Bali",
    price: 5_200_000_000,
    yield: "11.4%",
    score: 95,
    type: "Villa",
    img: "🌿",
  },
];

// ─── Step Components ───

const WelcomeStep = () => (
  <div className="space-y-5 text-center">
    {/* Hero icon */}
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg shadow-primary/20">
        <Brain className="h-8 w-8 text-primary-foreground" />
      </div>
    </motion.div>

    {/* Title */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-2"
    >
      <h2 className="text-xl font-bold text-foreground">
        Discover Smarter Investments
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed px-2">
        ASTRA Villa's AI engine analyzes thousands of properties to surface
        <span className="text-primary font-semibold"> elite opportunities </span>
        matched to your investment profile.
      </p>
    </motion.div>

    {/* Value props */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 gap-2"
    >
      {[
        {
          icon: Target,
          title: "AI-Matched Deals",
          desc: "Properties scored & ranked for your goals",
          color: "text-primary bg-primary/10",
        },
        {
          icon: TrendingUp,
          title: "Market Intelligence",
          desc: "Real-time yield & growth predictions",
          color: "text-chart-2 bg-chart-2/10",
        },
        {
          icon: Zap,
          title: "Instant Alerts",
          desc: "Price drops & elite deals pushed to you",
          color: "text-chart-4 bg-chart-4/10",
        },
      ].map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.08 }}
        >
          <Card className="border-border/30 hover:border-primary/20 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", item.color)}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const PreferenceStep = ({
  formData,
  updateFormData,
}: {
  formData: Record<string, any>;
  updateFormData: (f: string, v: any) => void;
}) => {
  const selectedCities: string[] = formData.preferredCities || [];
  const selectedTypes: string[] = formData.propertyTypes || [];
  const [budgetRange, setBudgetRange] = useState([
    formData.budgetMin || 1000,
    formData.budgetMax || 10000,
  ]);

  const toggleCity = (id: string) => {
    const next = selectedCities.includes(id)
      ? selectedCities.filter((c) => c !== id)
      : [...selectedCities, id];
    updateFormData("preferredCities", next);
  };

  const toggleType = (id: string) => {
    const next = selectedTypes.includes(id)
      ? selectedTypes.filter((t) => t !== id)
      : [...selectedTypes, id];
    updateFormData("propertyTypes", next);
  };

  const handleBudgetChange = (values: number[]) => {
    setBudgetRange(values);
    updateFormData("budgetMin", values[0]);
    updateFormData("budgetMax", values[1]);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-chart-4 to-chart-4/60 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Set Your Investment DNA</h3>
        <p className="text-xs text-muted-foreground">We'll tune recommendations to your profile</p>
      </div>

      {/* Cities */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Preferred Cities</p>
        <div className="grid grid-cols-3 gap-1.5">
          {CITIES.map((city) => {
            const active = selectedCities.includes(city.id);
            const Icon = city.icon;
            return (
              <button
                key={city.id}
                onClick={() => toggleCity(city.id)}
                className={cn(
                  "rounded-lg p-2 border text-center transition-all duration-150",
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/40 hover:border-primary/30 bg-card"
                )}
              >
                <Icon className={cn("h-4 w-4 mx-auto mb-0.5", active ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("text-[10px] font-medium", active ? "text-primary" : "text-foreground")}>{city.label}</p>
                <p className="text-[8px] text-chart-2 font-semibold">{city.growth}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Types */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Property Types</p>
        <div className="grid grid-cols-4 gap-1.5">
          {PROPERTY_TYPES.map((type) => {
            const active = selectedTypes.includes(type.id);
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={cn(
                  "rounded-lg p-2 border text-center transition-all duration-150",
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/40 hover:border-primary/30 bg-card"
                )}
              >
                <Icon className={cn("h-4 w-4 mx-auto mb-0.5", active ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("text-[10px] font-medium", active ? "text-primary" : "text-foreground")}>{type.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-1">
          Budget Range:{" "}
          <span className="text-primary font-bold">
            {getCurrencyFormatterShort()(budgetRange[0] * 1_000_000)} – {getCurrencyFormatterShort()(budgetRange[1] * 1_000_000)}
          </span>
        </p>
        <Slider
          value={budgetRange}
          onValueChange={handleBudgetChange}
          min={500}
          max={50000}
          step={500}
          className="mt-2"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>{getCurrencyFormatterShort()(500_000_000)}</span>
          <span>{getCurrencyFormatterShort()(50_000_000_000)}</span>
        </div>
      </div>
    </div>
  );
};

const EliteShowcaseStep = () => (
  <div className="space-y-4">
    <div className="text-center space-y-1">
      <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-chart-2 to-chart-2/60 flex items-center justify-center">
        <Star className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Elite Opportunities</h3>
      <p className="text-xs text-muted-foreground">
        AI-curated properties with the highest investment potential
      </p>
    </div>

    <div className="space-y-2">
      {ELITE_LISTINGS.map((listing, i) => (
        <motion.div
          key={listing.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/30 hover:border-chart-2/30 transition-all group cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {/* Emoji placeholder */}
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                  {listing.img}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{listing.title}</p>
                    {/* Score ring */}
                    <div className="relative w-8 h-8 shrink-0">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="3" />
                        <circle
                          cx="16" cy="16" r="13" fill="none"
                          stroke="currentColor"
                          className="text-chart-2"
                          strokeWidth="3"
                          strokeDasharray={`${(listing.score / 100) * 81.68} 81.68`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-chart-2">
                        {listing.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{listing.city}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{listing.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-bold text-foreground">
                      {getCurrencyFormatterShort()(listing.price)}
                    </span>
                    <Badge className="text-[8px] px-1.5 py-0 bg-chart-2/10 text-chart-2 border-0">
                      <TrendingUp className="h-2 w-2 mr-0.5" />
                      {listing.yield} yield
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
      <Shield className="h-3 w-3" />
      <span>Scored by ASTRA AI Opportunity Engine</span>
    </div>
  </div>
);

const ActivationStep = () => (
  <div className="space-y-5 text-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
        <Sparkles className="h-8 w-8 text-primary-foreground" />
      </div>
    </motion.div>

    <div className="space-y-2">
      <h3 className="text-xl font-bold text-foreground">You're Ready to Invest Smarter</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Take your first action to activate your personalized AI feed
      </p>
    </div>

    {/* Action cards */}
    <div className="space-y-2">
      {[
        {
          icon: Heart,
          title: "Save to Watchlist",
          desc: "Bookmark a property to start tracking its performance",
          badge: "Recommended",
          color: "text-chart-1 bg-chart-1/10",
          badgeColor: "bg-chart-1/10 text-chart-1",
        },
        {
          icon: MessageSquare,
          title: "Send an Inquiry",
          desc: "Contact an agent about a property that interests you",
          badge: "Popular",
          color: "text-chart-4 bg-chart-4/10",
          badgeColor: "bg-chart-4/10 text-chart-4",
        },
        {
          icon: TrendingUp,
          title: "View AI Insights",
          desc: "Open investment analytics on any property listing",
          badge: "Quick Win",
          color: "text-chart-2 bg-chart-2/10",
          badgeColor: "bg-chart-2/10 text-chart-2",
        },
      ].map((action, i) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.08 }}
        >
          <Card className="border-border/30 hover:border-primary/20 transition-colors text-left">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-foreground">{action.title}</p>
                  <Badge className={cn("text-[7px] px-1 py-0 border-0", action.badgeColor)}>
                    {action.badge}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Reward teaser */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex items-center justify-center gap-2 flex-wrap"
    >
      <Badge className="bg-primary/10 text-primary border-0 text-[10px]">🎁 50 ASTRA Tokens</Badge>
      <Badge className="bg-chart-2/10 text-chart-2 border-0 text-[10px]">📊 AI Portfolio</Badge>
      <Badge className="bg-chart-4/10 text-chart-4 border-0 text-[10px]">⚡ Smart Alerts</Badge>
    </motion.div>
  </div>
);

// ─── Main Component ───

const InvestorOnboarding = ({
  step,
  formData,
  updateFormData,
  nextStep,
  prevStep,
  onComplete,
}: OnboardingFlowProps) => {
  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <PreferenceStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <EliteShowcaseStep />;
      case 3:
        return <ActivationStep />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return (formData.preferredCities?.length > 0) || (formData.propertyTypes?.length > 0);
    }
    return true;
  };

  const stepLabels = ["Welcome", "Preferences", "Elite Deals", "Get Started"];

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
          onClick={step === 3 ? onComplete : nextStep}
          disabled={!canProceed()}
          className="flex-1 bg-gradient-to-r from-primary to-primary/80"
        >
          {step === 0
            ? "Let's Begin"
            : step === 3
            ? "Start Exploring"
            : stepLabels[step + 1] || "Next"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default InvestorOnboarding;
