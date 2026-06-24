import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  LifeBuoy,
  MessageCircle,
  Home,
  TrendingUp,
  ScrollText,
  Store,
  Settings,
  Ticket,
  History,
  Search,
  Bot,
  UserCheck,
  Eye,
  ShieldCheck,
  Calculator,
  Briefcase,
  FileSearch,
  FileBadge,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  KeyRound,
  LogIn,
  CreditCard,
  Paperclip,
  Sparkles,
  X,
  Lock,
} from "lucide-react";

import { SEOHead } from "@/components/SEOHead";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import type { TicketCategory } from "@/components/support/types";

type SupportCategoryKey =
  | "general_inquiry"
  | "technical_support"
  | "account_issue"
  | "payment_issue"
  | "complaint"
  | "suggestion"
  | "other";

type ActionItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

const Contact = () => {
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general_inquiry" as SupportCategoryKey,
    message: "",
  });

  const toggleLanguage = () => setLanguage(language === "en" ? "id" : "en");

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const presetForm = (
    category: SupportCategoryKey,
    subject: string,
  ) => {
    setFormData((prev) => ({ ...prev, category, subject }));
    document
      .getElementById("support-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openLiveChat = () => {
    window.dispatchEvent(new CustomEvent("astra:open-support-chat"));
    toast({
      title: "Live Chat",
      description:
        "Connecting you to the ASTRA Villa AI assistant — a human agent will join if needed.",
    });
  };

  const goToTickets = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view and manage your support tickets.",
      });
      navigate("/login?redirect=/dashboard/support");
      return;
    }
    navigate("/dashboard/support");
  };

  const uploadAttachment = async (
    ticketId: string,
    file: File,
  ): Promise<string | null> => {
    try {
      const path = `${ticketId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("support-attachments")
        .upload(path, file, { upsert: false });
      if (error) {
        console.warn("Attachment upload failed:", error.message);
        return null;
      }
      return path;
    } catch (err) {
      console.warn("Attachment upload exception:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user?.id) {
        // Route directly into the platform Support System.
        const { data: ticket, error } = await supabase
          .from("support_tickets")
          .insert({
            user_id: user.id,
            category: formData.category as TicketCategory,
            subject: formData.subject || "Support request",
            description: formData.message,
            priority: "normal",
            metadata: {
              source: "contact_page",
              contact_name: formData.name,
              contact_email: formData.email,
              contact_phone: formData.phone,
            },
          })
          .select()
          .single();

        if (error) throw error;

        if (attachment && ticket?.id) {
          const path = await uploadAttachment(ticket.id, attachment);
          if (path) {
            await supabase.from("ticket_messages").insert({
              ticket_id: ticket.id,
              sender_id: user.id,
              sender_type: "user",
              message: `Attachment uploaded: ${attachment.name}`,
              attachments: [{ path, name: attachment.name, size: attachment.size }],
            });
          }
        }
      } else {
        // Guest path — still routed through platform support intake (no personal email).
        const { error } = await supabase.functions.invoke("notification-engine", {
          body: {
            action: "create_support_intake",
            payload: {
              source: "contact_page_guest",
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              category: formData.category,
              subject: formData.subject,
              message: formData.message,
            },
          },
        });
        if (error) throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Support request received",
        description:
          "Your request has been routed to the ASTRA Villa Support Center. You'll get an update shortly.",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          category: "general_inquiry",
          message: "",
        });
        setAttachment(null);
      }, 4000);
    } catch (err: any) {
      console.error("Contact submit error:", err);
      toast({
        title: "Could not submit",
        description:
          err?.message || "Please try again in a moment, or use Live Chat.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportGroups: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    items: ActionItem[];
  }[] = [
    {
      title: "Customer Support Center",
      description: "Open, track and manage your support tickets.",
      icon: LifeBuoy,
      items: [
        {
          label: "Open Support Ticket",
          icon: Ticket,
          onClick: () => presetForm("general_inquiry", "New support ticket"),
        },
        { label: "Track Existing Tickets", icon: Search, onClick: goToTickets },
        { label: "View Ticket History", icon: History, onClick: goToTickets },
      ],
    },
    {
      title: "Live Chat",
      description: "AI-first response, human escalation when needed.",
      icon: MessageCircle,
      items: [
        { label: "Connect to ASTRA Villa Support", icon: MessageCircle, onClick: openLiveChat },
        { label: "AI Assistant First Response", icon: Bot, onClick: openLiveChat },
        { label: "Human Support Escalation", icon: UserCheck, onClick: openLiveChat },
      ],
    },
    {
      title: "Property Assistance",
      description: "Inquiries, viewings and listing verification.",
      icon: Home,
      items: [
        {
          label: "Property Inquiry",
          icon: Home,
          onClick: () => presetForm("general_inquiry", "Property inquiry"),
        },
        {
          label: "Viewing Request",
          icon: Eye,
          onClick: () => presetForm("general_inquiry", "Property viewing request"),
        },
        {
          label: "Property Verification Request",
          icon: ShieldCheck,
          onClick: () => presetForm("general_inquiry", "Property verification request"),
        },
      ],
    },
    {
      title: "Investment Assistance",
      description: "Consultation, ROI analysis and investor support.",
      icon: TrendingUp,
      items: [
        {
          label: "Investment Consultation",
          icon: TrendingUp,
          onClick: () => presetForm("general_inquiry", "Investment consultation"),
        },
        {
          label: "ROI Analysis Request",
          icon: Calculator,
          onClick: () => presetForm("general_inquiry", "ROI analysis request"),
        },
        {
          label: "Investor Support",
          icon: Briefcase,
          onClick: () => presetForm("general_inquiry", "Investor support"),
        },
      ],
    },
    {
      title: "Legal & Documentation",
      description: "Due diligence, ownership and PMA support.",
      icon: ScrollText,
      items: [
        {
          label: "Due Diligence Request",
          icon: FileSearch,
          onClick: () => presetForm("general_inquiry", "Due diligence request"),
        },
        {
          label: "Ownership Verification",
          icon: FileBadge,
          onClick: () => presetForm("general_inquiry", "Ownership verification"),
        },
        {
          label: "PMA Support",
          icon: ScrollText,
          onClick: () => presetForm("general_inquiry", "PMA support"),
        },
      ],
    },
    {
      title: "Vendor Support",
      description: "Registration, verification and dashboard help.",
      icon: Store,
      items: [
        {
          label: "Vendor Registration",
          icon: Building2,
          onClick: () => presetForm("general_inquiry", "Vendor registration"),
        },
        {
          label: "Vendor Verification",
          icon: ClipboardCheck,
          onClick: () => presetForm("general_inquiry", "Vendor verification"),
        },
        {
          label: "Vendor Dashboard Support",
          icon: LayoutDashboard,
          onClick: () => presetForm("technical_support", "Vendor dashboard support"),
        },
      ],
    },
    {
      title: "Technical Support",
      description: "Account, login, platform and billing.",
      icon: Settings,
      items: [
        {
          label: "Account Issues",
          icon: KeyRound,
          onClick: () => presetForm("account_issue", "Account issue"),
        },
        {
          label: "Login Problems",
          icon: LogIn,
          onClick: () => presetForm("account_issue", "Login problem"),
        },
        {
          label: "Platform Support",
          icon: Settings,
          onClick: () => presetForm("technical_support", "Platform support"),
        },
        {
          label: "Billing Support",
          icon: CreditCard,
          onClick: () => presetForm("payment_issue", "Billing support"),
        },
      ],
    },
  ];

  const ticketStatuses = [
    { label: "Open", tone: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
    { label: "In Review", tone: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
    { label: "Awaiting Customer", tone: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
    { label: "Resolved", tone: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
    { label: "Closed", tone: "bg-muted text-muted-foreground border-border" },
  ];

  const categoryOptions: { value: SupportCategoryKey; label: string }[] = [
    { value: "general_inquiry", label: "General Inquiry" },
    { value: "technical_support", label: "Technical Support" },
    { value: "account_issue", label: "Account / Login" },
    { value: "payment_issue", label: "Billing / Payment" },
    { value: "complaint", label: "Complaint" },
    { value: "suggestion", label: "Suggestion" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact ASTRA Villa Support Center"
        description="Open a support ticket, chat with the ASTRA Villa AI assistant, or escalate to a human agent for property, investment, legal, vendor and platform support."
      />
      <EnhancedNavigation language={language} onLanguageToggle={toggleLanguage} />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.15), transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Enterprise Support Center
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Contact ASTRA Villa
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Our team is here to help with property, investment, legal, finance,
              management and platform support.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={openLiveChat} className="h-10">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Live Chat
              </Button>
              <Button
                variant="outline"
                className="h-10"
                onClick={() => presetForm("general_inquiry", "New support ticket")}
              >
                <Ticket className="h-4 w-4 mr-2" />
                Open Ticket
              </Button>
              <Button variant="ghost" className="h-10" onClick={goToTickets}>
                <History className="h-4 w-4 mr-2" />
                My Tickets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Groups */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <Card
                key={group.title}
                className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md hover:border-primary/40 transition-colors"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <GroupIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{group.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {group.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-1.5">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        className="w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-colors text-foreground/90"
                      >
                        <ItemIcon className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Contact Form + Sidebar */}
      <section id="support-form" className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur-md">
            <CardHeader className="p-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5 text-primary" />
                Submit to Support Center
              </CardTitle>
              <CardDescription className="text-xs">
                Routed directly into the ASTRA Villa Support System — never to a personal inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <CheckCircle className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">Request received</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Your support request has been logged in the ASTRA Villa Support Center.
                    {user
                      ? " Track its status from your dashboard."
                      : " Sign in to track its status in real time."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="attachment" className="text-xs">
                      Attachment (optional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="attachment"
                        className="flex-1 flex items-center gap-2 h-10 px-3 rounded-md border border-dashed border-border bg-background/40 text-xs text-muted-foreground cursor-pointer hover:border-primary/40"
                      >
                        <Paperclip className="h-4 w-4 text-primary" />
                        {attachment ? attachment.name : "Upload a file (PDF, image, document)"}
                      </label>
                      {attachment && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAttachment(null)}
                          aria-label="Remove attachment"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <input
                        id="attachment"
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          setAttachment(e.target.files?.[0] ?? null)
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit to Support Center
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Submissions are routed into the ASTRA Villa Admin → Customer Support
                    Center. We never publish or share personal contact details.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Your Support Dashboard
                </CardTitle>
                <CardDescription className="text-xs">
                  {user
                    ? "Manage tickets, chat with support and upload documents."
                    : "Sign in to create tickets, chat with support and track status."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={goToTickets}
                >
                  <Ticket className="h-4 w-4 mr-2 text-primary" />
                  {user ? "Go to My Tickets" : "Sign in to View Tickets"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={openLiveChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                  Chat with Support
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base">Ticket Status</CardTitle>
                <CardDescription className="text-xs">
                  Every request moves through these stages.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex flex-wrap gap-2">
                {ticketStatuses.map((s) => (
                  <span
                    key={s.label}
                    className={`text-[11px] px-2 py-1 rounded-md border ${s.tone}`}
                  >
                    {s.label}
                  </span>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60 backdrop-blur-md">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  AI-Powered First Response
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 text-xs text-muted-foreground space-y-2">
                <p>
                  ASTRA Villa's AI assistant handles your first response 24/7 and
                  escalates to a human specialist when your case needs hands-on
                  attention.
                </p>
                <p>
                  All inquiries are routed into the Admin → Customer Support
                  Center — never to personal email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
