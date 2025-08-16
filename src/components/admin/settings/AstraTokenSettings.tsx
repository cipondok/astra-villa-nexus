import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Gift, Calendar, ArrowRightLeft, Settings2, BarChart3 } from 'lucide-react';
import AstraTokenAnalytics from '../analytics/AstraTokenAnalytics';

interface AstraTokenSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const AstraTokenSettings: React.FC<AstraTokenSettingsProps> = ({ settings = {}, onInputChange }) => {
  console.log('AstraTokenSettings rendered with settings:', settings);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">ASTRA Token System Management</h3>
        <Badge variant="secondary">Admin Panel</Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics & Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="space-y-4">
            <AstraTokenAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Bonus Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Welcome Bonus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeBonusAmount">Welcome Bonus Amount</Label>
              <Input
                id="welcomeBonusAmount"
                type="number"
                value={settings.astraWelcomeBonusAmount || '100'}
                onChange={(e) => onInputChange('astraWelcomeBonusAmount', e.target.value)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                ASTRA tokens given to new users on first login
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="welcomeBonusEnabled"
                checked={settings.astraWelcomeBonusEnabled !== false}
                onCheckedChange={(checked) => onInputChange('astraWelcomeBonusEnabled', checked)}
              />
              <Label htmlFor="welcomeBonusEnabled">Enable Welcome Bonus</Label>
            </div>
          </CardContent>
        </Card>

        {/* Daily Check-in Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Check-in Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyCheckinBaseReward">Base Daily Reward</Label>
              <Input
                id="dailyCheckinBaseReward"
                type="number"
                value={settings.astraDailyCheckinBaseReward || '10'}
                onChange={(e) => onInputChange('astraDailyCheckinBaseReward', e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyCheckinStreakMultiplier">Streak Multiplier</Label>
              <Input
                id="dailyCheckinStreakMultiplier"
                type="number"
                step="0.1"
                value={settings.astraDailyCheckinStreakMultiplier || '1.2'}
                onChange={(e) => onInputChange('astraDailyCheckinStreakMultiplier', e.target.value)}
                placeholder="1.2"
              />
              <p className="text-xs text-muted-foreground">
                Multiplier applied for consecutive check-ins
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyCheckinMaxStreak">Maximum Streak Days</Label>
              <Input
                id="dailyCheckinMaxStreak"
                type="number"
                value={settings.astraDailyCheckinMaxStreak || '30'}
                onChange={(e) => onInputChange('astraDailyCheckinMaxStreak', e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="dailyCheckinEnabled"
                checked={settings.astraDailyCheckinEnabled !== false}
                onCheckedChange={(checked) => onInputChange('astraDailyCheckinEnabled', checked)}
              />
              <Label htmlFor="dailyCheckinEnabled">Enable Daily Check-in</Label>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Bonus Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Transaction Bonuses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionBonusRate">Transaction Bonus Rate (%)</Label>
              <Input
                id="transactionBonusRate"
                type="number"
                step="0.01"
                value={settings.astraTransactionBonusRate || '0.5'}
                onChange={(e) => onInputChange('astraTransactionBonusRate', e.target.value)}
                placeholder="0.5"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of transaction amount awarded as tokens
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionBonusMin">Minimum Transaction for Bonus</Label>
              <Input
                id="transactionBonusMin"
                type="number"
                value={settings.astraTransactionBonusMin || '50000'}
                onChange={(e) => onInputChange('astraTransactionBonusMin', e.target.value)}
                placeholder="50000"
              />
              <p className="text-xs text-muted-foreground">
                Minimum transaction amount in IDR to qualify for bonus
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionBonusMax">Maximum Bonus Per Transaction</Label>
              <Input
                id="transactionBonusMax"
                type="number"
                value={settings.astraTransactionBonusMax || '500'}
                onChange={(e) => onInputChange('astraTransactionBonusMax', e.target.value)}
                placeholder="500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="transactionBonusEnabled"
                checked={settings.astraTransactionBonusEnabled !== false}
                onCheckedChange={(checked) => onInputChange('astraTransactionBonusEnabled', checked)}
              />
              <Label htmlFor="transactionBonusEnabled">Enable Transaction Bonuses</Label>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Transfer Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferMinimumAmount">Minimum Transfer Amount</Label>
              <Input
                id="transferMinimumAmount"
                type="number"
                value={settings.astraTransferMinimumAmount || '1000'}
                onChange={(e) => onInputChange('astraTransferMinimumAmount', e.target.value)}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferFeePercentage">Transfer Fee (%)</Label>
              <Input
                id="transferFeePercentage"
                type="number"
                step="0.01"
                value={settings.astraTransferFeePercentage || '1'}
                onChange={(e) => onInputChange('astraTransferFeePercentage', e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferFeeMinimum">Minimum Transfer Fee</Label>
              <Input
                id="transferFeeMinimum"
                type="number"
                value={settings.astraTransferFeeMinimum || '1'}
                onChange={(e) => onInputChange('astraTransferFeeMinimum', e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferDailyLimit">Daily Transfer Limit per User</Label>
              <Input
                id="transferDailyLimit"
                type="number"
                value={settings.astraTransferDailyLimit || '10000'}
                onChange={(e) => onInputChange('astraTransferDailyLimit', e.target.value)}
                placeholder="10000"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="transferEnabled"
                checked={settings.astraTransferEnabled !== false}
                onCheckedChange={(checked) => onInputChange('astraTransferEnabled', checked)}
              />
              <Label htmlFor="transferEnabled">Enable Token Transfers</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>ASTRA Token System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <span className="text-sm font-medium">Welcome Bonus</span>
              <Badge variant={settings.astraWelcomeBonusEnabled !== false ? "default" : "secondary"}>
                {settings.astraWelcomeBonusEnabled !== false ? "Active" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <span className="text-sm font-medium">Daily Check-in</span>
              <Badge variant={settings.astraDailyCheckinEnabled !== false ? "default" : "secondary"}>
                {settings.astraDailyCheckinEnabled !== false ? "Active" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <span className="text-sm font-medium">Token Transfers</span>
              <Badge variant={settings.astraTransferEnabled !== false ? "default" : "secondary"}>
                {settings.astraTransferEnabled !== false ? "Active" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="astraTokenDescription">Token System Description</Label>
            <Textarea
              id="astraTokenDescription"
              value={settings.astraTokenDescription || 'ASTRA tokens are reward points that can be earned through platform activities and transferred between users.'}
              onChange={(e) => onInputChange('astraTokenDescription', e.target.value)}
              placeholder="Describe the ASTRA token system..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="astraSystemEnabled"
              checked={settings.astraSystemEnabled !== false}
              onCheckedChange={(checked) => onInputChange('astraSystemEnabled', checked)}
            />
            <Label htmlFor="astraSystemEnabled">Enable ASTRA Token System</Label>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraTokenSettings;