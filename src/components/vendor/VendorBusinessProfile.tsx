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
import { Building2, MapPin, Edit3 } from "lucide-react";
import BusinessNatureSelector from "./BusinessNatureSelector";
import IndonesianLocationSelector from "../location/IndonesianLocationSelector";
import ProfilePreview from "./ProfilePreview";
import LogoUpload from "./LogoUpload";

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
  logo_url?: string;
  business_state?: string;
  business_city?: string;
  business_area?: string;
  // New detailed address fields
  building_name?: string;
  floor_unit?: string;
  street_address?: string;
  business_type_location?: string;
  postal_code?: string;
  landmark?: string;
  gps_coordinates?: string;
  gps_address?: string;
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
    is_active: true,
    logo_url: '',
    business_state: 'all',
    business_city: 'all',
    business_area: '',
    // Initialize new detailed address fields
    building_name: '',
    floor_unit: '',
    street_address: '',
    business_type_location: '',
    postal_code: '',
    landmark: '',
    gps_coordinates: '',
    gps_address: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canChangeNature, setCanChangeNature] = useState(true);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

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
          is_active: data.is_active ?? true,
          logo_url: data.logo_url || '',
          business_state: (data as any).business_state || 'all',
          business_city: (data as any).business_city || 'all',
          business_area: (data as any).business_area || '',
          // Initialize new detailed address fields
          building_name: (data as any).building_name || '',
          floor_unit: (data as any).floor_unit || '',
          street_address: (data as any).street_address || '',
          business_type_location: (data as any).business_type_location || '',
          postal_code: (data as any).postal_code || '',
          landmark: (data as any).landmark || '',
          gps_coordinates: (data as any).gps_coordinates || '',
          gps_address: (data as any).gps_address || ''
        });
        // If address exists, don't auto-enable editing
        setIsAddressEditing(!data.business_address);
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
      
      // Disable address editing after successful save
      setIsAddressEditing(false);
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Store GPS coordinates
          const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          // Use a free reverse geocoding service without API key requirement
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          
          let detectedAddress = '';
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              detectedAddress = data.display_name;
            }
          }
          
          // Update profile with GPS data
          setProfile({ 
            ...profile, 
            gps_coordinates: coordinates,
            gps_address: detectedAddress || coordinates
          });
          
          toast({
            title: "GPS Lokasi Berhasil Diambil",
            description: "Koordinat lokasi tersimpan untuk pemetaan area layanan"
          });
        } catch (error) {
          // Fallback to coordinates only
          const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setProfile({ 
            ...profile, 
            gps_coordinates: coordinates,
            gps_address: coordinates
          });
          
          toast({
            title: "GPS Lokasi Berhasil Diambil",
            description: "Koordinat tersimpan dengan sukses"
          });
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Error",
          description: "Failed to get your location. Please enter address manually.",
          variant: "destructive"
        });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const businessTypes = [
    'PT (Perseroan Terbatas)',
    'CV (Commanditaire Vennootschap)',
    'PMA (Penanaman Modal Asing)',
    'PMDN (Penanaman Modal Dalam Negeri)',
    'UD (Usaha Dagang)',
    'PD (Perusahaan Daerah)',
    'Firma',
    'Koperasi',
    'Yayasan',
    'Perorangan/Individual',
    'BUMN (Badan Usaha Milik Negara)',
    'BUMD (Badan Usaha Milik Daerah)'
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

      <Card data-edit-profile>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Bisnis
              </CardTitle>
              <CardDescription>
                Kelola profil bisnis dan informasi kontak Anda
              </CardDescription>
            </div>
            <ProfilePreview profile={profile} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <LogoUpload 
            currentLogoUrl={profile.logo_url}
            businessName={profile.business_name}
            onLogoChange={(logoUrl) => setProfile({ ...profile, logo_url: logoUrl })}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nama Bisnis *</Label>
              <Input
                id="business_name"
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                placeholder="Masukkan nama bisnis Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Jenis Bisnis *</Label>
              <Select
                value={profile.business_type}
                onValueChange={(value) => setProfile({ ...profile, business_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis bisnis" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_phone">Telepon Bisnis</Label>
              <Input
                id="business_phone"
                value={profile.business_phone}
                onChange={(e) => setProfile({ ...profile, business_phone: e.target.value })}
                placeholder="Masukkan nomor telepon bisnis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">Email Bisnis</Label>
              <Input
                id="business_email"
                type="email"
                value={profile.business_email}
                onChange={(e) => setProfile({ ...profile, business_email: e.target.value })}
                placeholder="Masukkan email bisnis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_website">Website</Label>
              <Input
                id="business_website"
                value={profile.business_website}
                onChange={(e) => setProfile({ ...profile, business_website: e.target.value })}
                placeholder="Masukkan URL website"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">Nomor Lisensi</Label>
              <Input
                id="license_number"
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                placeholder="Masukkan nomor lisensi"
              />
            </div>
          </div>

          <IndonesianLocationSelector
            selectedProvinceCode={profile.business_state || ''}
            selectedCityCode={profile.business_city || ''}
            selectedAreaName={profile.business_area || ''}
            onProvinceChange={(code, name) => setProfile({ ...profile, business_state: code })}
            onCityChange={(code, name) => setProfile({ ...profile, business_city: code })}
            onAreaChange={(name) => setProfile({ ...profile, business_area: name })}
            showLabel={true}
          />

          {/* Detailed Address Fields */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Alamat Bisnis Detail</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building_name">Nama Gedung/Kompleks</Label>
                <Input
                  id="building_name"
                  value={profile.building_name || ''}
                  onChange={(e) => setProfile({ ...profile, building_name: e.target.value })}
                  placeholder="contoh: Plaza Indonesia, Mall Taman Anggrek"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="floor_unit">Lantai/Unit</Label>
                <Input
                  id="floor_unit"
                  value={profile.floor_unit || ''}
                  onChange={(e) => setProfile({ ...profile, floor_unit: e.target.value })}
                  placeholder="contoh: Lantai 3 Unit 301"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street_address">Alamat Jalan</Label>
                <Input
                  id="street_address"
                  value={profile.street_address || ''}
                  onChange={(e) => setProfile({ ...profile, street_address: e.target.value })}
                  placeholder="contoh: Jl. Sudirman No. 123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_type_location">Jenis Lokasi Bisnis</Label>
                <Select
                  value={profile.business_type_location || ''}
                  onValueChange={(value) => setProfile({ ...profile, business_type_location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Kantor</SelectItem>
                    <SelectItem value="shop">Toko/Store</SelectItem>
                    <SelectItem value="warehouse">Gudang</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="home_based">Berbasis Rumah</SelectItem>
                    <SelectItem value="co_working">Co-working Space</SelectItem>
                    <SelectItem value="industrial">Area Industri</SelectItem>
                    <SelectItem value="mall">Mall/Pusat Perbelanjaan</SelectItem>
                    <SelectItem value="market">Pasar Tradisional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postal_code">Kode Pos</Label>
              <Input
                id="postal_code"
                value={profile.postal_code || ''}
                onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                placeholder="contoh: 12190"
                className="w-full md:w-48"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="landmark">Patokan/Catatan</Label>
              <Textarea
                id="landmark"
                value={profile.landmark || ''}
                onChange={(e) => setProfile({ ...profile, landmark: e.target.value })}
                placeholder="contoh: Dekat Bank BCA, seberang Starbucks"
                rows={2}
              />
            </div>
          </div>

          {/* GPS Location Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Lokasi GPS (untuk Area Layanan)</Label>
                <p className="text-sm text-muted-foreground">
                  Ini membantu pelanggan menemukan lokasi tepat Anda dan menentukan cakupan area layanan
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {gettingLocation ? "Mengambil Lokasi..." : "Ambil Lokasi GPS Saat Ini"}
              </Button>
            </div>
            
            {profile.gps_coordinates && (
              <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                <p className="text-sm font-medium">Koordinat GPS:</p>
                <p className="text-sm text-muted-foreground">{profile.gps_coordinates}</p>
                {profile.gps_address && (
                  <>
                    <p className="text-sm font-medium mt-2">Alamat Terdeteksi:</p>
                    <p className="text-sm text-muted-foreground">{profile.gps_address}</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description">Deskripsi Bisnis</Label>
            <Textarea
              id="business_description"
              value={profile.business_description}
              onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
              placeholder="Deskripsikan bisnis dan layanan Anda"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={profile.is_active}
              onCheckedChange={(checked) => setProfile({ ...profile, is_active: checked })}
            />
            <Label htmlFor="is_active">Profil Bisnis Aktif</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>
    </div>
  );
};

export default VendorBusinessProfile;
