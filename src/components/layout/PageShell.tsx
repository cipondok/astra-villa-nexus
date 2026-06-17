import { ReactNode } from "react";
import { motion } from "framer-motion";
import GlobalHeader from "./GlobalHeader";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** Hide the universal search input in the header. */
  hideSearch?: boolean;
  /** Constrain content width. Defaults to true. */
  contained?: boolean;
  /** Extra classes on the <main> element. */
  className?: string;
  /** Disable the page-enter fade animation. */
  noAnimate?: boolean;
  /** Hook the header's auth CTAs to a local modal opener. */
  onAuthOpen?: (mode: "login" | "register") => void;
}

/**
 * ASTRA Design System V3 — Page Shell
 *
 * Universal layout wrapper: sticky GlobalHeader + animated content slot.
 * Drop any page into <PageShell>…</PageShell> to inherit the V3 design.
 */
export default function PageShell({
  children,
  hideSearch,
  contained = true,
  className,
  noAnimate,
  onAuthOpen,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <GlobalHeader showSearch={!hideSearch} onAuthOpen={onAuthOpen} />
      <motion.main
        initial={noAnimate ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex-1 py-6 md:py-10",
          contained && "container",
          className
        )}
      >
        {children}
      </motion.main>
    </div>
  );
}
