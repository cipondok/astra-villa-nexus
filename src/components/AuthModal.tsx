
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const AuthModal = ({ isOpen, onClose, language }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const text = {
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Full Name",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      close: "Close"
    },
    id: {
      login: "Masuk",
      register: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      name: "Nama Lengkap", 
      loginBtn: "Masuk",
      registerBtn: "Buat Akun",
      close: "Tutup"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

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
                <Input
                  type="email"
                  placeholder={currentText.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={currentText.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                {currentText.loginBtn}
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={currentText.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={currentText.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={currentText.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                {currentText.registerBtn}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
