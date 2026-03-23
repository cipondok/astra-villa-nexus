import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Clock, Send, CheckCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TEMPLATES = [
  "Can you share rental income details for this property?",
  "Is the price negotiable? What's the best offer range?",
  "What is the expected appreciation over 3 years?",
  "Can I arrange a virtual viewing this week?",
  "What are the total ownership costs including maintenance?",
];

interface InquiryTrustPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
  propertyTitle?: string;
  inquiryType?: string;
  onSent?: () => void;
}

const InquiryTrustPopup = ({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  inquiryType = "investment_question",
  onSent,
}: InquiryTrustPopupProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleQuickFill = (template: string) => {
    setMessage((prev) => (prev ? prev + "\n" + template : template));
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      // Insert inquiry
      await supabase.from("inquiries").insert({
        property_id: propertyId,
        user_id: user?.id,
        message: message.trim(),
        status: "new",
        inquiry_type: inquiryType,
      });

      // Track behavior event
      if (user?.id) {
        await supabase.from("investor_behavior_events").insert({
          user_id: user.id,
          property_id: propertyId,
          event_type: "inquiry_sent",
          intent_level: "high",
        });
      }

      toast.success("Inquiry sent! You'll hear back within 24 hours.");
      setMessage("");
      onOpenChange(false);
      onSent?.();
    } catch (err) {
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send Investment Inquiry
          </DialogTitle>
        </DialogHeader>

        {/* Trust Reassurance Strip */}
        <div className="grid grid-cols-3 gap-2 py-2">
          {[
            { icon: Shield, label: "No Obligation", desc: "Zero commitment" },
            { icon: Lock, label: "Confidential", desc: "Private inquiry" },
            { icon: Clock, label: "Fast Response", desc: "Within 24h" },
          ].map((t, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
              <t.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] font-semibold">{t.label}</p>
              <p className="text-[9px] text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>

        {propertyTitle && (
          <p className="text-sm text-muted-foreground">
            Property: <span className="font-medium text-foreground">{propertyTitle}</span>
          </p>
        )}

        {/* Quick Templates */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleQuickFill(t)}
              >
                {t.length > 40 ? t.slice(0, 40) + "…" : t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Message Area */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your investment question here..."
          className="min-h-[100px] resize-none"
          maxLength={1000}
        />

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground italic">
            "Your inquiry helps you make an informed investment decision."
          </p>
          <Button onClick={handleSend} disabled={sending || !message.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Inquiry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryTrustPopup;
