
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bot, 
  TrendingUp, 
  Lightbulb, 
  MessageSquare,
  Users,
  BarChart3
} from "lucide-react";

const AIInsightsManagement = () => {
  const { data: aiSuggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['ai-vendor-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_vendor_suggestions')
        .select('*, profiles!vendor_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: chatLogs, isLoading: chatLoading } = useQuery({
    queryKey: ['ai-chat-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_logs')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const getSuggestionBadge = (type: string) => {
    switch (type) {
      case 'service_improvement':
        return <Badge className="bg-blue-100 text-blue-800">Service Improvement</Badge>;
      case 'pricing_optimization':
        return <Badge className="bg-green-100 text-green-800">Pricing Strategy</Badge>;
      case 'category_expansion':
        return <Badge className="bg-purple-100 text-purple-800">Category Expansion</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Implemented</Badge>;
      case 'viewed':
        return <Badge className="bg-yellow-100 text-yellow-800">Viewed</Badge>;
      case 'dismissed':
        return <Badge className="bg-red-100 text-red-800">Dismissed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case 'vendor':
        return <Badge className="bg-blue-100 text-blue-800">Vendor</Badge>;
      case 'customer':
        return <Badge className="bg-green-100 text-green-800">Customer</Badge>;
      default:
        return <Badge variant="outline">Guest</Badge>;
    }
  };

  // Calculate insights
  const totalChats = chatLogs?.length || 0;
  const uniqueUsers = new Set(chatLogs?.map(log => log.user_id).filter(Boolean)).size;
  const totalSuggestions = aiSuggestions?.length || 0;
  const implementedSuggestions = aiSuggestions?.filter(s => s.status === 'implemented').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Insights & Analytics</h2>
        <p className="text-muted-foreground">Monitor AI interactions and vendor improvement suggestions</p>
      </div>

      {/* AI Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total AI Chats</p>
                <p className="text-2xl font-bold text-blue-600">{totalChats}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{uniqueUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
                <p className="text-2xl font-bold text-purple-600">{totalSuggestions}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implemented</p>
                <p className="text-2xl font-bold text-orange-600">{implementedSuggestions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="chats">Chat Logs</TabsTrigger>
        </TabsList>

        {/* AI Suggestions */}
        <TabsContent value="suggestions">
          <Card className="card-ios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Vendor Suggestions
              </CardTitle>
              <CardDescription>
                AI-generated suggestions for vendor improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Suggestion</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading AI suggestions...
                        </TableCell>
                      </TableRow>
                    ) : aiSuggestions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No AI suggestions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      aiSuggestions?.map((suggestion) => (
                        <TableRow key={suggestion.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {suggestion.profiles?.full_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {suggestion.profiles?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSuggestionBadge(suggestion.suggestion_type)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {typeof suggestion.ai_suggestion === 'object' 
                                ? JSON.stringify(suggestion.ai_suggestion).substring(0, 100) + '...'
                                : suggestion.ai_suggestion.toString().substring(0, 100) + '...'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(suggestion.confidence_score || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">
                                {Math.round((suggestion.confidence_score || 0) * 100)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(suggestion.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(suggestion.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Logs */}
        <TabsContent value="chats">
          <Card className="card-ios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Chat Interactions
              </CardTitle>
              <CardDescription>
                Monitor AI bot conversations and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>AI Response</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading chat logs...
                        </TableCell>
                      </TableRow>
                    ) : chatLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No chat interactions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      chatLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {log.profiles?.full_name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {log.profiles?.email || 'Guest user'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getUserTypeBadge(log.user_type)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {log.message.substring(0, 50)}...
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {log.ai_response?.substring(0, 50)}...
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(log.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsManagement;
