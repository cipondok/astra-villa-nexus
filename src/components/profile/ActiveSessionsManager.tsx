import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Monitor, Smartphone, Tablet, Globe, Clock, Trash2,
  Shield, Loader2, CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionRow {
  id: string;
  session_token: string;
  device_fingerprint: string | null;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: unknown;
  is_current: boolean | null;
  last_activity_at: string;
  created_at: string;
}

const ActiveSessionsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentFingerprint, setCurrentFingerprint] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    generateDeviceFingerprint().then(setCurrentFingerprint);
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['user-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SessionRow[];
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast({ title: 'Session revoked', description: 'The device session has been terminated.' });
      setRevokingId(null);
    },
    onError: () => {
      toast({ title: 'Failed to revoke', description: 'Please try again.', variant: 'destructive' });
      setRevokingId(null);
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentFingerprint) return;
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .neq('device_fingerprint', currentFingerprint);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast({ title: 'All other sessions revoked', description: 'Only this device remains active.' });
    },
    onError: () => {
      toast({ title: 'Failed', description: 'Could not revoke sessions.', variant: 'destructive' });
    },
  });

  const getDeviceIcon = (deviceType: string | null) => {
    const t = deviceType?.toLowerCase();
    if (t === 'mobile') return <Smartphone className="h-5 w-5" />;
    if (t === 'tablet') return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const isCurrentDevice = (session: SessionRow) => {
    return (currentFingerprint && session.device_fingerprint === currentFingerprint) || session.is_current;
  };

  if (isLoading || currentFingerprint === null) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Active Sessions</span>
          {sessions && sessions.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5">
              {sessions.length}
            </Badge>
          )}
        </div>
        {sessions && sessions.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => revokeAllMutation.mutate()}
            disabled={revokeAllMutation.isPending}
            className="text-xs text-destructive hover:text-destructive h-7"
          >
            {revokeAllMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            Revoke All Others
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {!sessions || sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active sessions found.</p>
        ) : (
          sessions.map((session, idx) => {
            const isCurrent = isCurrentDevice(session);
            return (
              <div key={session.id}>
                {idx > 0 && <Separator className="my-2" />}
                <div className={cn(
                  "flex items-start gap-3 p-2.5 rounded-lg transition-colors",
                  isCurrent && "bg-primary/5 border border-primary/10"
                )}>
                  <div className={cn(
                    "mt-0.5 p-2 rounded-lg",
                    isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {getDeviceIcon(session.device_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {session.device_name || `${session.browser || 'Unknown'} on ${session.os || 'Unknown'}`}
                      </span>
                      {isCurrent && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-primary/15 text-primary border-primary/20 gap-0.5">
                          <CheckCircle className="h-2.5 w-2.5" />
                          This device
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {session.ip_address && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {String(session.ip_address)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRevokingId(session.id);
                        revokeMutation.mutate(session.id);
                      }}
                      disabled={revokingId === session.id}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSessionsManager;
