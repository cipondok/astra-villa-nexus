import { TableStyleDialog, TableFormField } from "@/components/ui/TableStyleDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <TableStyleDialog
      open={open}
      onOpenChange={onOpenChange}
      title="WhatsApp Inquiry"
      description="Connect with us instantly via WhatsApp"
      icon={MessageCircle}
      maxWidth="2xl"
      sections={[
        {
          title: "Property Details",
          rows: [
            { label: "Title", value: <span className="font-semibold">{property.title}</span> },
            { label: "Location", value: property.location || property.city || "N/A" },
            { 
              label: "Type", 
              value: (
                <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                  {property.property_type}
                </Badge>
              )
            },
            { 
              label: "Price", 
              value: <span className="text-lg font-bold text-primary">Rp {property.price?.toLocaleString('id-ID')}</span>
            }
          ]
        }
      ]}
      footer={
        <p className="text-xs text-center text-muted-foreground">
          Your inquiry will be sent directly to our WhatsApp business account
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TableFormField label="Full Name" icon={User}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="bg-background border-border/50"
          />
        </TableFormField>

        <TableFormField label="Phone Number" icon={Phone}>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62 812-3456-7890"
            required
            className="bg-background border-border/50"
          />
        </TableFormField>

        <TableFormField label="Message" icon={MessageCircle}>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I'm interested in this property..."
            rows={4}
            required
            className="bg-background border-border/50 resize-none"
          />
        </TableFormField>

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
    </TableStyleDialog>
  );
};

export default WhatsAppInquiryDialog;
