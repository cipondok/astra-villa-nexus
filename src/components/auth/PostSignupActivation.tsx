import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Wallet, Search, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

interface PostSignupActivationProps {
  userName?: string;
  onDismiss?: () => void;
}

const PostSignupActivation = ({ userName, onDismiss }: PostSignupActivationProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const actions = [
    {
      icon: Search,
      title: "Explore Properties",
      desc: "Browse AI-scored investment opportunities across Indonesia",
      cta: "View Properties",
      path: "/properties",
    },
    {
      icon: Wallet,
      title: "Set Up Your Wallet",
      desc: "Prepare for secure escrow transactions with multi-currency support",
      cta: "Open Wallet",
      path: "/wallet",
    },
    {
      icon: TrendingUp,
      title: "View Market Intelligence",
      desc: "Access rental yield data, price trends, and city investment scores",
      cta: "See Insights",
      path: "/market-intelligence-feed",
    },
  ];

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={stagger}
      className="max-w-2xl mx-auto space-y-6 p-4"
    >
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <Badge variant="outline" className="border-primary/40 text-primary">
          <CheckCircle className="h-3 w-3 mr-1" /> Account Created Successfully
        </Badge>
        <h2 className="text-2xl font-bold">
          Welcome{userName ? `, ${userName}` : ""}! 🎉
        </h2>
        <p className="text-muted-foreground">
          You now have access to ASTRA's global property investment intelligence platform.
        </p>
      </motion.div>

      {/* How It Works Mini */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">How Secure Investing Works</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { step: "1", label: "Browse & Analyze", desc: "AI-scored listings" },
                { step: "2", label: "Reserve via Escrow", desc: "Funds held securely" },
                { step: "3", label: "Complete Deal", desc: "Verified ownership" },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mx-auto">
                    {s.step}
                  </div>
                  <p className="text-xs font-semibold">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" /> Recommended Next Steps
        </h3>
        {actions.map((action, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Card 
              className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => { onDismiss?.(); navigate(action.path); }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  {action.cta} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.p variants={fadeUp} className="text-center text-xs text-muted-foreground italic">
        "Your funds remain protected until property verification is complete."
      </motion.p>
    </motion.div>
  );
};

export default PostSignupActivation;
