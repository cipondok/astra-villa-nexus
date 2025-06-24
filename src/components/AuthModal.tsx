import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import LoadingPage from "./LoadingPage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const AuthModal = ({ isOpen, onClose, language }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("general_user");
  const [loading, setLoading] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'register' | null>(null);

  const text = {
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Full Name",
      role: "I am a",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      close: "Close",
      generalUser: "General User",
      propertyOwner: "Property Owner",
      agent: "Real Estate Agent",
      vendor: "Service Vendor",
      customerService: "Customer Service"
    },
    id: {
      login: "Masuk",
      register: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      name: "Nama Lengkap",
      role: "Saya adalah",
      loginBtn: "Masuk",
      registerBtn: "Buat Akun",
      close: "Tutup",
      generalUser: "Pengguna Umum",
      propertyOwner: "Pemilik Properti",
      agent: "Agen Real Estat",
      vendor: "Vendor Layanan",
      customerService: "Layanan Pelanggan"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  // Show loading screen during authentication (reduced timeout)
  if (loading && authAction) {
    const loadingMessage = authAction === 'login' 
      ? "Authenticating user..." 
      : "Creating your account...";
    
    return (
      <LoadingPage 
        message={loadingMessage}
        showConnectionStatus={false} // Don't show connection status for auth
      />
    );
  }

  const handleLogin = async () => {
    setLoading(true);
    setAuthAction('login');
    try {
      const { success } = await signIn(email, password);
      if (success) {
        onClose();
        setEmail("");
        setPassword("");
      }
    } finally {
      setLoading(false);
      setAuthAction(null);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setAuthAction('register');
    try {
      const { success } = await signUp(email, password, name);
      if (success) {
        onClose();
        setEmail("");
        setPassword("");
        setName("");
        setRole("general_user");
      }
    } finally {
      setLoading(false);
      setAuthAction(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Astra Villa</h2>
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
              <div className="space-y-2">
                <Label htmlFor="login-email">{currentText.email}</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentText.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{currentText.password}</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={currentText.password}
                />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                onClick={handleLogin}
                disabled={loading || !email || !password}
              >
                {loading ? 'Signing in...' : currentText.loginBtn}
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">{currentText.name}</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={currentText.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">{currentText.email}</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentText.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">{currentText.password}</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={currentText.password}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-role">{currentText.role}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_user">{currentText.generalUser}</SelectItem>
                    <SelectItem value="property_owner">{currentText.propertyOwner}</SelectItem>
                    <SelectItem value="agent">{currentText.agent}</SelectItem>
                    <SelectItem value="vendor">{currentText.vendor}</SelectItem>
                    <SelectItem value="customer_service">{currentText.customerService}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                onClick={handleRegister}
                disabled={loading || !email || !password || !name}
              >
                {loading ? 'Creating account...' : currentText.registerBtn}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
