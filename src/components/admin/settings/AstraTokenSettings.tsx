
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Gift, Calendar, ArrowRightLeft, Settings2, BarChart3 } from 'lucide-react';
import ASTRATokenAnalytics from '../ASTRATokenAnalytics';

interface AstraTokenSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const AstraTokenSettings: React.FC<AstraTokenSettingsProps> = ({ settings = {}, onInputChange }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <Coins className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">ASTRA Token System Management</h3>
        <Badge variant="secondary" className="text-[9px]">Admin Panel</Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="analytics" className="text-xs flex items-center gap-1 h-7">
            <BarChart3 className="h-3 w-3" />
            Analytics & Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs flex items-center gap-1 h-7">
            <Settings2 className="h-3 w-3" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <ASTRATokenAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Welcome Bonus */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="py-3 px-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Gift className="h-4 w-4 text-green-500" />
                  Welcome Bonus
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Bonus Amount</Label>
                  <Input
                    type="number"
                    value={settings.astraWelcomeBonusAmount || '100'}
                    onChange={(e) => onInputChange('astraWelcomeBonusAmount', e.target.value)}
                    className="h-8 text-xs"
                    placeholder="100"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                  <Label className="text-xs">Enable Welcome Bonus</Label>
                  <Switch
                    checked={settings.astraWelcomeBonusEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraWelcomeBonusEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="py-3 px-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Daily Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Base Reward</Label>
                    <Input
                      type="number"
                      value={settings.astraDailyCheckinBaseReward || '10'}
                      onChange={(e) => onInputChange('astraDailyCheckinBaseReward', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Streak Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.astraDailyCheckinStreakMultiplier || '1.2'}
                      onChange={(e) => onInputChange('astraDailyCheckinStreakMultiplier', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max Streak Days</Label>
                  <Input
                    type="number"
                    value={settings.astraDailyCheckinMaxStreak || '30'}
                    onChange={(e) => onInputChange('astraDailyCheckinMaxStreak', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                  <Label className="text-xs">Enable Daily Check-in</Label>
                  <Switch
                    checked={settings.astraDailyCheckinEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraDailyCheckinEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transaction Bonuses */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="py-3 px-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <ArrowRightLeft className="h-4 w-4 text-purple-500" />
                  Transaction Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Bonus Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.astraTransactionBonusRate || '0.5'}
                      onChange={(e) => onInputChange('astraTransactionBonusRate', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max Bonus</Label>
                    <Input
                      type="number"
                      value={settings.astraTransactionBonusMax || '500'}
                      onChange={(e) => onInputChange('astraTransactionBonusMax', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Min Transaction (IDR)</Label>
                  <Input
                    type="number"
                    value={settings.astraTransactionBonusMin || '50000'}
                    onChange={(e) => onInputChange('astraTransactionBonusMin', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                  <Label className="text-xs">Enable Transaction Bonuses</Label>
                  <Switch
                    checked={settings.astraTransactionBonusEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraTransactionBonusEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transfer Configuration */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="py-3 px-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Settings2 className="h-4 w-4 text-orange-500" />
                  Transfer Config
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Min Transfer</Label>
                    <Input
                      type="number"
                      value={settings.astraTransferMinimumAmount || '1000'}
                      onChange={(e) => onInputChange('astraTransferMinimumAmount', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.astraTransferFeePercentage || '1'}
                      onChange={(e) => onInputChange('astraTransferFeePercentage', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Min Fee</Label>
                    <Input
                      type="number"
                      value={settings.astraTransferFeeMinimum || '1'}
                      onChange={(e) => onInputChange('astraTransferFeeMinimum', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Daily Limit</Label>
                    <Input
                      type="number"
                      value={settings.astraTransferDailyLimit || '10000'}
                      onChange={(e) => onInputChange('astraTransferDailyLimit', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                  <Label className="text-xs">Enable Transfers</Label>
                  <Switch
                    checked={settings.astraTransferEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraTransferEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">ASTRA Token System Status</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Welcome Bonus', enabled: settings.astraWelcomeBonusEnabled !== false },
                  { label: 'Daily Check-in', enabled: settings.astraDailyCheckinEnabled !== false },
                  { label: 'Token Transfers', enabled: settings.astraTransferEnabled !== false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
                    <span className="text-xs font-medium">{item.label}</span>
                    <Badge variant={item.enabled ? "default" : "secondary"} className="text-[9px]">
                      {item.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">System Description</Label>
                <Textarea
                  value={settings.astraTokenDescription || 'ASTRA tokens are reward points that can be earned through platform activities.'}
                  onChange={(e) => onInputChange('astraTokenDescription', e.target.value)}
                  className="text-xs min-h-[60px]"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <Label className="text-xs">Enable ASTRA Token System</Label>
                <Switch
                  checked={settings.astraSystemEnabled !== false}
                  onCheckedChange={(checked) => onInputChange('astraSystemEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraTokenSettings;
