
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Send,
  Clock,
  CheckCircle,
  FileText,
  ExternalLink,
  Search,
  BookOpen
} from "lucide-react";

const VendorSupport = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
    attachments: []
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch support tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('vendor_support_tickets')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Submit support ticket
  const submitTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const { error } = await supabase
        .from('vendor_support_tickets')
        .insert({
          vendor_id: user?.id,
          subject: ticketData.subject,
          category: ticketData.category,
          priority: ticketData.priority,
          description: ticketData.description,
          status: 'open'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Ticket Submitted", "Your support ticket has been submitted successfully.");
      setTicketForm({ subject: "", category: "", priority: "medium", description: "", attachments: [] });
    },
    onError: () => {
      showError("Error", "Failed to submit ticket. Please try again.");
    }
  });

  const handleSubmitTicket = () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      showError("Missing Information", "Please fill in all required fields.");
      return;
    }
    submitTicketMutation.mutate(ticketForm);
  };

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I set up my vendor profile?",
          a: "Go to your Business Profile section and complete all required fields including business name, description, contact information, and upload your business documents."
        },
        {
          q: "How do I add services to my profile?",
          a: "Navigate to the Services section and click 'Add New Service'. Fill in the service details, pricing, and duration to create your service offerings."
        },
        {
          q: "What documents do I need for verification?",
          a: "You'll need business registration documents, tax identification, and any relevant certifications or licenses for your industry."
        }
      ]
    },
    {
      category: "Bookings & Payments",
      questions: [
        {
          q: "How do I manage my bookings?",
          a: "Use the Bookings section to view, accept, decline, or reschedule customer requests. You can also set your availability and automatic booking preferences."
        },
        {
          q: "When do I receive payments?",
          a: "Payments are typically processed within 2-3 business days after service completion. You can track all payments in the Billing section."
        },
        {
          q: "What payment methods are supported?",
          a: "We support bank transfers, digital wallets, and cash payments. Credit card payments are available for verified vendors."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          q: "I'm having trouble uploading images",
          a: "Ensure your images are in JPG, PNG, or WebP format and under 5MB. Clear your browser cache if you continue experiencing issues."
        },
        {
          q: "My services aren't showing up",
          a: "Services need admin approval before they become visible. This typically takes 24-48 hours. You can check the status in your Services section."
        },
        {
          q: "How do I reset my password?",
          a: "Use the 'Forgot Password' link on the login page, or contact support if you need additional assistance with account access."
        }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      open: "secondary",
      in_progress: "default",
      resolved: "outline",
      closed: "destructive"
    };
    
    return (
      <Badge variant={statusColors[status] || "outline"}>
        {status?.toUpperCase().replace('_', ' ')}
      </Badge>
    );
  };

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Support</h2>
          <p className="text-muted-foreground">Get help and support for your vendor account</p>
        </div>
      </div>

      <Tabs defaultValue="help" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="help">Help Center</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Help Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">{category.category}</h3>
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={`${categoryIndex}-${index}`} value={`item-${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track your support requests and responses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading tickets...</div>
              ) : tickets?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No support tickets found. Create your first ticket in the Contact Support tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets?.map((ticket) => (
                    <Card key={ticket.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {ticket.category}</span>
                          <span>Priority: {ticket.priority}</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Create Support Ticket
              </CardTitle>
              <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={ticketForm.category} 
                    onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="bookings">Booking Issues</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={ticketForm.priority} 
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your issue..."
                  rows={5}
                />
              </div>

              <Button 
                onClick={handleSubmitTicket} 
                disabled={submitTicketMutation.isPending}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-sm text-muted-foreground">+62 21 1234 5678</p>
                <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM WIB</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground">vendor-support@astravilla.com</p>
                <p className="text-xs text-muted-foreground">24-48 hour response</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Available Mon-Fri</p>
                <p className="text-xs text-muted-foreground">9AM-6PM WIB</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Vendor Guides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  <span>Getting Started Guide</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Service Management Best Practices</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Customer Communication Tips</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Payment & Billing Guide</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  <span>API Documentation</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Terms of Service</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Privacy Policy</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Commission Structure</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorSupport;
