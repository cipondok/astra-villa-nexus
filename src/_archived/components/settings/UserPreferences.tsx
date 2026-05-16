import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Settings2, Bell, Mail, Eye, Layout } from 'lucide-react';

export const UserPreferences = () => {
  const { preferences, isLoading, isSaving, updatePreferences } = useUserPreferences();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Notifications */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Bell className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Notifications</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border">
            <Label htmlFor="email-notifications" className="flex-1 cursor-pointer">
              <span className="text-xs font-medium">Email</span>
              <p className="text-[10px] text-muted-foreground">Updates via email</p>
            </Label>
            <Switch id="email-notifications" checked={preferences.email_notifications} onCheckedChange={(checked) => updatePreferences({ email_notifications: checked })} disabled={isSaving} className="h-4 w-7" />
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border">
            <Label htmlFor="push-notifications" className="flex-1 cursor-pointer">
              <span className="text-xs font-medium">Push</span>
              <p className="text-[10px] text-muted-foreground">Browser notifications</p>
            </Label>
            <Switch id="push-notifications" checked={preferences.push_notifications} onCheckedChange={(checked) => updatePreferences({ push_notifications: checked })} disabled={isSaving} className="h-4 w-7" />
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border">
            <Label htmlFor="marketing-emails" className="flex-1 cursor-pointer">
              <span className="text-xs font-medium">Marketing</span>
              <p className="text-[10px] text-muted-foreground">Promos & updates</p>
            </Label>
            <Switch id="marketing-emails" checked={preferences.marketing_emails} onCheckedChange={(checked) => updatePreferences({ marketing_emails: checked })} disabled={isSaving} className="h-4 w-7" />
          </div>
        </div>
      </div>

      <Separator className="my-1.5" />

      {/* Display */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Eye className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Display</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border">
            <Label htmlFor="compact-view" className="flex-1 cursor-pointer">
              <span className="text-xs font-medium">Compact</span>
              <p className="text-[10px] text-muted-foreground">Less spacing</p>
            </Label>
            <Switch id="compact-view" checked={preferences.compact_view} onCheckedChange={(checked) => updatePreferences({ compact_view: checked })} disabled={isSaving} className="h-4 w-7" />
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/30 border">
            <Label htmlFor="show-avatars" className="flex-1 cursor-pointer">
              <span className="text-xs font-medium">Avatars</span>
              <p className="text-[10px] text-muted-foreground">Show profile pics</p>
            </Label>
            <Switch id="show-avatars" checked={preferences.show_avatars} onCheckedChange={(checked) => updatePreferences({ show_avatars: checked })} disabled={isSaving} className="h-4 w-7" />
          </div>
        </div>
      </div>
    </div>
  );
};
