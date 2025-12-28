import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Gem, ArrowRight, Star, Zap } from "lucide-react";

export const PremiumButtonsDemo = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 gradient-text">
            Premium Gold-Orange Buttons
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elegant, premium button styles with gold and orange gradients, glass effects, and embossed text
          </p>
        </div>

        {/* Button Showcase Grid */}
        <div className="grid gap-8 md:gap-12">
          {/* Primary Gold-Orange Button */}
          <div className="glass-card p-8 rounded-2xl text-center">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Primary Gold-Orange</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Bold gradient with premium shadow effects
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="gold-orange" size="premium">
                <Crown className="w-5 h-5" />
                Get Started
              </Button>
              <Button variant="gold-orange" size="premium-sm">
                <Sparkles className="w-4 h-4" />
                Premium Plan
              </Button>
              <Button variant="gold-orange" size="default">
                <Star className="w-4 h-4" />
                Upgrade
              </Button>
            </div>
          </div>

          {/* Glass Button */}
          <div className="glass-card p-8 rounded-2xl text-center">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Glass Button</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Frosted glass with subtle gold glow
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="glass" size="premium">
                <Gem className="w-5 h-5" />
                Explore Features
              </Button>
              <Button variant="glass" size="premium-sm">
                <Zap className="w-4 h-4" />
                Quick Action
              </Button>
              <Button variant="glass" size="default">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Outline Emboss Button */}
          <div className="glass-card p-8 rounded-2xl text-center">
            <h3 className="text-xl font-semibold mb-2 text-foreground">Outline with Emboss</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Elegant outline with 3D embossed text effect
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline-emboss" size="premium">
                <Crown className="w-5 h-5" />
                View Collection
              </Button>
              <Button variant="outline-emboss" size="premium-sm">
                <Sparkles className="w-4 h-4" />
                See All
              </Button>
              <Button variant="outline-emboss" size="default">
                Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* CTA Button */}
          <div className="glass-card p-8 rounded-2xl text-center bg-gradient-to-br from-card via-card to-primary/5">
            <h3 className="text-xl font-semibold mb-2 text-foreground">CTA Button</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Animated gradient with premium glow
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="cta" size="premium">
                <Sparkles className="w-5 h-5" />
                Start Your Journey
              </Button>
              <Button variant="cta" size="premium-sm">
                <Crown className="w-4 h-4" />
                Join Now
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Info */}
        <div className="mt-12 p-6 glass-card rounded-2xl">
          <h4 className="font-semibold text-lg mb-4 text-foreground">How to Use</h4>
          <div className="space-y-3 text-sm text-muted-foreground font-mono">
            <p><code className="bg-muted px-2 py-1 rounded">{`<Button variant="gold-orange">Gold-Orange</Button>`}</code></p>
            <p><code className="bg-muted px-2 py-1 rounded">{`<Button variant="glass">Glass Button</Button>`}</code></p>
            <p><code className="bg-muted px-2 py-1 rounded">{`<Button variant="outline-emboss">Outline Emboss</Button>`}</code></p>
            <p><code className="bg-muted px-2 py-1 rounded">{`<Button variant="cta">CTA Button</Button>`}</code></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumButtonsDemo;
