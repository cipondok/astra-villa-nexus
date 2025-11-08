import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { createCacheUtils } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { clearCache: clearServiceWorkerCache } = useServiceWorker();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear React Query cache
      const cacheUtils = createCacheUtils(queryClient);
      cacheUtils.clearAll();
      
      // Clear Service Worker cache
      await clearServiceWorkerCache();
      
      toast({
        title: "Cache Cleared",
        description: "All caches have been cleared successfully.",
      });
      
      setShowClearCacheDialog(false);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to access settings
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Role:</span>
                <p className="font-medium capitalize">{profile?.role || 'User'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>
                Clear app cache to free up space and resolve loading issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={() => setShowClearCacheDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Clear All Caches
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Caches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear both Service Worker and React Query caches. The app will reload after clearing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Clear Cache"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
