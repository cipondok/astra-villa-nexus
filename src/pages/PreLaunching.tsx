import { Rocket, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PreLaunching = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mx-auto"
        >
          <Rocket className="h-10 w-10 text-primary" />
        </motion.div>

        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-gold-primary/15 text-gold-primary text-xs font-semibold tracking-wider uppercase">
            Coming Soon
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display">
            Pre-Launching Offers
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Exclusive early access to premium properties with special pre-launch pricing. 
            Be the first to discover new developments across Indonesia.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="default" size="lg" className="gap-2 rounded-full px-6" disabled>
            <Bell className="h-4 w-4" />
            Notify Me
          </Button>
          <Link to="/">
            <Button variant="outline" size="lg" className="gap-2 rounded-full px-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          Stay tuned — launching soon with exclusive deals
        </p>
      </motion.div>
    </div>
  );
};

export default PreLaunching;
