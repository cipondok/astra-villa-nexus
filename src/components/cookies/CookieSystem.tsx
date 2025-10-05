import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import CookieConsent from './CookieConsent';
import NotificationPopup from './NotificationPopup';

const CookieSystem = () => {
  const { hasConsented, showBanner, acceptCookies, rejectCookies } = useCookieConsent();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification 10 seconds after user accepts cookies
    if (hasConsented === true) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [hasConsented]);

  return (
    <>
      <CookieConsent
        show={showBanner}
        onAccept={acceptCookies}
        onReject={rejectCookies}
      />
      
      <NotificationPopup
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};

export default CookieSystem;
