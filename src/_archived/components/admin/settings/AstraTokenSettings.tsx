
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <Coins className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">ASTRA Token System Management</h3>
        <Badge variant="secondary" className="text-[8px] h-4 px-1.5">Admin Panel</Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 h-7 bg-muted/30">
          <TabsTrigger value="analytics" className="text-[10px] flex items-center gap-1 h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="h-3 w-3" />
            Analytics & Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px] flex items-center gap-1 h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings2 className="h-3 w-3" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <ASTRATokenAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Welcome Bonus */}
            <Card className="border-l-4 border-l-primary bg-card/50 border-border/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  Welcome Bonus
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0 space-y-2">
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Bonus Amount</Label>
                  <Input
                    type="number"
                    value={settings.astraWelcomeBonusAmount || '100'}
                    onChange={(e) => onInputChange('astraWelcomeBonusAmount', e.target.value)}
                    className="h-7 text-xs bg-background/50 border-border/50"
                    placeholder="100"
                  />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                  <Label className="text-[10px] text-muted-foreground">Enable Welcome Bonus</Label>
                  <Switch
                    checked={settings.astraWelcomeBonusEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraWelcomeBonusEnabled', checked)}
                    className="scale-75"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card className="border-l-4 border-l-accent bg-card/50 border-border/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  Daily Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Base Reward</Label>
                    <Input
                      type="number"
                      value={settings.astraDailyCheckinBaseReward || '10'}
                      onChange={(e) => onInputChange('astraDailyCheckinBaseReward', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Streak Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.astraDailyCheckinStreakMultiplier || '1.2'}
                      onChange={(e) => onInputChange('astraDailyCheckinStreakMultiplier', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Max Streak Days</Label>
                  <Input
                    type="number"
                    value={settings.astraDailyCheckinMaxStreak || '30'}
                    onChange={(e) => onInputChange('astraDailyCheckinMaxStreak', e.target.value)}
                    className="h-7 text-xs bg-background/50 border-border/50"
                  />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                  <Label className="text-[10px] text-muted-foreground">Enable Daily Check-in</Label>
                  <Switch
                    checked={settings.astraDailyCheckinEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraDailyCheckinEnabled', checked)}
                    className="scale-75"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transaction Bonuses */}
            <Card className="border-l-4 border-l-secondary bg-card/50 border-border/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-secondary" />
                  Transaction Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Bonus Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.astraTransactionBonusRate || '0.5'}
                      onChange={(e) => onInputChange('astraTransactionBonusRate', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Max Bonus</Label>
                    <Input
                      type="number"
                      value={settings.astraTransactionBonusMax || '500'}
                      onChange={(e) => onInputChange('astraTransactionBonusMax', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Min Transaction (IDR)</Label>
                  <Input
                    type="number"
                    value={settings.astraTransactionBonusMin || '50000'}
                    onChange={(e) => onInputChange('astraTransactionBonusMin', e.target.value)}
                    className="h-7 text-xs bg-background/50 border-border/50"
                  />
                </div>
                <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                  <Label className="text-[10px] text-muted-foreground">Enable Transaction Bonuses</Label>
                  <Switch
                    checked={settings.astraTransactionBonusEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraTransactionBonusEnabled', checked)}
                    className="scale-75"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transfer Configuration */}
            <Card className="border-l-4 border-l-destructive bg-card/50 border-border/50">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Settings2 className="h-3.5 w-3.5 text-destructive" />
                  Transfer Config
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Min Transfer</Label>
                    <Input
                      type="number"
                      value={settings.astraTransferMinimumAmount || '1000'}
                      onChange={(e) => onInputChange('astraTransferMinimumAmount', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.astraTransferFeePercentage || '1'}
                      onChange={(e) => onInputChange('astraTransferFeePercentage', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Min Fee</Label>
                    <Input
                      type="number"
                      value={settings.astraTransferFeeMinimum || '1'}
                      onChange={(e) => onInputChange('astraTransferFeeMinimum', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Daily Limit</Label>
                    <Input
                      type="number"
                      value={settings.astraTransferDailyLimit || '10000'}
                      onChange={(e) => onInputChange('astraTransferDailyLimit', e.target.value)}
                      className="h-7 text-xs bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                  <Label className="text-[10px] text-muted-foreground">Enable Transfers</Label>
                  <Switch
                    checked={settings.astraTransferEnabled !== false}
                    onCheckedChange={(checked) => onInputChange('astraTransferEnabled', checked)}
                    className="scale-75"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground">ASTRA Token System Status</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Welcome Bonus', enabled: settings.astraWelcomeBonusEnabled !== false },
                  { label: 'Daily Check-in', enabled: settings.astraDailyCheckinEnabled !== false },
                  { label: 'Token Transfers', enabled: settings.astraTransferEnabled !== false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30">
                    <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                    <Badge 
                      variant={item.enabled ? "default" : "secondary"} 
                      className={`text-[8px] h-4 px-1.5 ${item.enabled ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}
                    >
                      {item.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-2">
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">System Description</Label>
                <Textarea
                  value={settings.astraTokenDescription || 'ASTRA tokens are reward points that can be earned through platform activities.'}
                  onChange={(e) => onInputChange('astraTokenDescription', e.target.value)}
                  className="text-xs min-h-[50px] bg-background/50 border-border/50"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <Label className="text-[10px] text-muted-foreground">Enable ASTRA Token System</Label>
                <Switch
                  checked={settings.astraSystemEnabled !== false}
                  onCheckedChange={(checked) => onInputChange('astraSystemEnabled', checked)}
                  className="scale-75"
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
