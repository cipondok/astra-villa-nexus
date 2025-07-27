
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HeadphonesIcon, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CustomerServiceCenter = () => {
  const [tickets, setTickets] = useState([
    { id: '1', subject: 'Property listing issue', customer: 'John Doe', status: 'open', priority: 'high', created: '2024-01-15' },
    { id: '2', subject: 'Payment problem', customer: 'Jane Smith', status: 'in_progress', priority: 'medium', created: '2024-01-14' },
  ]);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    customer_email: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.customer_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-service', {
        body: {
          action: 'create',
          subject: newTicket.subject,
          description: newTicket.description,
          customer_email: newTicket.customer_email,
          priority: newTicket.priority
        }
      });

      if (error) throw error;

      toast.success('Ticket created successfully');
      setIsNewTicketOpen(false);
      setNewTicket({ subject: '', description: '', customer_email: '', priority: 'medium' });
      
      // Add the new ticket to the list (you might want to refetch instead)
      const newTicketData = {
        id: data.ticket_id,
        subject: newTicket.subject,
        customer: newTicket.customer_email,
        status: 'open',
        priority: newTicket.priority,
        created: new Date().toISOString().split('T')[0]
      };
      setTickets(prev => [newTicketData, ...prev]);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Service Center</h2>
          <p className="text-gray-600">Advanced customer support and ticket management</p>
        </div>
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
              <DialogDescription>
                Create a new customer support ticket
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_email">Customer Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={newTicket.customer_email}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
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
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTicket} className="flex-1">
                  Create Ticket
                </Button>
                <Button variant="outline" onClick={() => setIsNewTicketOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">2.5h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <HeadphonesIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{ticket.customer}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'open' ? 'destructive' : 'outline'}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.priority === 'high' ? 'destructive' : 'outline'}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.created}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-chat">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Live Chat Interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Knowledge Base Management
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Customer Service Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Customer Service Analytics
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerServiceCenter;
