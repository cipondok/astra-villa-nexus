
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertTriangle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange: (strength: number) => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export const EnhancedPasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  onStrengthChange
}) => {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8, met: false },
    { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p), met: false },
    { id: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p), met: false },
    { id: 'number', label: 'One number', test: (p) => /\d/.test(p), met: false },
    { id: 'special', label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), met: false }
  ]);

  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [strengthColor, setStrengthColor] = useState('');

  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.test(password)
    }));
    
    setRequirements(updatedRequirements);
    
    const metCount = updatedRequirements.filter(req => req.met).length;
    const strengthValue = metCount;
    setStrength(strengthValue);
    
    // Update strength text and color
    if (strengthValue === 0) {
      setStrengthText('');
      setStrengthColor('');
    } else if (strengthValue <= 2) {
      setStrengthText('Weak');
      setStrengthColor('text-red-500');
    } else if (strengthValue <= 3) {
      setStrengthText('Fair');
      setStrengthColor('text-orange-500');
    } else if (strengthValue <= 4) {
      setStrengthText('Good');
      setStrengthColor('text-yellow-500');
    } else {
      setStrengthText('Strong');
      setStrengthColor('text-green-500');
    }
    
    onStrengthChange(strengthValue);
  }, [password, onStrengthChange]);

  if (!password) return null;

  const progressValue = (strength / 5) * 100;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          <span className={`text-xs font-medium ${strengthColor}`}>
            {strengthText}
          </span>
        </div>
        
        <Progress 
          value={progressValue} 
          className={`h-2 ${
            strength <= 2 ? '[&>div]:bg-red-500' :
            strength <= 3 ? '[&>div]:bg-orange-500' :
            strength <= 4 ? '[&>div]:bg-yellow-500' :
            '[&>div]:bg-green-500'
          }`}
        />
      </div>
      
      <div className="space-y-1">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 text-gray-400 flex-shrink-0" />
            )}
            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
      
      {password.length > 0 && strength < 3 && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-medium">Weak Password</p>
            <p>Consider using a stronger password for better security.</p>
          </div>
        </div>
      )}
    </div>
  );
};
