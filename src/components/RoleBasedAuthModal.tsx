import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

interface RoleBasedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin";

const RoleBasedAuthModal = ({ isOpen, onClose, language }: RoleBasedAuthModalProps) => {
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "general_user" as UserRole,
    phone: "",
    company_name: "",
    license_number: ""
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const { signIn, signUp } = useAuth();

  const text = {
    en: {
      signin: "Sign In",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      role: "Role",
      phone: "Phone Number",
      companyName: "Company Name",
      licenseNumber: "License Number",
      generalUser: "General User",
      propertyOwner: "Property Owner",
      agent: "Real Estate Agent",
      vendor: "Vendor",
      signinButton: "Sign In",
      signupButton: "Create Account",
      switchToSignup: "Don't have an account? Sign up",
      switchToSignin: "Already have an account? Sign in",
      passwordMismatch: "Passwords don't match",
      fillAllFields: "Please fill in all required fields",
      selectRole: "Select your role",
      roleDescription: {
        general_user: "Browse and search properties",
        property_owner: "List and manage your properties",
        agent: "Manage listings and clients",
        vendor: "Offer property services"
      }
    },
    id: {
      signin: "Masuk",
      signup: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      fullName: "Nama Lengkap",
      role: "Peran",
      phone: "Nomor Telepon",
      companyName: "Nama Perusahaan",
      licenseNumber: "Nomor Lisensi",
      generalUser: "Pengguna Umum",
      propertyOwner: "Pemilik Properti",
      agent: "Agen Real Estat",
      vendor: "Vendor",
      signinButton: "Masuk",
      signupButton: "Buat Akun",
      switchToSignup: "Belum punya akun? Daftar",
      switchToSignin: "Sudah punya akun? Masuk",
      passwordMismatch: "Kata sandi tidak cocok",
      fillAllFields: "Harap isi semua bidang yang diperlukan",
      selectRole: "Pilih peran Anda",
      roleDescription: {
        general_user: "Telusuri dan cari properti",
        property_owner: "Daftarkan dan kelola properti Anda",
        agent: "Kelola listing dan klien",
        vendor: "Tawarkan layanan properti"
      }
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(signInData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in with:', signInData.email);
      const { success } = await signIn(signInData.email, signInData.password);
      if (success) {
        onClose();
        setSignInData({ email: "", password: "" });
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Sign up data:', signUpData);
    
    if (!isValidEmail(signUpData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      alert(currentText.passwordMismatch);
      return;
    }

    if (!signUpData.email || !signUpData.password || !signUpData.full_name) {
      alert(currentText.fillAllFields);
      return;
    }

    if (signUpData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting sign up with role:', signUpData.role);
      const { success, error } = await signUp(
        signUpData.email, 
        signUpData.password, 
        signUpData.full_name,
        {
          role: signUpData.role,
          phone: signUpData.phone,
          company_name: signUpData.company_name,
          license_number: signUpData.license_number
        }
      );
      
      if (success) {
        onClose();
        setSignUpData({
          email: "",
          password: "",
          confirmPassword: "",
          full_name: "",
          role: "general_user" as UserRole,
          phone: "",
          company_name: "",
          license_number: ""
        });
      } else if (error) {
        console.error('Signup failed:', error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showAdditionalFields = () => {
    return signUpData.role === 'agent' || signUpData.role === 'vendor' || signUpData.role === 'property_owner';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Astra Villa
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{currentText.signin}</TabsTrigger>
              <TabsTrigger value="signup">{currentText.signup}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">{currentText.email}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">{currentText.password}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Progress value={50} className="w-full h-2" /> : currentText.signinButton}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">{currentText.email}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-fullname">{currentText.fullName}</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    value={signUpData.full_name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-role">{currentText.selectRole}</Label>
                  <Select 
                    value={signUpData.role} 
                    onValueChange={(value: UserRole) => setSignUpData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={currentText.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_user">
                        <div>
                          <div className="font-medium">{currentText.generalUser}</div>
                          <div className="text-sm text-gray-500">{currentText.roleDescription.general_user}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="property_owner">
                        <div>
                          <div className="font-medium">{currentText.propertyOwner}</div>
                          <div className="text-sm text-gray-500">{currentText.roleDescription.property_owner}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="agent">
                        <div>
                          <div className="font-medium">{currentText.agent}</div>
                          <div className="text-sm text-gray-500">{currentText.roleDescription.agent}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="vendor">
                        <div>
                          <div className="font-medium">{currentText.vendor}</div>
                          <div className="text-sm text-gray-500">{currentText.roleDescription.vendor}</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {showAdditionalFields() && (
                  <>
                    <div>
                      <Label htmlFor="signup-phone">{currentText.phone}</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    {(signUpData.role === 'agent' || signUpData.role === 'vendor') && (
                      <div>
                        <Label htmlFor="signup-company">{currentText.companyName}</Label>
                        <Input
                          id="signup-company"
                          type="text"
                          value={signUpData.company_name}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, company_name: e.target.value }))}
                        />
                      </div>
                    )}
                    {signUpData.role === 'agent' && (
                      <div>
                        <Label htmlFor="signup-license">{currentText.licenseNumber}</Label>
                        <Input
                          id="signup-license"
                          type="text"
                          value={signUpData.license_number}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, license_number: e.target.value }))}
                        />
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <Label htmlFor="signup-password">{currentText.password}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-confirm">{currentText.confirmPassword}</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Progress value={50} className="w-full h-2" /> : currentText.signupButton}
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
