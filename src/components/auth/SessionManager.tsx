
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Tablet, AlertTriangle } from "lucide-react";
import { useSessionMonitoring } from "@/hooks/useSessionMonitoring";
import { formatDistanceToNow } from "date-fns";

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ isOpen, onClose }) => {
  const { activeSessions, terminateSession, currentSessionId } = useSessionMonitoring();

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo?.toLowerCase().includes('mobile')) return Smartphone;
    if (deviceInfo?.toLowerCase().includes('tablet')) return Tablet;
    return Monitor;
  };

  const otherSessions = activeSessions.filter(session => session.id !== currentSessionId && session.is_active);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Sessions
          </DialogTitle>
          <DialogDescription>
            Manage your active sessions across different devices and browsers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Session */}
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Current Session</p>
                  <p className="text-sm text-green-600">This device</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>

          {/* Other Sessions */}
          {otherSessions.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Other Active Sessions</h4>
              {otherSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.device_fingerprint || '');
                return (
                  <div key={session.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DeviceIcon className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-800">
                            {session.device_fingerprint?.split(' - ')[0] || 'Unknown Device'}
                          </p>
                          <p className="text-sm text-orange-600">
                            Started: {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                      >
                        Terminate
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No other active sessions found</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
