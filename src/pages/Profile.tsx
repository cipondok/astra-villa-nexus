import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Home, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    company_name: '',
    business_address: '',
  });

  // Initialize form data when profile loads or edit mode starts
  React.useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        business_address: profile.business_address || '',
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
        return;
      }

      await refreshProfile();
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      company_name: profile?.company_name || '',
      business_address: profile?.business_address || '',
    });
  };

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
      <div className="max-w-xl mx-auto px-4 py-6 sm:px-6">{/* Mobile-optimized slim layout */}
        {/* Header Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold gradient-text">Profile</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Your account details</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-lg border-2 border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate">{profile?.full_name || 'User'}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`rounded-lg transition-all h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ${
                    isEditing 
                      ? 'bg-primary/10 border-primary/30 hover:bg-primary/20' 
                      : 'hover:bg-primary/5 hover:border-primary/30'
                  }`}
                  disabled={isSaving}
                >
                  <Edit2 className={`h-4 w-4 sm:h-5 sm:w-5 ${isEditing ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              {isEditing ? (
                <div className="space-y-3 sm:space-y-4 animate-fade-in">
                  {/* Avatar Upload Section */}
                  <div className="pb-3 sm:pb-4 border-b border-border">
                    <AvatarUpload
                      userId={user.id}
                      currentAvatarUrl={profile?.avatar_url}
                      onAvatarUpdate={(url) => {
                        refreshProfile();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-xs sm:text-sm font-semibold">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="border-2 focus:border-primary h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="border-2 focus:border-primary h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-xs sm:text-sm font-semibold">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Company name (optional)"
                      className="border-2 focus:border-primary h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_address" className="text-xs sm:text-sm font-semibold">Business Address</Label>
                    <Input
                      id="business_address"
                      value={formData.business_address}
                      onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                      placeholder="Business address (optional)"
                      className="border-2 focus:border-primary h-10 sm:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-xs sm:text-sm font-semibold">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself (optional)"
                      rows={3}
                      className="border-2 focus:border-primary resize-none text-sm"
                    />
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 gap-2 h-10 sm:h-11 shadow-lg text-sm sm:text-base"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 gap-2 h-10 sm:h-11 text-sm sm:text-base"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
                    <p className="font-semibold text-foreground mt-1 text-sm sm:text-base break-all">{user.email}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</span>
                      <p className="font-semibold text-foreground mt-1 text-sm sm:text-base">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</span>
                      <p className="font-semibold text-foreground mt-1 text-sm sm:text-base">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
                      <p className="font-semibold text-foreground mt-1 text-sm sm:text-base capitalize">{profile?.role || 'User'}</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</span>
                      <p className="font-semibold text-foreground mt-1 text-sm sm:text-base">{profile?.company_name || 'Not set'}</p>
                    </div>
                  </div>
                  {(profile?.business_address || profile?.bio) && (
                    <div className="space-y-3 sm:space-y-4">
                      {profile?.business_address && (
                        <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business Address</span>
                          <p className="font-semibold text-foreground mt-1 text-sm sm:text-base">{profile.business_address}</p>
                        </div>
                      )}
                      {profile?.bio && (
                        <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</span>
                          <p className="font-semibold text-foreground mt-1 leading-relaxed text-sm sm:text-base">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="professional-card border-2 overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent"></div>
            <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 sm:gap-3 h-11 sm:h-12 hover:bg-primary/5 hover:border-primary/30 transition-all text-sm sm:text-base"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-semibold">Settings</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 sm:gap-3 h-11 sm:h-12 hover:bg-accent/5 hover:border-accent/30 transition-all text-sm sm:text-base"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <span className="font-semibold">Home</span>
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-2 sm:gap-3 h-11 sm:h-12 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
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