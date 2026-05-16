import { useState, useEffect, useCallback } from 'react';

const COOKIE_CONSENT_KEY = 'astra-villa-cookie-consent';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(() => {
    // Initialize from localStorage synchronously to prevent flash
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent === 'accepted') return true;
      if (consent === 'rejected') return false;
    }
    return null;
  });
  
  const [showBanner, setShowBanner] = useState(() => {
    // Only show banner if no consent recorded
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      return consent !== 'accepted' && consent !== 'rejected';
    }
    return false;
  });

  // Double-check on mount
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

  const acceptCookies = useCallback(() => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      setHasConsented(true);
      setShowBanner(false);
    } catch (error) {
      console.error('Failed to save cookie consent:', error);
    }
  }, []);

  const rejectCookies = useCallback(() => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
      setHasConsented(false);
      setShowBanner(false);
    } catch (error) {
      console.error('Failed to save cookie rejection:', error);
    }
  }, []);

  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      setHasConsented(null);
      setShowBanner(true);
    } catch (error) {
      console.error('Failed to reset cookie consent:', error);
    }
  }, []);

  return {
    hasConsented,
    showBanner,
    acceptCookies,
    rejectCookies,
    resetConsent,
  };
};