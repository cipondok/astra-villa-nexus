
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Settings,
  Save,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PropertyOwnerSettings = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState({
    // Profile Settings
    displayName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    bio: '',
    profileImage: profile?.avatar_url || '',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newInquiryNotifications: true,
    marketingEmails: false,
    
    // Privacy Settings
    showContactInfo: true,
    allowDirectMessages: true,
    profileVisibility: 'public',
    
    // Listing Settings
    autoApprove: false,
    requireDeposit: true,
    defaultListingDuration: 90,
    allowNegotiation: true
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Add save logic here
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                {settings.profileImage ? (
                  <img src={settings.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 p-1 h-8 w-8">
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{settings.displayName || 'Property Owner'}</h3>
              <p className="text-sm text-muted-foreground">{settings.email}</p>
              <Badge variant="secondary" className="mt-1">Verified Owner</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName"
                value={settings.displayName}
                onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio"
              placeholder="Tell potential tenants about yourself..."
              value={settings.bio}
              onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified about your properties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
              { key: 'newInquiryNotifications', label: 'New Inquiry Alerts', description: 'Get notified immediately when someone inquires about your property' },
              { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive tips and updates about property management' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <Switch 
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Control your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              { key: 'showContactInfo', label: 'Show Contact Information', description: 'Display your contact details on property listings' },
              { key: 'allowDirectMessages', label: 'Allow Direct Messages', description: 'Let potential tenants message you directly' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <Switch 
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Listing Preferences
          </CardTitle>
          <CardDescription>Set your default preferences for property listings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Auto-approve Applications</div>
                <div className="text-xs text-muted-foreground">Automatically approve qualified applications</div>
              </div>
              <Switch 
                checked={settings.autoApprove}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoApprove: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Allow Price Negotiation</div>
                <div className="text-xs text-muted-foreground">Let tenants negotiate rental prices</div>
              </div>
              <Switch 
                checked={settings.allowNegotiation}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowNegotiation: checked }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="listingDuration">Default Listing Duration (days)</Label>
              <Input 
                id="listingDuration"
                type="number"
                value={settings.defaultListingDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultListingDuration: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PropertyOwnerSettings;
