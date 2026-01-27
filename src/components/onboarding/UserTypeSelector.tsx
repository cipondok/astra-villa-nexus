import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building2, 
  Users, 
  Search, 
  Key,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { UserType } from "./OnboardingWizard";

interface UserTypeSelectorProps {
  onSelect: (type: UserType) => void;
}

const userTypes = [
  {
    id: "homeowner" as UserType,
    title: "Selling Property",
    subtitle: "I want to sell my home",
    icon: Home,
    color: "from-emerald-500 to-green-600",
    reward: "Free Featured Boost"
  },
  {
    id: "landlord" as UserType,
    title: "Renting Out",
    subtitle: "I want to rent my property",
    icon: Building2,
    color: "from-blue-500 to-cyan-600",
    reward: "Tenant Screening Tool"
  },
  {
    id: "agent" as UserType,
    title: "Real Estate Agent",
    subtitle: "I'm a property professional",
    icon: Users,
    color: "from-purple-500 to-violet-600",
    reward: "100 ASTRA + Verified Badge"
  },
  {
    id: "buyer" as UserType,
    title: "Buying Property",
    subtitle: "I'm looking to buy",
    icon: Search,
    color: "from-orange-500 to-amber-600",
    reward: "AI Property Assistant"
  },
  {
    id: "renter" as UserType,
    title: "Looking to Rent",
    subtitle: "I need a rental",
    icon: Key,
    color: "from-pink-500 to-rose-600",
    reward: "Priority Viewing"
  }
];

const UserTypeSelector = ({ onSelect }: UserTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold">Welcome to ASTRA Villa</h2>
        <p className="text-sm text-muted-foreground">
          Tell us what brings you here so we can personalize your experience
        </p>
      </div>

      {/* User Type Cards */}
      <div className="grid gap-2">
        {userTypes.map((type, index) => {
          const Icon = type.icon;
          
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/30 group"
                onClick={() => onSelect(type.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{type.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 hidden sm:inline-flex">
                      🎁 {type.reward}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        You can change this later in your profile settings
      </p>
    </div>
  );
};

export default UserTypeSelector;
