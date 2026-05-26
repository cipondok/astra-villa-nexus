import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "glass" | "solid" | "outline";
type CardRadius = "sm" | "md" | "lg" | "pill";

interface LuxeCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  radius?: CardRadius;
  /** Adds the gold halo hover glow */
  glow?: boolean;
  /** Adds press/scale tap feedback */
  interactive?: boolean;
}

const VARIANT: Record<CardVariant, string> = {
  glass:   "luxe-glass-card",
  solid:   "bg-luxe-surface border border-luxe",
  outline: "bg-transparent border border-luxe",
};

const RADIUS: Record<CardRadius, string> = {
  sm:   "rounded-xl",
  md:   "rounded-2xl",
  lg:   "rounded-3xl",
  pill: "rounded-full",
};

export const LuxeCard = forwardRef<HTMLDivElement, LuxeCardProps>(function LuxeCard(
  { children, variant = "glass", radius = "lg", glow = false, interactive = false, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        VARIANT[variant],
        RADIUS[radius],
        glow && "luxe-card-glow",
        interactive && "luxe-tap cursor-pointer transition-colors hover:border-[color:var(--luxe-gold)]/40",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
