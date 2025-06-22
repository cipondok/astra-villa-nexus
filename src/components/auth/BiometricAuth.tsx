
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Eye } from 'lucide-react';

interface BiometricAuthProps {
  onSuccess: () => void;
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  React.useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setIsSupported(true);
    }
  }, []);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      // This would normally use the WebAuthn API
      // For demo purposes, we'll simulate biometric authentication
      console.log('Starting biometric authentication...');
      
      setTimeout(() => {
        console.log('Biometric authentication successful');
        setIsAuthenticating(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setIsAuthenticating(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#F9F9F9] px-2 text-gray-500">Or use biometric</span>
        </div>
      </div>
      
      <Button
        onClick={handleBiometricAuth}
        disabled={isAuthenticating}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <Fingerprint className="h-4 w-4" />
        {isAuthenticating ? 'Authenticating...' : 'Use Fingerprint/Face ID'}
      </Button>
    </div>
  );
};
