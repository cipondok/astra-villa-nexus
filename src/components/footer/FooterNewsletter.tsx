
import { useState } from "react";
import { Send, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FooterNewsletterProps {
  language: "en" | "id";
}

const FooterNewsletter = ({ language }: FooterNewsletterProps) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const text = {
    en: {
      newsletter: "Stay Updated",
      newsletterText: "Get the latest property listings, market insights, and exclusive deals delivered to your inbox.",
      emailPlaceholder: "Enter your email address",
      subscribe: "Subscribe Now",
      benefits: [
        "Weekly market reports",
        "New property alerts",
        "Exclusive pre-launch access",
        "Investment insights"
      ],
      successMessage: "Thank you for subscribing!",
      subscribed: "You're subscribed!"
    },
    id: {
      newsletter: "Tetap Update",
      newsletterText: "Dapatkan listing properti terbaru, wawasan pasar, dan penawaran eksklusif langsung ke inbox Anda.",
      emailPlaceholder: "Masukkan alamat email Anda",
      subscribe: "Berlangganan Sekarang",
      benefits: [
        "Laporan pasar mingguan",
        "Peringatan properti baru",
        "Akses pra-peluncuran eksklusif",
        "Wawasan investasi"
      ],
      successMessage: "Terima kasih telah berlangganan!",
      subscribed: "Anda sudah berlangganan!"
    }
  };

  const currentText = text[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    console.log("Subscribing email:", email);
    setIsSubscribed(true);
    toast.success(currentText.successMessage);
    setEmail("");
    
    // Reset after 3 seconds for demo purposes
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-bold text-foreground text-sm">
          {currentText.newsletter}
        </h4>
      </div>
      
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {currentText.newsletterText}
        </p>
        
        {!isSubscribed ? (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <Input
                type="email"
                placeholder={currentText.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12 bg-background/50 border-border/30 focus:border-primary/50 text-sm"
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
              size="sm"
            >
              <Send className="h-3 w-3 mr-2" />
              {currentText.subscribe}
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">
              {currentText.subscribed}
            </span>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">What you'll get:</p>
          <ul className="space-y-1">
            {currentText.benefits.map((benefit, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FooterNewsletter;
