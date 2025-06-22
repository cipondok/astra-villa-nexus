
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Key } from 'lucide-react';

interface MFASetupProps {
  onComplete: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete }) => {
  const [mfaCode, setMfaCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyMFA = async () => {
    setIsVerifying(true);
    
    // Simulate MFA verification
    setTimeout(() => {
      console.log('MFA verification completed');
      setIsVerifying(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Additional Security Required</h3>
        <p className="text-sm text-gray-600 mt-2">
          We've detected unusual activity. Please verify your identity with additional authentication.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">SMS Verification</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            We've sent a verification code to your registered phone number.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification Code</Label>
            <Input
              id="mfa-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
        </div>

        <Button 
          onClick={handleVerifyMFA}
          disabled={mfaCode.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify & Continue'}
        </Button>

        <div className="text-center">
          <button 
            onClick={onComplete}
            className="text-sm text-blue-600 hover:underline"
          >
            Skip for now (not recommended)
          </button>
        </div>
      </div>
    </div>
  );
};
