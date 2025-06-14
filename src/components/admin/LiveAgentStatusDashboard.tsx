
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, WifiOff } from "lucide-react";

type AgentProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  availability_status: 'online' | 'busy' | 'offline';
  last_seen_at: string;
};

const LiveAgentStatusDashboard = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [localStatus, setLocalStatus] = useState(profile?.availability_status || 'offline');

  // Fetch all agents with 'agent' or 'admin' role
  const { data: agents, isLoading } = useQuery({
    queryKey: ['live-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, availability_status, last_seen_at')
        .in('role', ['agent', 'admin', 'customer_service']);
      if (error) throw error;
      return data as AgentProfile[];
    },
    refetchInterval: 15000, // Refresh every 15 seconds for now
  });

  // Mutation to update agent status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'online' | 'busy' | 'offline') => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('profiles')
        .update({ availability_status: newStatus, last_seen_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      showSuccess("Status Updated", `You are now ${newStatus}.`);
      setLocalStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ['live-agents'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleStatusChange = (newStatus: 'online' | 'busy' | 'offline') => {
    updateStatusMutation.mutate(newStatus);
  };
  
  // Periodically update `last_seen_at` if user is online to keep them "active"
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (localStatus === 'online' && user) {
        intervalId = setInterval(async () => {
            const { error } = await supabase
              .from('profiles')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', user.id);
            if (error) console.error("Failed to update last_seen_at:", error);
        }, 60 * 1000); // every minute
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [localStatus, user]);


  const onlineAgents = agents?.filter(agent => {
      if (agent.availability_status !== 'online') return false;
      const lastSeen = new Date(agent.last_seen_at).getTime();
      const now = new Date().getTime();
      // Consider online if last seen within the last 5 minutes
      return (now - lastSeen) < 5 * 60 * 1000;
  }) || [];

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wifi className="h-5 w-5" />
          Live Agent Status
        </CardTitle>
        <CardDescription className="text-gray-300">
          Manage your availability and see which agents are online. (Updates every 15 seconds)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-lg bg-black/20">
            <div>
                <p className="text-white font-semibold">Your Status</p>
                <p className="text-sm text-gray-400">Set your availability for customer chats.</p>
            </div>
            <Select value={localStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="online" className="text-white">Online</SelectItem>
                    <SelectItem value="busy" className="text-white">Busy</SelectItem>
                    <SelectItem value="offline" className="text-white">Offline</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-300" />
                <h3 className="text-lg font-semibold text-white">Online Agents ({onlineAgents.length})</h3>
            </div>
            {isLoading ? (
                <p className="text-gray-300">Loading agents...</p>
            ) : onlineAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {onlineAgents.map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 p-3 rounded-md bg-black/20">
                            <Avatar>
                                <AvatarImage src={agent.avatar_url ?? undefined} />
                                <AvatarFallback>{agent.full_name?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium text-white">{agent.full_name}</p>
                                <p className="text-sm text-gray-400">{agent.email}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-lg">
                    <WifiOff className="h-10 w-10 text-gray-500 mb-4" />
                    <p className="text-gray-400">No agents are currently online.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveAgentStatusDashboard;
