
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";

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
    full_name: ""
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const { signIn, signUp } = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();

  const text = {
    en: {
      signin: "Sign In",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      signinButton: "Sign In",
      signupButton: "Create Account",
      fillDemo: "Fill Demo Data",
      passwordMismatch: "Passwords don't match",
      fillAllFields: "Please fill in all required fields",
      emailInvalid: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters"
    },
    id: {
      signin: "Masuk",
      signup: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      fullName: "Nama Lengkap",
      signinButton: "Masuk",
      signupButton: "Buat Akun",
      fillDemo: "Isi Data Demo",
      passwordMismatch: "Kata sandi tidak cocok",
      fillAllFields: "Harap isi semua bidang yang diperlukan",
      emailInvalid: "Masukkan alamat email yang valid",
      passwordTooShort: "Kata sandi minimal 6 karakter"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const fillDemoData = () => {
    if (activeTab === "signup") {
      setSignUpData({
        email: "demo@example.com",
        password: "Demo123456",
        confirmPassword: "Demo123456",
        full_name: "John Doe"
      });
    } else {
      setSignInData({
        email: "demo@example.com",
        password: "demo123456"
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInData.email.trim()) {
      showWarning("Missing Information", currentText.fillAllFields);
      return;
    }
    
    if (!isValidEmail(signInData.email)) {
      showError("Invalid Email", currentText.emailInvalid);
      return;
    }
    
    if (!signInData.password) {
      showWarning("Missing Information", currentText.fillAllFields);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in with:', signInData.email.trim());
      const { success } = await signIn(signInData.email.trim(), signInData.password);
      if (success) {
        showSuccess(
          "Welcome Back!", 
          "You have successfully signed in to your account."
        );
        onClose();
        setSignInData({ email: "", password: "" });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showError("Sign In Failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Sign up data:', signUpData);
    
    if (!signUpData.email.trim() || !signUpData.password || !signUpData.full_name.trim()) {
      showWarning("Missing Information", currentText.fillAllFields);
      return;
    }
    
    if (!isValidEmail(signUpData.email)) {
      showError("Invalid Email", currentText.emailInvalid);
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      showError("Password Mismatch", currentText.passwordMismatch);
      return;
    }

    if (signUpData.password.length < 6) {
      showError("Password Too Short", currentText.passwordTooShort);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting sign up with clean email:', signUpData.email.trim());
      const { success, error } = await signUp(
        signUpData.email.trim(), 
        signUpData.password, 
        signUpData.full_name.trim()
      );
      
      if (success) {
        showSuccess(
          "Account Created Successfully!", 
          "Welcome to Astra Villa! Your account has been created and you're now signed in."
        );
        onClose();
        setSignUpData({
          email: "",
          password: "",
          confirmPassword: "",
          full_name: ""
        });
      } else if (error) {
        console.error('Signup failed:', error);
        showError("Registration Failed", error.message || "An error occurred during registration");
      }
    } catch (error) {
      console.error('Sign up error:', error);
      showError("Registration Failed", "An unexpected error occurred during registration. Please try again.");
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
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={fillDemoData}
                disabled={isLoading}
                className="w-full mb-4"
              >
                {currentText.fillDemo}
              </Button>
            </div>
            
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    minLength={6}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
