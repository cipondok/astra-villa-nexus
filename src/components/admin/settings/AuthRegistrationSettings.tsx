
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, Mail, Phone, Globe, Gift, Crown, Users, Coins, 
  Megaphone, Clock, Save, RefreshCw, Smartphone, CheckCircle,
  AlertTriangle, Sparkles, Rocket, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

const AuthRegistrationSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Login Methods
    emailLoginEnabled: true,
    phoneLoginEnabled: true,
    whatsappLoginEnabled: true,
    googleLoginEnabled: true,
    facebookLoginEnabled: false,
    appleLoginEnabled: false,
    twitterLoginEnabled: false,
    githubLoginEnabled: false,
    
    // Registration Settings
    registrationEnabled: true,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    autoAssignRole: 'general_user',
    defaultMembershipLevel: 'basic',
    
    // Signup Rewards
    signupRewardsEnabled: true,
    welcomeTokenBonus: 500,
    welcomeVipDays: 30,
    welcomeVipLevel: 'vip',
    referralTokenBonus: 200,
    referrerTokenBonus: 300,
    
    // Promotion Settings
    promotionEnabled: true,
    promotionTitle: '🎉 Limited Time Offer!',
    promotionDescription: 'Sign up now and get 500 ASTRA Tokens + 30 Days VIP FREE!',
    promotionEndDate: '2026-03-31',
    promotionBannerColor: '#7f5af0',
    showCountdownTimer: true,
    
    // Affiliate Settings
    affiliateEnabled: true,
    affiliateCommissionRate: 10,
    affiliateMinPayout: 100000,
    affiliateAutoApprove: false,
    
    // WhatsApp Settings
    whatsappDefaultCountry: '+62',
    whatsappOtpEnabled: false,
    whatsappWelcomeMessage: 'Welcome to Astra Villa Realty! Your account has been created.',
    
    // Google OAuth
    googleClientConfigured: true,
    googleOneTapEnabled: false,
    
    // Security
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    requireCaptcha: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .like('key', 'auth_%');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const loaded: Record<string, any> = {};
        data.forEach(row => {
          const key = row.key.replace('auth_', '');
          const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          let val: any = row.value;
          if (val === 'true') val = true;
          else if (val === 'false') val = false;
          else if (!isNaN(Number(val)) && val !== '') val = Number(val);
          loaded[camelKey] = val;
        });
        setSettings(prev => ({ ...prev, ...loaded }));
      }
    } catch (err) {
      console.error('Error loading auth settings:', err);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        const snakeKey = 'auth_' + key.replace(/([A-Z])/g, '_$1').toLowerCase();
        await supabase
          .from('system_settings')
          .upsert({
            key: snakeKey,
            value: String(value),
            category: 'auth',
            description: `Auth setting: ${key}`,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      }
      showSuccess('Saved', 'Auth & Registration settings saved successfully');
    } catch (err) {
      showError('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Auth & Registration Settings
          </h2>
          <p className="text-xs text-muted-foreground">Manage login methods, signup rewards, promotions, and affiliate settings</p>
        </div>
        <Button onClick={saveSettings} disabled={loading} size="sm" className="gap-1.5">
          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save All
        </Button>
      </div>

      <Tabs defaultValue="login-methods" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1 rounded-lg border border-border/30">
          <TabsTrigger value="login-methods" className="text-xs h-7 px-3 gap-1"><Shield className="h-3 w-3" />Login Methods</TabsTrigger>
          <TabsTrigger value="registration" className="text-xs h-7 px-3 gap-1"><Users className="h-3 w-3" />Registration</TabsTrigger>
          <TabsTrigger value="rewards" className="text-xs h-7 px-3 gap-1"><Gift className="h-3 w-3" />Signup Rewards</TabsTrigger>
          <TabsTrigger value="promotion" className="text-xs h-7 px-3 gap-1"><Megaphone className="h-3 w-3" />Promotions</TabsTrigger>
          <TabsTrigger value="affiliate" className="text-xs h-7 px-3 gap-1"><Rocket className="h-3 w-3" />Affiliate</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs h-7 px-3 gap-1"><Phone className="h-3 w-3" />WhatsApp</TabsTrigger>
          <TabsTrigger value="social" className="text-xs h-7 px-3 gap-1"><Globe className="h-3 w-3" />Social Login</TabsTrigger>
          <TabsTrigger value="security" className="text-xs h-7 px-3 gap-1"><Shield className="h-3 w-3" />Security</TabsTrigger>
        </TabsList>

        {/* LOGIN METHODS */}
        <TabsContent value="login-methods" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" />Sign-in Methods</CardTitle>
              <CardDescription className="text-xs">Enable or disable authentication providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'emailLoginEnabled', label: 'Email & Password', icon: Mail, desc: 'Standard email/password login' },
                { key: 'phoneLoginEnabled', label: 'Phone Number (SMS)', icon: Phone, desc: 'SMS OTP verification' },
                { key: 'whatsappLoginEnabled', label: 'WhatsApp Login', icon: Smartphone, desc: 'Login via WhatsApp number' },
                { key: 'googleLoginEnabled', label: 'Google OAuth', icon: Globe, desc: 'Sign in with Google account', badge: 'Configured' },
                { key: 'facebookLoginEnabled', label: 'Facebook Login', icon: Globe, desc: 'Sign in with Facebook' },
                { key: 'appleLoginEnabled', label: 'Apple Sign In', icon: Smartphone, desc: 'Sign in with Apple ID' },
                { key: 'twitterLoginEnabled', label: 'Twitter/X Login', icon: Globe, desc: 'Sign in with Twitter/X' },
                { key: 'githubLoginEnabled', label: 'GitHub Login', icon: Globe, desc: 'Sign in with GitHub' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs font-medium flex items-center gap-1.5">
                        {item.label}
                        {item.badge && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-chart-1/10 text-chart-1 border-chart-1/30">{item.badge}</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onCheckedChange={(v) => update(item.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTRATION */}
        <TabsContent value="registration" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />Registration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow New Registrations</Label>
                <Switch checked={settings.registrationEnabled} onCheckedChange={v => update('registrationEnabled', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Require Email Verification</Label>
                <Switch checked={settings.requireEmailVerification} onCheckedChange={v => update('requireEmailVerification', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Require Phone Verification</Label>
                <Switch checked={settings.requirePhoneVerification} onCheckedChange={v => update('requirePhoneVerification', v)} />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label className="text-xs">Default Role for New Users</Label>
                <Select value={settings.autoAssignRole} onValueChange={v => update('autoAssignRole', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_user">General User</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default Membership Level</Label>
                <Select value={settings.defaultMembershipLevel} onValueChange={v => update('defaultMembershipLevel', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIGNUP REWARDS */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="h-4 w-4 text-chart-3" />
                Signup Reward Configuration
                <Badge className="text-[9px] bg-chart-3/20 text-chart-3 border-chart-3/30">Active</Badge>
              </CardTitle>
              <CardDescription className="text-xs">Configure rewards given to new users upon registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Enable Signup Rewards</Label>
                <Switch checked={settings.signupRewardsEnabled} onCheckedChange={v => update('signupRewardsEnabled', v)} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Coins className="h-3 w-3" />Welcome Token Bonus</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.welcomeTokenBonus} onChange={e => update('welcomeTokenBonus', Number(e.target.value))} />
                  <p className="text-[10px] text-muted-foreground">ASTRA tokens given on signup</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Crown className="h-3 w-3" />Free VIP Duration (days)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.welcomeVipDays} onChange={e => update('welcomeVipDays', Number(e.target.value))} />
                  <p className="text-[10px] text-muted-foreground">Days of free VIP membership</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">VIP Level Granted</Label>
                  <Select value={settings.welcomeVipLevel} onValueChange={v => update('welcomeVipLevel', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <h4 className="text-xs font-medium flex items-center gap-1"><Star className="h-3 w-3" />Referral Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Referrer Bonus (tokens)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.referrerTokenBonus} onChange={e => update('referrerTokenBonus', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Referee Bonus (tokens)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.referralTokenBonus} onChange={e => update('referralTokenBonus', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROMOTIONS */}
        <TabsContent value="promotion" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                Signup Promotion Banner
              </CardTitle>
              <CardDescription className="text-xs">Configure the promotional banner shown on login/signup pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Promotion Banner</Label>
                <Switch checked={settings.promotionEnabled} onCheckedChange={v => update('promotionEnabled', v)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Promotion Title</Label>
                <Input className="h-8 text-xs" value={settings.promotionTitle} onChange={e => update('promotionTitle', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Promotion Description</Label>
                <Textarea className="text-xs min-h-[60px]" value={settings.promotionDescription} onChange={e => update('promotionDescription', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />End Date</Label>
                  <Input type="date" className="h-8 text-xs" value={settings.promotionEndDate} onChange={e => update('promotionEndDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Banner Accent Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="h-8 w-12 p-1" value={settings.promotionBannerColor} onChange={e => update('promotionBannerColor', e.target.value)} />
                    <Input className="h-8 text-xs flex-1" value={settings.promotionBannerColor} onChange={e => update('promotionBannerColor', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Countdown Timer</Label>
                <Switch checked={settings.showCountdownTimer} onCheckedChange={v => update('showCountdownTimer', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AFFILIATE */}
        <TabsContent value="affiliate" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Rocket className="h-4 w-4" />Affiliate Program Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Affiliate Program</Label>
                <Switch checked={settings.affiliateEnabled} onCheckedChange={v => update('affiliateEnabled', v)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Commission Rate (%)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.affiliateCommissionRate} onChange={e => update('affiliateCommissionRate', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min Payout (IDR)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.affiliateMinPayout} onChange={e => update('affiliateMinPayout', Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Auto-Approve New Affiliates</Label>
                <Switch checked={settings.affiliateAutoApprove} onCheckedChange={v => update('affiliateAutoApprove', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WHATSAPP */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-chart-1" />WhatsApp Login Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Default Country Code</Label>
                <Select value={settings.whatsappDefaultCountry} onValueChange={v => update('whatsappDefaultCountry', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+62">🇮🇩 Indonesia (+62)</SelectItem>
                    <SelectItem value="+60">🇲🇾 Malaysia (+60)</SelectItem>
                    <SelectItem value="+65">🇸🇬 Singapore (+65)</SelectItem>
                    <SelectItem value="+1">🇺🇸 USA (+1)</SelectItem>
                    <SelectItem value="+44">🇬🇧 UK (+44)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable WhatsApp OTP</Label>
                <Switch checked={settings.whatsappOtpEnabled} onCheckedChange={v => update('whatsappOtpEnabled', v)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Welcome Message</Label>
                <Textarea className="text-xs min-h-[60px]" value={settings.whatsappWelcomeMessage} onChange={e => update('whatsappWelcomeMessage', e.target.value)} />
              </div>
              <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Supabase Phone Auth Required</p>
                    <p className="text-[10px] text-muted-foreground">WhatsApp login uses Supabase phone authentication. Make sure phone auth is enabled in your Supabase dashboard under Authentication → Providers.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL LOGIN */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Social Login Configuration</CardTitle>
              <CardDescription className="text-xs">Configure OAuth providers. Credentials must be set in Supabase dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Google One-Tap Sign In</Label>
                <Switch checked={settings.googleOneTapEnabled} onCheckedChange={v => update('googleOneTapEnabled', v)} />
              </div>
              <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Google OAuth Status: {settings.googleClientConfigured ? 'Configured ✓' : 'Not Configured'}</p>
                    <p className="text-[10px] text-muted-foreground">Manage OAuth credentials in your Supabase dashboard → Authentication → Providers</p>
                  </div>
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">To add or modify social login providers (Facebook, Apple, Twitter, GitHub), configure them directly in your Supabase dashboard.</p>
              <Button variant="outline" size="sm" className="text-xs gap-1.5" asChild>
                <a href="https://supabase.com/dashboard/project/zymrajuuyyfkzdmptebl/auth/providers" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-3 w-3" />
                  Open Supabase Auth Providers
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Login Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Login Attempts</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.maxLoginAttempts} onChange={e => update('maxLoginAttempts', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Lockout Duration (min)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.lockoutDuration} onChange={e => update('lockoutDuration', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Session Timeout (min)</Label>
                  <Input type="number" className="h-8 text-xs" value={settings.sessionTimeout} onChange={e => update('sessionTimeout', Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Require CAPTCHA on Registration</Label>
                <Switch checked={settings.requireCaptcha} onCheckedChange={v => update('requireCaptcha', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthRegistrationSettings;
