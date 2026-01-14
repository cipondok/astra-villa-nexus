
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import astraLogo from '@/assets/astra-logo.png';

interface LoadingPageProps {
  message?: string;
  showConnectionStatus?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

interface LoadingPageSettings {
  enabled: boolean;
  message: string;
  subMessage: string;
  logoText: string;
  logoSubtext: string;
  showConnectionStatus: boolean;
  logoImageUrl: string;
  imageSize: number;
  imagePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  showBothTextAndImage: boolean;
  imageAlignment: 'left' | 'center' | 'right';
  textAlignment: 'left' | 'center' | 'right';
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
  message: propMessage = 'Initializing ASTRA Villa...',
  showConnectionStatus: propShowConnectionStatus = false,
  connectionStatus = 'connecting'
}) => {
  const [settings, setSettings] = useState<LoadingPageSettings>({
    enabled: true,
    message: 'Initializing ASTRA Villa...',
    subMessage: 'Please wait while we prepare your experience',
    logoText: '',
    logoSubtext: 'PREMIUM REAL ESTATE',
    showConnectionStatus: true,
    logoImageUrl: astraLogo,
    imageSize: 120,
    imagePosition: 'top',
    showBothTextAndImage: true,
    imageAlignment: 'center',
    textAlignment: 'center',
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
    // Add a safety timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    loadSettings();
    
    return () => clearTimeout(loadTimeout);
  }, []);

  const loadSettings = async () => {
    try {
      // Fetch loading page settings
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'loading_page');
      
      if (error) {
        console.error('Error loading loading page settings:', error);
      }

      // Fetch welcome screen logo from general settings
      const { data: logoData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'welcomeScreenLogo')
        .maybeSingle();

      // Fallback to header logo if no welcome screen logo
      let welcomeLogo = logoData?.value;
      if (!welcomeLogo || welcomeLogo === '') {
        const { data: headerLogoData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'headerLogo')
          .maybeSingle();
        welcomeLogo = headerLogoData?.value;
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
        
        // Use welcome screen logo from settings if available
        if (welcomeLogo && typeof welcomeLogo === 'string') {
          settingsObj.logoImageUrl = welcomeLogo;
        }
        
        setSettings(prev => ({ ...prev, ...settingsObj }));
      } else if (welcomeLogo && typeof welcomeLogo === 'string') {
        // Even if no loading_page settings, still apply welcome logo
        setSettings(prev => ({ ...prev, logoImageUrl: welcomeLogo }));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
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

  const getFlexDirection = () => {
    if (settings.imagePosition === 'left') return 'row';
    if (settings.imagePosition === 'right') return 'row-reverse';
    if (settings.imagePosition === 'bottom') return 'column-reverse';
    return 'column'; // top or center
  };

  const getJustifyContent = () => {
    switch (settings.imageAlignment) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  };

  const getTextAlign = () => {
    switch (settings.textAlignment) {
      case 'left': return 'left';
      case 'right': return 'right';
      default: return 'center';
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
    textAlign: getTextAlign() as any,
    animation: settings.animationType === 'gradient' ? `pulseGlow ${settings.animationSpeed}s ease-in-out infinite` : undefined,
  };

  const contentWrapperStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: getFlexDirection() as any,
    alignItems: 'center',
    justifyContent: getJustifyContent(),
    gap: settings.imagePosition === 'left' || settings.imagePosition === 'right' ? '2rem' : '1.5rem',
  };

  const showImage = settings.logoImageUrl && (settings.showBothTextAndImage || !settings.logoText);
  const showText = settings.logoText && (settings.showBothTextAndImage || !settings.logoImageUrl);

  const renderAnimation = () => {
    switch (settings.animationType) {
      case 'dots':
        return (
          <div className="flex space-x-2" style={{ justifyContent: getJustifyContent() }}>
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
          <div style={{ display: 'flex', justifyContent: getJustifyContent() }}>
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ 
                borderColor: settings.accentColor,
                borderTopColor: 'transparent',
                animationDuration: `${settings.animationSpeed}s`
              }}
            />
          </div>
        );
      case 'pulse':
        return (
          <div style={{ display: 'flex', justifyContent: getJustifyContent() }}>
            <div 
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ 
                backgroundColor: settings.accentColor,
                animationDuration: `${settings.animationSpeed}s`
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // If settings are still loading, show a simple fallback
  if (isLoading) {
    return (
      <div className="bg-background text-foreground flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6">
          <img 
            src={astraLogo} 
            alt="ASTRA Villa" 
            className="w-24 h-24 object-contain animate-pulse"
          />
          <div className="text-sm text-muted-foreground tracking-[0.3em]">
            PREMIUM REAL ESTATE
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
          <div style={contentWrapperStyles}>
            {/* Logo Image */}
            {showImage && (
              <div style={{ display: 'flex', justifyContent: getJustifyContent() }}>
                <img 
                  src={settings.logoImageUrl}
                  alt="Loading Logo"
                  style={{ 
                    width: `${settings.imageSize}px`,
                    height: `${settings.imageSize}px`,
                    objectFit: 'contain'
                  }}
                  className="rounded-lg"
                />
              </div>
            )}
            
            {/* Text Content */}
            {showText && (
              <div style={{ textAlign: getTextAlign() as any }}>
                <div style={logoStyles}>
                  {settings.logoText}
                </div>
                {settings.logoSubtext && (
                  <p className="text-lg opacity-75 mb-4" style={{ textAlign: getTextAlign() as any }}>
                    {settings.logoSubtext}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {renderAnimation()}
          
          <div style={{ textAlign: getTextAlign() as any }}>
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
