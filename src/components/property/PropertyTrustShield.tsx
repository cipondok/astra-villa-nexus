import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ShieldCheck, Scale, Building2, Crown, BadgeCheck,
  Landmark, CreditCard, Leaf, UserCheck, CheckCircle2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PropertyTrustType } from "@/components/ui/VerificationBadge";

interface TrustFlags {
  id?: string;
  owner_type?: string;
  owner_verified?: boolean;
  agent_verified?: boolean;
  agency_verified?: boolean;
  ownership_verified?: boolean;
  developer_certified?: boolean;
  legal_checked?: boolean;
  premium_partner?: boolean;
}

interface Props {
  property: TrustFlags;
  className?: string;
}

const TRUST_ITEMS: {
  key: PropertyTrustType;
  label: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  check: (p: TrustFlags) => boolean;
}[] = [
  {
    key: "verified_ownership",
    label: "Verified Ownership",
    description: "Property ownership documents have been verified by our legal team",
    icon: ShieldCheck,
    colorClass: "text-chart-1",
    bgClass: "bg-chart-1/10 border-chart-1/20",
    check: (p) => !!p.ownership_verified,
  },
  {
    key: "developer_certified",
    label: "Developer Certified",
    description: "Property developed by a certified and registered developer",
    icon: Building2,
    colorClass: "text-chart-4",
    bgClass: "bg-chart-4/10 border-chart-4/20",
    check: (p) => !!p.developer_certified,
  },
  {
    key: "legal_checked",
    label: "Legal Checked",
    description: "Legal documents (SHM/HGB, IMB, permits) have been reviewed and cleared",
    icon: Scale,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10 border-sky-500/20",
    check: (p) => !!p.legal_checked,
  },
  {
    key: "premium_partner",
    label: "Premium Partner",
    description: "Listed by an exclusive Premium Partner with top trust rating",
    icon: Crown,
    colorClass: "text-gold-primary",
    bgClass: "bg-gold-primary/10 border-gold-primary/20",
    check: (p) => !!p.premium_partner,
  },
];

const DB_BADGE_MAP: Record<string, { label: string; icon: React.ElementType; colorClass: string; bgClass: string; description: string }> = {
  ownership_verified: { label: "Ownership Verified", icon: BadgeCheck, colorClass: "text-chart-1", bgClass: "bg-chart-1/10 border-chart-1/20", description: "Admin-verified ownership" },
  government_approved: { label: "Government Approved", icon: Landmark, colorClass: "text-chart-3", bgClass: "bg-chart-3/10 border-chart-3/20", description: "Government permits verified" },
  bank_partner: { label: "Bank Partner", icon: CreditCard, colorClass: "text-chart-4", bgClass: "bg-chart-4/10 border-chart-4/20", description: "Eligible for partner bank mortgages" },
  premium_listing: { label: "Premium Listing", icon: Crown, colorClass: "text-gold-primary", bgClass: "bg-gold-primary/10 border-gold-primary/20", description: "Enhanced premium listing" },
  eco_certified: { label: "Eco Certified", icon: Leaf, colorClass: "text-green-500", bgClass: "bg-green-500/10 border-green-500/20", description: "Meets sustainability standards" },
};

/**
 * A prominent trust shield section for property detail pages.
 * Shows all verified trust signals with visual emphasis.
 */
const PropertyTrustShield: React.FC<Props> = ({ property, className }) => {
  const { data: dbBadges = [] } = useQuery({
    queryKey: ["property-trust-shield", property.id],
    queryFn: async () => {
      if (!property.id) return [];
      const { data, error } = await supabase
        .from("property_verification_badges")
        .select("badge_type")
        .eq("property_id", property.id)
        .eq("is_active", true);
      if (error) return [];
      return (data || []).map((d: any) => d.badge_type as string);
    },
    enabled: !!property.id,
    staleTime: 5 * 60 * 1000,
  });

  // Collect static trust items
  const activeTrust = TRUST_ITEMS.filter((item) => item.check(property));
  const inactiveTrust = TRUST_ITEMS.filter((item) => !item.check(property));

  // Add owner/agent/agency verification
  const ownerBadges: typeof activeTrust = [];
  if (property.owner_type === "individual" && property.owner_verified) {
    ownerBadges.push({ key: "owner", label: "Verified Owner", description: "Owner identity verified", icon: UserCheck, colorClass: "text-primary", bgClass: "bg-primary/10 border-primary/20", check: () => true });
  }
  if (property.owner_type === "agent" && property.agent_verified) {
    ownerBadges.push({ key: "agent", label: "Verified Agent", description: "Licensed agent with verified credentials", icon: UserCheck, colorClass: "text-chart-1", bgClass: "bg-chart-1/10 border-chart-1/20", check: () => true });
  }
  if (property.owner_type === "agency" && property.agency_verified) {
    ownerBadges.push({ key: "agency", label: "Verified Agency", description: "Registered agency with verified profile", icon: Building2, colorClass: "text-chart-5", bgClass: "bg-chart-5/10 border-chart-5/20", check: () => true });
  }

  // Collect DB-driven badges not already in static
  const staticKeys = new Set(TRUST_ITEMS.map((t) => t.key));
  const extraDbBadges = dbBadges
    .filter((bt) => !staticKeys.has(bt as PropertyTrustType) && DB_BADGE_MAP[bt])
    .map((bt) => {
      const cfg = DB_BADGE_MAP[bt];
      return { key: bt as PropertyTrustType, ...cfg, check: () => true as boolean };
    });

  const allActive = [...ownerBadges, ...activeTrust, ...extraDbBadges];
  const trustScore = Math.round(
    (allActive.length / Math.max(1, allActive.length + inactiveTrust.length)) * 100
  );

  if (allActive.length === 0 && inactiveTrust.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-border/60 bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-chart-1/10">
            <ShieldCheck className="h-4 w-4 text-chart-1" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Trust & Verification</h3>
            <p className="text-[10px] text-muted-foreground">Verified trust signals for this property</p>
          </div>
        </div>
        {allActive.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="relative h-8 w-8">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  className="stroke-chart-1"
                  strokeWidth="3"
                  strokeDasharray={`${trustScore * 0.942} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">
                {trustScore}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Trust<br/>Score</span>
          </div>
        )}
      </div>

      {/* Active badges */}
      <div className="p-3 space-y-2">
        {allActive.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {allActive.map((item) => {
              const Icon = item.icon;
              return (
                <TooltipProvider key={item.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors cursor-default",
                        item.bgClass
                      )}>
                        <Icon className={cn("h-4 w-4 flex-shrink-0", item.colorClass)} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.label}</p>
                        </div>
                        <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 ml-auto flex-shrink-0" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px]">
                      <p className="text-xs">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}

        {/* Pending / not-yet-verified (dimmed) */}
        {inactiveTrust.length > 0 && allActive.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/30">
            {inactiveTrust.map((item) => {
              const Icon = item.icon;
              return (
                <TooltipProvider key={item.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 rounded-md border border-border/40 bg-muted/20 px-2 py-1 opacity-50 cursor-default">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Not yet verified</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {allActive.length === 0 && (
          <div className="text-center py-4">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No verification badges yet</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">Verification builds buyer trust</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyTrustShield;
