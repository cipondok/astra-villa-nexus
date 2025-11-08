import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Home } from 'lucide-react';

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center max-w-md mx-auto professional-card">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 gradient-text">Profile</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to view your profile
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="btn-primary">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">{/* Slim compact layout */}
        {/* Header Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Profile</h1>
              <p className="text-muted-foreground mt-1">Your account details</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{profile?.full_name || 'User'}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
                <p className="font-semibold text-foreground mt-1">{user.email}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</span>
                  <p className="font-semibold text-foreground mt-1">{profile?.full_name || 'Not set'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
                  <p className="font-semibold text-foreground mt-1 capitalize">{profile?.role || 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent"></div>
            <CardContent className="p-4 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 hover:bg-primary/5 hover:border-primary/30 transition-all"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-5 w-5 text-primary" />
                <span className="font-semibold">Settings</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12 hover:bg-accent/5 hover:border-accent/30 transition-all"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5 text-accent" />
                <span className="font-semibold">Home</span>
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-3 h-12 shadow-lg hover:shadow-xl transition-all"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-semibold">Sign Out</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;