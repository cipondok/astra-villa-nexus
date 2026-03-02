import { Badge } from "@/components/ui/badge";
import { Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerSubscriptionBadgeProps {
  subscriptionType?: string | null;
  className?: string;
}

const OwnerSubscriptionBadge = ({ subscriptionType, className }: OwnerSubscriptionBadgeProps) => {
  if (!subscriptionType || subscriptionType === 'free') return null;

  if (subscriptionType === 'enterprise') {
    return (
      <Badge
        className={cn(
          "bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(45,100%,45%)]",
          "text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md",
          "border border-[hsl(var(--gold-primary)/0.6)]",
          "flex items-center gap-1",
          className
        )}
      >
        <Gem className="h-2.5 w-2.5" />
        Featured Investment
      </Badge>
    );
  }

  if (subscriptionType === 'pro') {
    return (
      <Badge
        className={cn(
          "bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm",
          "border border-primary/30",
          "flex items-center gap-1",
          className
        )}
      >
        <Crown className="h-2.5 w-2.5" />
        Pro Listing
      </Badge>
    );
  }

  return null;
};

export default OwnerSubscriptionBadge;
