import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import BusinessNatureSelector from "./BusinessNatureSelector";

interface BusinessProfile {
  id?: string;
  business_name: string;
  business_type: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  license_number: string;
  tax_id: string;
  business_nature_id: string;
  business_finalized_at: string | null;
  can_change_nature: boolean;
  is_active: boolean;
}

const VendorBusinessProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile>({
    business_name: '',
    business_type: '',
    business_description: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    business_website: '',
    license_number: '',
    tax_id: '',
    business_nature_id: '',
    business_finalized_at: null,
    can_change_nature: true,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canChangeNature, setCanChangeNature] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBusinessProfile();
      checkCanChangeNature();
    }
  }, [user]);

  const fetchBusinessProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          business_description: data.business_description || '',
          business_address: data.business_address || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          business_website: data.business_website || '',
          license_number: data.license_number || '',
          tax_id: data.tax_id || '',
          business_nature_id: data.business_nature_id || '',
          business_finalized_at: data.business_finalized_at,
          can_change_nature: data.can_change_nature ?? true,
          is_active: data.is_active ?? true
        });
      }
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      toast({
        title: "Error",
        description: "Failed to load business profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCanChangeNature = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('can_change_business_nature', { vendor_id: user.id });

      if (error) throw error;
      setCanChangeNature(data);
    } catch (error: any) {
      console.error('Error checking change permissions:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileData = {
        vendor_id: user.id,
        ...profile
      };

      const { error } = await supabase
        .from('vendor_business_profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business profile saved successfully"
      });
    } catch (error: any) {
      console.error('Error saving business profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save business profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNatureSelect = (natureId: string) => {
    setProfile({ ...profile, business_nature_id: natureId });
  };

  const handleFinalize = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('vendor_business_profiles')
        .update({ 
          business_finalized_at: new Date().toISOString(),
          business_nature_id: profile.business_nature_id
        })
        .eq('vendor_id', user.id);

      if (error) throw error;

      setProfile({ 
        ...profile, 
        business_finalized_at: new Date().toISOString() 
      });
      
      toast({
        title: "Success",
        description: "Business setup finalized successfully"
      });
      
      await fetchBusinessProfile();
    } catch (error: any) {
      console.error('Error finalizing business:', error);
      toast({
        title: "Error",
        description: "Failed to finalize business setup",
        variant: "destructive"
      });
    }
  };

  const businessTypes = [
    'Individual Contractor',
    'Small Business',
    'Corporation',
    'Partnership',
    'LLC',
    'Non-Profit'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BusinessNatureSelector
        currentNatureId={profile.business_nature_id}
        canChange={canChangeNature && profile.can_change_nature}
        onNatureSelect={handleNatureSelect}
        onFinalize={handleFinalize}
        isFinalized={!!profile.business_finalized_at}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Manage your business profile and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type *</Label>
              <Select
                value={profile.business_type}
                onValueChange={(value) => setProfile({ ...profile, business_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_phone">Business Phone</Label>
              <Input
                id="business_phone"
                value={profile.business_phone}
                onChange={(e) => setProfile({ ...profile, business_phone: e.target.value })}
                placeholder="Enter business phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Business Email</Label>
              <Input
                id="business_email"
                type="email"
                value={profile.business_email}
                onChange={(e) => setProfile({ ...profile, business_email: e.target.value })}
                placeholder="Enter business email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_website">Website</Label>
              <Input
                id="business_website"
                value={profile.business_website}
                onChange={(e) => setProfile({ ...profile, business_website: e.target.value })}
                placeholder="Enter website URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Textarea
              id="business_address"
              value={profile.business_address}
              onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
              placeholder="Enter complete business address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description">Business Description</Label>
            <Textarea
              id="business_description"
              value={profile.business_description}
              onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
              placeholder="Describe your business and services"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={profile.is_active}
              onCheckedChange={(checked) => setProfile({ ...profile, is_active: checked })}
            />
            <Label htmlFor="is_active">Business Profile Active</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
};

export default VendorBusinessProfile;
