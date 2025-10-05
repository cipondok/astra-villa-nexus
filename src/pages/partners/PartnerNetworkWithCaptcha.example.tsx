/**
 * EXAMPLE: How to integrate Captcha into Partner Network Form
 * 
 * This shows you how to integrate the captcha into your existing forms.
 * Copy this pattern to any form that needs captcha protection.
 */

import { Users, CheckCircle, Network, Building, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCaptcha } from "@/hooks/useCaptcha";
import { verifyCaptchaToken } from "@/utils/captchaVerification";

const PartnerNetworkWithCaptcha = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { executeRecaptcha, isAvailable } = useCaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Step 1: Execute captcha (if available)
      let captchaToken = null;
      if (isAvailable) {
        captchaToken = await executeRecaptcha('partner_network_form');
        
        if (!captchaToken) {
          toast({
            title: "Error",
            description: "Captcha verification failed. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        // Step 2: Verify captcha on backend
        const verification = await verifyCaptchaToken(captchaToken, 'partner_network_form');
        
        if (!verification.success) {
          toast({
            title: "Security Check Failed",
            description: verification.error || "Please try again later.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        console.log('Captcha verified successfully. Score:', verification.score);
      }

      // Step 3: Submit your form data
      // TODO: Replace this with your actual form submission logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: language === "en" ? "Application Submitted!" : "Aplikasi Terkirim!",
        description: language === "en" 
          ? "We'll contact you within 24 hours." 
          : "Kami akan menghubungi Anda dalam 24 jam.",
      });
      
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // rest of the component remains the same
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your form fields here */}
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name"
            className="h-12"
          />
          
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full text-lg h-14"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PartnerNetworkWithCaptcha;
