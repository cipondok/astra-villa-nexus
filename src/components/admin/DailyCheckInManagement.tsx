
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Calendar, Gift, Users, AlertTriangle } from "lucide-react";

const DailyCheckInManagement = () => {
  const [rewardAmount, setRewardAmount] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Check if ASTRA tokens are enabled
  const { data: tokenSystemEnabled } = useQuery({
    queryKey: ['astra-token-system-enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'astra_tokens_enabled')
        .eq('category', 'tools')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value === true;
    },
  });

  const { data: checkInSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['daily-checkin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'daily_checkin_rewards')
        .eq('category', 'astra_tokens')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: tokenSystemEnabled,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ amount, enabled }: { amount: number; enabled: boolean }) => {
      const settingValue = { amount, enabled };
      
      if (checkInSettings) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: settingValue })
          .eq('id', checkInSettings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert([{
            key: 'daily_checkin_rewards',
            value: settingValue,
            category: 'astra_tokens',
            description: 'Daily check-in reward settings for ASTRA tokens'
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "Daily check-in settings updated");
      queryClient.invalidateQueries({ queryKey: ['daily-checkin-settings'] });
    },
    onError: (error) => {
      console.error('Settings update error:', error);
      showError("Error", "Failed to update settings");
    },
  });

  const handleSaveSettings = () => {
    if (!rewardAmount) return;
    
    updateSettingsMutation.mutate({
      amount: Number(rewardAmount),
      enabled: isEnabled
    });
  };

  if (!tokenSystemEnabled) {
    return (
      <div className="space-y-6">
        <Card className="card-ios">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Check-In Rewards
            </CardTitle>
            <CardDescription>
              Configure daily check-in rewards for ASTRA tokens (Currently Disabled)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ASTRA Token system is currently disabled. Enable it through Tools Management to activate daily check-in rewards.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 mt-6 opacity-50">
              <div className="flex items-center justify-between">
                <Label>Enable Daily Check-In Rewards</Label>
                <Switch
                  checked={false}
                  disabled={true}
                />
              </div>
              
              <div>
                <Label>Reward Amount (ASTRA)</Label>
                <Input
                  type="number"
                  value=""
                  disabled={true}
                  placeholder="Enter daily reward amount"
                />
              </div>
              
              <Button disabled={true}>
                Save Settings (Disabled)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-ios">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Check-Ins
            </CardTitle>
            <CardDescription>
              Monitor daily check-in activity (Feature Disabled)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Daily check-in system is disabled. Enable ASTRA tokens to view activity.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In Rewards
          </CardTitle>
          <CardDescription>
            Configure daily check-in rewards for all site members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Daily Check-In Rewards</Label>
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
            
            <div>
              <Label>Reward Amount (ASTRA)</Label>
              <Input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="Enter daily reward amount"
              />
            </div>
            
            <Button 
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending || !rewardAmount}
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Check-Ins
          </CardTitle>
          <CardDescription>
            Monitor daily check-in activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No check-ins found. Feature is enabled but no data available yet.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyCheckInManagement;
