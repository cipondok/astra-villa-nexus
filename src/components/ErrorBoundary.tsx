import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
              <div className="text-6xl font-bold text-primary opacity-50 mb-2">
                500
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                An unexpected error occurred. We're working to fix this issue.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>Error ID: {Date.now()}</p>
                <p>Time: {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;