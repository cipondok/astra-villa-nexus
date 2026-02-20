import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Top-level error boundary for the entire admin dashboard.
 * Catches unhandled render errors and shows a safe recovery screen.
 */
export class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: React.ErrorInfo) {
    // In production, send to error tracking service (e.g. Sentry)
    // Do NOT log sensitive error details to the console
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              The admin dashboard encountered an unexpected error. Your data is safe.
            </p>
          </div>

          {/* Error code (safe, no stack trace exposure) */}
          {this.state.error && (
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-[11px] font-mono text-muted-foreground text-left break-all">
              {this.state.error.name}: {this.state.error.message.slice(0, 120)}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button onClick={this.handleReload} size="sm" className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Reload
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="/">
                <Home className="h-3.5 w-3.5" />
                Home
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
