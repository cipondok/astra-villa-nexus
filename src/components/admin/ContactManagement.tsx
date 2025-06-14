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
import { Phone, Mail, MessageCircle, Eye, Reply, Clock } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";

const ContactManagement = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contact-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_monitoring')
        .select(`
          *,
          profiles!feedback_monitoring_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('feedback_type', 'contact')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status: string; response?: string }) => {
      const updateData: any = { status };
      if (response) {
        updateData.admin_response = response;
      }
      
      const { error } = await supabase
        .from('feedback_monitoring')
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

  const filteredContacts = contacts?.filter(contact =>
    contact.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.content?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            {/* Search */}
            <div className="flex gap-4">
              <Input
                placeholder="Search contacts by name, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
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
                    <TableHead className="text-gray-300">Message Preview</TableHead>
                    <TableHead className="text-gray-300">Priority</TableHead>
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
                          <div className="text-sm">
                            <div className="font-medium">{contact.profiles?.full_name || 'Anonymous'}</div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.profiles?.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="max-w-xs truncate">
                            {contact.content?.substring(0, 100)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(contact.priority)}
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
            <DialogTitle className="text-white">Contact Inquiry Details</DialogTitle>
            <DialogDescription className="text-gray-300">
              Review and respond to customer inquiry
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-300 font-medium">Name:</label>
                  <p className="text-white">{selectedContact.profiles?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Email:</label>
                  <p className="text-white">{selectedContact.profiles?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Priority:</label>
                  {getPriorityBadge(selectedContact.priority)}
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Status:</label>
                  {getStatusBadge(selectedContact.status)}
                </div>
              </div>
              <div>
                <label className="text-gray-300 font-medium">Message:</label>
                <p className="text-white bg-gray-800 p-3 rounded mt-2">{selectedContact.content}</p>
              </div>
              <div>
                <Label className="text-gray-300 font-medium">Your Response:</Label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Close
            </Button>
            <Button 
              onClick={handleSendResponse}
              disabled={updateContactMutation.isPending || !response.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Reply className="h-4 w-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactManagement;
