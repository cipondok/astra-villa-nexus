
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { Bot, Plus, Edit, Activity, Zap, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AIBotManagement = () => {
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<any>(null);
  const [newBot, setNewBot] = useState({
    bot_name: '',
    model_type: 'openai',
    configuration: '',
    is_active: true
  });
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: aiBots, isLoading } = useQuery({
    queryKey: ['ai-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_bot_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createBotMutation = useMutation({
    mutationFn: async (botData: any) => {
      const { error } = await supabase
        .from('ai_bot_settings')
        .insert({
          ...botData,
          configuration: botData.configuration ? JSON.parse(botData.configuration) : {},
          usage_stats: {}
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      showSuccess("Success", "AI Bot created successfully");
      setIsCreateBotOpen(false);
      setNewBot({
        bot_name: '',
        model_type: 'openai',
        configuration: '',
        is_active: true
      });
    },
    onError: (error) => {
      showError("Error", `Failed to create bot: ${error.message}`);
    }
  });

  const updateBotMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase
        .from('ai_bot_settings')
        .update({
          ...updates,
          configuration: updates.configuration ? JSON.parse(updates.configuration) : {},
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      showSuccess("Success", "AI Bot updated successfully");
      setEditingBot(null);
    },
    onError: (error) => {
      showError("Error", `Failed to update bot: ${error.message}`);
    }
  });

  const toggleBotStatus = async (botId: string, currentStatus: boolean) => {
    updateBotMutation.mutate({
      id: botId,
      updates: { is_active: !currentStatus }
    });
  };

  const handleCreateBot = () => {
    if (!newBot.bot_name.trim()) {
      showError("Error", "Bot name is required");
      return;
    }
    createBotMutation.mutate(newBot);
  };

  const handleUpdateBot = () => {
    if (!editingBot) return;
    updateBotMutation.mutate({
      id: editingBot.id,
      updates: {
        bot_name: editingBot.bot_name,
        model_type: editingBot.model_type,
        configuration: editingBot.configuration,
        is_active: editingBot.is_active
      }
    });
  };

  const getModelColor = (model: string) => {
    switch (model) {
      case 'openai': return 'bg-green-500';
      case 'anthropic': return 'bg-blue-500';
      case 'gemini': return 'bg-purple-500';
      case 'local': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUsageStats = (stats: any) => {
    if (!stats || typeof stats !== 'object') return 'No data';
    return Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join(', ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Bot Management
              </CardTitle>
              <CardDescription>Configure and manage AI bots and automation</CardDescription>
            </div>
            <Dialog open={isCreateBotOpen} onOpenChange={setIsCreateBotOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add AI Bot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New AI Bot</DialogTitle>
                  <DialogDescription>Configure a new AI bot for automation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input
                      id="bot-name"
                      value={newBot.bot_name}
                      onChange={(e) => setNewBot({...newBot, bot_name: e.target.value})}
                      placeholder="Customer Support Bot"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model-type">AI Model Type</Label>
                    <Select
                      value={newBot.model_type}
                      onValueChange={(value) => setNewBot({...newBot, model_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="gemini">Google (Gemini)</SelectItem>
                        <SelectItem value="local">Local Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bot-config">Configuration (JSON)</Label>
                    <Textarea
                      id="bot-config"
                      value={newBot.configuration}
                      onChange={(e) => setNewBot({...newBot, configuration: e.target.value})}
                      placeholder='{"model": "gpt-4", "temperature": 0.7, "max_tokens": 2000}'
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bot-active"
                      checked={newBot.is_active}
                      onCheckedChange={(checked) => setNewBot({...newBot, is_active: checked})}
                    />
                    <Label htmlFor="bot-active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateBotOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBot} disabled={createBotMutation.isPending}>
                    {createBotMutation.isPending ? 'Creating...' : 'Create Bot'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* AI Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading AI bots...</div>
        ) : aiBots?.map((bot) => (
          <Card key={bot.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-lg">{bot.bot_name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getModelColor(bot.model_type)}>
                    {bot.model_type.toUpperCase()}
                  </Badge>
                  <Switch
                    checked={bot.is_active}
                    onCheckedChange={() => toggleBotStatus(bot.id, bot.is_active)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(bot.configuration, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Usage Statistics
                </h4>
                <div className="text-sm text-gray-600">
                  {formatUsageStats(bot.usage_stats)}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created: {new Date(bot.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(bot.updated_at).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBot({
                    ...bot,
                    configuration: JSON.stringify(bot.configuration, null, 2)
                  })}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={bot.is_active ? "default" : "secondary"}
                  size="sm"
                  onClick={() => toggleBotStatus(bot.id, bot.is_active)}
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  {bot.is_active ? 'Active' : 'Inactive'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiBots?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Configured bots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {aiBots?.filter(bot => bot.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OpenAI Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiBots?.filter(bot => bot.model_type === 'openai').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">GPT-powered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Models</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiBots?.filter(bot => bot.model_type !== 'openai').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Alternative AI</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Bot Dialog */}
      <Dialog open={!!editingBot} onOpenChange={() => setEditingBot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Bot</DialogTitle>
            <DialogDescription>Update bot configuration and settings</DialogDescription>
          </DialogHeader>
          {editingBot && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-bot-name">Bot Name</Label>
                <Input
                  id="edit-bot-name"
                  value={editingBot.bot_name}
                  onChange={(e) => setEditingBot({...editingBot, bot_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-model-type">AI Model Type</Label>
                <Select
                  value={editingBot.model_type}
                  onValueChange={(value) => setEditingBot({...editingBot, model_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="gemini">Google (Gemini)</SelectItem>
                    <SelectItem value="local">Local Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-bot-config">Configuration (JSON)</Label>
                <Textarea
                  id="edit-bot-config"
                  value={editingBot.configuration}
                  onChange={(e) => setEditingBot({...editingBot, configuration: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-bot-active"
                  checked={editingBot.is_active}
                  onCheckedChange={(checked) => setEditingBot({...editingBot, is_active: checked})}
                />
                <Label htmlFor="edit-bot-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBot(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBot} disabled={updateBotMutation.isPending}>
              {updateBotMutation.isPending ? 'Updating...' : 'Update Bot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIBotManagement;
