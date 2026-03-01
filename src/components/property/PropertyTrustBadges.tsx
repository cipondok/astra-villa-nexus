import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VerificationBadge, { type PropertyTrustType } from "@/components/ui/VerificationBadge";
import { cn } from "@/lib/utils";

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

interface PropertyTrustBadgesProps {
  property: TrustFlags;
  size?: "sm" | "md" | "lg";
  className?: string;
  maxBadges?: number;
}

/**
 * Renders all applicable trust badges for a property.
 * Combines static property flags with database-driven verification badges.
 */
const PropertyTrustBadges: React.FC<PropertyTrustBadgesProps> = ({
  property,
  size = "sm",
  className,
  maxBadges = 6,
}) => {
  // Fetch database-driven badges if property has an id
  const { data: dbBadges = [] } = useQuery({
    queryKey: ["property-badges", property.id],
    queryFn: async () => {
      if (!property.id) return [];
      const { data, error } = await supabase
        .from("property_verification_badges")
        .select("badge_type")
        .eq("property_id", property.id)
        .eq("is_active", true);
      if (error) return [];
      return (data || []).map((d: any) => d.badge_type as PropertyTrustType);
    },
    enabled: !!property.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Static flag-based badges
  const staticBadges: { type: PropertyTrustType; show: boolean }[] = [
    { type: "owner", show: property.owner_type === "individual" && !!property.owner_verified },
    { type: "agent", show: property.owner_type === "agent" && !!property.agent_verified },
    { type: "agency", show: property.owner_type === "agency" && !!property.agency_verified },
    { type: "verified_ownership", show: !!property.ownership_verified },
    { type: "developer_certified", show: !!property.developer_certified },
    { type: "legal_checked", show: !!property.legal_checked },
    { type: "premium_partner", show: !!property.premium_partner },
  ];

  const visibleStatic = staticBadges.filter((b) => b.show);
  
  // Merge: static badges + database badges (deduplicate)
  const staticTypes = new Set(visibleStatic.map(b => b.type));
  const allBadgeTypes = [
    ...visibleStatic.map(b => b.type),
    ...dbBadges.filter(t => !staticTypes.has(t)),
  ].slice(0, maxBadges);

  if (allBadgeTypes.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {allBadgeTypes.map((type) => (
        <VerificationBadge
          key={type}
          type={type}
          verified
          size={size}
        />
      ))}
    </div>
  );
};

export default PropertyTrustBadges;
