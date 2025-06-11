
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Calendar, Gift, Users } from "lucide-react";

const DailyCheckInManagement = () => {
  const [rewardAmount, setRewardAmount] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: checkInSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['daily-checkin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_token_settings')
        .select('*')
        .eq('setting_key', 'daily_checkin')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: recentCheckIns, isLoading: checkInsLoading } = useQuery({
    queryKey: ['recent-checkins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_token_transactions')
        .select('*, profiles!vendor_id(full_name, email)')
        .eq('transaction_type', 'daily_checkin')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ amount, enabled }: { amount: number; enabled: boolean }) => {
      const settingValue = { amount, enabled };
      
      if (checkInSettings) {
        const { error } = await supabase
          .from('astra_token_settings')
          .update({ setting_value: settingValue })
          .eq('id', checkInSettings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('astra_token_settings')
          .insert([{
            setting_key: 'daily_checkin',
            setting_value: settingValue,
            description: 'Daily check-in reward for all site members'
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
                {checkInsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading check-ins...
                    </TableCell>
                  </TableRow>
                ) : recentCheckIns?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No check-ins found
                    </TableCell>
                  </TableRow>
                ) : (
                  recentCheckIns?.map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell>
                        {checkIn.profiles?.full_name || checkIn.profiles?.email || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          +{checkIn.amount} ASTRA
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(checkIn.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          Completed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyCheckInManagement;
