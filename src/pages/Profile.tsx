import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{profile?.full_name || 'User'}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`rounded-lg transition-all ${
                    isEditing 
                      ? 'bg-primary/10 border-primary/30 hover:bg-primary/20' 
                      : 'hover:bg-primary/5 hover:border-primary/30'
                  }`}
                  disabled={isSaving}
                >
                  <Edit2 className={`h-5 w-5 ${isEditing ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-sm font-semibold">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Enter your company name (optional)"
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_address" className="text-sm font-semibold">Business Address</Label>
                    <Input
                      id="business_address"
                      value={formData.business_address}
                      onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                      placeholder="Enter your business address (optional)"
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself (optional)"
                      rows={4}
                      className="border-2 focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 gap-2 h-11 shadow-lg"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 gap-2 h-11"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</span>
                      <p className="font-semibold text-foreground mt-1">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</span>
                      <p className="font-semibold text-foreground mt-1 capitalize">{profile?.role || 'User'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</span>
                      <p className="font-semibold text-foreground mt-1">{profile?.company_name || 'Not set'}</p>
                    </div>
                  </div>
                  {(profile?.business_address || profile?.bio) && (
                    <div className="space-y-4">
                      {profile?.business_address && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business Address</span>
                          <p className="font-semibold text-foreground mt-1">{profile.business_address}</p>
                        </div>
                      )}
                      {profile?.bio && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</span>
                          <p className="font-semibold text-foreground mt-1 leading-relaxed">{profile.bio}</p>
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