import { useNavigate } from "react-router-dom";
import { Calculator, TrendingUp, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AIPriceEstimatorCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-10 sm:py-14 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-primary/20 bg-gradient-to-br from-card via-card/95 to-gold-primary/5 shadow-xl"
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Left: Icon + Text */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-primary/15 border border-gold-primary/25 text-gold-primary text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Cek Estimasi Harga{" "}
                <span className="bg-gradient-to-r from-gold-primary to-gold-primary/70 bg-clip-text text-transparent">
                  Properti Anda
                </span>
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                Dapatkan estimasi harga pasar berdasarkan data real-time, analisis AI, dan perbandingan properti serupa di lokasi Anda.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/80">
                  <TrendingUp className="h-4 w-4 text-gold-primary" />
                  <span>ROI & Rental Yield</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/80">
                  <Shield className="h-4 w-4 text-gold-primary" />
                  <span>Investment Score</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/80">
                  <Calculator className="h-4 w-4 text-gold-primary" />
                  <span>Market Comparables</span>
                </div>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex flex-col items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/ai-pricing")}
                  className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-background shadow-lg shadow-gold-primary/25 transition-all"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Cek Harga Sekarang
                </Button>
              </motion.div>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                Gratis • Tanpa login • Hasil instan
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIPriceEstimatorCTA;
