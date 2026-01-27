import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Phone, Video, Clock, Check, 
  Send, User, ChevronRight, Star, Calendar,
  Loader2, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * Smart Inquiry Flow
 * Solves: Complicated contact forms, unclear response expectations
 * 
 * Technical: One-tap WhatsApp, auto-populated details, quick templates
 * Psychological: Response rate display, confirmation animation, trust indicators
 * Alternative: Direct call, video call request, AI chatbot
 */

interface SmartInquiryFlowProps {
  propertyTitle: string;
  agentName: string;
  agentPhoto?: string;
  responseRate?: string;
  avgResponseTime?: string;
  inquiryCount?: number;
  onClose?: () => void;
}

const SmartInquiryFlow: React.FC<SmartInquiryFlowProps> = ({
  propertyTitle,
  agentName,
  agentPhoto,
  responseRate = "98%",
  avgResponseTime = "within 2 hours",
  inquiryCount = 23,
  onClose,
}) => {
  const [step, setStep] = useState<'options' | 'message' | 'sending' | 'success'>('options');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);

  const quickTemplates = [
    { id: 'available', text: 'Is this property still available?', icon: '🏠' },
    { id: 'viewing', text: 'I\'d like to schedule a viewing', icon: '📅' },
    { id: 'price', text: 'Is the price negotiable?', icon: '💰' },
    { id: 'details', text: 'Can you share more details?', icon: '📋' },
  ];

  const handleWhatsAppInquiry = () => {
    const message = selectedTemplate 
      ? quickTemplates.find(t => t.id === selectedTemplate)?.text 
      : customMessage;
    
    const encodedMessage = encodeURIComponent(
      `Hi, I'm interested in: ${propertyTitle}\n\n${message}`
    );
    window.open(`https://wa.me/6285716008080?text=${encodedMessage}`, '_blank');
    setStep('success');
  };

  const handleSendMessage = async () => {
    setStep('sending');
    await new Promise(r => setTimeout(r, 1500));
    setStep('success');
  };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Contact Options */}
        {step === 'options' && (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Agent info with trust signals (Psychological) */}
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {agentPhoto ? (
                    <img src={agentPhoto} alt={agentName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-card" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">{agentName}</span>
                  <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">Verified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    4.9
                  </span>
                  <span>•</span>
                  <span>Replies {avgResponseTime}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-green-500">{responseRate}</span>
                <p className="text-[10px] text-muted-foreground">response rate</p>
              </div>
            </div>

            {/* Social proof */}
            <p className="text-xs text-center text-muted-foreground">
              📊 {inquiryCount} inquiries this week
            </p>

            {/* Quick templates (Technical) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Quick message:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setStep('message');
                    }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl",
                      "border border-border/50 bg-card",
                      "hover:border-primary hover:bg-primary/5",
                      "active:scale-95 transition-all",
                      "text-left"
                    )}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span className="text-xs text-foreground">{template.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact methods */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Or contact directly:</p>
              
              {/* WhatsApp - Primary (Technical) */}
              <Button
                onClick={handleWhatsAppInquiry}
                className="w-full h-12 bg-green-600 hover:bg-green-700 active:scale-95"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp Inquiry
                <span className="ml-auto text-xs opacity-80">Fastest</span>
              </Button>

              {/* Alternative options */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10 active:scale-95">
                  <Phone className="h-4 w-4 mr-1.5" />
                  <span className="text-xs">Call</span>
                </Button>
                <Button variant="outline" className="h-10 active:scale-95">
                  <Video className="h-4 w-4 mr-1.5" />
                  <span className="text-xs">Video Call</span>
                </Button>
              </div>
            </div>

            {/* Custom message option */}
            <button
              onClick={() => setStep('message')}
              className="w-full text-sm text-primary flex items-center justify-center gap-1 py-2"
            >
              Write custom message
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Message Composition */}
        {step === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setStep('options')}
                className="text-sm text-muted-foreground"
              >
                ← Back
              </button>
              <span className="text-sm font-medium">Your Message</span>
              <div className="w-12" />
            </div>

            {/* Selected template or custom */}
            <div className="space-y-3">
              {selectedTemplate && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm text-foreground">
                    {quickTemplates.find(t => t.id === selectedTemplate)?.text}
                  </p>
                </div>
              )}

              <Textarea
                placeholder="Add more details to your message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px] resize-none"
              />

              {/* Follow-up reminder option (Psychological) */}
              <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleFollowUp}
                  onChange={(e) => setScheduleFollowUp(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">Set follow-up reminder</span>
                  <p className="text-xs text-muted-foreground">We'll remind you if no reply in 24h</p>
                </div>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleWhatsAppInquiry}
                className="h-11 active:scale-95"
              >
                <MessageCircle className="h-4 w-4 mr-1.5 text-green-500" />
                WhatsApp
              </Button>
              <Button
                onClick={handleSendMessage}
                className="h-11 active:scale-95"
              >
                <Send className="h-4 w-4 mr-1.5" />
                Send In-App
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Sending */}
        {step === 'sending' && (
          <motion.div
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Sending your message...</p>
          </motion.div>
        )}

        {/* Step 4: Success (Psychological - Confirmation) */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-green-500" />
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Message Sent! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                {agentName} typically replies {avgResponseTime}
              </p>
            </div>

            {/* Next steps (Psychological) */}
            <div className="space-y-2 text-left p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium text-foreground">What happens next:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Agent receives your inquiry via app & WhatsApp</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>You'll get notified when they respond</span>
                </li>
                {scheduleFollowUp && (
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="h-3 w-3 text-accent" />
                    </span>
                    <span>We'll remind you to follow up if no reply in 24h</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="h-10 active:scale-95">
                Continue Browsing
              </Button>
              <Button 
                onClick={() => {/* Navigate to messages */}} 
                className="h-10 active:scale-95"
              >
                View Messages
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartInquiryFlow;
