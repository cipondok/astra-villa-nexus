import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Cookie, Save, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const CookieConsentSettings = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    bannerTitle: 'Welcome to ASTRA Villa',
    bannerMessage: 'We use cookies to enhance your experience. By accepting, you agree to our cookie policy.',
    notificationEnabled: true,
    notificationDelay: 10,
    notificationMessage: '✨ New 3D villas in Bali! Register for exclusive offers.',
    gmailOfferEnabled: true,
    gmailOfferDiscount: 5,
    gmailOfferTitle: '🎉 Welcome Google User!',
    gmailOfferMessage: 'Your First 3D Villa Booking'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage for now (can be moved to database)
      localStorage.setItem('astra-cookie-settings', JSON.stringify(settings));
      toast.success('Cookie settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('astra-villa-cookie-consent');
    toast.success('Cookie consent reset. Users will see the banner again.');
  };

  const handlePreview = () => {
    localStorage.removeItem('astra-villa-cookie-consent');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            Cookie Consent Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage cookie consent banner, notifications, and special offers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Consent
          </Button>
          <Button variant="outline" onClick={handlePreview} size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Cookie Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cookie Consent Banner</CardTitle>
          <CardDescription>
            Configure the cookie consent banner that appears to new visitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Cookie Banner</Label>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerTitle">Banner Title</Label>
            <Input
              id="bannerTitle"
              value={settings.bannerTitle}
              onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })}
              placeholder="Enter banner title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerMessage">Banner Message</Label>
            <Textarea
              id="bannerMessage"
              value={settings.bannerMessage}
              onChange={(e) => setSettings({ ...settings, bannerMessage: e.target.value })}
              placeholder="Enter banner message"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Popup</CardTitle>
          <CardDescription>
            Configure the notification that appears after users accept cookies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notificationEnabled">Enable Notification</Label>
            <Switch
              id="notificationEnabled"
              checked={settings.notificationEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notificationEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationDelay">Delay (seconds)</Label>
            <Input
              id="notificationDelay"
              type="number"
              value={settings.notificationDelay}
              onChange={(e) => setSettings({ ...settings, notificationDelay: parseInt(e.target.value) })}
              min={1}
              max={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationMessage">Notification Message</Label>
            <Textarea
              id="notificationMessage"
              value={settings.notificationMessage}
              onChange={(e) => setSettings({ ...settings, notificationMessage: e.target.value })}
              placeholder="Enter notification message"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gmail Offer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Gmail Special Offer</CardTitle>
          <CardDescription>
            Configure the special offer popup for Gmail users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="gmailOfferEnabled">Enable Gmail Offer</Label>
            <Switch
              id="gmailOfferEnabled"
              checked={settings.gmailOfferEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, gmailOfferEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gmailOfferDiscount">Discount Percentage (%)</Label>
            <Input
              id="gmailOfferDiscount"
              type="number"
              value={settings.gmailOfferDiscount}
              onChange={(e) => setSettings({ ...settings, gmailOfferDiscount: parseInt(e.target.value) })}
              min={0}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gmailOfferTitle">Offer Title</Label>
            <Input
              id="gmailOfferTitle"
              value={settings.gmailOfferTitle}
              onChange={(e) => setSettings({ ...settings, gmailOfferTitle: e.target.value })}
              placeholder="Enter offer title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gmailOfferMessage">Offer Message</Label>
            <Input
              id="gmailOfferMessage"
              value={settings.gmailOfferMessage}
              onChange={(e) => setSettings({ ...settings, gmailOfferMessage: e.target.value })}
              placeholder="Enter offer message"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Cookie Consent Statistics</CardTitle>
          <CardDescription>
            View analytics about cookie consent interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Consents</div>
              <div className="text-2xl font-bold text-foreground mt-1">-</div>
              <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Acceptance Rate</div>
              <div className="text-2xl font-bold text-foreground mt-1">-</div>
              <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Gmail Offers Shown</div>
              <div className="text-2xl font-bold text-foreground mt-1">-</div>
              <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsentSettings;
