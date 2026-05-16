import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  sectionName?: string;
  fallbackMinHeight?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Lightweight error boundary for individual page sections.
 * Renders an inline fallback so the rest of the page remains functional.
 */
class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[SectionErrorBoundary] ${this.props.sectionName || "Section"} crashed:`,
      error,
      errorInfo
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/30"
          style={{ minHeight: this.props.fallbackMinHeight || "200px" }}
        >
          <div className="flex flex-col items-center gap-3 p-6 text-center max-w-sm">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-medium text-foreground/80 mb-1">
                {this.props.sectionName
                  ? `Unable to load ${this.props.sectionName}`
                  : "Something went wrong"}
              </p>
              <p className="text-xs text-muted-foreground">
                This section encountered an error. The rest of the page is unaffected.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
