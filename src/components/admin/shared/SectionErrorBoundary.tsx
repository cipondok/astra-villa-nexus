import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for individual admin sections loaded via React.lazy.
 * Shows a safe in-place error UI without taking down the entire dashboard.
 */
class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // In production: forward to error tracking (e.g. Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 p-6 bg-destructive/5 rounded-lg border border-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-1">Failed to load section</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {this.state.error?.message || "An error occurred while loading this section"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  if (this.props.onRetry) {
                    this.props.onRetry();
                  } else {
                    window.location.reload();
                  }
                }}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
