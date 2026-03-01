import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, HardHat, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DEMO_PROJECTS } from '@/data/demoOffPlanProjects';
import Price from '@/components/ui/Price';

export default function EarlyInvestmentCTA() {
  const navigate = useNavigate();
  const featured = DEMO_PROJECTS.filter(p => p.isEarlyBird || p.isPreLaunch).slice(0, 3);
  const avgROI = Math.round(DEMO_PROJECTS.reduce((s, p) => s + p.appreciationPct, 0) / DEMO_PROJECTS.length);

  return (
    <section className="py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="border-primary/15 bg-gradient-to-r from-primary/5 via-card to-primary/5 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
              {/* Left: Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <HardHat className="h-5 w-5 text-primary" />
                  <h3 className="text-sm sm:text-base font-bold text-foreground">Early Investment Opportunities</h3>
                  <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20">New</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get pre-launch prices on {DEMO_PROJECTS.length} off-plan projects with avg. {avgROI}% projected ROI.
                </p>

                {/* Mini project cards */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {featured.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-shrink-0 flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/40 min-w-[200px]"
                    >
                      <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-md object-cover" loading="lazy" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-foreground truncate">{p.title}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-muted-foreground"><Price amount={p.startingPrice} short /></span>
                          <span className="text-[9px] text-primary font-bold flex items-center gap-0.5">
                            <TrendingUp className="h-2.5 w-2.5" />+{p.appreciationPct}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: CTA */}
              <Button
                onClick={() => navigate('/early-investment')}
                className="shrink-0 gap-1.5"
                size="sm"
              >
                Explore Projects
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
