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

const ContactManagement = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

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

  const authorizedRoles = ['admin', 'agent', 'customer_service'];
  if (!profile || !authorizedRoles.includes(profile.role)) {
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
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="h-5 w-5" />
            Contact Us System
          </CardTitle>
          <CardDescription className="text-gray-300">
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
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/10 border-white/20">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
                    All Inquiries
                  </TabsTrigger>
                  <TabsTrigger value="business_partners" className="data-[state=active]:bg-white/20">
                    <Building2 className="h-4 w-4 mr-2" />
                    Business Partners
                  </TabsTrigger>
                  <TabsTrigger value="general" className="data-[state=active]:bg-white/20">
                    General
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-gray-300">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {contacts?.filter(c => c.status === 'pending').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {contacts?.filter(c => c.status === 'in_progress').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Resolved</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {contacts?.filter(c => c.status === 'resolved').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {contacts?.length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contacts Table */}
            <div className="border border-white/20 rounded-lg bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Contact</TableHead>
                    <TableHead className="text-gray-300">Type / Department</TableHead>
                    <TableHead className="text-gray-300">Message Preview</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                        Loading contacts...
                      </TableCell>
                    </TableRow>
                  ) : filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                        No contact inquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id} className="border-white/20">
                        <TableCell className="text-white">
                          <div className="text-sm space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {contact.contact_name || 'Anonymous'}
                            </div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.contact_email || 'N/A'}
                            </div>
                            {contact.contact_phone && (
                              <div className="text-gray-400 flex items-center gap-1">
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
                              <div className="text-xs text-gray-400">
                                Dept: {contact.department}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="max-w-xs">
                            <div className="font-medium text-sm mb-1">{contact.subject}</div>
                            <div className="text-xs truncate">
                              {contact.message?.substring(0, 80)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contact.status)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(contact)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
        <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-2 border-blue-500/30 shadow-2xl">
          <DialogHeader className="border-b border-blue-500/20 pb-4">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-400" />
              </div>
              <span>Contact Inquiry Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              Review and respond to the customer's message.
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6 py-6 max-h-[65vh] overflow-y-auto pr-2">
              {/* Contact Info Card */}
              <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 rounded-xl p-5 border border-blue-500/20">
                <h3 className="text-sm font-semibold text-blue-300 mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Name</label>
                    <p className="text-white font-medium flex items-center gap-2">
                      {selectedContact.contact_name || 'Anonymous'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Email</label>
                    <p className="text-white flex items-center gap-2 break-all">
                      <Mail className="h-3 w-3 text-blue-400 shrink-0" />
                      {selectedContact.contact_email || 'N/A'}
                    </p>
                  </div>
                  {selectedContact.contact_phone && (
                    <div className="space-y-1">
                      <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Phone</label>
                      <p className="text-white flex items-center gap-2">
                        <Phone className="h-3 w-3 text-green-400 shrink-0" />
                        {selectedContact.contact_phone}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Type</label>
                    <Badge variant="outline" className="mt-1 border-blue-400/50 text-blue-300">
                      {selectedContact.inquiry_type?.replace('_', ' ') || 'General'}
                    </Badge>
                  </div>
                  {selectedContact.department && (
                    <div className="space-y-1">
                      <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Department</label>
                      <p className="text-white flex items-center gap-2">
                        <Building2 className="h-3 w-3 text-purple-400 shrink-0" />
                        {selectedContact.department}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">Subject</label>
                    <p className="text-white font-medium">{selectedContact.subject}</p>
                  </div>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2 border-b border-blue-500/20 pb-2">
                  <MessageCircle className="h-4 w-4" />
                  Conversation History
                </h3>
                
                {/* User's Message */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                    {selectedContact.contact_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-750 p-4 rounded-2xl rounded-tl-none border border-gray-700/50 shadow-lg">
                      <p className="text-white text-sm leading-relaxed">{selectedContact.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedContact.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Admin's Response */}
                {selectedContact.admin_response && (
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-[85%] text-right">
                       <div className="bg-gradient-to-br from-green-800 to-green-700 inline-block p-4 rounded-2xl rounded-br-none text-left border border-green-600/50 shadow-lg">
                         <p className="text-white text-sm leading-relaxed">{selectedContact.admin_response}</p>
                       </div>
                       <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 justify-end">
                         <Reply className="h-3 w-3" />
                         Replied by {selectedContact.responded_by || 'Admin'} • {selectedContact.responded_at ? new Date(selectedContact.responded_at).toLocaleString() : 'Recently'}
                       </p>
                    </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                       A
                     </div>
                  </div>
                )}
              </div>

              {/* Response Form */}
              {!selectedContact.admin_response && selectedContact.status !== 'resolved' && (
                <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 rounded-xl p-5 border border-blue-500/20">
                  <Label htmlFor="response" className="text-blue-300 font-semibold flex items-center gap-2 mb-3">
                    <Reply className="h-4 w-4" />
                    Your Response
                  </Label>
                  <Textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here... This will be sent to the customer."
                    className="bg-gray-900/50 border-blue-500/30 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                    rows={5}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-3 sm:justify-between pt-4 border-t border-blue-500/20">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Close
            </Button>
            {!selectedContact?.admin_response && selectedContact?.status !== 'resolved' && (
              <Button 
                onClick={handleSendResponse}
                disabled={updateContactMutation.isPending || !response.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg"
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
