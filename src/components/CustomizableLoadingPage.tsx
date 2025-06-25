import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoadingPageProps {
  message?: string;
  showConnectionStatus?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

interface LoadingPageSettings {
  enabled: boolean;
  message: string;
  subMessage: string;
  duration: number;
  logoText: string;
  logoSubtext: string;
  showConnectionStatus: boolean;
  animationType: 'pulse' | 'bounce' | 'spin' | 'gradient' | 'dots';
  animationSpeed: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  customCSS: string;
}

const CustomizableLoadingPage: React.FC<LoadingPageProps> = ({ 
  message: propMessage,
  showConnectionStatus: propShowConnectionStatus = false,
  connectionStatus = 'connecting'
}) => {
  const [settings, setSettings] = useState<LoadingPageSettings>({
    enabled: true,
    message: 'Initializing ASTRA Villa...',
    subMessage: 'Please wait while we prepare your experience',
    duration: 3000,
    logoText: 'ASTRA Villa',
    logoSubtext: '',
    showConnectionStatus: true,
    animationType: 'gradient',
    animationSpeed: 2,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#7f5af0',
    gradientFrom: '#7f5af0',
    gradientTo: '#2cb67d',
    fontFamily: 'Inter',
    fontSize: '16',
    fontWeight: '400',
    customCSS: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'loading_page');
      
      if (error) {
        console.error('Error loading loading page settings:', error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          let value = setting.value;
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string if not valid JSON
            }
          }
          acc[setting.key] = value;
          return acc;
        }, {} as any);
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use prop values if provided, otherwise use settings
  const displayMessage = propMessage || settings.message;
  const showStatus = propShowConnectionStatus !== undefined ? propShowConnectionStatus : settings.showConnectionStatus;

  const getConnectionMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Checking database...';
      case 'connected':
        return 'Database ready';
      case 'error':
        return 'Database unavailable';
      case 'offline':
        return 'Working offline';
      default:
        return 'Initializing...';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '#fbbf24'; // yellow-400
      case 'connected':
        return '#34d399'; // green-400
      case 'error':
        return '#9ca3af'; // gray-400
      case 'offline':
        return '#9ca3af'; // gray-400
      default:
        return '#9ca3af'; // gray-400
    }
  };

  const containerStyles: React.CSSProperties = {
    backgroundColor: settings.backgroundColor,
    color: settings.textColor,
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    fontWeight: settings.fontWeight,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const logoStyles: React.CSSProperties = {
    background: `linear-gradient(45deg, ${settings.gradientFrom}, ${settings.gradientTo})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    animation: settings.animationType === 'gradient' ? `pulseGlow ${settings.animationSpeed}s ease-in-out infinite` : undefined,
  };

  const renderAnimation = () => {
    switch (settings.animationType) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div 
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: settings.accentColor,
                animationDuration: `${settings.animationSpeed}s`
              }}
            />
            <div 
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: settings.accentColor,
                animationDelay: '0.2s',
                animationDuration: `${settings.animationSpeed}s`
              }}
            />
            <div 
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: settings.accentColor,
                animationDelay: '0.4s',
                animationDuration: `${settings.animationSpeed}s`
              }}
            />
          </div>
        );
      case 'spin':
        return (
          <div 
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ 
              borderColor: settings.accentColor,
              borderTopColor: 'transparent',
              animationDuration: `${settings.animationSpeed}s`
            }}
          />
        );
      case 'pulse':
        return (
          <div 
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ 
              backgroundColor: settings.accentColor,
              animationDuration: `${settings.animationSpeed}s`
            }}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    // Fallback loading while settings are being loaded
    return (
      <div className="bg-black text-white flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-4xl md:text-6xl font-extrabold tracking-widest animate-pulse">
            ASTRA <span className="text-indigo-400">Villa</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes pulseGlow {
            0%, 100% {
              text-shadow: 0 0 8px ${settings.accentColor}, 0 0 12px ${settings.gradientTo};
              opacity: 1;
            }
            50% {
              text-shadow: 0 0 16px ${settings.accentColor}, 0 0 24px ${settings.gradientTo};
              opacity: 0.8;
            }
          }
          ${settings.customCSS}
        `}
      </style>
      <div style={containerStyles}>
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <div style={logoStyles}>
              {settings.logoText}
            </div>
            {settings.logoSubtext && (
              <p className="text-lg opacity-75 mb-4">{settings.logoSubtext}</p>
            )}
          </div>
          
          {renderAnimation()}
          
          <div className="text-center">
            <p className="text-sm mb-2">{displayMessage}</p>
            {settings.subMessage && (
              <p className="text-xs opacity-60 mb-4">{settings.subMessage}</p>
            )}
          </div>
          
          {showStatus && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2 text-xs">
                <div 
                  className={`w-2 h-2 rounded-full ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: getConnectionColor() }}
                />
                <span style={{ color: getConnectionColor() }}>
                  {getConnectionMessage()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomizableLoadingPage;
