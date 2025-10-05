import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { supabase } from '@/integrations/supabase/client';

interface CaptchaContextType {
  siteKey: string;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export const useCaptchaContext = () => {
  const context = useContext(CaptchaContext);
  if (!context) {
    throw new Error('useCaptchaContext must be used within CaptchaProvider');
  }
  return context;
};

interface CaptchaProviderProps {
  children: React.ReactNode;
}

export const CaptchaProvider = ({ children }: CaptchaProviderProps) => {
  const [siteKey, setSiteKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSiteKey = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'recaptcha_site_key')
          .single();
        
        if (data?.value) {
          setSiteKey(data.value as string);
        }
      } catch (error) {
        console.error('Failed to load reCAPTCHA site key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSiteKey();
  }, []);

  // Show children immediately if loading or no site key
  if (isLoading || !siteKey) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <CaptchaContext.Provider value={{ siteKey }}>
        {children}
      </CaptchaContext.Provider>
    </GoogleReCaptchaProvider>
  );
};
