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
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="glass-effect rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Exclusive Villa Offers
              </h2>
              <p className="text-muted-foreground text-lg">
                Register now to receive personalized luxury villa recommendations
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="pl-12 h-14 text-base bg-background/50 border-border/50 focus:border-primary rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Exclusive Access
                <Sparkles className="w-5 h-5" />
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🏝️', text: 'Bali Villas' },
                { icon: '🎁', text: 'Special Offers' },
                { icon: '⚡', text: 'Early Access' }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50"
                >
                  <span className="text-3xl">{benefit.icon}</span>
                  <span className="text-sm font-medium text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              By registering, you agree to receive marketing emails. Unsubscribe anytime.
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
