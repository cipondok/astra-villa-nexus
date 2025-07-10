import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Percent, Clock, Shield, Bell, Calendar, TrendingDown } from 'lucide-react';

interface DiscountSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const DiscountSettings: React.FC<DiscountSettingsProps> = ({ settings, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Discount System Configuration</h3>
        <Badge variant="secondary">Active</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Discount Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic discount system parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="discountEnabled">Enable Discount System</Label>
                <p className="text-xs text-muted-foreground">
                  Allow vendors to create discount offers
                </p>
              </div>
              <Switch
                id="discountEnabled"
                checked={settings.discountEnabled}
                onCheckedChange={(checked) => onInputChange('discountEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscountPercentage">Maximum Discount Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="maxDiscountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxDiscountPercentage}
                  onChange={(e) => onInputChange('maxDiscountPercentage', e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum discount percentage vendors can offer (1-100%)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minDiscountDuration">Minimum Discount Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minDiscountDuration"
                  type="number"
                  min="1"
                  value={settings.minDiscountDuration}
                  onChange={(e) => onInputChange('minDiscountDuration', e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum duration for discount campaigns
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Approval & Control Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Approval & Control
            </CardTitle>
            <CardDescription>
              Manage discount approval workflow and controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireAdminApproval">Require Admin Approval</Label>
                <p className="text-xs text-muted-foreground">
                  All discounts must be approved by admin
                </p>
              </div>
              <Switch
                id="requireAdminApproval"
                checked={settings.requireAdminApproval}
                onCheckedChange={(checked) => onInputChange('requireAdminApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowSeasonalDiscounts">Allow Seasonal Discounts</Label>
                <p className="text-xs text-muted-foreground">
                  Enable seasonal and holiday discount campaigns
                </p>
              </div>
              <Switch
                id="allowSeasonalDiscounts"
                checked={settings.allowSeasonalDiscounts}
                onCheckedChange={(checked) => onInputChange('allowSeasonalDiscounts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="discountNotifications">Discount Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send notifications about discount activities
                </p>
              </div>
              <Switch
                id="discountNotifications"
                checked={settings.discountNotifications}
                onCheckedChange={(checked) => onInputChange('discountNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Discount System Overview
          </CardTitle>
          <CardDescription>
            Current discount system status and quick stats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Active Discounts</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-muted-foreground">Approved Today</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-xs text-muted-foreground">Pending Approval</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0%</div>
              <div className="text-xs text-muted-foreground">Avg Discount</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountSettings;