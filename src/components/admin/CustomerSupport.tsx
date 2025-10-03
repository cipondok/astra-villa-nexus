import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Star,
  User,
  Calendar,
  Search,
  Filter,
  Reply,
  Archive,
  Trash2,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  HeadphonesIcon,
  Zap,
  Target,
  Award
} from 'lucide-react';

const CustomerSupport = () => {
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-001',
      customer: 'Ahmad Rizki',
      email: 'ahmad.rizki@email.com',
      subject: 'Payment issue with property booking',
      category: 'Payment',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Sarah Agent',
      createdAt: '2024-01-15 09:30',
      lastUpdate: '2024-01-15 14:20',
      messages: 3,
      rating: null
    },
    {
      id: 'TKT-002',
      customer: 'Siti Nurhaliza',
      email: 'siti.nur@email.com',
      subject: 'Cannot access virtual tour',
      category: 'Technical',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'John Support',
      createdAt: '2024-01-14 16:45',
      lastUpdate: '2024-01-15 10:15',
      messages: 5,
      rating: null
    },
    {
      id: 'TKT-003',
      customer: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      subject: 'Request for property information',
      category: 'General',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'Lisa Helper',
      createdAt: '2024-01-13 11:20',
      lastUpdate: '2024-01-14 09:30',
      messages: 2,
      rating: 5
    }
  ]);

  const [feedback, setFeedback] = useState([
    {
      id: 1,
      customer: 'Maya Sari',
      rating: 5,
      comment: 'Excellent service! The support team resolved my issue quickly.',
      date: '2024-01-15',
      category: 'Service Quality',
      resolved: true
    },
    {
      id: 2,
      customer: 'Rudi Hartono',
      rating: 4,
      comment: 'Good response time, but could improve the explanation clarity.',
      date: '2024-01-14',
      category: 'Response Time',
      resolved: true
    },
    {
      id: 3,
      customer: 'Andi Wijaya',
      rating: 2,
      comment: 'Took too long to get a proper solution. Need better training.',
      date: '2024-01-13',
      category: 'Resolution',
      resolved: false
    }
  ]);

  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Sarah Agent',
      status: 'Online',
      activeTickets: 8,
      resolvedToday: 12,
      avgRating: 4.8,
      responseTime: '2m 15s',
      department: 'Payment Support'
    },
    {
      id: 2,
      name: 'John Support',
      status: 'Online',
      activeTickets: 6,
      resolvedToday: 9,
      avgRating: 4.6,
      responseTime: '3m 45s',
      department: 'Technical Support'
    },
    {
      id: 3,
      name: 'Lisa Helper',
      status: 'Away',
      activeTickets: 4,
      resolvedToday: 15,
      avgRating: 4.9,
      responseTime: '1m 30s',
      department: 'General Support'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      case 'Offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-500 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          <TabsTrigger value="agents">Support Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'Open').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'In Progress').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'Resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">4.7</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search tickets..." className="pl-10" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage customer support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{ticket.subject}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{ticket.id}</span>
                            <span>{ticket.customer}</span>
                            <span>{ticket.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Category: {ticket.category}</span>
                        <span>Assigned to: {ticket.assignedTo}</span>
                        <span>{ticket.messages} messages</span>
                        {ticket.rating && (
                          <div className="flex items-center gap-1">
                            Rating: {renderStars(ticket.rating)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>Review customer satisfaction and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.customer}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {item.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={item.resolved ? "default" : "secondary"}>
                        {item.resolved ? "Resolved" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{item.comment}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{item.category}</Badge>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Team</CardTitle>
              <CardDescription>Manage support agents and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card key={agent.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getAgentStatusColor(agent.status)}`}></div>
                        </div>
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <p className="text-sm text-muted-foreground">{agent.department}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Active Tickets</span>
                          <span className="font-semibold">{agent.activeTickets}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Resolved Today</span>
                          <span className="font-semibold">{agent.resolvedToday}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{agent.avgRating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Time</span>
                          <span className="font-semibold">{agent.responseTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                    <p className="text-2xl font-bold">94.5%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+2.3% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">2m 30s</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">-15s from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">4.7/5</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+0.2 from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Payment Issues</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Technical Support</span>
                    <span className="font-semibold">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>General Inquiries</span>
                    <span className="font-semibold">22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Property Information</span>
                    <span className="font-semibold">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>Live Chat</span>
                    </div>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-500" />
                      <span>Email</span>
                    </div>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span>Phone</span>
                    </div>
                    <span className="font-semibold">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerSupport;