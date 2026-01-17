
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Percent, Shield, TrendingDown } from 'lucide-react';

interface DiscountSettingsProps {
  settings: any;
  onInputChange: (key: string, value: any) => void;
}

const DiscountSettings: React.FC<DiscountSettingsProps> = ({ settings, onInputChange }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <TrendingDown className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Discount System Configuration</h3>
        <Badge variant="secondary" className="text-[9px]">Active</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* General Settings */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Percent className="h-4 w-4 text-blue-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
              <div>
                <Label htmlFor="discountEnabled" className="text-xs font-medium">Enable Discount System</Label>
                <p className="text-[9px] text-muted-foreground">Allow vendors to create discounts</p>
              </div>
              <Switch
                id="discountEnabled"
                checked={settings.discountEnabled}
                onCheckedChange={(checked) => onInputChange('discountEnabled', checked)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="maxDiscountPercentage" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max Discount %</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="maxDiscountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxDiscountPercentage}
                  onChange={(e) => onInputChange('maxDiscountPercentage', e.target.value)}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="minDiscountDuration" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Min Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minDiscountDuration"
                  type="number"
                  min="1"
                  value={settings.minDiscountDuration}
                  onChange={(e) => onInputChange('minDiscountDuration', e.target.value)}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval & Control */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-orange-500" />
              Approval & Control
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            {[
              { id: 'requireAdminApproval', label: 'Admin Approval', desc: 'All discounts need approval', checked: settings.requireAdminApproval },
              { id: 'allowSeasonalDiscounts', label: 'Seasonal Discounts', desc: 'Holiday campaigns', checked: settings.allowSeasonalDiscounts },
              { id: 'discountNotifications', label: 'Notifications', desc: 'Discount activity alerts', checked: settings.discountNotifications },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border border-border/50">
                <div>
                  <Label htmlFor={item.id} className="text-xs font-medium">{item.label}</Label>
                  <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingDown className="h-4 w-4" />
            Discount System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Active Discounts', value: '0', color: 'text-primary' },
              { label: 'Approved Today', value: '0', color: 'text-green-600' },
              { label: 'Pending Approval', value: '0', color: 'text-orange-600' },
              { label: 'Avg Discount', value: '0%', color: 'text-blue-600' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountSettings;
