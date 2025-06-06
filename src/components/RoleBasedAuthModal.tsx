import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  const [registrationProgress, setRegistrationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [fieldTouched, setFieldTouched] = useState<{[key: string]: boolean}>({});

  const { signUp, signIn } = useAuth();

  const text = {
    en: {
      login: "Login",
      register: "Register", 
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      phone: "Phone Number (Indonesian format)",
      role: "Select Your Role",
      companyName: "Company Name",
      licenseNumber: "License Number",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      close: "Close",
      fillDemo: "Fill Demo Data",
      passwordWeak: "Password must be at least 8 characters with uppercase, lowercase, and number",
      emailExists: "Email already exists",
      phoneInvalid: "Please enter valid Indonesian phone number (08xx-xxxx-xxxx)",
      emailInvalid: "Please enter a valid email address",
      nameRequired: "Full name is required (minimum 2 characters)",
      roleRequired: "Please select your role",
      companyRequired: "Company name is required for this role",
      licenseRequired: "License number is required for agents",
      checkingEmail: "Checking email availability...",
      validatingData: "Validating data...",
      creatingAccount: "Creating account...",
      formIncomplete: "Please complete all required fields correctly",
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
      phone: "Nomor Telepon (format Indonesia)",
      role: "Pilih Peran Anda",
      companyName: "Nama Perusahaan",
      licenseNumber: "Nomor Lisensi",
      loginBtn: "Masuk",
      registerBtn: "Buat Akun",
      close: "Tutup",
      fillDemo: "Isi Data Demo",
      passwordWeak: "Kata sandi minimal 8 karakter dengan huruf besar, kecil, dan angka",
      emailExists: "Email sudah terdaftar",
      phoneInvalid: "Masukkan nomor telepon Indonesia yang valid (08xx-xxxx-xxxx)",
      emailInvalid: "Masukkan alamat email yang valid",
      nameRequired: "Nama lengkap wajib diisi (minimal 2 karakter)",
      roleRequired: "Silakan pilih peran Anda",
      companyRequired: "Nama perusahaan wajib diisi untuk peran ini",
      licenseRequired: "Nomor lisensi wajib diisi untuk agen",
      checkingEmail: "Memeriksa ketersediaan email...",
      validatingData: "Memvalidasi data...", 
      creatingAccount: "Membuat akun...",
      formIncomplete: "Silakan lengkapi semua field yang diperlukan dengan benar",
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

  // Demo data auto-fill function
  const fillDemoData = () => {
    const timestamp = Date.now();
    setFullName("John Doe Demo");
    setEmail(`demo${timestamp}@example.com`);
    setPassword("Demo123456");
    setPhone("0812-3456-7890");
    setRole("general_user");
    setCompanyName("Demo Company");
    setLicenseNumber("LIC123456");
    
    // Clear any existing errors
    setValidationErrors({});
    
    // Mark all fields as touched for validation
    setFieldTouched({
      fullName: true,
      email: true,
      password: true,
      phone: true,
      role: true,
      companyName: true,
      licenseNumber: true
    });
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

  const validateIndonesianPhone = (phone: string): boolean => {
    // Indonesian mobile number format: 08xx-xxxx-xxxx or 08xxxxxxxxxx
    const phoneRegex = /^08\d{8,11}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const validateFullName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Ensure it starts with 08
    let formatted = cleaned;
    if (cleaned.length > 0 && !cleaned.startsWith('08')) {
      if (cleaned.startsWith('8')) {
        formatted = '0' + cleaned;
      } else if (cleaned.startsWith('0') && !cleaned.startsWith('08')) {
        formatted = '08' + cleaned.slice(1);
      }
    }
    
    // Format as 08xx-xxxx-xxxx
    if (formatted.length > 4 && formatted.length <= 8) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
    } else if (formatted.length > 8) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4, 8) + '-' + formatted.slice(8, 12);
    }
    
    return formatted;
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  // Real-time field validation
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        if (!validateFullName(value)) {
          return currentText.nameRequired;
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          return currentText.emailInvalid;
        }
        break;
      case 'password':
        if (!validatePassword(value)) {
          return currentText.passwordWeak;
        }
        break;
      case 'phone':
        if (value && !validateIndonesianPhone(value)) {
          return currentText.phoneInvalid;
        }
        break;
      case 'role':
        if (!value) {
          return currentText.roleRequired;
        }
        break;
      case 'companyName':
        const showCompanyFields = role === 'agent' || role === 'vendor' || role === 'property_owner';
        if (showCompanyFields && !value.trim()) {
          return currentText.companyRequired;
        }
        break;
      case 'licenseNumber':
        if (role === 'agent' && !value.trim()) {
          return currentText.licenseRequired;
        }
        break;
    }
    return '';
  };

  // Handle field changes with real-time validation
  const handleFieldChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case 'fullName':
        setFullName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'phone':
        setPhone(formatPhoneNumber(value));
        break;
      case 'role':
        setRole(value);
        // Clear company/license errors when role changes
        const newErrors = { ...validationErrors };
        delete newErrors.companyName;
        delete newErrors.licenseNumber;
        setValidationErrors(newErrors);
        break;
      case 'companyName':
        setCompanyName(value);
        break;
      case 'licenseNumber':
        setLicenseNumber(value);
        break;
    }

    // Mark field as touched
    setFieldTouched(prev => ({ ...prev, [field]: true }));

    // Validate field in real-time only if it has been touched
    if (fieldTouched[field] || field === 'role') {
      const error = validateField(field, field === 'phone' ? formatPhoneNumber(value) : value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validate all fields
    const fullNameError = validateField('fullName', fullName);
    if (fullNameError) errors.fullName = fullNameError;

    const emailError = validateField('email', email);
    if (emailError) errors.email = emailError;

    const passwordError = validateField('password', password);
    if (passwordError) errors.password = passwordError;

    const phoneError = validateField('phone', phone);
    if (phoneError) errors.phone = phoneError;

    const roleError = validateField('role', role);
    if (roleError) errors.role = roleError;

    const companyError = validateField('companyName', companyName);
    if (companyError) errors.companyName = companyError;

    const licenseError = validateField('licenseNumber', licenseNumber);
    if (licenseError) errors.licenseNumber = licenseError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Effect to validate role-dependent fields when role changes
  useEffect(() => {
    if (fieldTouched.companyName || fieldTouched.licenseNumber) {
      const companyError = validateField('companyName', companyName);
      const licenseError = validateField('licenseNumber', licenseNumber);
      
      setValidationErrors(prev => ({
        ...prev,
        companyName: companyError,
        licenseNumber: licenseError
      }));
    }
  }, [role, companyName, licenseNumber, fieldTouched.companyName, fieldTouched.licenseNumber, currentText]);

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
      console.log('Form submission started', { email, fullName, role });
      
      // Step 1: Validate form completely
      setRegistrationProgress(20);
      if (!validateForm()) {
        console.log('Form validation failed');
        setLoading(false);
        return;
      }

      // Step 2: Check email availability
      setRegistrationProgress(40);
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setValidationErrors({ email: currentText.emailExists });
        setLoading(false);
        return;
      }

      // Step 3: Prepare user data
      setRegistrationProgress(60);
      const cleanPhone = phone.replace(/[-\s]/g, '');
      
      const userData = {
        full_name: fullName.trim(),
        phone: cleanPhone,
        role: role,
        company_name: companyName.trim(),
        license_number: licenseNumber.trim()
      };

      console.log('Registration data prepared:', userData);

      // Step 4: Create account
      setRegistrationProgress(80);
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
    setPhone("");
    setRole("general_user");
    setCompanyName("");
    setLicenseNumber("");
    setValidationErrors({});
    setFieldTouched({});
    setRegistrationProgress(0);
  };

  if (!isOpen) return null;

  const showCompanyFields = role === 'agent' || role === 'vendor' || role === 'property_owner';
  const showLicenseField = role === 'agent';

  // Check if form is valid (no errors and all required fields filled)
  const isFormValid = Object.keys(validationErrors).every(key => !validationErrors[key]) &&
    fullName.trim() && 
    email.trim() && 
    password.trim() && 
    role &&
    (!showCompanyFields || companyName.trim()) &&
    (!showLicenseField || licenseNumber.trim());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                    {registrationProgress <= 40 && currentText.validatingData}
                    {registrationProgress > 40 && registrationProgress <= 80 && currentText.checkingEmail}
                    {registrationProgress > 80 && currentText.creatingAccount}
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
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, fullName: true }))}
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
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, email: true }))}
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
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, password: true }))}
                    required
                    disabled={loading}
                    className={validationErrors.password ? "border-red-500" : ""}
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">{currentText.phone}</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="08xx-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    onBlur={() => setFieldTouched(prev => ({ ...prev, phone: true }))}
                    disabled={loading}
                    className={validationErrors.phone ? "border-red-500" : ""}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500">{validationErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-role">{currentText.role}</Label>
                  <Select value={role} onValueChange={(value) => handleFieldChange('role', value)} disabled={loading}>
                    <SelectTrigger className={validationErrors.role ? "border-red-500" : ""}>
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
                  {validationErrors.role && (
                    <p className="text-sm text-red-500">{validationErrors.role}</p>
                  )}
                </div>

                {showCompanyFields && (
                  <div className="space-y-2">
                    <Label htmlFor="register-company">{currentText.companyName}</Label>
                    <Input
                      id="register-company"
                      type="text"
                      placeholder={currentText.companyName}
                      value={companyName}
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      onBlur={() => setFieldTouched(prev => ({ ...prev, companyName: true }))}
                      disabled={loading}
                      className={validationErrors.companyName ? "border-red-500" : ""}
                    />
                    {validationErrors.companyName && (
                      <p className="text-sm text-red-500">{validationErrors.companyName}</p>
                    )}
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
                      onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                      onBlur={() => setFieldTouched(prev => ({ ...prev, licenseNumber: true }))}
                      disabled={loading}
                      className={validationErrors.licenseNumber ? "border-red-500" : ""}
                    />
                    {validationErrors.licenseNumber && (
                      <p className="text-sm text-red-500">{validationErrors.licenseNumber}</p>
                    )}
                  </div>
                )}

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
