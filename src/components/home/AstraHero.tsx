import { motion } from "framer-motion";
import { CheckCircle, Users, Building2, HardHat, Eye, Rocket, Search, ShoppingBag, Home, Key } from "lucide-react";
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
    <section className="relative w-full overflow-hidden" id="hero-section">
      {/* Background — light: sky blue gradient, dark: deep navy */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0099e6] via-[#0088d4] to-[#006bb3] dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#081225]" />
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#005a9e]/40 dark:from-[#060e1a]/60 to-transparent" />

      {/* Decorative glows */}
      <div className="absolute top-[10%] right-[5%] w-64 h-64 rounded-full bg-white/5 dark:bg-blue-500/8 blur-xl" />
      <div className="absolute bottom-[20%] left-[-5%] w-48 h-48 rounded-full bg-white/5 dark:bg-cyan-500/5 blur-lg" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 lg:pt-8 pb-3">
          {/* Header: Title + Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 mb-4 sm:mb-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-orbitron text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] drop-shadow-lg tracking-wider"
            >
              ASTRA <span className="text-[#ffe14d]">VILLA</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-base sm:text-xl lg:text-2xl font-bold text-white mt-1 sm:mt-0 sm:pb-1 drop-shadow"
            >
              Indonesia's Smart Property Platform
            </motion.p>
          </div>

          {/* Role pills — clickable links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-4 sm:mb-5"
          >
            {rolePills.map((p) => (
              <button
                key={p.label}
                onClick={() => navigate(p.path)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/15 text-[#006bb3] dark:text-white text-xs sm:text-sm font-semibold shadow-md backdrop-blur-sm hover:bg-white hover:dark:bg-white/25 transition-colors duration-200 cursor-pointer"
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
              </button>
            ))}
          </motion.div>

          {/* Two-column info cards */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            {/* Left card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/95 dark:bg-white/10 dark:border dark:border-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl"
            >
              <div className="inline-block px-3 py-1 bg-[#006bb3] dark:bg-blue-600 rounded-lg mb-2">
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  For Agents & Owners
                </span>
              </div>
              <div className="space-y-1.5">
                {leftChecks.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-800 dark:text-gray-200 font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right card — VR tour */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, duration: 0.6 }}
              className="bg-[#ffe14d]/95 dark:bg-amber-500/20 dark:border dark:border-amber-500/30 backdrop-blur-sm rounded-2xl p-4 shadow-xl cursor-pointer hover:scale-[1.01] transition-transform"
              onClick={() => navigate("/vr-tour")}
            >
              <div className="inline-block px-3 py-1 bg-[#ff8c00] dark:bg-amber-600 rounded-lg mb-2">
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  First Time in Indonesia
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Nikmati Virtual Tour Property:
              </p>
              <div className="space-y-1.5">
                {rightChecks.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span onClick={(e) => { e.stopPropagation(); navigate("/investment"); }} className="text-[11px] font-bold text-[#006bb3] dark:text-blue-300 cursor-pointer hover:underline">🌍 Foreign Investment Program</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#006bb3] dark:bg-blue-600 text-white shadow-lg">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#006bb3] dark:text-blue-300">360° Virtual Tour</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tagline + Quick links row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.5 }}
            className="mb-4 sm:mb-5"
          >
            <p className="text-sm sm:text-base lg:text-lg font-black text-white drop-shadow-md mb-3">
              One Platform. <span className="text-[#ffe14d]">Full Access.</span> Smart Property Experience.
            </p>

            {/* Quick action links */}
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 dark:bg-white/10 text-white text-xs font-semibold hover:bg-white/30 dark:hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-2.5 mb-4 sm:mb-5"
          >
            <Button
              size="lg"
              onClick={() => navigate("/vendor/register")}
              className="bg-gradient-to-r from-[#ffe14d] to-[#ffb800] hover:from-[#ffb800] hover:to-[#ffe14d] text-gray-900 font-bold px-6 py-5 text-sm rounded-xl shadow-lg shadow-yellow-500/30 transition-all duration-300"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Start Listing Property
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/search")}
              className="border-white/40 text-white hover:bg-white/15 px-6 py-5 text-sm rounded-xl backdrop-blur-sm"
            >
              <Search className="mr-2 h-4 w-4" />
              Explore Smart Deals
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/portfolio-dashboard")}
              className="border-white/40 text-white hover:bg-white/15 px-6 py-5 text-sm rounded-xl backdrop-blur-sm"
            >
              Invest Now
            </Button>
          </motion.div>

          {/* Search panel ON the slide */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="w-full max-w-5xl mx-auto pb-4 sm:pb-6"
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

          {/* Trust footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-[11px] text-white/60 font-medium pb-3"
          >
            Trusted by Agents • Developers • Investors Across Indonesia
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default AstraHero;
