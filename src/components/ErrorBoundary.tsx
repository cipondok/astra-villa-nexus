import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorPage from "@/pages/ErrorPage";

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
        <ErrorPage 
          errorType="500"
          title="Something went wrong"
          description="An unexpected error occurred. We're working to fix this issue."
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;