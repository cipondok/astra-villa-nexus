import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import astraLogoFallback from '@/assets/astra-logo.png';

interface WelcomeScreenPreviewProps {
  settings: Record<string, any>;
}

const WelcomeScreenPreview: React.FC<WelcomeScreenPreviewProps> = ({ settings }) => {
  const loadingLogo = settings.loadingPageLogo || settings.welcomeScreenLogo || settings.headerLogo || astraLogoFallback;
  const chatbotLogo = settings.chatbotLogo || astraLogoFallback;

  return (
    <Card className="bg-card/50 border-border/50 border-l-4 border-l-blue-500">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs text-foreground flex items-center gap-2">
          <Monitor className="h-3.5 w-3.5" />
          Live Preview
          <Badge variant="outline" className="text-[8px] px-1.5 py-0 ml-auto">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {/* Welcome/Loading Screen Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-foreground">Welcome Screen</span>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background h-48">
            {/* Background gradient animation */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -inset-[50px] opacity-30"
                style={{
                  background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <div className="relative flex flex-col items-center justify-center h-full gap-3 z-10">
              {/* Logo */}
              <motion.div 
                className="relative"
                animate={{ 
                  boxShadow: [
                    '0 0 0px rgba(127, 90, 240, 0)',
                    '0 0 20px rgba(127, 90, 240, 0.3)',
                    '0 0 0px rgba(127, 90, 240, 0)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img 
                  src={loadingLogo}
                  alt="Welcome Logo"
                  className="w-14 h-14 object-contain rounded-xl"
                  style={{ background: 'transparent' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = astraLogoFallback; }}
                />
                {/* Spinning ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-transparent"
                  style={{
                    borderTopColor: 'rgba(59, 130, 246, 0.6)',
                    borderRightColor: 'rgba(139, 92, 246, 0.4)'
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Brand Name */}
              <div className="text-center">
                <h1 className="text-lg font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                    ASTRA
                  </span>
                  <span className="text-foreground ml-1.5">Villa</span>
                </h1>
                <p className="text-[7px] uppercase tracking-[0.2em] text-muted-foreground">
                  Premium Real Estate
                </p>
              </div>

              {/* Loading dots */}
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{
                      background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#f97316'
                    }}
                    animate={{
                      y: [0, -4, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-24 h-0.5 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* Label */}
            <div className="absolute bottom-1 left-1">
              <Badge variant="secondary" className="text-[7px] px-1 py-0 bg-background/80">
                {settings.loadingPageLogo ? 'loadingPageLogo' : settings.welcomeScreenLogo ? 'welcomeScreenLogo' : settings.headerLogo ? 'headerLogo' : 'fallback'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Chatbot Button Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Bot className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-foreground">Chatbot Button</span>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background h-24 flex items-end justify-end p-3">
            {/* Simulated page content */}
            <div className="absolute inset-3 flex flex-col gap-1.5">
              <div className="h-2 w-3/4 bg-muted/30 rounded" />
              <div className="h-2 w-1/2 bg-muted/20 rounded" />
              <div className="h-2 w-2/3 bg-muted/20 rounded" />
            </div>

            {/* Chatbot button */}
            <motion.div
              className={cn(
                "relative z-10 h-10 w-10 rounded-full",
                "bg-gradient-to-br from-background/90 via-background/80 to-primary/20",
                "shadow-[0_2px_12px_hsla(var(--primary),0.2)]",
                "border border-primary/30",
                "backdrop-blur-lg",
                "flex items-center justify-center"
              )}
              animate={{
                boxShadow: [
                  "0 0 0 0 hsla(var(--primary), 0)",
                  "0 0 0 4px hsla(var(--primary), 0.15)",
                  "0 0 0 0 hsla(var(--primary), 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img 
                src={chatbotLogo}
                alt="Chatbot"
                className="w-7 h-7 object-contain rounded-md"
                style={{ background: 'transparent' }}
                onError={(e) => { (e.target as HTMLImageElement).src = astraLogoFallback; }}
              />
            </motion.div>

            {/* Label */}
            <div className="absolute bottom-1 left-1">
              <Badge variant="secondary" className="text-[7px] px-1 py-0 bg-background/80">
                {settings.chatbotLogo ? 'chatbotLogo' : 'fallback'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Smartphone className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-foreground">Mobile App Icon</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border border-border/30">
            <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                src={settings.mobileAppIcon || settings.faviconUrl || astraLogoFallback}
                alt="App Icon"
                className="w-10 h-10 object-contain"
                style={{ background: 'transparent' }}
                onError={(e) => { (e.target as HTMLImageElement).src = astraLogoFallback; }}
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-foreground">ASTRA Villa</p>
              <p className="text-[8px] text-muted-foreground">
                {settings.mobileAppIcon ? 'mobileAppIcon' : settings.faviconUrl ? 'faviconUrl' : 'fallback'}
              </p>
            </div>
            <div className="w-4 h-4 rounded bg-background border border-border/50 flex items-center justify-center overflow-hidden">
              <img 
                src={settings.faviconUrl || astraLogoFallback}
                alt="Favicon"
                className="w-3 h-3 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = astraLogoFallback; }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeScreenPreview;
