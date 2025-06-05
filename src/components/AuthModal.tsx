
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const AuthModal = ({ isOpen, onClose, language }: AuthModalProps) => {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  const text = {
    en: {
      login: "Login",
      register: "Register",
      welcome: "Welcome Back",
      createAccount: "Create Account",
      loginDesc: "Sign in to your account to continue",
      registerDesc: "Join Astra Villa and start your property journey",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      name: "Full Name",
      role: "Account Type",
      selectRole: "Select your role",
      buyer: "Buyer/Renter",
      owner: "Property Owner",
      agent: "Agent/Agency",
      vendor: "Vendor/Service Provider",
      signIn: "Sign In",
      signUp: "Sign Up",
      haveAccount: "Already have an account?",
      noAccount: "Don't have an account?"
    },
    id: {
      login: "Masuk",
      register: "Daftar",
      welcome: "Selamat Datang Kembali",
      createAccount: "Buat Akun",
      loginDesc: "Masuk ke akun Anda untuk melanjutkan",
      registerDesc: "Bergabung dengan Astra Villa dan mulai perjalanan properti Anda",
      email: "Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      name: "Nama Lengkap",
      role: "Jenis Akun",
      selectRole: "Pilih peran Anda",
      buyer: "Pembeli/Penyewa",
      owner: "Pemilik Properti",
      agent: "Agen/Agensi",
      vendor: "Vendor/Penyedia Layanan",
      signIn: "Masuk",
      signUp: "Daftar",
      haveAccount: "Sudah punya akun?",
      noAccount: "Belum punya akun?"
    }
  };

  const currentText = text[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", loginForm);
    // Handle login logic here
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register attempt:", registerForm);
    // Handle registration logic here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{currentText.login}</TabsTrigger>
            <TabsTrigger value="register">{currentText.register}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{currentText.welcome}</CardTitle>
                <CardDescription>{currentText.loginDesc}</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{currentText.email}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{currentText.password}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  >
                    {currentText.signIn}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{currentText.createAccount}</CardTitle>
                <CardDescription>{currentText.registerDesc}</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">{currentText.name}</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{currentText.email}</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">{currentText.role}</Label>
                    <Select value={registerForm.role} onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={currentText.selectRole} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">{currentText.buyer}</SelectItem>
                        <SelectItem value="owner">{currentText.owner}</SelectItem>
                        <SelectItem value="agent">{currentText.agent}</SelectItem>
                        <SelectItem value="vendor">{currentText.vendor}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{currentText.password}</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">{currentText.confirmPassword}</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  >
                    {currentText.signUp}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
