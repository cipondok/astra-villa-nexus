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

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = 
      contact.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "business_partners" && contact.inquiry_type === "business_partnership") ||
      (activeTab === "general" && contact.inquiry_type !== "business_partnership");
    
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
                            variant="outline"
                            onClick={() => handleViewDetails(contact)}
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
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
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>Contact Inquiry</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Review and respond to the customer's message.
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <label className="text-gray-400 font-medium">Name:</label>
                  <p className="text-white flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedContact.contact_name || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400 font-medium">Email:</label>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedContact.contact_email || 'N/A'}
                  </p>
                </div>
                {selectedContact.contact_phone && (
                  <div>
                    <label className="text-gray-400 font-medium">Phone:</label>
                    <p className="text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedContact.contact_phone}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 font-medium">Type:</label>
                  <Badge variant="outline" className="mt-1">
                    {selectedContact.inquiry_type?.replace('_', ' ') || 'General'}
                  </Badge>
                </div>
                {selectedContact.department && (
                  <div>
                    <label className="text-gray-400 font-medium">Department:</label>
                    <p className="text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedContact.department}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 font-medium">Status:</label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>
                <div>
                  <label className="text-gray-400 font-medium">Subject:</label>
                  <p className="text-white mt-1">{selectedContact.subject}</p>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">Conversation History</h3>
                
                {/* User's Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {selectedContact.contact_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none">
                      <p className="text-white text-sm">{selectedContact.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedContact.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Admin's Response */}
                {selectedContact.admin_response && (
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-[85%] text-right">
                       <div className="bg-green-800 inline-block p-3 rounded-lg rounded-br-none text-left">
                         <p className="text-white text-sm">{selectedContact.admin_response}</p>
                       </div>
                       <p className="text-xs text-gray-500 mt-1">
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
                  <Label htmlFor="response" className="text-gray-300 font-medium">Your Response:</Label>
                  <Textarea
                    id="response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here... This will be sent to the user."
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-between pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Close
            </Button>
            {!selectedContact?.admin_response && selectedContact?.status !== 'resolved' && (
              <Button 
                onClick={handleSendResponse}
                disabled={updateContactMutation.isPending || !response.trim()}
                className="bg-blue-600 hover:bg-blue-700"
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
