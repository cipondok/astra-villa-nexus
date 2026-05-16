import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, BarChart3, Lock, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface InvestorSignupPromptProps {
  triggerSource?: string;
}

const InvestorSignupPrompt = ({ triggerSource = "general" }: InvestorSignupPromptProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Track listing views in sessionStorage
  const checkShouldShow = useCallback(() => {
    if (user || dismissed) return false;
    const dismissedAt = sessionStorage.getItem("signup_prompt_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 30 * 60 * 1000) return false;
    
    const views = parseInt(sessionStorage.getItem("listing_views") || "0");
    return views >= 2;
  }, [user, dismissed]);

  useEffect(() => {
    if (checkShouldShow()) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [checkShouldShow]);

  // Static method to increment view count
  useEffect(() => {
    const currentViews = parseInt(sessionStorage.getItem("listing_views") || "0");
    sessionStorage.setItem("listing_views", String(currentViews + 1));
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
    sessionStorage.setItem("signup_prompt_dismissed", String(Date.now()));
  };

  const handleSignup = async () => {
    // Track conversion event
    try {
      await supabase.from("signup_conversion_events").insert({
        trigger_source: triggerSource,
        visitor_session_id: sessionStorage.getItem("visitor_session_id") || crypto.randomUUID(),
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        signup_success_flag: false,
      });
    } catch (_) {}
    
    setOpen(false);
    navigate("/auth");
  };

  if (user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/50">
        <div className="relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-7 w-7" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
          
          <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 pb-4 text-center space-y-3">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs">
              <Shield className="h-3 w-3 mr-1" /> Secure Investment Platform
            </Badge>
            <h3 className="text-xl font-bold">Unlock Full Investment Insights</h3>
            <p className="text-sm text-muted-foreground">
              Create a free investor account to access ROI analytics, market intelligence, and secure escrow transactions.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BarChart3, label: "ROI Analysis", desc: "AI-powered forecasts" },
                { icon: TrendingUp, label: "Market Data", desc: "Real-time trends" },
                { icon: Lock, label: "Escrow Safety", desc: "Protected funds" },
                { icon: Users, label: "Global Access", desc: "Multi-currency" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <f.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSignup} className="w-full" size="lg">
              Create Free Investor Account
            </Button>

            <div className="text-center space-y-1">
              <p className="text-[11px] text-muted-foreground">No payment required • Takes 30 seconds</p>
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Funds protected by escrow until deal completion
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorSignupPrompt;

// Helper to trigger signup prompt from specific actions
export const triggerSignupPrompt = (source: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("listing_views", "3"); // Force show
    window.dispatchEvent(new CustomEvent("trigger-signup-prompt", { detail: { source } }));
  }
};
