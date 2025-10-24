import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MessageCircle, Eye, Reply, Clock, User, Building2 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

const ContactManagement = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contact-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status: string; response?: string }) => {
      const updateData: any = { 
        status,
        responded_at: new Date().toISOString(),
        responded_by: profile?.id
      };
      if (response) {
        updateData.admin_response = response;
      }
      
      const { error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Contact Updated", "Contact inquiry has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      setShowDetailDialog(false);
      setSelectedContact(null);
      setResponse("");
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleViewDetails = (contact: any) => {
    setSelectedContact(contact);
    setResponse("");
    setShowDetailDialog(true);
  };

  const handleSendResponse = () => {
    if (selectedContact && response.trim()) {
      updateContactMutation.mutate({
        id: selectedContact.id,
        status: 'resolved',
        response: response.trim()
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return <Badge className={colors[priority] || colors.medium}>{priority?.toUpperCase()}</Badge>;
  };

  const businessPartnerTypes = [
    'business_partnership',
    'partner_network',
    'become_a_partner',
    'partner_benefits',
    'joint_ventures'
  ];

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = 
      contact.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "business_partners" && businessPartnerTypes.includes(contact.inquiry_type)) ||
      (activeTab === "general" && !businessPartnerTypes.includes(contact.inquiry_type));
    
    return matchesSearch && matchesTab;
  }) || [];

  const hasAccess = userRoles.some(role => ['admin', 'agent', 'customer_service'].includes(role));
  
  if (rolesLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  if (!profile || !hasAccess) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">You do not have permission to view this page. Please contact an administrator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Us System
          </CardTitle>
          <CardDescription>
            Manage customer inquiries and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Tabs */}
            <div className="space-y-4">
              <Input
                placeholder="Search contacts by name, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border-input"
              />
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">
                    All Inquiries
                  </TabsTrigger>
                  <TabsTrigger value="business_partners">
                    <Building2 className="h-4 w-4 mr-2" />
                    Business Partners
                  </TabsTrigger>
                  <TabsTrigger value="general">
                    General
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {contacts?.filter(c => c.status === 'pending').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {contacts?.filter(c => c.status === 'in_progress').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Resolved</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {contacts?.filter(c => c.status === 'resolved').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {contacts?.length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contacts Table */}
            <div className="border border-border rounded-lg bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Contact</TableHead>
                    <TableHead>Type / Department</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading contacts...
                      </TableCell>
                    </TableRow>
                  ) : filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No contact inquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id} className="border-border">
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {contact.contact_name || 'Anonymous'}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.contact_email || 'N/A'}
                            </div>
                            {contact.contact_phone && (
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.contact_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {contact.inquiry_type?.replace('_', ' ') || 'General'}
                            </Badge>
                            {contact.department && (
                              <div className="text-xs text-muted-foreground">
                                Dept: {contact.department}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-sm mb-1">{contact.subject}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {contact.message?.substring(0, 80)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contact.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(contact)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>Contact Inquiry</span>
            </DialogTitle>
            <DialogDescription>
              Review and respond to the customer's message.
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground font-medium">Name:</label>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedContact.contact_name || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Email:</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedContact.contact_email || 'N/A'}
                  </p>
                </div>
                {selectedContact.contact_phone && (
                  <div>
                    <label className="text-muted-foreground font-medium">Phone:</label>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedContact.contact_phone}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-muted-foreground font-medium">Type:</label>
                  <Badge variant="outline" className="mt-1">
                    {selectedContact.inquiry_type?.replace('_', ' ') || 'General'}
                  </Badge>
                </div>
                {selectedContact.department && (
                  <div>
                    <label className="text-muted-foreground font-medium">Department:</label>
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedContact.department}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-muted-foreground font-medium">Status:</label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-muted-foreground font-medium">Subject:</label>
                  <p className="mt-1">{selectedContact.subject}</p>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Conversation History</h3>
                
                {/* User's Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                    {selectedContact.contact_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                      <p className="text-sm">{selectedContact.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(selectedContact.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Admin's Response */}
                {selectedContact.admin_response && (
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-[85%] text-right">
                       <div className="bg-green-600 dark:bg-green-800 inline-block p-3 rounded-lg rounded-br-none text-left">
                         <p className="text-white text-sm">{selectedContact.admin_response}</p>
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">
                         Replied by {selectedContact.responded_by || 'Admin'} • {selectedContact.responded_at ? new Date(selectedContact.responded_at).toLocaleString() : 'Recently'}
                       </p>
                    </div>
                     <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                       A
                     </div>
                  </div>
                )}
              </div>

              {/* Response Form */}
              {!selectedContact.admin_response && selectedContact.status !== 'resolved' && (
                <div>
                  <Label htmlFor="response" className="font-medium">Your Response:</Label>
                  <Textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here... This will be sent to the user."
                    className="mt-2"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-between pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
            >
              Close
            </Button>
            {!selectedContact?.admin_response && selectedContact?.status !== 'resolved' && (
              <Button 
                onClick={handleSendResponse}
                disabled={updateContactMutation.isPending || !response.trim()}
              >
                <Reply className="h-4 w-4 mr-2" />
                Send Response
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactManagement;
