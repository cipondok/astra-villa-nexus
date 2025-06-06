
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  const [loading, setLoading] = useState(false);
  const [registrationProgress, setRegistrationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const { signUp, signIn } = useAuth();

  const text = {
    en: {
      login: "Login",
      register: "Register", 
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      close: "Close",
      fillDemo: "Fill Demo Data",
      passwordWeak: "Password must be at least 8 characters with uppercase, lowercase, and number",
      emailExists: "Email already exists",
      emailInvalid: "Please enter a valid email address",
      nameRequired: "Full name is required (minimum 2 characters)",
      creatingAccount: "Creating account...",
    },
    id: {
      login: "Masuk",
      register: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      fullName: "Nama Lengkap",
      loginBtn: "Masuk",
      registerBtn: "Buat Akun",
      close: "Tutup",
      fillDemo: "Isi Data Demo",
      passwordWeak: "Kata sandi minimal 8 karakter dengan huruf besar, kecil, dan angka",
      emailExists: "Email sudah terdaftar",
      emailInvalid: "Masukkan alamat email yang valid",
      nameRequired: "Nama lengkap wajib diisi (minimal 2 karakter)",
      creatingAccount: "Membuat akun...",
    }
  };

  const currentText = text[language];

  // Demo data auto-fill function
  const fillDemoData = () => {
    const timestamp = Date.now();
    setFullName("John Doe Demo");
    setEmail(`demo${timestamp}@example.com`);
    setPassword("Demo123456");
    setValidationErrors({});
  };

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFullName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!validateFullName(fullName)) {
      errors.fullName = currentText.nameRequired;
    }

    if (!validateEmail(email)) {
      errors.email = currentText.emailInvalid;
    }

    if (!validatePassword(password)) {
      errors.password = currentText.passwordWeak;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});
    
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
    setRegistrationProgress(0);

    try {
      console.log('Form submission started', { email, fullName });
      
      // Step 1: Validate form
      setRegistrationProgress(40);
      if (!validateForm()) {
        console.log('Form validation failed');
        setLoading(false);
        return;
      }

      // Step 2: Prepare user data for general user
      setRegistrationProgress(70);
      const userData = {
        full_name: fullName.trim(),
        role: 'general_user',
        phone: '',
        company_name: '',
        license_number: ''
      };

      console.log('Registration data prepared:', userData);

      // Step 3: Create account
      setRegistrationProgress(90);
      const { error } = await signUp(email, password, userData);
      
      setRegistrationProgress(100);
      
      if (!error) {
        console.log('Registration successful');
        onClose();
        resetForm();
      } else {
        console.log('Registration failed:', error);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
      setRegistrationProgress(0);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setValidationErrors({});
    setRegistrationProgress(0);
  };

  if (!isOpen) return null;

  // Check if form is valid (no errors and all required fields filled)
  const isFormValid = Object.keys(validationErrors).every(key => !validationErrors[key]) &&
    fullName.trim() && 
    email.trim() && 
    password.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Astra Villa
            </h2>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
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
                    disabled={loading}
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
                    disabled={loading}
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
              {/* Demo Data Fill Button */}
              <div className="flex justify-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={fillDemoData}
                  disabled={loading}
                  className="text-sm"
                >
                  {currentText.fillDemo}
                </Button>
              </div>

              {loading && registrationProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={registrationProgress} className="w-full" />
                  <p className="text-sm text-center">
                    {currentText.creatingAccount}
                  </p>
                </div>
              )}
              
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
                    disabled={loading}
                    className={validationErrors.fullName ? "border-red-500" : ""}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                  )}
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
                    disabled={loading}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
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
                    disabled={loading}
                    className={validationErrors.password ? "border-red-500" : ""}
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  disabled={loading || !isFormValid}
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
