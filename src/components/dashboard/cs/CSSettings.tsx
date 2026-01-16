import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileText, Settings, MessageSquare, User, Clock, Save, Cog } from "lucide-react";
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-zinc-500/10 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
        <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
          <Cog className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Settings</h2>
            <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-400 text-[9px] px-1.5 py-0 h-4">Preferences</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Configure your CS workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-blue-200/50 dark:border-blue-800/30">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                <Settings className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xs">CS Preferences</CardTitle>
                <CardDescription className="text-[10px]">Customize your settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <label className="text-[10px] font-medium">Auto-assign tickets</label>
                <p className="text-[9px] text-muted-foreground">Automatically assign new tickets</p>
              </div>
              <Switch
                checked={settings.autoAssignTickets}
                onCheckedChange={(checked) => updateSetting('autoAssignTickets', checked)}
                className="scale-75"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <label className="text-[10px] font-medium">Email notifications</label>
                <p className="text-[9px] text-muted-foreground">Get notified about tickets</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                className="scale-75"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div>
                <label className="text-[10px] font-medium">Response templates</label>
                <p className="text-[9px] text-muted-foreground">Manage quick responses</p>
              </div>
              <Button variant="outline" size="sm" className="h-6 text-[9px] px-2" onClick={() => showSuccess("Templates", "Template management coming soon!")}>
                <FileText className="h-3 w-3 mr-1" />
                Manage
              </Button>
            </div>
            <Button 
              className="w-full h-7 text-[10px]" 
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save Preferences
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/30">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                <User className="h-3 w-3 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xs">Account Settings</CardTitle>
                <CardDescription className="text-[10px]">Manage account preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium">Display Name</label>
              <Input 
                value={settings.displayName}
                onChange={(e) => updateSetting('displayName', e.target.value)}
                placeholder="Enter your display name"
                className="h-7 text-[10px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium">Status Message</label>
              <Input 
                value={settings.statusMessage}
                onChange={(e) => updateSetting('statusMessage', e.target.value)}
                placeholder="Enter your status message"
                className="h-7 text-[10px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium">Working Hours</label>
              <Select 
                value={settings.workingHours}
                onValueChange={(value) => updateSetting('workingHours', value)}
              >
                <SelectTrigger className="h-7 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9-5" className="text-[10px]">9 AM - 5 PM</SelectItem>
                  <SelectItem value="24-7" className="text-[10px]">24/7 Available</SelectItem>
                  <SelectItem value="custom" className="text-[10px]">Custom Hours</SelectItem>
                  <SelectItem value="flexible" className="text-[10px]">Flexible Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full h-7 text-[10px]"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Current Settings Preview */}
        <Card className="lg:col-span-2 border-green-200/50 dark:border-green-800/30">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                <Settings className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xs">Current Settings</CardTitle>
                <CardDescription className="text-[10px]">Preview of your configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-2 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Settings className="h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-medium">Auto-assign</span>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {settings.autoAssignTickets ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="p-2 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-medium">Notifications</span>
                </div>
                <p className="text-[9px] text-muted-foreground">
                  {settings.emailNotifications ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="p-2 border rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="h-3 w-3 text-purple-500" />
                  <span className="text-[10px] font-medium">Display Name</span>
                </div>
                <p className="text-[9px] text-muted-foreground truncate">
                  {settings.displayName}
                </p>
              </div>
              <div className="p-2 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-[10px] font-medium">Working Hours</span>
                </div>
                <p className="text-[9px] text-muted-foreground">
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
    </div>
  );
};

export default CSSettings;
