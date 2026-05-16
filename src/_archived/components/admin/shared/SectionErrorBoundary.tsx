import React from "react";
import { AlertCircle, RefreshCw, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  /** Optional label shown in the error card so the user knows which panel failed */
  sectionName?: string;
  /** Called on retry — if omitted the boundary simply resets itself (no page reload) */
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * Error boundary for individual admin sections.
 * Catches render errors and shows a compact in-place recovery card
 * without taking down the rest of the dashboard.
 *
 * On retry it resets its own state so React re-mounts the children
 * (no full page reload required).
 */
class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // In production: forward to Sentry / error tracking
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: undefined,
      retryCount: prev.retryCount + 1,
    }));
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { sectionName } = this.props;
    const { error, retryCount } = this.state;
    const tooManyRetries = retryCount >= 3;

    return (
      <div className="flex items-center justify-center min-h-[200px] p-4">
        <div className="w-full max-w-md text-center space-y-3 p-5 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-destructive/10">
              {tooManyRetries ? (
                <Bug className="h-7 w-7 text-destructive" />
              ) : (
                <AlertCircle className="h-7 w-7 text-destructive" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-foreground">
              {sectionName ? `"${sectionName}" failed to load` : "Section failed to load"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tooManyRetries
                ? "This section keeps crashing. Try reloading the full page."
                : "The rest of the dashboard is still working. You can retry this section."}
            </p>
          </div>

          {error && (
            <div className="px-3 py-1.5 rounded-md bg-muted/50 border border-border/40 text-[10px] font-mono text-muted-foreground text-left break-all max-h-16 overflow-auto">
              {error.name}: {error.message.slice(0, 150)}
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {tooManyRetries ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3" />
                Reload Page
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={this.handleRetry}
              >
                <RefreshCw className="h-3 w-3" />
                Retry {retryCount > 0 ? `(${retryCount}/3)` : ''}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default SectionErrorBoundary;
