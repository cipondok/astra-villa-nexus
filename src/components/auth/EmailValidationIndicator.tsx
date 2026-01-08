import React, { useMemo } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface EmailValidationIndicatorProps {
  email: string;
}

export const EmailValidationIndicator = ({ email }: EmailValidationIndicatorProps) => {
  const validation = useMemo(() => {
    if (!email) return { status: 'empty', message: '' };
    
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    
    // Common domain check
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    const isCommonDomain = domain && commonDomains.includes(domain);
    
    // Check for common typos
    const typoSuggestions: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmail.con': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmal.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };
    const suggestion = domain && typoSuggestions[domain];
    
    if (!isValidFormat) {
      return { status: 'invalid', message: 'Please enter a valid email address' };
    }
    
    if (suggestion) {
      return { status: 'warning', message: `Did you mean ${email.split('@')[0]}@${suggestion}?` };
    }
    
    return { status: 'valid', message: 'Email format looks good!' };
  }, [email]);

  if (validation.status === 'empty') return null;

  return (
    <div className="flex items-center gap-2 mt-1.5 text-xs">
      {validation.status === 'valid' && (
        <>
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-600">{validation.message}</span>
        </>
      )}
      {validation.status === 'invalid' && (
        <>
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-red-600">{validation.message}</span>
        </>
      )}
      {validation.status === 'warning' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-amber-600">{validation.message}</span>
        </>
      )}
    </div>
  );
};
