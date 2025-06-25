
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoadingPageProps {
  message?: string;
  showConnectionStatus?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

interface LoadingSettings {
  enabled: boolean;
  logoUrl: string;
  logoSize: number;
  logoOpacity: number;
  mainTitle: string;
  subtitle: string;
  animationType: string;
  animationSpeed: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  showProgress: boolean;
  showConnectionStatus: boolean;
  customCss: string;
  fadeInDuration: number;
  pulseEffect: boolean;
  particleEffect: boolean;
  gradientBackground: boolean;
}

const CustomizableLoadingPage: React.FC<LoadingPageProps> = ({ 
  message,
  showConnectionStatus = false,
  connectionStatus = 'connecting'
}) => {
  const [settings, setSettings] = useState<LoadingSettings>({
    enabled: true,
    logoUrl: '',
    logoSize: 100,
    logoOpacity: 100,
    mainTitle: 'ASTRA Villa',
    subtitle: 'Loading, please wait...',
    animationType: 'pulse',
    animationSpeed: 2,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    showProgress: true,
    showConnectionStatus: true,
    customCss: '',
    fadeInDuration: 300,
    pulseEffect: true,
    particleEffect: false,
    gradientBackground: true
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.showProgress) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 90);
        });
      }, 500);

      return () => clearInterval(timer);
    }
  }, [settings.showProgress]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'loading_customization');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          let value = setting.value;
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          if (!isNaN(Number(value)) && value !== '') value = Number(value);
          acc[setting.key] = value;
          return acc;
        }, {} as any);
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading loading settings:', error);
    }
  };

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
        return '#10b981'; // green-500
      case 'error':
        return '#6b7280'; // gray-500
      case 'offline':
        return '#6b7280'; // gray-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  if (!settings.enabled) {
    // Fallback to original loading page
    return (
      <div className="bg-black text-white flex items-center justify-center min-h-screen font-orbitron">
        <div className="flex flex-col items-center space-y-6">
          <div 
            className="text-4xl md:text-6xl font-extrabold tracking-widest animate-pulse-glow"
            style={{
              textShadow: '0 0 8px #7f5af0, 0 0 12px #2cb67d',
              animation: 'pulseGlow 2s ease-in-out infinite'
            }}
          >
            ASTRA <span className="text-indigo-400">Villa</span>
          </div>
          
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-dot-flash"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-dot-flash" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-dot-flash" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          <p className="text-sm text-gray-400 tracking-wide">{message || 'Loading, please wait...'}</p>
        </div>
      </div>
    );
  }

  const backgroundStyle = settings.gradientBackground 
    ? `linear-gradient(135deg, ${settings.backgroundColor}, ${settings.accentColor}20)`
    : settings.backgroundColor;

  const animationClass = {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-right',
    scale: 'animate-scale-in',
    glow: 'animate-pulse-glow',
    wave: 'animate-bounce'
  }[settings.animationType] || 'animate-pulse';

  return (
    <>
      {settings.customCss && (
        <style>
          {`
            :root {
              --loading-bg-color: ${settings.backgroundColor};
              --loading-text-color: ${settings.textColor};
              --loading-accent-color: ${settings.accentColor};
              --loading-logo-size: ${settings.logoSize}px;
              --loading-animation-speed: ${settings.animationSpeed}s;
              --loading-fade-duration: ${settings.fadeInDuration}ms;
            }
            ${settings.customCss}
          `}
        </style>
      )}
      
      <div 
        className="flex items-center justify-center min-h-screen font-orbitron transition-all"
        style={{ 
          background: backgroundStyle,
          color: settings.textColor,
          animationDuration: `${settings.fadeInDuration}ms`
        }}
      >
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          {/* Logo */}
          {settings.logoUrl && (
            <div className="mb-4">
              <img 
                src={settings.logoUrl}
                alt="Loading Logo"
                className={`${animationClass} ${settings.pulseEffect ? 'animate-pulse' : ''}`}
                style={{
                  width: `${settings.logoSize}px`,
                  height: 'auto',
                  opacity: settings.logoOpacity / 100,
                  animationDuration: `${settings.animationSpeed}s`
                }}
              />
            </div>
          )}
          
          {/* Main Title */}
          <div 
            className={`text-4xl md:text-6xl font-extrabold tracking-widest ${settings.pulseEffect ? 'animate-pulse-glow' : ''}`}
            style={{
              color: settings.textColor,
              textShadow: settings.pulseEffect ? `0 0 8px ${settings.accentColor}, 0 0 12px ${settings.accentColor}80` : 'none',
              animationDuration: `${settings.animationSpeed}s`
            }}
          >
            {settings.mainTitle}
          </div>
          
          {/* Animated Dots */}
          {settings.particleEffect && (
            <div className="flex space-x-2">
              <div 
                className="w-3 h-3 rounded-full animate-dot-flash"
                style={{ backgroundColor: settings.accentColor }}
              ></div>
              <div 
                className="w-3 h-3 rounded-full animate-dot-flash" 
                style={{ 
                  backgroundColor: settings.accentColor,
                  animationDelay: '0.2s' 
                }}
              ></div>
              <div 
                className="w-3 h-3 rounded-full animate-dot-flash" 
                style={{ 
                  backgroundColor: settings.accentColor,
                  animationDelay: '0.4s' 
                }}
              ></div>
            </div>
          )}
          
          {/* Subtitle */}
          <p 
            className="text-sm tracking-wide"
            style={{ color: `${settings.textColor}80` }}
          >
            {message || settings.subtitle}
          </p>
          
          {/* Progress Bar */}
          {settings.showProgress && (
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out"
                style={{ 
                  backgroundColor: settings.accentColor,
                  width: `${progress}%`
                }}
              />
            </div>
          )}
          
          {/* Connection Status */}
          {showConnectionStatus && settings.showConnectionStatus && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2 text-xs">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connecting' ? 'animate-pulse' : ''
                  }`}
                  style={{ backgroundColor: getConnectionColor() }}
                ></div>
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
