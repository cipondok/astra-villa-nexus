
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

const AstraTokenSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ASTRA Token Settings
          </CardTitle>
          <CardDescription>Configure token parameters and rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staking-rate">Staking Reward Rate (%)</Label>
              <Input id="staking-rate" placeholder="5.0" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min-stake">Minimum Stake Amount</Label>
              <Input id="min-stake" placeholder="100" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Token Staking</Label>
              <p className="text-sm text-muted-foreground">Allow users to stake ASTRA tokens</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Token Rewards</Label>
              <p className="text-sm text-muted-foreground">Distribute rewards to active users</p>
            </div>
            <Switch />
          </div>

          <Button className="w-full">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AstraTokenSettings;
