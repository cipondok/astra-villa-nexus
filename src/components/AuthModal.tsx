import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import LoadingPage from "./LoadingPage";
import { X } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation();

  if (!isOpen) return null;

  if (loading && authAction) {
    const loadingMessage = authAction === 'login' 
      ? "Authenticating user..." 
      : "Creating your account...";
    
    return (
      <LoadingPage 
        message={loadingMessage}
        showConnectionStatus={false}
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Astra Villa</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/80">
              <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('authModal.login')}</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('authModal.register')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground/80">{t('authModal.email')}</Label>
                <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('authModal.email')} className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foreground/80">{t('authModal.password')}</Label>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('authModal.password')} className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/30" />
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg" onClick={handleLogin} disabled={loading || !email || !password}>
                {loading ? t('authModal.signingIn') : t('authModal.loginBtn')}
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-foreground/80">{t('authModal.name')}</Label>
                <Input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('authModal.name')} className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-foreground/80">{t('authModal.email')}</Label>
                <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('authModal.email')} className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-foreground/80">{t('authModal.password')}</Label>
                <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('authModal.password')} className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-role" className="text-foreground/80">{t('authModal.role')}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background/70 border-border/50 focus:border-primary focus:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="general_user">{t('authModal.generalUser')}</SelectItem>
                    <SelectItem value="property_owner">{t('authModal.propertyOwner')}</SelectItem>
                    <SelectItem value="agent">{t('authModal.agent')}</SelectItem>
                    <SelectItem value="vendor">{t('authModal.vendor')}</SelectItem>
                    <SelectItem value="customer_service">{t('authModal.customerService')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg" onClick={handleRegister} disabled={loading || !email || !password || !name}>
                {loading ? t('authModal.creatingAccount') : t('authModal.registerBtn')}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
