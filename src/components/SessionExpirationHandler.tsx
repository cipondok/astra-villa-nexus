import { useState, useCallback } from 'react';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import SessionExpirationModal from './SessionExpirationModal';
import RoleBasedAuthModal from './RoleBasedAuthModal';

const SessionExpirationHandler = () => {
  const { 
    showExpirationModal, 
    dismissExpirationModal,
    resetSessionState,
    authError
  } = useSessionMonitor();
  
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleReLogin = useCallback(() => {
    dismissExpirationModal();
    setShowLoginModal(true);
  }, [dismissExpirationModal]);

  const handleGoHome = useCallback(() => {
    dismissExpirationModal();
    resetSessionState();
    // Clear all auth data
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
        isOpen={showExpirationModal}
        onReLogin={handleReLogin}
        onGoHome={handleGoHome}
        errorMessage={authError || undefined}
      />
      <RoleBasedAuthModal
        isOpen={showLoginModal}
        onClose={handleLoginClose}
      />
    </>
  );
};

export default SessionExpirationHandler;
