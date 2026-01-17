import React from 'react';
import AstraTokenSettings from './AstraTokenSettings';

interface AstraTokenSettingsWrapperProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, errorInfo: any) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AstraTokenSettings crashed:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 border border-destructive/30 rounded-md bg-destructive/5">
          <h3 className="text-xs font-semibold text-destructive mb-1">Token Settings Error</h3>
          <p className="text-[10px] text-destructive/80 mb-2">Something went wrong loading the token settings.</p>
          <details className="mb-2">
            <summary className="text-[9px] text-destructive/70 cursor-pointer">Error details</summary>
            <pre className="text-[8px] mt-1 p-1.5 bg-destructive/10 rounded text-destructive/80">
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-[10px] hover:bg-destructive/90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AstraTokenSettingsWrapper: React.FC<AstraTokenSettingsWrapperProps> = ({ settings, onInputChange }) => {
  console.log('AstraTokenSettingsWrapper called with:', { settings, onInputChange });
  
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('AstraTokenSettings crashed:', error, errorInfo);
    }}>
      <AstraTokenSettings settings={settings} onInputChange={onInputChange} />
    </ErrorBoundary>
  );
};

export default AstraTokenSettingsWrapper;
