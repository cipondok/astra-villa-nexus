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
      <DialogContent className="sm:max-w-lg bg-background border-border shadow-lg">
        <DialogHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Contact Us About This Property</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Fill in your details and we'll connect you via WhatsApp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {/* Property Info Card */}
        <div className="rounded-lg border border-border bg-accent/50 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-semibold text-foreground line-clamp-1">{property.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{property.location || property.city}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {property.property_type}
            </Badge>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-lg font-bold text-primary">
              Rp {property.price?.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Your Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-border focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Your Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., +6281234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="border-border focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              Your Message *
            </Label>
            <Textarea
              id="message"
              placeholder="I'm interested in this property. Please provide more details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="border-border focus:border-primary resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-[#25D366] hover:bg-[#1fb855] text-white shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppInquiryDialog;
