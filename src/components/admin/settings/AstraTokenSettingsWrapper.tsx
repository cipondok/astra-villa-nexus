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
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Token Settings Error</h3>
          <p className="text-red-600 mb-3">Something went wrong loading the token settings.</p>
          <details className="mb-3">
            <summary className="text-sm text-red-600 cursor-pointer">Error details</summary>
            <pre className="text-xs mt-2 p-2 bg-red-100 rounded">
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
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