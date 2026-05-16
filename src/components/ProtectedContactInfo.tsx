import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Phone, Mail, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProtectedContactInfoProps {
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  className?: string;
  showButtons?: boolean;
}

const ProtectedContactInfo: React.FC<ProtectedContactInfoProps> = ({
  email,
  phone,
  whatsappNumber,
  className = "",
  showButtons = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const visibleChars = Math.ceil(username.length * 0.3);
    const maskedUsername = username.substring(0, visibleChars) + '*'.repeat(username.length - visibleChars);
    return `${maskedUsername}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return '*'.repeat(phone.length);
    const countryCode = phone.startsWith('+62') ? '+62' : phone.substring(0, 3);
    const remaining = phone.substring(countryCode.length);
    return countryCode + '*'.repeat(Math.max(0, remaining.length - 3)) + remaining.slice(-3);
  };

  const handleRevealField = (field: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view full contact information.",
        variant: "destructive",
      });
      return;
    }

    setRevealedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  const isRevealed = (field: string) => user && revealedFields.has(field);

  const ContactField = ({ 
    field, 
    value, 
    maskFn, 
    icon: Icon, 
    label,
    actionFn 
  }: {
    field: string;
    value: string;
    maskFn: (val: string) => string;
    icon: React.ComponentType<any>;
    label: string;
    actionFn?: () => void;
  }) => (
    <div className="group relative">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50 hover:border-border transition-all">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
            <div className="font-mono text-sm">
              {isRevealed(field) ? value : maskFn(value)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRevealField(field)}
            className="p-2 hover:bg-primary/10"
            title={isRevealed(field) ? "Hide" : user ? "Reveal" : "Sign in to view"}
          >
            {isRevealed(field) ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-primary" />
            )}
          </Button>
          
          {showButtons && actionFn && isRevealed(field) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={actionFn}
              className="p-2 hover:bg-accent/10"
            >
              <Icon className="h-4 w-4 text-accent" />
            </Button>
          )}
        </div>
      </div>
      
      {!user && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/90 px-3 py-1.5 rounded-full border">
            <Shield className="h-3 w-3" />
            Sign in to view
          </div>
        </div>
      )}
      
      {!isRevealed(field) && user && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
            Click to reveal
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {email && (
        <ContactField
          field="email"
          value={email}
          maskFn={maskEmail}
          icon={Mail}
          label="Email Address"
          actionFn={() => window.open(`mailto:${email}`, '_self')}
        />
      )}
      
      {phone && (
        <ContactField
          field="phone"
          value={phone}
          maskFn={maskPhone}
          icon={Phone}
          label="Phone Number"
          actionFn={() => window.open(`tel:${phone}`, '_self')}
        />
      )}
      
      {whatsappNumber && (
        <ContactField
          field="whatsapp"
          value={whatsappNumber}
          maskFn={maskPhone}
          icon={MessageCircle}
          label="WhatsApp"
          actionFn={() => window.open(`https://wa.me/${whatsappNumber.replace('+', '')}`, '_blank')}
        />
      )}
    </div>
  );
};

export default ProtectedContactInfo;