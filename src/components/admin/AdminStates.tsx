import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";

/**
 * ASTRA Admin — Standardized Loading Skeletons & State Views
 *
 * All admin skeletons and empty/error/loading states render as
 * full-width blocks inside the admin `<main>` column. They intentionally
 * carry NO horizontal padding of their own so they align pixel-perfectly
 * with the shared admin gutters (`px-4 sm:px-6 lg:px-8`) applied by
 * `AdminLayout` / `ModernEnhancedAdminDashboard`.
 *
 * Vertical rhythm uses admin-standard spacing (`space-y-4 lg:space-y-6`)
 * matching page content sections.
 */

interface AdminStateWrapperProps {
  className?: string;
  children: ReactNode;
}

/** Ensures state views span the full admin content column with correct rhythm. */
function AdminStateWrapper({ className, children }: AdminStateWrapperProps) {
  return (
    <div className={cn("w-full min-w-0", className)}>{children}</div>
  );
}

/** Shimmer block using semantic tokens — no hard-coded colors. */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-astra bg-muted/15 border border-border/10 animate-pulse",
        className,
      )}
    />
  );
}

interface AdminPageSkeletonProps {
  /** Number of KPI cards in the top strip. */
  kpis?: number;
  /** Number of table/list rows below. */
  rows?: number;
  /** Show a leading heading skeleton line. */
  heading?: boolean;
  className?: string;
}

/**
 * Page-level skeleton for admin sections. Mirrors the standard
 * "KPI strip + data table" layout used across the admin panel.
 */
export function AdminPageSkeleton({
  kpis = 5,
  rows = 8,
  heading = true,
  className,
}: AdminPageSkeletonProps) {
  return (
    <AdminStateWrapper
      className={cn("space-y-4 lg:space-y-6 animate-in fade-in duration-150", className)}
    >
      {heading && (
        <div className="space-y-2">
          <Shimmer className="h-5 w-48" />
          <Shimmer className="h-3 w-72 border-0 bg-muted/10" />
        </div>
      )}
      <div className="admin-kpi-strip">
        {Array.from({ length: kpis }).map((_, i) => (
          <Shimmer
            key={i}
            className="h-14"
            // stagger via inline style (motion-safe respected by CSS)
          />
        ))}
      </div>
      <div className="space-y-1">
        {Array.from({ length: rows }).map((_, i) => (
          <Shimmer key={i} className="h-[42px] rounded-lg bg-muted/10 border-border/8" />
        ))}
      </div>
    </AdminStateWrapper>
  );
}

interface AdminCardsSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

/** Grid of card-shaped skeletons for dashboards and galleries. */
export function AdminCardsSkeleton({
  count = 6,
  columns = 3,
  className,
}: AdminCardsSkeletonProps) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <AdminStateWrapper
      className={cn("animate-in fade-in duration-150", className)}
    >
      <div className={cn("grid grid-cols-1 gap-3 lg:gap-4", colClass)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-astra border border-border/10 bg-card/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-32 border-0" />
              <Shimmer className="h-5 w-14 rounded-full border-0" />
            </div>
            <Shimmer className="h-2 w-full border-0 bg-muted/10" />
            <Shimmer className="h-2 w-2/3 border-0 bg-muted/10" />
            <div className="flex gap-2 pt-1">
              <Shimmer className="h-8 flex-1 border-0" />
              <Shimmer className="h-8 flex-1 border-0" />
            </div>
          </div>
        ))}
      </div>
    </AdminStateWrapper>
  );
}

interface AdminTableSkeletonProps {
  rows?: number;
  className?: string;
}

/** Dense table skeleton for admin lists. */
export function AdminTableSkeleton({ rows = 10, className }: AdminTableSkeletonProps) {
  return (
    <AdminStateWrapper
      className={cn("space-y-1 animate-in fade-in duration-150", className)}
    >
      <Shimmer className="h-9 rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-[42px] rounded-lg bg-muted/10 border-border/8" />
      ))}
    </AdminStateWrapper>
  );
}

/* ------------------------------------------------------------------ */
/* Unified skeleton dispatcher                                        */
/* ------------------------------------------------------------------ */

/**
 * Single decision point for admin loading fallbacks.
 *
 * Contributors should NOT hand-pick between `AdminPageSkeleton`,
 * `AdminCardsSkeleton`, and `AdminTableSkeleton` inline. Instead, render
 * `<AdminLoadingFallback layout="…" />` and let this dispatcher choose,
 * so cards/tables/pages stay visually consistent across the dashboard
 * and every subpage.
 *
 * Rule of thumb:
 *   - layout="page"   → default full-page shell (KPI strip + rows).
 *                       Use at the top of a dashboard route while its
 *                       primary query resolves.
 *   - layout="cards"  → any view whose loaded state is a grid of cards
 *                       (portfolios, catalogues, tile dashboards).
 *   - layout="table"  → any view whose loaded state is a dense list or
 *                       data table (queues, ledgers, logs, CRM lists).
 *
 * The dispatcher forwards sizing hints (`kpis`, `rows`, `count`,
 * `columns`) to the matching underlying skeleton and ignores the rest,
 * so callers can pass one consistent props bag.
 */
export type AdminLoadingLayout = "page" | "cards" | "table";

export interface AdminLoadingFallbackProps {
  layout?: AdminLoadingLayout;
  /** KPI count (page layout). */
  kpis?: number;
  /** Row count (page + table layouts). */
  rows?: number;
  /** Card count (cards layout). */
  count?: number;
  /** Card grid columns (cards layout). */
  columns?: 2 | 3 | 4;
  className?: string;
}

export function AdminLoadingFallback({
  layout = "page",
  kpis,
  rows,
  count,
  columns,
  className,
}: AdminLoadingFallbackProps) {
  if (layout === "cards") {
    return (
      <AdminCardsSkeleton
        count={count ?? 6}
        columns={columns ?? 3}
        className={className}
      />
    );
  }
  if (layout === "table") {
    return <AdminTableSkeleton rows={rows ?? 10} className={className} />;
  }
  return (
    <AdminPageSkeleton
      kpis={kpis ?? 5}
      rows={rows ?? 8}
      className={className}
    />
  );
}


/* ------------------------------------------------------------------ */
/* State views (empty / error / loading) — full-width admin variants  */
/* ------------------------------------------------------------------ */

interface AdminBaseStateProps {
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function AdminEmptyState(props: AdminBaseStateProps) {
  return (
    <AdminStateWrapper>
      <EmptyState {...props} className={cn("w-full", props.className)} />
    </AdminStateWrapper>
  );
}

export function AdminErrorState(
  props: AdminBaseStateProps & { onRetry?: () => void; retryLabel?: string },
) {
  return (
    <AdminStateWrapper>
      <ErrorState {...props} className={cn("w-full", props.className)} />
    </AdminStateWrapper>
  );
}

export function AdminLoadingState({
  label,
  compact,
  className,
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <AdminStateWrapper>
      <LoadingState
        label={label}
        compact={compact}
        className={cn("w-full", className)}
      />
    </AdminStateWrapper>
  );
}
