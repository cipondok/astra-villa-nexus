
import React, { useEffect, useState } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Monitor, Smartphone, Tablet } from 'lucide-react';

interface ActiveSession {
  id: string;
  device_info: any;
  created_at: string;
  last_activity: string;
  is_current: boolean;
}

const DuplicateLoginDetector: React.FC = () => {
  const { user } = useEnhancedAuth();
  const { showWarning, showError } = useAlert();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getDeviceIcon = (deviceInfo: any) => {
    const userAgent = deviceInfo?.userAgent?.toLowerCase() || '';
    
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceDescription = (deviceInfo: any) => {
    if (!deviceInfo) return 'Unknown Device';
    
    const platform = deviceInfo.platform || 'Unknown Platform';
    const userAgent = deviceInfo.userAgent || '';
    
    let browser = 'Unknown Browser';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    return `${platform} - ${browser}`;
  };

  const checkActiveSessions = async () => {
    if (!user?.id) return;

    try {
      const { data: sessions, error } = await supabase
        .from('user_device_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      if (sessions && sessions.length > 1) {
        const currentFingerprint = localStorage.getItem('device_fingerprint');
        const sessionsWithCurrent = sessions.map(session => ({
          ...session,
          is_current: session.device_fingerprint === currentFingerprint
        }));

        setActiveSessions(sessionsWithCurrent);
        
        // Show warning for multiple active sessions
        showWarning(
          "Multiple Active Sessions",
          `You have ${sessions.length} active sessions. Click to manage them for better security.`
        );
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_device_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) {
        showError("Session Error", "Failed to terminate session. Please try again.");
        return;
      }

      // Remove from local state
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      
      showWarning("Session Terminated", "The selected session has been terminated for security.");
    } catch (error) {
      showError("Error", "An unexpected error occurred while terminating the session.");
    } finally {
      setIsLoading(false);
    }
  };

  const terminateAllOtherSessions = async () => {
    setIsLoading(true);
    try {
      const currentFingerprint = localStorage.getItem('device_fingerprint');
      
      const { error } = await supabase
        .from('user_device_sessions')
        .update({ is_active: false })
        .eq('user_id', user?.id)
        .neq('device_fingerprint', currentFingerprint);

      if (error) {
        showError("Session Error", "Failed to terminate other sessions. Please try again.");
        return;
      }

      setActiveSessions(prev => prev.filter(s => s.is_current));
      setShowSessionModal(false);
      
      showWarning("Sessions Terminated", "All other sessions have been terminated for security.");
    } catch (error) {
      showError("Error", "An unexpected error occurred while terminating sessions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Check for active sessions on login
      checkActiveSessions();
      
      // Set up periodic checking every 5 minutes
      const interval = setInterval(checkActiveSessions, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  if (activeSessions.length <= 1) {
    return null;
  }

  return (
    <>
      {/* Session Management Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSessionModal(true)}
        className="fixed bottom-4 right-4 bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        {activeSessions.length} Active Sessions
      </Button>

      {/* Session Management Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Sessions Management
            </DialogTitle>
            <DialogDescription>
              You have multiple active sessions. For security, please review and terminate any sessions you don't recognize.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg border ${
                  session.is_current 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.device_info)}
                    <div>
                      <p className="font-medium text-sm">
                        {getDeviceDescription(session.device_info)}
                        {session.is_current && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Current Device
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Active since: {new Date(session.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last seen: {new Date(session.last_activity || session.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {!session.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                      disabled={isLoading}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button
                onClick={terminateAllOtherSessions}
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                {isLoading ? "Terminating..." : "Terminate All Other Sessions"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DuplicateLoginDetector;
