import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Settings, MessageSquare, User, Clock } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface CSSettingsData {
  autoAssignTickets: boolean;
  emailNotifications: boolean;
  displayName: string;
  statusMessage: string;
  workingHours: string;
}

interface CSSettingsProps {
  settings: CSSettingsData;
  onSettingsChange: (settings: CSSettingsData) => void;
  onSave: () => void;
  isSaving: boolean;
}

const CSSettings = ({ settings, onSettingsChange, onSave, isSaving }: CSSettingsProps) => {
  const { showSuccess } = useAlert();

  const updateSetting = (key: keyof CSSettingsData, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CS Preferences</CardTitle>
          <CardDescription>Customize your customer service settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-assign tickets</label>
              <p className="text-xs text-muted-foreground">Automatically assign new tickets to you</p>
            </div>
            <Switch
              checked={settings.autoAssignTickets}
              onCheckedChange={(checked) => updateSetting('autoAssignTickets', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Email notifications</label>
              <p className="text-xs text-muted-foreground">Get notified about new tickets</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Response templates</label>
              <p className="text-xs text-muted-foreground">Manage your quick response templates</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => showSuccess("Templates", "Template management coming soon!")}>
              <FileText className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
          <Button 
            className="w-full" 
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your CS account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input 
              value={settings.displayName}
              onChange={(e) => updateSetting('displayName', e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Message</label>
            <Input 
              value={settings.statusMessage}
              onChange={(e) => updateSetting('statusMessage', e.target.value)}
              placeholder="Enter your status message"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Working Hours</label>
            <Select 
              value={settings.workingHours}
              onValueChange={(value) => updateSetting('workingHours', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9-5">9 AM - 5 PM</SelectItem>
                <SelectItem value="24-7">24/7 Available</SelectItem>
                <SelectItem value="custom">Custom Hours</SelectItem>
                <SelectItem value="flexible">Flexible Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Current Settings Preview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
          <CardDescription>Preview of your current CS configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Auto-assign</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.autoAssignTickets ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.emailNotifications ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Display Name</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.displayName}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Working Hours</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {settings.workingHours === '9-5' ? '9 AM - 5 PM' :
                 settings.workingHours === '24-7' ? '24/7 Available' :
                 settings.workingHours === 'custom' ? 'Custom Hours' :
                 'Flexible Schedule'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSSettings;