import { useCookieConsent } from '@/hooks/useCookieConsent';
import CookieConsent from './CookieConsent';

const CookieSystem = () => {
  const { showBanner, acceptCookies, rejectCookies } = useCookieConsent();

  return (
    <CookieConsent
      show={showBanner}
      onAccept={acceptCookies}
      onReject={rejectCookies}
    />
  );
};

export default CookieSystem;
