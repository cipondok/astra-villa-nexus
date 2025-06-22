
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fingerprint, Eye, ShieldCheck } from "lucide-react";

interface BiometricAuthProps {
  onSuccess: () => void;
}

export const BiometricAuth = ({ onSuccess }: BiometricAuthProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setIsSupported(true);
    }
  }, []);

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (!available) {
        setError("Biometric authentication not available on this device");
        return;
      }

      // Create credential options
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: "Astra Villa",
          id: "localhost", // In production, use your domain
        },
        user: {
          id: new Uint8Array(16),
          name: "user@astravilla.com",
          displayName: "User",
        },
        pubKeyCredParams: [{alg: -7, type: "public-key" as const}],
        authenticatorSelection: {
          authenticatorAttachment: "platform" as const,
          userVerification: "required" as const,
        },
        timeout: 60000,
        attestation: "direct" as const
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential) {
        // Store credential ID for future use
        localStorage.setItem('biometric_credential', 'enabled');
        onSuccess();
      }
    } catch (err: any) {
      console.error('Biometric authentication failed:', err);
      setError("Biometric authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        allowCredentials: [],
        timeout: 60000,
        userVerification: "required" as const
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Biometric login failed:', err);
      setError("Biometric login failed. Please try password instead.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  const hasBiometricSetup = localStorage.getItem('biometric_credential') === 'enabled';

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasBiometricSetup ? (
        <Button
          variant="outline"
          onClick={handleBiometricLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Authenticating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              Sign in with Biometrics
            </div>
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={handleBiometricAuth}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Setting up...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Set up Biometric Authentication
            </div>
          )}
        </Button>
      )}

      <div className="text-xs text-center text-muted-foreground">
        Use fingerprint, face ID, or other biometric methods
      </div>
    </div>
  );
};
