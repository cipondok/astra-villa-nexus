
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FooterNewsletterProps {
  language: "en" | "id";
}

const FooterNewsletter = ({ language }: FooterNewsletterProps) => {
  const [email, setEmail] = useState("");

  const text = {
    en: {
      newsletter: "Property Updates",
      newsletterText: "Subscribe to get the latest property listings and market updates",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe",
    },
    id: {
      newsletter: "Update Properti",
      newsletterText: "Berlangganan untuk mendapatkan listing properti dan update pasar terbaru",
      emailPlaceholder: "Masukkan email Anda",
      subscribe: "Berlangganan",
    }
  };

  const currentText = text[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    toast.success("Successfully subscribed to property updates!");
    setEmail("");
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm">
        {currentText.newsletter}
      </h4>
      <p className="text-muted-foreground text-sm">
        {currentText.newsletterText}
      </p>
      <form onSubmit={handleSubscribe} className="space-y-3">
        <Input
          type="email"
          placeholder={currentText.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass-ios border-border/30 text-sm"
          required
        />
        <Button 
          type="submit" 
          variant="ios"
          size="sm"
          className="w-full"
        >
          <Send className="h-3 w-3 mr-2" />
          {currentText.subscribe}
        </Button>
      </form>
    </div>
  );
};

export default FooterNewsletter;
