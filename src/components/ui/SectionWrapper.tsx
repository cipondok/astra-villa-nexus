import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionWrapperProps {
  variant?: "default" | "muted" | "accent";
  children: ReactNode;
  id?: string;
  className?: string;
}

const variantStyles = {
  default: "bg-background",
  muted: "bg-muted/30",
  accent: "bg-gradient-to-b from-primary/[0.03] to-background",
} as const;

const edgeGradients = {
  default: {
    top: "from-muted/30 to-background",
    bottom: "from-background to-muted/30",
  },
  muted: {
    top: "from-background to-muted/30",
    bottom: "from-muted/30 to-background",
  },
  accent: {
    top: "from-background to-primary/[0.03]",
    bottom: "from-background to-muted/30",
  },
} as const;

const SectionWrapper = ({
  variant = "default",
  children,
  id,
  className,
}: SectionWrapperProps) => {
  const edges = edgeGradients[variant];

  return (
    <div id={id} className={cn("relative", variantStyles[variant], className)}>
      {/* Top gradient fade */}
      <div
        className={cn("absolute top-0 inset-x-0 h-3 bg-gradient-to-b pointer-events-none", edges.top)}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative">{children}</div>
      {/* Bottom gradient fade */}
      <div
        className={cn("absolute bottom-0 inset-x-0 h-3 bg-gradient-to-b pointer-events-none", edges.bottom)}
        aria-hidden="true"
      />
    </div>
  );
};

export default SectionWrapper;
