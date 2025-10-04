import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageSquare, Lightbulb, Clock, CheckCircle2, XCircle } from "lucide-react";
import { InvestmentOrderForm } from "./InvestmentOrderForm";
import { InquiryForm } from "./InquiryForm";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { ForeignInvestmentChat } from "../ForeignInvestmentChat";

export const UserInvestmentDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        return <Clock className="h-4 w-4" />;
      case "approved":
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "new":
      case "submitted":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "approved":
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Foreign Investment Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your investment orders, inquiries, and ideas
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-card/50 backdrop-blur-sm shadow-lg rounded-2xl border-2 border-primary/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3">
            <TrendingUp className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3">
            <MessageSquare className="h-4 w-4 mr-2" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="ideas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3">
            <Lightbulb className="h-4 w-4 mr-2" />
            Ideas
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3">
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Investment Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{orders.length}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {orders.filter(o => o.status === "pending").length} pending
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{inquiries.length}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {inquiries.filter(i => i.status === "new").length} awaiting response
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Ideas Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{ideas.length}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {ideas.filter(i => i.status === "submitted").length} under review
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InvestmentOrderForm />
            <div className="space-y-6">
              <InquiryForm />
              <IdeaSubmissionForm />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6 mt-6">
          <InvestmentOrderForm />
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Your Investment Orders</h3>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No investment orders yet. Submit one above to get started!
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-2 border-primary/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize">{order.property_type} Investment</CardTitle>
                        <CardDescription>
                          IDR {order.investment_amount.toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {order.location_preference && (
                      <p><span className="font-medium">Location:</span> {order.location_preference}</p>
                    )}
                    {order.investment_timeline && (
                      <p><span className="font-medium">Timeline:</span> {order.investment_timeline}</p>
                    )}
                    {order.notes && (
                      <p><span className="font-medium">Notes:</span> {order.notes}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-6 mt-6">
          <InquiryForm />
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Your Inquiries</h3>
            {inquiries.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No inquiries yet. Submit one above if you have questions!
                </CardContent>
              </Card>
            ) : (
              inquiries.map((inquiry) => (
                <Card key={inquiry.id} className="border-2 border-primary/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{inquiry.subject}</CardTitle>
                        <CardDescription className="capitalize">
                          {inquiry.inquiry_type}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {getStatusIcon(inquiry.status)}
                        <span className="ml-1 capitalize">{inquiry.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>{inquiry.message}</p>
                    {inquiry.admin_response && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                        <p className="font-medium text-sm mb-2">Admin Response:</p>
                        <p className="text-sm">{inquiry.admin_response}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6 mt-6">
          <IdeaSubmissionForm />
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Your Ideas</h3>
            {ideas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No ideas submitted yet. Share your thoughts above!
                </CardContent>
              </Card>
            ) : (
              ideas.map((idea) => (
                <Card key={idea.id} className="border-2 border-primary/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{idea.title}</CardTitle>
                        <CardDescription className="capitalize">
                          {idea.category}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(idea.status)}>
                        {getStatusIcon(idea.status)}
                        <span className="ml-1 capitalize">{idea.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>{idea.description}</p>
                    {idea.admin_response && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                        <p className="font-medium text-sm mb-2">Admin Response:</p>
                        <p className="text-sm">{idea.admin_response}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(idea.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ForeignInvestmentChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};
