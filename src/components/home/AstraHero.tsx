import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Rocket, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const trustPoints = [
  "Verified Buyers & Serious Investors",
  "AI Liquidity & Smart Price Insights",
  "360° Virtual Property Experience",
];

const AstraHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-[#0a1628]">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-gold-primary/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 sm:space-y-8"
          >
            <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white">
              ASTRA VILLA
            </h1>

            <p className="text-xl sm:text-2xl font-inter font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Indonesia's Property Intelligence Platform
            </p>

            <p className="text-sm sm:text-base text-gray-400 font-inter leading-relaxed max-w-lg">
              Buy, sell, and invest faster with AI-driven liquidity insights,
              verified investors, and immersive virtual property experiences.
            </p>

            {/* Trust Points */}
            <div className="space-y-3">
              {trustPoints.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  <span className="text-sm text-gray-300 font-inter">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button
                size="lg"
                onClick={() => navigate('/vendor/register')}
                className="bg-gradient-to-r from-gold-primary to-amber-500 hover:from-amber-500 hover:to-gold-primary text-[#0a1628] font-bold px-7 py-6 text-sm rounded-xl shadow-lg shadow-gold-primary/25 transition-all duration-300"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Start Listing Property
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/search')}
                className="border-white/20 text-white hover:bg-white/10 px-7 py-6 text-sm rounded-xl backdrop-blur-sm"
              >
                <Search className="mr-2 h-4 w-4" />
                Explore Smart Deals
              </Button>
            </motion.div>

            {/* Trust Strip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-[11px] sm:text-xs text-gray-500 font-inter tracking-wide"
            >
              Trusted by Agents • Developers • Investors Across Indonesia
            </motion.p>
          </motion.div>

          {/* RIGHT VISUAL — Phone mockup with floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Phone frame */}
            <div className="relative w-[280px] h-[560px] rounded-[40px] border-[3px] border-white/15 bg-gradient-to-b from-[#0f1f3a] to-[#0a1628] shadow-2xl shadow-black/40 overflow-hidden">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#0a1628] rounded-b-2xl z-10" />

              {/* Phone screen content — Property card mockup */}
              <div className="absolute inset-3 top-8 rounded-[28px] overflow-hidden bg-gradient-to-b from-[#1a2d4a] to-[#0f1f3a]">
                {/* Property image area */}
                <div className="h-[45%] bg-gradient-to-br from-blue-900/60 to-cyan-900/40 flex items-end p-4">
                  <div className="space-y-1">
                    <div className="inline-flex px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                      <span className="text-[10px] text-emerald-400 font-semibold">PREMIUM</span>
                    </div>
                    <p className="text-white text-sm font-semibold">Luxury Villa Seminyak</p>
                    <p className="text-gray-400 text-[10px]">Bali, Indonesia</p>
                  </div>
                </div>

                {/* Property details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-gold-primary font-bold text-lg">Rp 8.5B</span>
                    <span className="text-[10px] text-gray-500">4 BR · 4 BA · 450m²</span>
                  </div>

                  {/* Mini metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "ROI", value: "12.4%" },
                      { label: "Yield", value: "8.2%" },
                      { label: "Score", value: "92" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="text-[9px] text-gray-500 uppercase">{m.label}</p>
                        <p className="text-xs text-white font-semibold">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-gold-primary to-amber-500 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#0a1628]">View Details</span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="text-[10px]">♡</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Liquidity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="absolute -left-12 top-[20%] px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
            >
              <p className="text-[10px] text-gray-400 font-inter uppercase tracking-wider">Liquidity Score</p>
              <p className="text-2xl font-bold text-emerald-400 font-inter mt-1">87</p>
            </motion.div>

            {/* Floating Investor Alert Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -right-8 top-[60%] px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
            >
              <p className="text-[10px] text-gray-400 font-inter uppercase tracking-wider">Investor Alert</p>
              <p className="text-sm font-bold text-amber-400 font-inter mt-1">High Demand 🔥</p>
            </motion.div>

            {/* Floating Price Trend */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -left-4 bottom-[15%] px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
            >
              <p className="text-[10px] text-gray-400 font-inter uppercase tracking-wider">Price Trend</p>
              <p className="text-sm font-bold text-cyan-400 font-inter mt-1">↑ +8.2% YoY</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AstraHero;
