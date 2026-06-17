import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * ASTRA Design System V3 — Primitive wrappers.
 *
 * Thin opt-in wrappers around shadcn primitives that apply the
 * ASTRA visual language (rounded-2xl cards, gold-tinted borders,
 * generous padding, consistent motion). Migrate page-by-page —
 * shadcn primitives keep working everywhere they're already used.
 */

interface AstraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pull-in glassy + subtle gold border treatment. */
  glass?: boolean;
}

export function AstraCard({ glass, className, ...props }: AstraCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-border/60 transition-all duration-300",
        glass &&
          "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-primary/20 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.18)]",
        "hover:border-primary/30 hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.25)]",
        className,
      )}
      {...props}
    />
  );
}

export const AstraCardHeader = CardHeader;
export const AstraCardTitle = CardTitle;
export const AstraCardDescription = CardDescription;
export const AstraCardContent = CardContent;
export const AstraCardFooter = CardFooter;

/** ASTRA Button — shadcn button + softer rounding + larger touch target. */
export function AstraButton({ className, size, ...props }: ButtonProps) {
  return (
    <Button
      size={size ?? "default"}
      className={cn("rounded-xl font-medium", className)}
      {...props}
    />
  );
}

/** ASTRA Input — rounded, primary-tinted focus ring. */
export function AstraInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      className={cn(
        "h-10 rounded-xl border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30",
        className,
      )}
      {...props}
    />
  );
}

interface AstraSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional eyebrow rendered above the title. */
  eyebrow?: string;
  /** Optional section title. */
  title?: string;
  /** Optional section description. */
  description?: string;
  /** Trailing action slot (e.g. a CTA button). */
  action?: ReactNode;
  /** Container width. Defaults to true. */
  contained?: boolean;
}

/** ASTRA Section — standard page section with consistent header + spacing. */
export function AstraSection({
  children,
  className,
  eyebrow,
  title,
  description,
  action,
  contained = true,
}: AstraSectionProps) {
  return (
    <section className={cn("py-8 md:py-12", className)}>
      <div className={cn(contained && "container max-w-7xl mx-auto px-4 sm:px-6")}>
        {(eyebrow || title || action) && (
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6 md:mb-8">
            <div>
              {eyebrow && (
                <span className="text-[11px] uppercase tracking-[0.18em] text-primary font-medium">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="text-2xl md:text-3xl font-bold mt-2 tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
