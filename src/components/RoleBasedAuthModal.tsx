
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface RoleBasedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const RoleBasedAuthModal = ({ isOpen, onClose, language }: RoleBasedAuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("general_user");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth();

  const text = {
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      phone: "Phone Number",
      role: "Select Your Role",
      companyName: "Company Name",
      licenseNumber: "License Number",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      close: "Close",
      roles: {
        general_user: "General User / Buyer / Renter",
        property_owner: "Property Owner",
        agent: "Agent / Agency",
        vendor: "Vendor / Service Provider",
        admin: "Admin / Support"
      }
    },
    id: {
      login: "Masuk",
      register: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      fullName: "Nama Lengkap",
      phone: "Nomor Telepon",
      role: "Pilih Peran Anda",
      companyName: "Nama Perusahaan",
      licenseNumber: "Nomor Lisensi",
      loginBtn: "Masuk",
      registerBtn: "Buat Akun",
      close: "Tutup",
      roles: {
        general_user: "Pengguna Umum / Pembeli / Penyewa",
        property_owner: "Pemilik Properti",
        agent: "Agen / Agensi",
        vendor: "Vendor / Penyedia Layanan",
        admin: "Admin / Dukungan"
      }
    }
  };

  const currentText = text[language];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      onClose();
      resetForm();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      full_name: fullName,
      phone,
      role,
      company_name: companyName,
      license_number: licenseNumber
    };

    const { error } = await signUp(email, password, userData);
    
    if (!error) {
      onClose();
      resetForm();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("general_user");
    setCompanyName("");
    setLicenseNumber("");
  };

  if (!isOpen) return null;

  const showCompanyFields = role === 'agent' || role === 'vendor' || role === 'property_owner';
  const showLicenseField = role === 'agent';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Astra Villa
            </h2>
            <Button variant="ghost" onClick={onClose}>
              {currentText.close}
            </Button>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{currentText.login}</TabsTrigger>
              <TabsTrigger value="register">{currentText.register}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{currentText.email}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={currentText.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{currentText.password}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={currentText.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : currentText.loginBtn}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">{currentText.fullName}</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={currentText.fullName}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">{currentText.email}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={currentText.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">{currentText.password}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder={currentText.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">{currentText.phone}</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder={currentText.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-role">{currentText.role}</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentText.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_user">{currentText.roles.general_user}</SelectItem>
                      <SelectItem value="property_owner">{currentText.roles.property_owner}</SelectItem>
                      <SelectItem value="agent">{currentText.roles.agent}</SelectItem>
                      <SelectItem value="vendor">{currentText.roles.vendor}</SelectItem>
                      <SelectItem value="admin">{currentText.roles.admin}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showCompanyFields && (
                  <div className="space-y-2">
                    <Label htmlFor="register-company">{currentText.companyName}</Label>
                    <Input
                      id="register-company"
                      type="text"
                      placeholder={currentText.companyName}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                )}

                {showLicenseField && (
                  <div className="space-y-2">
                    <Label htmlFor="register-license">{currentText.licenseNumber}</Label>
                    <Input
                      id="register-license"
                      type="text"
                      placeholder={currentText.licenseNumber}
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : currentText.registerBtn}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleBasedAuthModal;
