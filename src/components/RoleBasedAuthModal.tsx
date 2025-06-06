
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

interface RoleBasedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

const RoleBasedAuthModal = ({ isOpen, onClose, language }: RoleBasedAuthModalProps) => {
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "general_user",
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
      fillAllFields: "Please fill in all required fields"
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
      fillAllFields: "Harap isi semua bidang yang diperlukan"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { success } = await signIn(signInData.email, signInData.password);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      alert(currentText.passwordMismatch);
      return;
    }

    if (!signUpData.email || !signUpData.password || !signUpData.full_name) {
      alert(currentText.fillAllFields);
      return;
    }

    setIsLoading(true);
    
    try {
      const { success } = await signUp(signUpData.email, signUpData.password, signUpData.full_name);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
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
                  <Label htmlFor="signup-password">{currentText.password}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
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
