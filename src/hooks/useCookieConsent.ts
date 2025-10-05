import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'astra-villa-cookie-consent';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent === 'accepted') {
      setHasConsented(true);
      setShowBanner(false);
    } else if (consent === 'rejected') {
      setHasConsented(false);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setHasConsented(true);
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setHasConsented(false);
    setShowBanner(false);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setHasConsented(null);
    setShowBanner(true);
  };

  return {
    hasConsented,
    showBanner,
    acceptCookies,
    rejectCookies,
    resetConsent,
  };
};
