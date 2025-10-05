import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Sparkles } from 'lucide-react';
import GmailOfferPopup from './GmailOfferPopup';

const OfferRegistration = () => {
  const [email, setEmail] = useState('');
  const [showGmailOffer, setShowGmailOffer] = useState(false);
  const [hasShownOffer, setHasShownOffer] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Check if email ends with @gmail.com and offer hasn't been shown yet
    if (value.toLowerCase().endsWith('@gmail.com') && !hasShownOffer && value.length > 10) {
      setShowGmailOffer(true);
      setHasShownOffer(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Email registered:', email);
  };

  return (
    <>
      <div className="w-full max-w-xl mx-auto p-4">
        <div className="glass-effect rounded-xl border border-white/20 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Exclusive Villa Offers
              </h2>
              <p className="text-muted-foreground text-sm">
                Register to receive personalized recommendations
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="pl-10 h-11 text-sm bg-background/50 border-border/50 focus:border-primary rounded-lg"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full h-11 text-sm gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Exclusive Access
                <Sparkles className="w-4 h-4" />
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: '🏝️', text: 'Bali Villas' },
                { icon: '🎁', text: 'Offers' },
                { icon: '⚡', text: 'Early Access' }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <span className="text-2xl">{benefit.icon}</span>
                  <span className="text-xs font-medium text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              By registering, you agree to receive emails. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Gmail Offer Popup */}
      <GmailOfferPopup
        show={showGmailOffer}
        onClose={() => setShowGmailOffer(false)}
        email={email}
      />
    </>
  );
};

export default OfferRegistration;
