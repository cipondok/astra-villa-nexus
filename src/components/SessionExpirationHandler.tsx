import { useState, useCallback, useEffect } from 'react';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat';
import { useAuth } from '@/contexts/AuthContext';
import SessionExpirationModal from './SessionExpirationModal';
import RoleBasedAuthModal from './RoleBasedAuthModal';

const SessionExpirationHandler = () => {
  const { isAuthenticated } = useAuth();
  useSessionHeartbeat(isAuthenticated);
  const {
    showExpirationModal,
    dismissExpirationModal,
    resetSessionState,
    authError,
    inactivityWarning,
    gracePeriodEnd,
    extendSession,
  } = useSessionMonitor();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>(undefined);

  // Countdown timer during grace period
  useEffect(() => {
    if (!inactivityWarning || !gracePeriodEnd) {
      setRemainingSeconds(undefined);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((gracePeriodEnd - Date.now()) / 1000));
      setRemainingSeconds(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [inactivityWarning, gracePeriodEnd]);

  const handleStayLoggedIn = useCallback(async () => {
    await extendSession();
  }, [extendSession]);

  const handleReLogin = useCallback(() => {
    dismissExpirationModal();
    setShowLoginModal(true);
  }, [dismissExpirationModal]);

  const handleGoHome = useCallback(() => {
    dismissExpirationModal();
    resetSessionState();
    localStorage.removeItem('had_active_session');
    localStorage.removeItem('last_activity');
    localStorage.removeItem('login_time');
  }, [dismissExpirationModal, resetSessionState]);

  const handleLoginClose = useCallback(() => {
    setShowLoginModal(false);
    resetSessionState();
  }, [resetSessionState]);

  return (
    <>
      <SessionExpirationModal
        isOpen={showExpirationModal || inactivityWarning}
        onReLogin={handleReLogin}
        onGoHome={handleGoHome}
        onStayLoggedIn={inactivityWarning ? handleStayLoggedIn : undefined}
        remainingTime={remainingSeconds}
        errorMessage={authError || undefined}
        isGracePeriod={inactivityWarning}
      />
      <RoleBasedAuthModal
        isOpen={showLoginModal}
        onClose={handleLoginClose}
      />
    </>
  );
};

export default SessionExpirationHandler;
