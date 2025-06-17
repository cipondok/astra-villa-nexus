
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Video, 
  Users, 
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'phone' | 'chat';
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  messageCount: number;
  responseTime: string;
}

interface LiveUpdate {
  id: string;
  type: 'booking' | 'maintenance' | 'inquiry' | 'emergency';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  title: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
}

const CommunicationHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const channels: CommunicationChannel[] = [
    {
      id: "1",
      name: "WhatsApp Business",
      type: "whatsapp",
      status: "active",
      lastActivity: "2 min ago",
      messageCount: 47,
      responseTime: "1.2 min"
    },
    {
      id: "2",
      name: "Customer Email",
      type: "email",
      status: "active",
      lastActivity: "15 min ago",
      messageCount: 23,
      responseTime: "8.5 min"
    },
    {
      id: "3",
      name: "Live Chat",
      type: "chat",
      status: "active",
      lastActivity: "5 min ago",
      messageCount: 12,
      responseTime: "2.1 min"
    },
    {
      id: "4",
      name: "Emergency Hotline",
      type: "phone",
      status: "pending",
      lastActivity: "1 hour ago",
      messageCount: 3,
      responseTime: "45 sec"
    }
  ];

  const liveUpdates: LiveUpdate[] = [
    {
      id: "1",
      type: "booking",
      status: "in_progress",
      title: "Villa #12 Pool Cleaning",
      timestamp: "10:30 AM",
      priority: "medium",
      assignedTo: "CleanPro Services"
    },
    {
      id: "2",
      type: "emergency",
      status: "pending",
      title: "AC Repair - Villa #7",
      timestamp: "10:15 AM",
      priority: "high",
      assignedTo: "Tech Solutions"
    },
    {
      id: "3",
      type: "inquiry",
      status: "completed",
      title: "Check-in Information Request",
      timestamp: "9:45 AM",
      priority: "low"
    },
    {
      id: "4",
      type: "maintenance",
      status: "delayed",
      title: "Garden Maintenance - Villa #3",
      timestamp: "9:30 AM",
      priority: "medium",
      assignedTo: "Green Thumb Co."
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />;
      case 'phone': return <Phone className="h-5 w-5 text-purple-600" />;
      case 'chat': return <Video className="h-5 w-5 text-orange-600" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Hub</h1>
          <p className="text-muted-foreground">
            Unified communication system with live tracking and AI automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Channels
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="live-status">Live Status</TabsTrigger>
          <TabsTrigger value="ai-automation">AI Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85</div>
                <p className="text-xs text-muted-foreground">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2 min</div>
                <p className="text-xs text-muted-foreground">
                  -15% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Resolution Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Communication Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {channels.slice(0, 3).map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <div className="font-medium">{channel.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {channel.messageCount} messages • {channel.lastActivity}
                        </div>
                      </div>
                    </div>
                    <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Status Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveUpdates.slice(0, 3).map((update) => (
                  <div key={update.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(update.status)}
                      <div>
                        <div className="font-medium">{update.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {update.assignedTo || 'Unassigned'} • {update.timestamp}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(update.priority)}>
                      {update.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.type)}
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                    <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Messages</div>
                      <div className="font-medium">{channel.messageCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Response Time</div>
                      <div className="font-medium">{channel.responseTime}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last activity: {channel.lastActivity}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Configure</Button>
                    <Button size="sm">View Messages</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live-status" className="space-y-6">
          <div className="space-y-4">
            {liveUpdates.map((update) => (
              <Card key={update.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(update.status)}
                      <div>
                        <div className="font-medium">{update.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {update.type} • {update.assignedTo || 'Unassigned'} • {update.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(update.priority)}>
                        {update.priority}
                      </Badge>
                      <Badge variant="outline">
                        {update.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Chatbot Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resolution Rate</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span className="font-medium">4.2/5</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">High Priority Escalation</div>
                  <div className="text-muted-foreground">Auto-escalate emergency requests</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">FAQ Auto-Response</div>
                  <div className="text-muted-foreground">Handle common questions automatically</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Vendor Notification</div>
                  <div className="text-muted-foreground">Auto-notify vendors of new bookings</div>
                </div>
                <Button size="sm" className="w-full">Manage Rules</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationHub;
