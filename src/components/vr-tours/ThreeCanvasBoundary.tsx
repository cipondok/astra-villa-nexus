import React from "react";

type FallbackRender = (args: { error: Error; reset: () => void }) => React.ReactNode;

interface Props {
  children: React.ReactNode;
  fallback: FallbackRender;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Local error boundary for react-three-fiber Canvas trees.
 * Prevents the whole route from crashing if WebGL/three props fail.
 */
export class ThreeCanvasBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Keep logging concise; outer ErrorBoundary already logs stack.
    console.error("ThreeCanvasBoundary caught error:", error);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }

    return this.props.children;
  }
}
