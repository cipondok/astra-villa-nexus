import AnimatedLogo from '@/components/AnimatedLogo';

const LandingFooter = () => {
  return (
    <footer className="py-6 border-t border-border/10 bg-astra-navy-dark">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AnimatedLogo size="sm" />
            <span className="font-playfair text-sm text-text-muted">
              AI-Powered Property Investment
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-muted font-inter">
            <a href="/about" className="hover:text-gold-primary transition-colors">About</a>
            <a href="/contact" className="hover:text-gold-primary transition-colors">Contact</a>
            <a href="/help" className="hover:text-gold-primary transition-colors">Help</a>
          </div>
          <p className="font-inter text-[11px] text-text-muted">
            © {new Date().getFullYear()} ASTRA Villa Realty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
