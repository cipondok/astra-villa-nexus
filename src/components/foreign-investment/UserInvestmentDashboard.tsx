import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MessageSquare, Lightbulb, Clock, CheckCircle2, XCircle, ArrowLeft, Globe, LayoutDashboard } from "lucide-react";
import { InvestmentOrderForm } from "./InvestmentOrderForm";
import { InquiryForm } from "./InquiryForm";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { ForeignInvestmentChat } from "../ForeignInvestmentChat";
import { Link } from "react-router-dom";

export const UserInvestmentDashboard = () => {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const text = {
    en: {
      title: "Investment Dashboard",
      subtitle: "Manage your investment orders, inquiries, and ideas",
      overview: "Overview",
      orders: "Orders",
      inquiries: "Inquiries",
      ideas: "Ideas",
      chat: "Chat",
      investmentOrders: "Investment Orders",
      pending: "pending",
      awaitingResponse: "awaiting response",
      underReview: "under review",
      ideasSubmitted: "Ideas Submitted",
      yourOrders: "Your Investment Orders",
      yourInquiries: "Your Inquiries",
      yourIdeas: "Your Ideas",
      noOrders: "No investment orders yet. Submit one above to get started!",
      noInquiries: "No inquiries yet. Submit one above if you have questions!",
      noIdeas: "No ideas submitted yet. Share your thoughts above!",
      adminResponse: "Admin Response:",
      submitted: "Submitted:",
      location: "Location:",
      timeline: "Timeline:",
      notes: "Notes:",
      investment: "Investment"
    },
    id: {
      title: "Dashboard Investasi",
      subtitle: "Kelola pesanan investasi, pertanyaan, dan ide Anda",
      overview: "Ringkasan",
      orders: "Pesanan",
      inquiries: "Pertanyaan",
      ideas: "Ide",
      chat: "Chat",
      investmentOrders: "Pesanan Investasi",
      pending: "menunggu",
      awaitingResponse: "menunggu respons",
      underReview: "dalam review",
      ideasSubmitted: "Ide Terkirim",
      yourOrders: "Pesanan Investasi Anda",
      yourInquiries: "Pertanyaan Anda",
      yourIdeas: "Ide Anda",
      noOrders: "Belum ada pesanan investasi. Kirim satu di atas untuk memulai!",
      noInquiries: "Belum ada pertanyaan. Kirim pertanyaan Anda di atas!",
      noIdeas: "Belum ada ide yang dikirim. Bagikan pemikiran Anda di atas!",
      adminResponse: "Respons Admin:",
      submitted: "Dikirim:",
      location: "Lokasi:",
      timeline: "Timeline:",
      notes: "Catatan:",
      investment: "Investasi"
    }
  };

  const t = text[language];

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [ordersData, inquiriesData, ideasData] = await Promise.all([
        supabase
          .from("foreign_investment_orders")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("foreign_investment_inquiries")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_ideas")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      ]);

      setOrders(ordersData.data || []);
      setInquiries(inquiriesData.data || []);
      setIdeas(ideasData.data || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "new":
      case "submitted":
        return <Clock className="h-3.5 w-3.5" />;
      case "approved":
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "new":
      case "submitted":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "approved":
      case "completed":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span>{t.title}</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 space-y-6">
        {/* Subtitle */}
        <p className="text-sm text-muted-foreground">
          {t.subtitle}
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-10 sm:h-11 bg-muted/50 border border-border rounded-xl p-1">
            <TabsTrigger 
              value="overview" 
              className="text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.overview}
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1"
            >
              <TrendingUp className="h-3.5 w-3.5 hidden sm:block" />
              {t.orders}
            </TabsTrigger>
            <TabsTrigger 
              value="inquiries" 
              className="text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1"
            >
              <MessageSquare className="h-3.5 w-3.5 hidden sm:block" />
              {t.inquiries}
            </TabsTrigger>
            <TabsTrigger 
              value="ideas" 
              className="text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1"
            >
              <Lightbulb className="h-3.5 w-3.5 hidden sm:block" />
              {t.ideas}
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="text-[10px] sm:text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.chat}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5 mt-5">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    {t.investmentOrders}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{orders.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {orders.filter(o => o.status === "pending").length} {t.pending}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    {t.inquiries}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{inquiries.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {inquiries.filter(i => i.status === "new").length} {t.awaitingResponse}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    {t.ideasSubmitted}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{ideas.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {ideas.filter(i => i.status === "submitted").length} {t.underReview}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Forms Grid */}
            <div className="grid lg:grid-cols-2 gap-4">
              <InvestmentOrderForm />
              <div className="space-y-4">
                <InquiryForm />
                <IdeaSubmissionForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-5 mt-5">
            <InvestmentOrderForm />
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{t.yourOrders}</h3>
              {orders.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    {t.noOrders}
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="border-border bg-card">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-base capitalize">{order.property_type} {t.investment}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            IDR {order.investment_amount?.toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-[10px] sm:text-xs flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-1.5 text-xs sm:text-sm">
                      {order.location_preference && (
                        <p><span className="font-medium">{t.location}</span> {order.location_preference}</p>
                      )}
                      {order.investment_timeline && (
                        <p><span className="font-medium">{t.timeline}</span> {order.investment_timeline}</p>
                      )}
                      {order.notes && (
                        <p><span className="font-medium">{t.notes}</span> {order.notes}</p>
                      )}
                      <p className="text-muted-foreground pt-1">
                        {t.submitted} {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-5 mt-5">
            <InquiryForm />
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{t.yourInquiries}</h3>
              {inquiries.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    {t.noInquiries}
                  </CardContent>
                </Card>
              ) : (
                inquiries.map((inquiry) => (
                  <Card key={inquiry.id} className="border-border bg-card">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-base">{inquiry.subject}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm capitalize">
                            {inquiry.inquiry_type}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(inquiry.status)} text-[10px] sm:text-xs flex items-center gap-1`}>
                          {getStatusIcon(inquiry.status)}
                          <span className="capitalize">{inquiry.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2 text-xs sm:text-sm">
                      <p>{inquiry.message}</p>
                      {inquiry.admin_response && (
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="font-medium text-xs mb-1">{t.adminResponse}</p>
                          <p className="text-muted-foreground">{inquiry.admin_response}</p>
                        </div>
                      )}
                      <p className="text-muted-foreground pt-1">
                        {t.submitted} {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="ideas" className="space-y-5 mt-5">
            <IdeaSubmissionForm />
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{t.yourIdeas}</h3>
              {ideas.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    {t.noIdeas}
                  </CardContent>
                </Card>
              ) : (
                ideas.map((idea) => (
                  <Card key={idea.id} className="border-border bg-card">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-base">{idea.title}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm capitalize">
                            {idea.category}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(idea.status)} text-[10px] sm:text-xs flex items-center gap-1`}>
                          {getStatusIcon(idea.status)}
                          <span className="capitalize">{idea.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2 text-xs sm:text-sm">
                      <p>{idea.description}</p>
                      {idea.admin_response && (
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="font-medium text-xs mb-1">{t.adminResponse}</p>
                          <p className="text-muted-foreground">{idea.admin_response}</p>
                        </div>
                      )}
                      <p className="text-muted-foreground pt-1">
                        {t.submitted} {new Date(idea.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-5">
            <ForeignInvestmentChat />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
