
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AgentProfileProgress from "./AgentProfileProgress";
import LocationSelector from "../LocationSelector";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Camera,
  Save,
  Upload,
  Phone,
  AlertCircle,
  CheckCircle,
  Building2,
  FileText,
  MapPin
} from "lucide-react";

const AgentSettings = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    company_name: profile?.company_name || "",
    license_number: profile?.license_number || "",
    business_address: profile?.business_address || "",
    years_experience: profile?.years_experience || "",
    specializations: profile?.specializations || "",
    bio: profile?.bio || ""
  });
  
  const [phoneError, setPhoneError] = useState("");
  const [showProfileProgress, setShowProfileProgress] = useState(true);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        company_name: profile.company_name || "",
        license_number: profile.license_number || "",
        business_address: profile.business_address || "",
        years_experience: profile.years_experience || "",
        specializations: profile.specializations || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  });

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.email?.charAt(0).toUpperCase() || 'A';
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setEditMode(false);
      showSuccess('Profile Updated', 'Your profile has been updated successfully.');
    } else {
      showError('Update Failed', 'Failed to update your profile. Please try again.');
    }
  };

  const isValidIndonesianPhone = (phone: string): boolean => {
    const indonesianPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return indonesianPhoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const formatIndonesianPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('628')) {
      return `+${digits}`;
    } else if (digits.startsWith('08')) {
      return `+62${digits.substring(1)}`;
    } else if (digits.startsWith('8')) {
      return `+62${digits}`;
    }
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatIndonesianPhone(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (value && !isValidIndonesianPhone(formatted)) {
      setPhoneError("Please enter a valid Indonesian mobile number (08xxx or +628xxx)");
    } else {
      setPhoneError("");
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      company_name: profile?.company_name || "",
      license_number: profile?.license_number || "",
      business_address: profile?.business_address || "",
      years_experience: profile?.years_experience || "",
      specializations: profile?.specializations || "",
      bio: profile?.bio || ""
    });
    setEditMode(false);
    setPhoneError("");
  };

  const handleNotificationSave = () => {
    // Here you would typically save notification preferences to the backend
    showSuccess('Settings Saved', 'Your notification preferences have been updated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Settings</h2>
          <p className="text-muted-foreground">Manage your agent profile and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {/* Profile Progress Component */}
          {showProfileProgress && (
            <AgentProfileProgress onEditProfile={() => setEditMode(true)} />
          )}
          
          <Card data-edit-profile>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Agent Profile & Company Information
              </CardTitle>
              <CardDescription>Complete your professional profile to get 3x more leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Professional Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Professional headshot builds client trust. JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label>Agent Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active Agent</Badge>
                    <Badge variant="outline">{profile?.verification_status || 'Pending'}</Badge>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">Personal & Professional Information</h4>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button onClick={handleSave} disabled={loading || !!phoneError}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full professional name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!editMode}
                        className={!formData.full_name && editMode ? "border-orange-300" : ""}
                      />
                      {!formData.full_name && editMode && (
                        <p className="text-xs text-orange-600 mt-1">Required for client trust</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Indonesian Mobile Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="08xxx or +628xxx"
                          value={formData.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          disabled={!editMode}
                          className={`pl-10 ${phoneError ? "border-red-300" : ""} ${!formData.phone && editMode ? "border-orange-300" : ""}`}
                        />
                      </div>
                      {phoneError && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {phoneError}
                        </p>
                      )}
                      {!phoneError && formData.phone && isValidIndonesianPhone(formData.phone) && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Valid Indonesian mobile number
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company/Agency Name *</Label>
                      <Input
                        id="company"
                        placeholder="Your real estate agency or company"
                        value={formData.company_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                        disabled={!editMode}
                        className={!formData.company_name && editMode ? "border-orange-300" : ""}
                      />
                      {!formData.company_name && editMode && (
                        <p className="text-xs text-orange-600 mt-1">Builds professional credibility</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="license">Real Estate License Number *</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="license"
                          placeholder="Indonesian real estate license"
                          value={formData.license_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                          disabled={!editMode}
                          className={`pl-10 ${!formData.license_number && editMode ? "border-orange-300" : ""}`}
                        />
                      </div>
                      {!formData.license_number && editMode && (
                        <p className="text-xs text-orange-600 mt-1">Required for verified agent badge (+20% leads)</p>
                      )}
                    </div>
                    <div>
                      <LocationSelector
                        label="Business Address"
                        value={
                          formData.business_address 
                            ? (() => {
                                try {
                                  const parsed = typeof formData.business_address === 'string' 
                                    ? JSON.parse(formData.business_address)
                                    : formData.business_address;
                                  
                                  // Handle legacy string format
                                  if (typeof parsed === 'string') {
                                    return { full_address: parsed };
                                  }
                                  
                                  return parsed;
                                } catch {
                                  return { full_address: formData.business_address };
                                }
                              })()
                            : {}
                        }
                        onChange={(location) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            business_address: JSON.stringify(location)
                          }));
                        }}
                        disabled={!editMode}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        placeholder="e.g., 5 years"
                        value={formData.years_experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm">Additional Information</h5>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="specializations">Specializations</Label>
                      <Input
                        id="specializations"
                        placeholder="e.g., Luxury homes, Commercial properties, First-time buyers"
                        value={formData.specializations}
                        onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell clients about your expertise, approach, and what makes you unique..."
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!editMode}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Completion Alert */}
                {editMode && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Complete your profile to unlock:</strong> 3x more leads, verified agent badge, 
                      premium placement, and commission discounts up to 50%!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about new leads and property updates
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get instant notifications in your browser
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive urgent updates via text message
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive tips, market insights and promotional content
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNotificationSave} className="w-full">
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Change Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Sessions</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage your active login sessions
                    </p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentSettings;
