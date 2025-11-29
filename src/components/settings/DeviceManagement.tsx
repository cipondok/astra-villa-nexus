import { useState } from 'react';
import { useDeviceManagement } from '@/hooks/useDeviceManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <Card className="professional-card border p-2">
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
          <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="professional-card border p-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Shield className="h-2.5 w-2.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold">Devices</p>
            <p className="text-[10px] text-muted-foreground">{devices?.length || 0} connected</p>
          </div>
        </div>
        
        {!devices || devices.length === 0 ? (
          <p className="text-center py-2 text-[10px] text-muted-foreground">No devices</p>
        ) : (
          <ScrollArea className="h-[100px]">
            <div className="space-y-1">
              {devices.map((device) => (
                <div key={device.id} className="p-1.5 rounded-md border bg-muted/20 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === device.id ? (
                        <div className="flex gap-0.5">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-5 text-[10px]" autoFocus />
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => saveEdit(device.id)}>
                            <Check className="h-2.5 w-2.5 text-green-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={cancelEdit}>
                            <X className="h-2.5 w-2.5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium truncate">{device.device_name || device.browser_name || 'Device'}</span>
                          <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => startEdit(device.id, device.device_name)}>
                            <Edit2 className="h-2 w-2" />
                          </Button>
                        </div>
                      )}
                      <p className="text-[9px] text-muted-foreground truncate">{device.os_name} • {formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Switch checked={device.is_trusted} onCheckedChange={() => toggleTrust(device.id, device.is_trusted)} className="h-3 w-6 data-[state=checked]:bg-green-500" />
                      <Button size="icon" variant="ghost" className="h-5 w-5 hover:text-destructive" onClick={() => setDeviceToRemove(device.id)}>
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
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
