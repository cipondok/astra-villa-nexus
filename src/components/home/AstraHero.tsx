import { motion } from "framer-motion";
import vrTourHeroImg from "@/assets/vr-tour-hero.png";
import { CheckCircle, Users, Building2, HardHat, Eye, Rocket, Search, ShoppingBag, Home, Key, Store, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SearchPanelSkeleton } from "@/components/search/SearchSkeleton";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import SectionErrorBoundary from "@/components/ui/SectionErrorBoundary";

const AstraSearchPanel = lazy(() => import("@/components/AstraSearchPanel"));

interface AstraHeroProps {
  language?: string;
  onSearch?: (searchData: any) => void;
  onLiveSearch?: (term: string) => void;
  resultsCount?: number;
}

const rolePills = [
  { label: "Property Agent", icon: Users, path: "/agent-dashboard" },
  { label: "Property Owner", icon: Building2, path: "/dashboard/property-owner" },
  { label: "Developer", icon: HardHat, path: "/vendor/register" },
  { label: "Marketplace", icon: ShoppingBag, path: "/search" },
];

const quickLinks = [
  { label: "Buy Now", icon: Home, path: "/buy" },
  { label: "Rent Now", icon: Key, path: "/rent" },
  { label: "360° Virtual Tour", icon: Eye, path: "/vr-tour" },
];

const leftChecks = [
  "Pasang & kelola listing properti",
  "Promosikan New Launch Projects",
  "Menjangkau pembeli & investor serius",
  "AI Smart Price & Market Insights",
  "Dashboard analytics real-time",
];

const rightChecks = [
  "Apartment",
  "Branded Residence",
  "Project Baru (New Launch)",
];

const AstraHero = ({ language = "en", onSearch, onLiveSearch, resultsCount }: AstraHeroProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full overflow-hidden border-b border-border/30 bg-background" id="hero-section">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.12),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.18)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr] lg:gap-8 items-start">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className="mb-4"
                >
                  <div className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Luxury Property Intelligence
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="max-w-4xl font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-foreground"
                >
                  ASTRA <span className="text-primary">VILLA</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12 }}
                  className="mt-4 text-lg sm:text-xl font-semibold text-foreground/90"
                >
                  Global Property Investment Platform
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.18 }}
                  className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground"
                >
                  Secure, AI-scored property investments in Indonesia — protected by escrow, backed by market intelligence.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.24 }}
                  className="mt-5 flex flex-wrap gap-2.5"
                >
                  {rolePills.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => navigate(p.path)}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs sm:text-sm font-medium text-foreground backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card"
                    >
                      <p.icon className="h-3.5 w-3.5 text-primary" />
                      {p.label}
                    </button>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.3 }}
                  className="mt-8 flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    size="lg"
                    onClick={() => navigate("/search")}
                    className="h-12 px-6 text-sm font-semibold"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Explore Investment Opportunities
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/onboarding/investor")}
                    className="h-12 px-6 text-sm font-semibold border-border/70 bg-card/30"
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Start Secure Investment
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => navigate("/vendor/register")}
                    className="h-12 px-6 text-sm font-semibold"
                  >
                    <Store className="mr-2 h-4 w-4" />
                    List Property
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.38 }}
                  className="mt-8"
                >
                  <div className="flex flex-wrap gap-2">
                    {quickLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => navigate(link.path)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        <link.icon className="h-3.5 w-3.5 text-primary" />
                        {link.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.18 }}
                className="grid gap-4"
              >
                <div className="rounded-3xl border border-border/50 bg-card/75 p-5 shadow-xl backdrop-blur-xl">
                  <div className="mb-3 inline-flex rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    For Agents & Owners
                  </div>
                  <div className="space-y-2.5">
                    {leftChecks.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm leading-snug text-foreground/90">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="group rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-5 shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => navigate("/vr-tour")}
                >
                  <div className="grid gap-4 sm:grid-cols-[1fr_116px] sm:items-center">
                    <div>
                      <div className="mb-3 inline-flex rounded-lg border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                        Immersive Viewing
                      </div>
                      <p className="text-base font-semibold text-foreground mb-2">Nikmati Virtual Tour Property</p>
                      <div className="space-y-2">
                        {rightChecks.map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-[11px] font-semibold text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/investment");
                        }}
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Foreign Investment Program
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-2">
                      <img src={vrTourHeroImg} alt="360° Virtual Tour Experience" className="w-24 h-auto drop-shadow-xl" />
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        <Eye className="h-3 w-3" />
                        360° Virtual Tour
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 rounded-[28px] border border-border/50 bg-card/55 p-2 shadow-2xl backdrop-blur-xl"
            >
              <SectionErrorBoundary sectionName="Search" fallbackMinHeight="60px">
                <Suspense fallback={<SearchPanelSkeleton />}>
                  <SearchErrorBoundary>
                    <AstraSearchPanel
                      language={language}
                      onSearch={onSearch || (() => {})}
                      onLiveSearch={onLiveSearch || (() => {})}
                      resultsCount={resultsCount}
                    />
                  </SearchErrorBoundary>
                </Suspense>
              </SectionErrorBoundary>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="pt-4 text-center text-[11px] font-medium text-muted-foreground"
            >
              Escrow-Protected Transactions • Verified Listings • AI-Powered Investment Scoring
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AstraHero;
