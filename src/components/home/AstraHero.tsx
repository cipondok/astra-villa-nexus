import { motion } from "framer-motion";
import { CheckCircle, Users, Building2, HardHat, Eye, Rocket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";
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
  { label: "Property Agent", icon: Users },
  { label: "Property Owner", icon: Building2 },
  { label: "Developer", icon: HardHat },
];

const leftChecks = [
  "Pasang & kelola listing properti",
  "Promosikan New Launch Projects",
  "Menjangkau pembeli & investor serius",
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
      {/* Sky-blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0099e6] via-[#0088d4] to-[#006bb3]" />

      {/* Subtle cloud/city silhouette overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#005a9e]/40 to-transparent" />

      {/* Decorative circles */}
      <div className="absolute top-[10%] right-[5%] w-64 h-64 rounded-full bg-white/5 blur-xl" />
      <div className="absolute bottom-[20%] left-[-5%] w-48 h-48 rounded-full bg-white/5 blur-lg" />

      <div className="relative z-10">
        {/* Main content area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-4">
          {/* Header row: Title + Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 mb-6 sm:mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] drop-shadow-lg"
            >
              ASTRA <span className="text-[#ffe14d]">VILLA</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-1 sm:mt-0 sm:pb-1 drop-shadow"
            >
              Indonesia's Smart Property Platform
            </motion.p>
          </div>

          {/* Role pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
          >
            {rolePills.map((p) => (
              <div
                key={p.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-[#006bb3] text-xs sm:text-sm font-semibold shadow-md backdrop-blur-sm"
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label}
              </div>
            ))}
          </motion.div>

          {/* Two-column info cards */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {/* Left card — listing features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl"
            >
              <div className="space-y-2.5">
                {leftChecks.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right card — VR tour */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="bg-[#ffe14d]/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl"
            >
              <div className="inline-block px-3 py-1 bg-[#ff8c00] rounded-lg mb-3">
                <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
                  First Time in Indonesia
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-2">
                Nikmati Virtual Tour Property:
              </p>
              <div className="space-y-2">
                {rightChecks.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    <span className="text-sm text-gray-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#006bb3] text-white shadow-lg">
                  <Eye className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-[#006bb3]">360° Virtual Tour</span>
              </div>
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mb-5 sm:mb-6"
          >
            <p className="text-base sm:text-lg lg:text-xl font-black text-white drop-shadow-md">
              One Platform. <span className="text-[#ffe14d]">Full Access.</span> Smart Property Experience.
            </p>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium">
              Bangun masa depan properti Anda bersama Astra Villa.
            </p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8"
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
          </motion.div>

          {/* Search panel ON the slide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="w-full max-w-5xl mx-auto pb-6 sm:pb-8"
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
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-center text-[11px] sm:text-xs text-white/60 font-medium pb-4 sm:pb-6"
          >
            Trusted by Agents • Developers • Investors Across Indonesia
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default AstraHero;
