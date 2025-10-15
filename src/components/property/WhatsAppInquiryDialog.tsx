import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BaseProperty } from "@/types/property";
import { MessageCircle, Phone, User } from "lucide-react";

interface WhatsAppInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: BaseProperty;
}

const WhatsAppInquiryDialog = ({ open, onOpenChange, property }: WhatsAppInquiryDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  // Company WhatsApp number (configure this with your actual number)
  const COMPANY_WHATSAPP = "6281234567890"; // Replace with your company WhatsApp number

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const inquiryMessage = `*New Property Inquiry*

*Property Details:*
- Title: ${property.title}
- Price: Rp ${property.price?.toLocaleString('id-ID')}
- Location: ${property.location || property.city}
- Type: ${property.property_type}
- Link: ${window.location.origin}/property/${property.id}

*Client Information:*
- Name: ${name}
- Phone: ${phone}

*Message:*
${message}`;

    const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(inquiryMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset form and close dialog
    setName("");
    setPhone("");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm">
                <MessageCircle className="h-7 w-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Send WhatsApp Inquiry</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-1">
                  Connect with us instantly
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Property Info Card */}
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-accent/30 to-accent/50 p-5 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <h4 className="font-bold text-lg text-foreground leading-tight">
                  {property.title}
                </h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location || property.city}
                </p>
              </div>
              <Badge variant="default" className="shrink-0 bg-primary text-primary-foreground">
                {property.property_type}
              </Badge>
            </div>
            <div className="pt-3 border-t border-border/50">
              <p className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Rp {property.price?.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border-2 border-border/50 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-semibold flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                WhatsApp Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+62 812 3456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-11 border-2 border-border/50 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground font-semibold flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 text-primary" />
                Your Message
              </Label>
              <Textarea
                id="message"
                placeholder="Hi! I'm interested in this property. Could you provide more information about..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="border-2 border-border/50 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
            
            <div className="flex gap-3 pt-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 border-2 hover:bg-accent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Send on WhatsApp
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppInquiryDialog;
