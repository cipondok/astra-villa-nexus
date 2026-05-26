import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LuxeButtonVariant = "gold" | "ghost" | "outline";
type LuxeButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: LuxeButtonVariant;
  size?: LuxeButtonSize;
  /** Render as Link to internal route */
  to?: string;
  /** Render as anchor */
  href?: string;
  /** Full width */
  block?: boolean;
  className?: string;
  /** Icon before label */
  iconLeft?: ReactNode;
  /** Icon after label */
  iconRight?: ReactNode;
}

type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

const VARIANT: Record<LuxeButtonVariant, string> = {
  gold:    "luxe-gold-btn",
  ghost:   "luxe-ghost-btn",
  outline: "bg-transparent border border-[color:var(--luxe-gold)]/60 text-luxe-gold hover:bg-[color:var(--luxe-gold)]/10",
};

const SIZE: Record<LuxeButtonSize, string> = {
  sm: "h-9 px-4 text-[12px] rounded-full",
  md: "h-11 px-6 text-[13px] rounded-full",
  lg: "h-14 px-8 text-[14px] rounded-full",
};

export const LuxeButton = forwardRef<HTMLButtonElement, ButtonProps>(function LuxeButton(
  { children, variant = "gold", size = "md", to, href, block, className, iconLeft, iconRight, type = "button", ...rest },
  ref
) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide select-none luxe-tap",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--luxe-gold)]/40",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANT[variant],
    SIZE[size],
    block && "w-full",
    className
  );

  const content = (
    <>
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      <span className="truncate">{children}</span>
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </>
  );

  if (to) {
    return <Link to={to} className={base}>{content}</Link>;
  }
  if (href) {
    return <a href={href} className={base}>{content}</a>;
  }
  return (
    <button ref={ref} type={type} className={base} {...rest}>
      {content}
    </button>
  );
});
