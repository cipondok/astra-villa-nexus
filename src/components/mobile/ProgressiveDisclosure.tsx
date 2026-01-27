import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Progressive Disclosure Component
 * Shows essential info first, reveals complexity on demand
 * Reduces cognitive load on mobile screens
 */

interface DisclosureLevel {
  level: 'essential' | 'detailed' | 'advanced';
  content: ReactNode;
  label?: string;
}

interface ProgressiveDisclosureProps {
  levels: DisclosureLevel[];
  defaultLevel?: 'essential' | 'detailed' | 'advanced';
  className?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  levels,
  defaultLevel = 'essential',
  className,
}) => {
  const [currentLevel, setCurrentLevel] = useState<'essential' | 'detailed' | 'advanced'>(defaultLevel);

  const levelIndex = { essential: 0, detailed: 1, advanced: 2 };
  const currentIdx = levelIndex[currentLevel];

  const canExpand = currentIdx < levels.length - 1;
  const canCollapse = currentIdx > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="wait">
        {levels.slice(0, currentIdx + 1).map((level, idx) => (
          <motion.div
            key={level.level}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {level.content}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Disclosure controls */}
      <div className="flex justify-center gap-2 pt-2">
        {canExpand && (
          <button
            onClick={() => setCurrentLevel(levels[currentIdx + 1].level)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-primary/10 text-primary text-xs font-medium",
              "active:scale-95 transition-transform"
            )}
          >
            <span>{levels[currentIdx + 1].label || 'Show more'}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
        
        {canCollapse && (
          <button
            onClick={() => setCurrentLevel(levels[currentIdx - 1].level)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-muted text-muted-foreground text-xs font-medium",
              "active:scale-95 transition-transform"
            )}
          >
            <ChevronUp className="h-3 w-3" />
            <span>Show less</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Collapsible Section for Progressive Disclosure
 */
interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ElementType;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-border/50 rounded-xl overflow-hidden", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "bg-card/50 active:bg-muted/50 transition-colors",
          "text-left"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 pt-0 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Summary Card with Expandable Details
 */
interface SummaryCardProps {
  summary: ReactNode;
  details: ReactNode;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  details,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={cn(
      "bg-card border border-border/50 rounded-xl overflow-hidden",
      className
    )}>
      {/* Summary - always visible */}
      <div className="p-4">{summary}</div>

      {/* Details toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2",
          "border-t border-border/30 bg-muted/30",
          "text-xs text-muted-foreground",
          "active:bg-muted/50 transition-colors"
        )}
      >
        <Info className="h-3.5 w-3.5" />
        <span>{showDetails ? 'Hide details' : 'View details'}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 transition-transform",
          showDetails && "rotate-180"
        )} />
      </button>

      {/* Expandable details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-4 bg-muted/20 border-t border-border/30">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressiveDisclosure;
