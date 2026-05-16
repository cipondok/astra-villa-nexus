import React from "react";
import { Button } from "@/components/ui/button";
import { Monitor, RefreshCw } from "lucide-react";

interface OverviewHeaderProps {
  onRefresh: () => void;
}

const OverviewHeader = React.memo(function OverviewHeader({ onRefresh }: OverviewHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-card rounded-xl border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Monitor className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold">Live Monitoring Dashboard</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" role="status" aria-live="polite">
              <span className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-chart-1 font-medium">Online</span>
            </span>
            <span className="text-border">•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={onRefresh}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Refresh
      </Button>
    </div>
  );
});

export default OverviewHeader;
