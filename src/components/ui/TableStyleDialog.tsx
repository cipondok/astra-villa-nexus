import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableRow {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

interface TableSection {
  title?: string;
  icon?: LucideIcon;
  rows: TableRow[];
  columns?: 1 | 2; // Support for 2-column layout
}

interface TableStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  sections?: TableSection[];
  children?: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  showProgress?: {
    value: number;
    label?: string;
  };
}

export const TableStyleDialog = ({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconClassName,
  sections = [],
  children,
  footer,
  maxWidth = "2xl",
  showProgress
}: TableStyleDialogProps) => {
  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "4xl": "sm:max-w-4xl"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          maxWidthClasses[maxWidth],
          "bg-card/100 border-2 border-primary/20 p-0 shadow-2xl animate-macos-window-in backdrop-blur-none overflow-hidden"
        )}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg",
                  iconClassName
                )}>
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-sm text-muted-foreground">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            {showProgress && (
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {showProgress.value}%
                </div>
                {showProgress.label && (
                  <p className="text-xs text-muted-foreground">{showProgress.label}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-4">
          {/* Render Table Sections */}
          {sections.map((section, sectionIdx) => (
            <div 
              key={sectionIdx}
              className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden"
            >
              <table className="w-full">
                {section.title && (
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase"
                        colSpan={section.columns === 2 ? 2 : 1}
                      >
                        <div className="flex items-center gap-2">
                          {section.icon && <section.icon className="h-4 w-4 text-primary" />}
                          {section.title}
                        </div>
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {section.rows.map((row, rowIdx) => (
                    <tr 
                      key={rowIdx}
                      className={cn(
                        "border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors",
                        row.className
                      )}
                    >
                      <td className={cn(
                        "px-4 py-3 text-sm font-medium text-muted-foreground",
                        section.columns === 2 ? "w-1/2" : "w-32"
                      )}>
                        <div className="flex items-center gap-2">
                          {row.icon && <row.icon className="h-4 w-4 text-primary" />}
                          {row.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Custom Children Content */}
          {children}
        </div>

        {/* Footer Section */}
        {footer && (
          <div className="bg-muted/20 border-t border-border/50 px-6 py-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Utility component for table-style forms
interface TableFormFieldProps {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  description?: string;
}

export const TableFormField = ({ label, icon: Icon, children, description }: TableFormFieldProps) => (
  <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
    <table className="w-full">
      <tbody>
        <tr>
          <td className="px-4 py-3" colSpan={2}>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              {Icon && <Icon className="h-4 w-4 text-primary" />}
              {label}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground mb-2">{description}</p>
            )}
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Utility component for stat display
interface TableStatsProps {
  stats: Array<{
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
  }>;
}

export const TableStats = ({ stats }: TableStatsProps) => (
  <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border/50 bg-muted/20">
          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">
            Metric
          </th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat, idx) => (
          <tr 
            key={idx}
            className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
          >
            <td className="px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {stat.icon && <stat.icon className="h-4 w-4 text-primary" />}
                {stat.label}
              </div>
            </td>
            <td className="px-4 py-3 text-center">
              {stat.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
