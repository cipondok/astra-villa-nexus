import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PartyPopper, 
  Gift, 
  ArrowRight,
  Home,
  Search,
  Plus,
  Trophy,
  Sparkles,
  Check
} from "lucide-react";
import { UserType } from "./OnboardingWizard";

interface OnboardingCompleteProps {
  userType: UserType;
  rewards: string[];
  onAction: (action: string) => void;
}

const OnboardingComplete = ({ userType, rewards, onAction }: OnboardingCompleteProps) => {

  const getCtaActions = () => {
    switch (userType) {
      case "homeowner":
      case "landlord":
        return [
          { label: "Add Your Property", action: "add-property", icon: Plus, primary: true },
          { label: "Go to Dashboard", action: "dashboard", icon: Home }
        ];
      case "agent":
        return [
          { label: "Start Adding Listings", action: "add-property", icon: Plus, primary: true },
          { label: "View Agent Dashboard", action: "dashboard", icon: Home }
        ];
      case "buyer":
      case "renter":
        return [
          { label: "Explore Properties", action: "explore", icon: Search, primary: true },
          { label: "Go to Dashboard", action: "dashboard", icon: Home }
        ];
      default:
        return [
          { label: "Go to Dashboard", action: "dashboard", icon: Home, primary: true }
        ];
    }
  };

  const actions = getCtaActions();

  return (
    <div className="space-y-6 text-center">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <PartyPopper className="h-10 w-10 text-white" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="h-4 w-4 text-primary-foreground" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold"
        >
          You're All Set! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          Your account is ready. Here's what you've unlocked:
        </motion.p>
      </div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Your Rewards</span>
            </div>
            <div className="space-y-2">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{reward}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-2"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.action}
              onClick={() => onAction(action.action)}
              variant={action.primary ? "default" : "outline"}
              className={`w-full ${action.primary ? 'bg-gradient-to-r from-primary to-primary/80' : ''}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
              {action.primary && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          );
        })}
      </motion.div>

      {/* Achievement Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex items-center justify-center gap-2"
      >
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="text-xs text-muted-foreground">
          Achievement Unlocked: Early Adopter
        </span>
      </motion.div>
    </div>
  );
};

export default OnboardingComplete;
