import { useState } from 'react';
import { useDeviceManagement } from '@/hooks/useDeviceManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Laptop, Smartphone, Tablet, Monitor, Trash2, Edit2, Check, X, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const DeviceManagement = () => {
  const { devices, isLoading, updateDevice, removeDevice, isRemoving } = useDeviceManagement();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);

  const getDeviceIcon = (type: string | null) => {
    const iconClass = "h-4 w-4";
    switch (type?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className={iconClass} />;
      case 'tablet':
        return <Tablet className={iconClass} />;
      case 'desktop':
        return <Monitor className={iconClass} />;
      default:
        return <Laptop className={iconClass} />;
    }
  };

  const startEdit = (id: string, currentName: string | null) => {
    setEditingId(id);
    setEditName(currentName || '');
  };

  const saveEdit = (id: string) => {
    updateDevice({ id, updates: { device_name: editName } });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const toggleTrust = (id: string, currentTrust: boolean) => {
    updateDevice({ id, updates: { is_trusted: !currentTrust } });
  };

  if (isLoading) {
    return (
      <Card className="professional-card border">
        <CardContent className="p-4">
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading devices...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="professional-card border">
        <CardHeader className="pb-2 px-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">Trusted Devices</CardTitle>
              <CardDescription className="text-xs">Manage devices that have accessed your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-2">
          {!devices || devices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              No devices found
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="p-2.5 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === device.id ? (
                        <div className="flex gap-1 mb-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-6 text-xs"
                            placeholder="Device name"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => saveEdit(device.id)}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={cancelEdit}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className="font-semibold text-xs text-foreground truncate">
                            {device.device_name || `${device.browser_name || 'Unknown'} on ${device.os_name || 'Unknown'}`}
                          </h4>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5"
                            onClick={() => startEdit(device.id, device.device_name)}
                          >
                            <Edit2 className="h-2.5 w-2.5 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        {device.browser_name && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            {device.browser_name} {device.browser_version}
                          </Badge>
                        )}
                        {device.os_name && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            {device.os_name}
                          </Badge>
                        )}
                        {device.ip_address && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            {device.ip_address}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Last used {formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Trusted</span>
                        <Switch
                          checked={device.is_trusted}
                          onCheckedChange={() => toggleTrust(device.id, device.is_trusted)}
                          className="h-4 w-7 data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeviceToRemove(device.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this device? This device will need to be verified again on next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deviceToRemove) {
                  removeDevice(deviceToRemove);
                  setDeviceToRemove(null);
                }
              }}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
