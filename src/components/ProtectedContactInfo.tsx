import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedContactInfoProps {
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  className?: string;
}

const ProtectedContactInfo: React.FC<ProtectedContactInfoProps> = ({
  email,
  phone,
  whatsappNumber,
  className = ""
}) => {
  const { user } = useAuth();

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const visibleChars = Math.ceil(username.length * 0.2);
    const maskedUsername = username.substring(0, visibleChars) + '*'.repeat(username.length - visibleChars);
    return `${maskedUsername}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return '*'.repeat(phone.length);
    return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
  };

  return (
    <div className={className}>
      {email && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Email: </span>
          {user ? email : maskEmail(email)}
          {!user && (
            <span className="text-xs text-primary ml-2">
              (Sign in to view full email)
            </span>
          )}
        </div>
      )}
      
      {phone && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Phone: </span>
          {user ? phone : maskPhone(phone)}
          {!user && (
            <span className="text-xs text-primary ml-2">
              (Sign in to view full number)
            </span>
          )}
        </div>
      )}
      
      {whatsappNumber && user && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">WhatsApp: </span>
          {whatsappNumber}
        </div>
      )}
      
      {whatsappNumber && !user && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">WhatsApp: </span>
          <span className="text-primary">Sign in to view WhatsApp number</span>
        </div>
      )}
    </div>
  );
};

export default ProtectedContactInfo;