import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LuxeSectionProps {
  children: ReactNode;
  /** Container max-width. Defaults to 1440. */
  maxWidth?: "narrow" | "default" | "wide" | "full";
  /** Section vertical rhythm */
  pad?: "sm" | "md" | "lg" | "xl";
  /** Skip paint until near viewport (long-form pages). */
  cv?: boolean;
  id?: string;
  className?: string;
  innerClassName?: string;
}

const MAX: Record<NonNullable<LuxeSectionProps["maxWidth"]>, string> = {
  narrow:  "max-w-[960px]",
  default: "max-w-[1440px]",
  wide:    "max-w-[1680px]",
  full:    "max-w-none",
};

const PAD: Record<NonNullable<LuxeSectionProps["pad"]>, string> = {
  sm: "py-12 md:py-16",
  md: "py-20 md:py-28",
  lg: "py-24 md:py-36",
  xl: "py-32 md:py-44",
};

export function LuxeSection({
  children, maxWidth = "default", pad = "md", cv = false, id, className, innerClassName,
}: LuxeSectionProps) {
  return (
    <section id={id} className={cn("relative", PAD[pad], cv && "luxe-cv", className)}>
      <div className={cn("mx-auto px-5 md:px-10", MAX[maxWidth], innerClassName)}>
        {children}
      </div>
    </section>
  );
}

interface LuxeSectionHeadProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function LuxeSectionHead({
  eyebrow, title, description, align = "left", className,
}: LuxeSectionHeadProps) {
  return (
    <div className={cn(align === "center" ? "max-w-2xl mx-auto text-center" : "max-w-2xl", className)}>
      {eyebrow && <span className="luxe-eyebrow">{eyebrow}</span>}
      <h2 className="font-serif-l text-[36px] md:text-[56px] leading-[1.02] mt-5 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-[14px] md:text-[15px] text-luxe-mut max-w-xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
