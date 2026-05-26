import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LuxeCard } from "./LuxeCard";

interface LuxeDashboardPanelProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Top-right action slot (button, link, badge) */
  action?: ReactNode;
  /** Footer metadata slot (timestamps, sources) */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  glow?: boolean;
}

/**
 * LuxeDashboardPanel — the canonical container for any data widget
 * (KPI tile, chart, list, AI signal). Use across the dashboard, investor
 * pages, and analytics surfaces to keep one consistent panel grammar.
 */
export function LuxeDashboardPanel({
  eyebrow, title, description, action, footer, children, className, bodyClassName, glow = true,
}: LuxeDashboardPanelProps) {
  return (
    <LuxeCard variant="glass" radius="lg" glow={glow} className={cn("flex flex-col", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          {eyebrow && <div className="luxe-eyebrow mb-2">{eyebrow}</div>}
          <h3 className="font-serif-l text-[20px] md:text-[22px] leading-tight tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 text-[12px] text-luxe-mut leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      <div className={cn("px-5 py-5", bodyClassName)}>{children}</div>

      {footer && (
        <footer className="px-5 pb-4 pt-3 border-t border-luxe text-[11px] text-luxe-mut font-mono-l">
          {footer}
        </footer>
      )}
    </LuxeCard>
  );
}
