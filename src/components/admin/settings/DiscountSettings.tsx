
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <TrendingDown className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Discount System Configuration</h3>
        <Badge className="text-[8px] h-4 px-1.5 bg-primary/20 text-primary border border-primary/30">Active</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* General Settings */}
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Percent className="h-3.5 w-3.5 text-primary" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 space-y-2">
            <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
              <div>
                <Label htmlFor="discountEnabled" className="text-[10px] font-medium text-foreground">Enable Discount System</Label>
                <p className="text-[8px] text-muted-foreground">Allow vendors to create discounts</p>
              </div>
              <Switch
                id="discountEnabled"
                checked={settings.discountEnabled}
                onCheckedChange={(checked) => onInputChange('discountEnabled', checked)}
                className="scale-75"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="maxDiscountPercentage" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Max Discount %</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="maxDiscountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxDiscountPercentage}
                  onChange={(e) => onInputChange('maxDiscountPercentage', e.target.value)}
                  className="h-7 text-xs w-20 bg-background/50 border-border/50"
                />
                <span className="text-[10px] text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="minDiscountDuration" className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Min Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minDiscountDuration"
                  type="number"
                  min="1"
                  value={settings.minDiscountDuration}
                  onChange={(e) => onInputChange('minDiscountDuration', e.target.value)}
                  className="h-7 text-xs w-20 bg-background/50 border-border/50"
                />
                <span className="text-[10px] text-muted-foreground">days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval & Control */}
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="h-3.5 w-3.5 text-accent" />
              Approval & Control
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 space-y-2">
            {[
              { id: 'requireAdminApproval', label: 'Admin Approval', desc: 'All discounts need approval', checked: settings.requireAdminApproval },
              { id: 'allowSeasonalDiscounts', label: 'Seasonal Discounts', desc: 'Holiday campaigns', checked: settings.allowSeasonalDiscounts },
              { id: 'discountNotifications', label: 'Notifications', desc: 'Discount activity alerts', checked: settings.discountNotifications },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label htmlFor={item.id} className="text-[10px] font-medium text-foreground">{item.label}</Label>
                  <p className="text-[8px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) => onInputChange(item.id, checked)}
                  className="scale-75"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <TrendingDown className="h-3.5 w-3.5" />
            Discount System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-foreground">0</p>
                <p className="text-[8px] text-muted-foreground">Active Discounts</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-foreground">0</p>
                <p className="text-[8px] text-muted-foreground">Approved Today</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-foreground">0</p>
                <p className="text-[8px] text-muted-foreground">Pending Approval</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
              <CardContent className="p-2 text-center">
                <p className="text-lg font-bold text-foreground">0%</p>
                <p className="text-[8px] text-muted-foreground">Avg Discount</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountSettings;
