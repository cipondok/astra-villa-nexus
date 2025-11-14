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
      <DialogContent className="sm:max-w-2xl bg-card/100 border-2 border-primary/20 p-0 shadow-2xl animate-macos-window-in backdrop-blur-none overflow-hidden">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <MessageCircle className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">WhatsApp Inquiry</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Connect with us instantly via WhatsApp
              </DialogDescription>
            </div>
          </div>
        </div>
        
        {/* Content Section - Table Style */}
        <div className="p-6 space-y-4">
          {/* Property Information - Table Style */}
          <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase" colSpan={2}>
                    Property Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 w-32 text-sm font-medium text-muted-foreground">
                    Title
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-semibold">
                    {property.title}
                  </td>
                </tr>
                <tr className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 w-32 text-sm font-medium text-muted-foreground">
                    Location
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {property.location || property.city}
                  </td>
                </tr>
                <tr className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 w-32 text-sm font-medium text-muted-foreground">
                    Type
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                      {property.property_type}
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 w-32 text-sm font-medium text-muted-foreground">
                    Price
                  </td>
                  <td className="px-4 py-3 text-lg font-bold text-primary">
                    Rp {property.price?.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inquiry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Information - Table Style */}
            <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase" colSpan={2}>
                      Your Information
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3" colSpan={2}>
                      <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="bg-background border-border/50"
                      />
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3" colSpan={2}>
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 812-3456-7890"
                        required
                        className="bg-background border-border/50"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3" colSpan={2}>
                      <Label htmlFor="message" className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="I'm interested in this property..."
                        rows={4}
                        required
                        className="bg-background border-border/50 resize-none"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-border/50 hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send via WhatsApp
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-muted/20 border-t border-border/50 px-6 py-3">
          <p className="text-xs text-center text-muted-foreground">
            Your inquiry will be sent directly to our WhatsApp business account
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppInquiryDialog;
