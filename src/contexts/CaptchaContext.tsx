import React, { createContext, useContext } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

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

// Add your Google reCAPTCHA site key here
// Get it from: https://www.google.com/recaptcha/admin
const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY_HERE";

export const CaptchaProvider = ({ children }: CaptchaProviderProps) => {
  // If no site key is configured, render children without captcha
  if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === "YOUR_RECAPTCHA_SITE_KEY_HERE") {
    console.warn("reCAPTCHA site key not configured. Captcha protection is disabled.");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <CaptchaContext.Provider value={{ siteKey: RECAPTCHA_SITE_KEY }}>
        {children}
      </CaptchaContext.Provider>
    </GoogleReCaptchaProvider>
  );
};
