import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, BarChart3, MapPin, Sparkles, DollarSign, Building2 } from "lucide-react";

interface ChatInvestmentChipsProps {
  onChipClick: (query: string) => void;
}

const chips = [
  { icon: TrendingUp, label: "Undervalued villas in Bali", color: "text-emerald-500" },
  { icon: BarChart3, label: "Highest rental yield properties", color: "text-amber-500" },
  { icon: DollarSign, label: "Good investment under 2B", color: "text-primary" },
  { icon: MapPin, label: "Emerging investment zones", color: "text-sky-500" },
  { icon: Building2, label: "Compare top 3 apartments ROI", color: "text-violet-500" },
  { icon: Sparkles, label: "Best deals this month", color: "text-rose-500" },
];

const ChatInvestmentChips = memo<ChatInvestmentChipsProps>(({ onChipClick }) => {
  return (
    <div className="flex flex-wrap gap-1.5 px-1 py-2">
      {chips.map((chip, i) => (
        <motion.button
          key={chip.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onChipClick(chip.label)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium",
            "bg-muted/50 border border-border/40",
            "hover:border-primary/40 hover:bg-primary/5",
            "active:scale-95 transition-all duration-150"
          )}
        >
          <chip.icon className={cn("h-3 w-3", chip.color)} />
          <span className="text-foreground/80">{chip.label}</span>
        </motion.button>
      ))}
    </div>
  );
});

ChatInvestmentChips.displayName = "ChatInvestmentChips";
export default ChatInvestmentChips;
