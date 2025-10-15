import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { BaseProperty } from "@/types/property";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Us About This Property</DialogTitle>
          <DialogDescription>
            Fill in your details and we'll connect you with the property owner via WhatsApp.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Your Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., +6281234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              placeholder="I'm interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-1">Property: {property.title}</p>
            <p>Price: Rp {property.price?.toLocaleString('id-ID')}</p>
          </div>
          
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
            Send via WhatsApp
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppInquiryDialog;
