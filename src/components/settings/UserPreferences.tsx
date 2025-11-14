import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTooltipPreferences } from '@/hooks/useTooltipPreferences';
import { Settings2, Bell, Mail, Eye, Layout, Info } from 'lucide-react';

export const UserPreferences = () => {
  const { preferences, isLoading, isSaving, updatePreferences } = useUserPreferences();
  const { preferences: tooltipPrefs, updatePreferences: updateTooltipPrefs } = useTooltipPreferences();

  if (isLoading) {
    return (
      <Card className="professional-card border-2 overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500"></div>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500"></div>
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Settings2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-xl">User Preferences</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Customize your experience</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        
        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <Label htmlFor="email-notifications" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Receive updates via email</div>
              </Label>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ email_notifications: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <Label htmlFor="push-notifications" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">Push Notifications</div>
                <div className="text-xs text-muted-foreground">Browser push notifications</div>
              </Label>
              <Switch
                id="push-notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => 
                  updatePreferences({ push_notifications: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <Label htmlFor="marketing-emails" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">Marketing Emails</div>
                <div className="text-xs text-muted-foreground">Promotional content and updates</div>
              </Label>
              <Switch
                id="marketing-emails"
                checked={preferences.marketing_emails}
                onCheckedChange={(checked) => 
                  updatePreferences({ marketing_emails: checked })
                }
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Display Options Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Display Options</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <Label htmlFor="compact-view" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">Compact View</div>
                <div className="text-xs text-muted-foreground">Reduce spacing and padding</div>
              </Label>
              <Switch
                id="compact-view"
                checked={preferences.compact_view}
                onCheckedChange={(checked) => 
                  updatePreferences({ compact_view: checked })
                }
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <Label htmlFor="show-avatars" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">Show Avatars</div>
                <div className="text-xs text-muted-foreground">Display user profile pictures</div>
              </Label>
              <Switch
                id="show-avatars"
                checked={preferences.show_avatars}
                onCheckedChange={(checked) => 
                  updatePreferences({ show_avatars: checked })
                }
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tooltip Preferences Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Tooltip Preferences</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <Label htmlFor="tooltips-enabled" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">Enable Tooltips</div>
                <div className="text-xs text-muted-foreground">Show helpful tooltips throughout the app</div>
              </Label>
              <Switch
                id="tooltips-enabled"
                checked={tooltipPrefs.enabled}
                onCheckedChange={(checked) => updateTooltipPrefs({ enabled: checked })}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-3">
              <Label htmlFor="tooltip-delay" className="text-sm font-medium">
                Tooltip Delay (ms)
                <div className="text-xs text-muted-foreground font-normal">Time before tooltip appears</div>
              </Label>
              <Select
                value={tooltipPrefs.delay.toString()}
                onValueChange={(value) => updateTooltipPrefs({ delay: parseInt(value) })}
                disabled={!tooltipPrefs.enabled}
              >
                <SelectTrigger id="tooltip-delay" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Instant</SelectItem>
                  <SelectItem value="150">Fast (150ms)</SelectItem>
                  <SelectItem value="300">Normal (300ms)</SelectItem>
                  <SelectItem value="500">Slow (500ms)</SelectItem>
                  <SelectItem value="700">Very Slow (700ms)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-3">
              <Label htmlFor="tooltip-position" className="text-sm font-medium">
                Default Position
                <div className="text-xs text-muted-foreground font-normal">Preferred tooltip position</div>
              </Label>
              <Select
                value={tooltipPrefs.position}
                onValueChange={(value: 'top' | 'right' | 'bottom' | 'left') => 
                  updateTooltipPrefs({ position: value })
                }
                disabled={!tooltipPrefs.enabled}
              >
                <SelectTrigger id="tooltip-position" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-3">
              <Label htmlFor="tooltip-theme" className="text-sm font-medium">
                Tooltip Theme
                <div className="text-xs text-muted-foreground font-normal">Visual style of tooltips</div>
              </Label>
              <Select
                value={tooltipPrefs.theme}
                onValueChange={(value: 'light' | 'dark' | 'colorful') => 
                  updateTooltipPrefs({ theme: value })
                }
                disabled={!tooltipPrefs.enabled}
              >
                <SelectTrigger id="tooltip-theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="colorful">Colorful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
