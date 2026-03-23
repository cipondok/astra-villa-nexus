import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, BarChart3, Lock, Globe, ArrowRight, CheckCircle, Star, Wallet, Building } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const InvestorLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Invest in Indonesian Property | ASTRA Villa"
        description="Secure, AI-powered property investment platform. Earn rental yields, capital appreciation, and build global wealth through Indonesian real estate."
      />

      {/* HERO — Trust-First Impact */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }} className="text-center space-y-6">
            <Badge variant="outline" className="border-primary/40 text-primary px-4 py-1.5 text-sm">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Escrow-Protected Investment Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Invest in Indonesia's
              <span className="text-primary block">Property Growth Story</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-driven property intelligence, secure escrow transactions, and institutional-grade infrastructure for global investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/properties")} className="text-base px-8">
                Explore Opportunities <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-base px-8">
                Create Investor Account
              </Button>
            </div>
            <div className="flex justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> Verified Listings</span>
              <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> Escrow Secured</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-accent-foreground" /> Global Access</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TOP OPPORTUNITIES PREVIEW */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Featured Investment Opportunities</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">AI-scored properties with high rental yield and capital growth potential</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { city: "Bali", type: "Villa", yield: "8.5%", score: 87, price: "Rp 3.2B" },
              { city: "Jakarta", type: "Apartment", yield: "6.2%", score: 79, price: "Rp 1.8B" },
              { city: "Bandung", type: "Townhouse", yield: "7.1%", score: 82, price: "Rp 950M" },
            ].map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50" onClick={() => navigate("/properties")}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{p.city} {p.type}</p>
                        <p className="text-2xl font-bold text-primary">{p.price}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0">Score {p.score}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Yield {p.yield}</span>
                      <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> High Demand</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate("/properties")}>
              View All Opportunities <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ESCROW SAFETY EXPLANATION */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Your Investment is Protected</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Wallet, step: "1", title: "Fund Securely", desc: "Deposit via verified payment partners. Multi-currency support with live FX conversion." },
              { icon: Lock, step: "2", title: "Escrow Hold", desc: "Funds held in secure escrow until property verification and legal checks complete." },
              { icon: CheckCircle, step: "3", title: "Complete Deal", desc: "Ownership transfers only after all conditions are satisfied. Full audit trail." },
            ].map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }} className="text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">Step {s.step}</Badge>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 italic">
            "Funds remain protected until transaction conditions are fully satisfied."
          </p>
        </div>
      </section>

      {/* ROI INSIGHT TEASER */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">AI-Powered Investment Intelligence</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every property comes with data-driven insights to guide your investment decisions</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: BarChart3, label: "Investment Score", value: "0-100 rating" },
              { icon: TrendingUp, label: "ROI Forecast", value: "3-year projection" },
              { icon: Star, label: "Rental Yield", value: "Live benchmarks" },
              { icon: Building, label: "Market Demand", value: "Real-time index" },
            ].map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className="text-center p-5 border-border/50">
                  <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="font-semibold">{f.label}</p>
                  <p className="text-sm text-muted-foreground">{f.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FIRST FUNDING CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold">Start Your Investment Journey</h2>
            <p className="text-muted-foreground">Many investors begin with a small test deposit to explore opportunities.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Rp 2,000,000", "Rp 5,000,000", "Rp 10,000,000"].map((amt) => (
                <Button key={amt} variant="outline" onClick={() => navigate("/auth")} className="px-6">
                  Start with {amt}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">Average first deposit this week: Rp 4,500,000</p>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Join Global Investors Building Wealth in Indonesia</h2>
          <p className="text-primary-foreground/80 text-lg">Secure, transparent, AI-powered property investment infrastructure.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="px-8">
              Create Account
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8" onClick={() => navigate("/properties")}>
              Explore Properties
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestorLanding;
