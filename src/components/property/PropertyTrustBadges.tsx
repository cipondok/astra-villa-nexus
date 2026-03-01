import React from "react";
import VerificationBadge, { type PropertyTrustType } from "@/components/ui/VerificationBadge";
import { cn } from "@/lib/utils";

interface TrustFlags {
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
 * Drop-in replacement for the repeated badge conditionals in property cards.
 */
const PropertyTrustBadges: React.FC<PropertyTrustBadgesProps> = ({
  property,
  size = "sm",
  className,
  maxBadges = 4,
}) => {
  const badges: { type: PropertyTrustType; show: boolean }[] = [
    // Legacy owner/agent/agency badges
    { type: "owner", show: property.owner_type === "individual" && !!property.owner_verified },
    { type: "agent", show: property.owner_type === "agent" && !!property.agent_verified },
    { type: "agency", show: property.owner_type === "agency" && !!property.agency_verified },
    // New trust-layer badges
    { type: "verified_ownership", show: !!property.ownership_verified },
    { type: "developer_certified", show: !!property.developer_certified },
    { type: "legal_checked", show: !!property.legal_checked },
    { type: "premium_partner", show: !!property.premium_partner },
  ];

  const visibleBadges = badges.filter((b) => b.show).slice(0, maxBadges);

  if (visibleBadges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleBadges.map((badge) => (
        <VerificationBadge
          key={badge.type}
          type={badge.type}
          verified
          size={size}
        />
      ))}
    </div>
  );
};

export default PropertyTrustBadges;
