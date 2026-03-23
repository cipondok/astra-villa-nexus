import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Video, TrendingUp, Zap, Shield, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartInquiryCTAProps {
  intentLevel: "low" | "medium" | "high";
  onInquiry: (type: string) => void;
  propertyTitle?: string;
}

const SmartInquiryCTA = ({ intentLevel, onInquiry, propertyTitle }: SmartInquiryCTAProps) => {
  const isHighIntent = intentLevel === "high";
  const isMediumIntent = intentLevel === "medium";

  return (
    <div className="space-y-3">
      {isHighIntent && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs bg-primary/10 text-primary rounded-lg px-3 py-2"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="font-medium">High demand — secure priority access by contacting agent now</span>
        </motion.div>
      )}

      <div className="grid gap-2">
        <Button
          onClick={() => onInquiry("investment_question")}
          className="w-full justify-start gap-2"
          size={isHighIntent ? "lg" : "default"}
        >
          <MessageSquare className="h-4 w-4" />
          Ask Investment Questions
          {isHighIntent && (
            <Badge variant="secondary" className="ml-auto text-[9px]">
              <Clock className="h-2.5 w-2.5 mr-0.5" /> Avg reply: 2h
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => onInquiry("virtual_viewing")}
          className="w-full justify-start gap-2"
        >
          <Video className="h-4 w-4" />
          Request Virtual Viewing
        </Button>

        {(isMediumIntent || isHighIntent) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="outline"
              onClick={() => onInquiry("roi_discussion")}
              className="w-full justify-start gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Discuss ROI with Advisor
            </Button>
          </motion.div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Shield className="h-3 w-3" /> No obligation • Confidential • Escrow-protected transactions
      </p>
    </div>
  );
};

export default SmartInquiryCTA;
