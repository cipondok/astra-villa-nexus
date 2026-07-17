import { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ASTRA V3 — Unified State Views (Phase 5)
 *
 * One canonical set of Empty / Error / Loading views for every module.
 * Replaces ad-hoc "No data" divs and one-off error banners.
 */

interface BaseProps {
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  className,
  title = "Nothing here yet",
  description,
  icon,
  action,
}: BaseProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-border/60 bg-card/40",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-6 h-6" aria-hidden />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  className,
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  icon,
  onRetry,
  retryLabel = "Retry",
  action,
}: BaseProps & { onRetry?: () => void; retryLabel?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-destructive/30 bg-destructive/5",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        {icon ?? <AlertTriangle className="w-6 h-6" aria-hidden />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
        {description}
      </p>
      <div className="mt-5 flex gap-2">
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-1.5" aria-hidden />
            {retryLabel}
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}

export function LoadingState({
  className,
  label = "Loading…",
  compact = false,
}: {
  className?: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        compact ? "py-6" : "py-14",
        className,
      )}
    >
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
