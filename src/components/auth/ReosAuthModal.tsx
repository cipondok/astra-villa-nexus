import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  X, Mail, Lock, Eye, EyeOff, Globe, Loader2, Check, ArrowRight, ArrowLeft,
  Sparkles, Shield, Building2, TrendingUp, Cpu, Wrench, Scale, Store,
  CheckCircle2, Briefcase, Home, Hammer, KeyRound, Users, FileText,
  Lightbulb, MapPin, Languages,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import heroImg from "@/assets/reos-hero.jpg";

/* ============================================================
   ASTRA Villa — Premium Auth Modal
   Luxury glass · 720x520 desktop · fullscreen mobile
   ============================================================ */

type Mode = "login" | "register" | "loading" | "success";

const profileTypes = [
  { v: "buyer",      label: "Property Buyer",  icon: Home,      desc: "Discover & purchase premium properties" },
  { v: "investor",   label: "Investor",        icon: TrendingUp, desc: "Fractional & full-asset opportunities" },
  { v: "developer",  label: "Developer",       icon: Hammer,    desc: "List & manage development projects" },
  { v: "owner",      label: "Property Owner",  icon: KeyRound,  desc: "Manage your portfolio & tenants" },
  { v: "agent",      label: "Agent",           icon: Users,     desc: "Represent buyers, sellers & landlords" },
  { v: "vendor",     label: "Vendor",          icon: Store,     desc: "Architects, contractors, suppliers" },
  { v: "lawyer",     label: "Lawyer",          icon: Scale,     desc: "Legal & due diligence services" },
  { v: "consultant", label: "Consultant",      icon: Briefcase, desc: "Advisory & specialist services" },
];

const interestOptions = [
  { v: "luxury_villas",       label: "Luxury Villas",       icon: Building2 },
  { v: "commercial",          label: "Commercial",          icon: Briefcase },
  { v: "apartments",          label: "Apartments",          icon: Home },
  { v: "hotels",              label: "Hotels",              icon: Sparkles },
  { v: "land",                label: "Land",                icon: MapPin },
  { v: "property_management", label: "Property Management", icon: Wrench },
  { v: "investment",          label: "Investment",          icon: TrendingUp },
  { v: "ai_tools",            label: "AI Tools",            icon: Cpu },
];

const loadingSteps = [
  { label: "AI System Connecting...",   icon: Cpu },
  { label: "Loading Portfolio",         icon: Briefcase },
  { label: "Loading Properties",        icon: Building2 },
  { label: "Loading Intelligence",      icon: Sparkles },
  { label: "Loading Investment Data",   icon: TrendingUp },
];

const countries = ["Indonesia", "Singapore", "Malaysia", "Thailand", "Vietnam", "Philippines", "Australia", "United States", "United Kingdom"];
const languages = [
  { v: "en", label: "English" },
  { v: "id", label: "Bahasa Indonesia" },
  { v: "zh", label: "中文" },
  { v: "ja", label: "日本語" },
  { v: "ko", label: "한국어" },
];

/* ---- validation ---- */
const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});
const registerStep1Schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  country: z.string().min(1, "Select a country"),
  language: z.string().min(1, "Select a language"),
});

/* ============================================================ */
export function ReosAuthModal({
  open,
  onOpenChange,
  initialMode = "login",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialMode?: Mode;
}) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [submitting, setSubmitting] = useState(false);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loginErr, setLoginErr] = useState<Record<string, string>>({});

  // register state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [reg, setReg] = useState({
    fullName: "", email: "", password: "",
    country: "Indonesia", language: "en",
    profileType: "" as string,
    interests: [] as string[],
  });
  const [regErr, setRegErr] = useState<Record<string, string>>({});

  // loading state
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => { if (open) { setMode(initialMode); setStep(1); setLoginErr({}); setRegErr({}); } }, [open, initialMode]);

  /* ---- handlers ---- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setLoginErr(errs);
      return;
    }
    setSubmitting(true); setLoginErr({});
    const { error } = await signIn(loginEmail, loginPassword);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign in failed");
      setLoginErr({ password: error.message?.includes("Invalid") ? "Invalid email or password" : "Sign in failed" });
      return;
    }
    runSuccessLoader();
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    setSubmitting(false);
    if (error) toast.error(error.message || "Google sign in failed");
  };

  const validateStep1 = () => {
    const parsed = registerStep1Schema.safeParse(reg);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setRegErr(errs);
      return false;
    }
    setRegErr({});
    return true;
  };

  const handleRegisterSubmit = async () => {
    setSubmitting(true);
    const { error } = await signUp(reg.email, reg.password, reg.fullName);
    if (error) {
      setSubmitting(false);
      toast.error(error.message || "Sign up failed");
      return;
    }
    // Persist extended profile data (best-effort).
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          full_name: reg.fullName,
          country: reg.country,
          language: reg.language,
          profile_type: reg.profileType as any,
          interests: reg.interests,
          onboarded_at: new Date().toISOString(),
        }).eq("id", user.id);
      }
    } catch (err) {
      console.warn("profile update skipped", err);
    }
    setSubmitting(false);
    setStep(4);
  };

  const runSuccessLoader = () => {
    setMode("loading"); setLoadingStep(0);
    const id = setInterval(() => {
      setLoadingStep(s => {
        if (s >= loadingSteps.length - 1) { clearInterval(id); setTimeout(() => onOpenChange(false), 600); return s; }
        return s + 1;
      });
    }, 380);
  };

  /* ---- render ---- */
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="reos-auth-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center p-0 md:p-6"
          style={{ background: "radial-gradient(ellipse at center, rgba(20,16,8,0.65), rgba(0,0,0,0.85))", backdropFilter: "blur(14px)" }}
          onClick={() => !submitting && onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full md:h-[520px] md:w-[720px] md:rounded-2xl overflow-hidden flex flex-col md:flex-row"
            style={{
              background: "linear-gradient(180deg, rgba(18,18,20,0.94), rgba(11,11,12,0.96))",
              border: "1px solid rgba(200,169,106,0.28)",
              boxShadow: "0 40px 120px -20px rgba(200,169,106,0.25), 0 0 0 1px rgba(200,169,106,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            role="dialog" aria-modal="true" aria-label="ASTRA Villa authentication"
          >
            {/* Close */}
            <button
              onClick={() => !submitting && onOpenChange(false)}
              aria-label="Close authentication dialog"
              className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* ===== LEFT PANEL ===== */}
            <div className="relative md:w-[44%] h-44 md:h-full overflow-hidden hidden md:block">
              <motion.img
                src={heroImg} alt="Luxury villa overlooking the ocean"
                initial={{ scale: 1.08, y: 0 }}
                animate={{ scale: 1.18, y: -12 }}
                transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* black → gold → dark emerald gradient overlay */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(165deg, rgba(0,0,0,0.85) 0%, rgba(20,15,5,0.7) 40%, rgba(200,169,106,0.25) 65%, rgba(6,40,30,0.85) 100%)",
              }} />
              <div className="absolute inset-0" style={{
                background: "radial-gradient(circle at 30% 80%, rgba(200,169,106,0.25), transparent 55%)",
              }} />

              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-black" style={{ background: "linear-gradient(180deg,#E0C384,#D4AF37)" }}>A</div>
                    <div className="leading-tight">
                      <div className="text-[11px] tracking-[0.28em] font-semibold">ASTRA VILLA</div>
                      <div className="text-[8px] tracking-[0.3em] text-white/60">REAL ESTATE OS</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "#E0C384" }}>Private Investor Platform</div>
                  <h2 className="text-2xl font-semibold leading-tight">Welcome to ASTRA Villa</h2>
                  <p className="mt-1.5 text-[12px] text-white/70 leading-relaxed">
                    Southeast Asia's AI-Powered<br />Real Estate Operating System
                  </p>
                  <ul className="mt-5 space-y-1.5">
                    {["Property Marketplace","Investment Platform","AI Property Advisor","Property Management","Legal Services","Vendor Marketplace"].map((f, i) => (
                      <motion.li key={f}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                        className="flex items-center gap-2 text-[11.5px] text-white/85">
                        <Check className="h-3 w-3" style={{ color: "#E0C384" }} /> {f}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ===== RIGHT PANEL ===== */}
            <div className="relative md:w-[56%] flex-1 flex flex-col bg-transparent text-[#F4F1EA]">
              <AnimatePresence mode="wait">
                {/* ----- LOGIN ----- */}
                {mode === "login" && (
                  <motion.div key="login"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 overflow-y-auto p-6 md:p-7">
                    <Header title="Welcome Back" subtitle="Access your property portfolio, investments and AI intelligence." />

                    <form onSubmit={handleLogin} className="mt-5 space-y-3">
                      <Field id="login-email" label="Email" icon={Mail} error={loginErr.email}>
                        <input id="login-email" type="email" autoComplete="email" value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@company.com"
                          className={inputCls} />
                      </Field>
                      <Field id="login-password" label="Password" icon={Lock} error={loginErr.password}>
                        <input id="login-password" type={showPw ? "text" : "password"} autoComplete="current-password" value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputCls} />
                        <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A958A] hover:text-[#F4F1EA]">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </Field>

                      <div className="flex items-center justify-between text-[12px]">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-[#9A958A]">
                          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-[#D4AF37]" />
                          Remember me
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            const email = loginEmail.trim();
                            if (!email) { toast.error("Enter your email above first"); return; }
                            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                              redirectTo: `${window.location.origin}/reset-password`,
                            });
                            if (error) toast.error(error.message);
                            else toast.success("Password reset link sent. Check your email.");
                          }}
                          className="hover:underline" style={{ color: "#E0C384" }}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <PrimaryButton type="submit" loading={submitting} disabled={submitting}>
                        Continue <ArrowRight className="h-4 w-4" />
                      </PrimaryButton>

                      <Divider>or continue with</Divider>

                      <div className="grid grid-cols-1 gap-2">
                        <SocialButton onClick={handleGoogle} disabled={submitting} provider="google">Continue with Google</SocialButton>
                        <SocialButton disabled provider="apple">Continue with Apple <Soon /></SocialButton>
                        <SocialButton disabled provider="linkedin">Continue with LinkedIn <Soon /></SocialButton>
                      </div>

                      <div className="pt-3 text-center text-[12px] text-[#9A958A]">
                        New to ASTRA Villa?{" "}
                        <button type="button" onClick={() => setMode("register")} className="font-medium hover:underline" style={{ color: "#E0C384" }}>
                          Create Account
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ----- REGISTER ----- */}
                {mode === "register" && (
                  <motion.div key="register"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 overflow-y-auto p-6 md:p-7 flex flex-col">
                    <Header
                      title={step === 4 ? "You're in." : "Create Your Account"}
                      subtitle={step === 4 ? "Your Real Estate Operating System is ready." : "Join Southeast Asia's premier real estate investor network."}
                    />

                    {step < 4 && <Stepper step={step} total={3} />}

                    {/* Step 1 — Account info */}
                    {step === 1 && (
                      <div className="mt-4 space-y-3 flex-1">
                        <Field id="reg-name" label="Full Name" error={regErr.fullName}>
                          <input id="reg-name" autoComplete="name" value={reg.fullName}
                            onChange={(e) => setReg(r => ({ ...r, fullName: e.target.value }))}
                            placeholder="Jane Doe" className={inputCls} />
                        </Field>
                        <Field id="reg-email" label="Email" icon={Mail} error={regErr.email}>
                          <input id="reg-email" type="email" autoComplete="email" value={reg.email}
                            onChange={(e) => setReg(r => ({ ...r, email: e.target.value }))}
                            placeholder="you@company.com" className={inputCls} />
                        </Field>
                        <Field id="reg-pw" label="Password" icon={Lock} error={regErr.password}>
                          <input id="reg-pw" type={showPw ? "text" : "password"} autoComplete="new-password" value={reg.password}
                            onChange={(e) => setReg(r => ({ ...r, password: e.target.value }))}
                            placeholder="At least 8 characters" className={inputCls} />
                          <button type="button" onClick={() => setShowPw(s => !s)} aria-label={showPw ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A958A] hover:text-[#F4F1EA]">
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field id="reg-country" label="Country" icon={Globe} error={regErr.country}>
                            <select id="reg-country" value={reg.country}
                              onChange={(e) => setReg(r => ({ ...r, country: e.target.value }))}
                              className={inputCls + " appearance-none"}>
                              {countries.map(c => <option key={c} value={c} className="bg-[#0D2140]">{c}</option>)}
                            </select>
                          </Field>
                          <Field id="reg-lang" label="Language" icon={Languages} error={regErr.language}>
                            <select id="reg-lang" value={reg.language}
                              onChange={(e) => setReg(r => ({ ...r, language: e.target.value }))}
                              className={inputCls + " appearance-none"}>
                              {languages.map(l => <option key={l.v} value={l.v} className="bg-[#0D2140]">{l.label}</option>)}
                            </select>
                          </Field>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <SecondaryButton onClick={() => setMode("login")}><ArrowLeft className="h-4 w-4" /> Back to login</SecondaryButton>
                          <PrimaryButton onClick={() => { if (validateStep1()) setStep(2); }}>Continue <ArrowRight className="h-4 w-4" /></PrimaryButton>
                        </div>
                      </div>
                    )}

                    {/* Step 2 — Profile type */}
                    {step === 2 && (
                      <div className="mt-4 flex-1 flex flex-col">
                        <p className="text-[12px] text-[#9A958A] mb-3">Choose how you'll use ASTRA Villa. You can change this later.</p>
                        <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1">
                          {profileTypes.map(p => {
                            const active = reg.profileType === p.v;
                            return (
                              <button key={p.v} type="button"
                                onClick={() => setReg(r => ({ ...r, profileType: p.v }))}
                                className={`text-left rounded-xl border p-3 transition group ${active ? "bg-[#D4AF37]/12 border-[#D4AF37]" : "bg-white/[0.02] border-white/8 hover:border-[#D4AF37]/40"}`}
                                style={active ? { borderColor: "#D4AF37", background: "rgba(200,169,106,0.08)" } : {}}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`h-7 w-7 rounded-md flex items-center justify-center ${active ? "bg-[#D4AF37] text-black" : "bg-white/5"}`}>
                                    <p.icon className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="text-[12.5px] font-semibold">{p.label}</div>
                                </div>
                                <div className="mt-1.5 text-[10.5px] text-[#9A958A] leading-snug">{p.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="pt-3 flex gap-2">
                          <SecondaryButton onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</SecondaryButton>
                          <PrimaryButton disabled={!reg.profileType} onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4" /></PrimaryButton>
                        </div>
                      </div>
                    )}

                    {/* Step 3 — Interests */}
                    {step === 3 && (
                      <div className="mt-4 flex-1 flex flex-col">
                        <p className="text-[12px] text-[#9A958A] mb-3">Pick what you're interested in. We'll tune your dashboard & AI insights.</p>
                        <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1">
                          {interestOptions.map(opt => {
                            const active = reg.interests.includes(opt.v);
                            return (
                              <button key={opt.v} type="button"
                                onClick={() => setReg(r => ({ ...r, interests: active ? r.interests.filter(x => x !== opt.v) : [...r.interests, opt.v] }))}
                                className={`flex items-center gap-2 rounded-xl border p-3 transition ${active ? "border-[#D4AF37]" : "border-white/8 hover:border-[#D4AF37]/40"}`}
                                style={active ? { background: "rgba(200,169,106,0.08)" } : {}}
                              >
                                <div className={`h-7 w-7 rounded-md flex items-center justify-center ${active ? "bg-[#D4AF37] text-black" : "bg-white/5"}`}>
                                  <opt.icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-[12px] font-medium">{opt.label}</span>
                                {active && <Check className="ml-auto h-3.5 w-3.5" style={{ color: "#E0C384" }} />}
                              </button>
                            );
                          })}
                        </div>
                        <div className="pt-3 flex gap-2">
                          <SecondaryButton onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</SecondaryButton>
                          <PrimaryButton disabled={!reg.interests.length || submitting} loading={submitting} onClick={handleRegisterSubmit}>
                            Create Account <ArrowRight className="h-4 w-4" />
                          </PrimaryButton>
                        </div>
                      </div>
                    )}

                    {/* Step 4 — Success */}
                    {step === 4 && (
                      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                        className="mt-4 flex-1 flex flex-col items-center justify-center text-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 14 }}
                          className="h-20 w-20 rounded-full flex items-center justify-center"
                          style={{ background: "radial-gradient(circle, rgba(200,169,106,0.25), transparent 70%)" }}
                        >
                          <div className="h-14 w-14 rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(180deg,#E0C384,#D4AF37)" }}>
                            <CheckCircle2 className="h-7 w-7 text-black" />
                          </div>
                        </motion.div>
                        <div className="mt-5 text-[20px] font-semibold">Welcome to ASTRA Villa</div>
                        <div className="text-[12.5px] text-[#9A958A] mt-1 max-w-xs">Your Real Estate Operating System is ready.</div>
                        <PrimaryButton onClick={runSuccessLoader} className="mt-6 max-w-[260px]">
                          Launch Dashboard <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ----- LOADING ----- */}
                {mode === "loading" && (
                  <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center">
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(200,169,106,0.35), transparent 65%)" }} />
                      <Loader2 className="absolute inset-0 m-auto h-10 w-10 animate-spin" style={{ color: "#E0C384" }} />
                    </div>
                    <div className="mt-5 text-[14px] font-semibold tracking-wide">Booting Operating System</div>
                    <ul className="mt-5 space-y-2 w-full max-w-xs">
                      {loadingSteps.map((s, i) => {
                        const done = i < loadingStep;
                        const active = i === loadingStep;
                        return (
                          <motion.li key={s.label}
                            animate={{ opacity: done || active ? 1 : 0.35 }}
                            className="flex items-center gap-3 text-[12.5px]">
                            <span className="h-6 w-6 rounded-full flex items-center justify-center border"
                              style={{
                                borderColor: done ? "#D4AF37" : active ? "#E0C384" : "rgba(255,255,255,0.1)",
                                background: done ? "rgba(200,169,106,0.18)" : "transparent",
                              }}>
                              {done ? <Check className="h-3 w-3" style={{ color: "#E0C384" }} />
                                : active ? <Loader2 className="h-3 w-3 animate-spin" style={{ color: "#E0C384" }} />
                                : <s.icon className="h-3 w-3 text-white/40" />}
                            </span>
                            <span className={done ? "text-white/90" : active ? "text-white" : "text-white/50"}>{s.label}</span>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              {mode !== "loading" && (
                <div className="border-t border-white/5 px-6 md:px-7 py-3 flex items-center justify-between text-[10.5px] text-[#6B6760]">
                  <span>© {new Date().getFullYear()} ASTRA Villa</span>
                  <div className="flex items-center gap-4">
                    <Link to="/legal-services" onClick={() => onOpenChange(false)} className="hover:text-white">Privacy</Link>
                    <Link to="/legal-services" onClick={() => onOpenChange(false)} className="hover:text-white">Terms</Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ============================================================
   Sub-components
   ============================================================ */
const inputCls =
  "w-full h-10 pl-9 pr-9 rounded-lg bg-white/[0.03] border border-white/8 text-[13px] text-[#F4F1EA] placeholder:text-[#6B6760] outline-none transition focus:border-[#D4AF37] focus:bg-white/[0.05] focus:ring-2 focus:ring-[#D4AF37]/30";

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="md:hidden flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-black" style={{ background: "linear-gradient(180deg,#E0C384,#D4AF37)" }}>A</div>
        <span className="text-[12px] tracking-[0.25em] font-semibold">ASTRA VILLA</span>
      </div>
      <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
      <p className="text-[12.5px] text-[#9A958A] mt-1 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function Field({
  id, label, icon: Icon, error, children,
}: { id: string; label: string; icon?: any; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.18em] text-[#9A958A] mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A958A]" />}
        {children}
      </div>
      {error && <div role="alert" className="mt-1 text-[11px] text-[#F87171]">{error}</div>}
    </div>
  );
}

function PrimaryButton({ children, loading, className = "", ...props }: any) {
  return (
    <button {...props}
      className={`relative w-full h-11 rounded-xl text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ background: "linear-gradient(180deg,#E0C384,#D4AF37)", color: "#161208", boxShadow: "0 12px 30px -10px rgba(200,169,106,0.55), inset 0 1px 0 rgba(255,255,255,0.25)" }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

function SecondaryButton({ children, ...props }: any) {
  return (
    <button {...props}
      className="h-11 px-4 rounded-xl text-[12.5px] inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.02] text-[#F4F1EA] hover:bg-white/[0.05] hover:border-[#D4AF37]/40 transition">
      {children}
    </button>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-[10px] uppercase tracking-[0.25em] text-[#6B6760]">{children}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

function SocialButton({ provider, children, ...props }: any) {
  const Glyph = useMemo(() => {
    switch (provider) {
      case "google":  return <GoogleGlyph />;
      case "apple":   return <AppleGlyph />;
      case "linkedin":return <LinkedinGlyph />;
    }
  }, [provider]);
  return (
    <button {...props}
      className="h-10 rounded-xl inline-flex items-center justify-center gap-2.5 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#D4AF37]/40 text-[12.5px] text-[#F4F1EA] transition disabled:opacity-50 disabled:cursor-not-allowed">
      {Glyph} {children}
    </button>
  );
}
function Soon() { return <span className="ml-2 text-[9px] tracking-[0.18em] uppercase text-[#9A958A] border border-white/10 px-1.5 py-0.5 rounded">soon</span>; }
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-16 21 21 0 0 0 0-7.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.6-5.2l-6.3-5.3A12 12 0 0 1 12.7 28L6.1 33A20 20 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.3 5.3C41 35 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
function AppleGlyph() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M16.4 1.6c0 1.2-.5 2.4-1.3 3.2-.9.9-2.3 1.6-3.5 1.5-.2-1.2.4-2.4 1.2-3.2.9-.9 2.4-1.5 3.6-1.5zM20.9 17.3c-.6 1.4-1 2-1.8 3.2-1.1 1.7-2.7 3.7-4.7 3.7-1.7 0-2.2-1.1-4.5-1.1-2.3 0-2.8 1.1-4.5 1.1-2 0-3.4-1.9-4.6-3.5-3.2-4.7-3.5-10.3-1.6-13.3 1.4-2.1 3.5-3.4 5.6-3.4 2 0 3.3 1.1 5 1.1 1.6 0 2.7-1.1 5-1.1 1.9 0 3.8 1 5.1 2.7-4.5 2.5-3.8 9.1.0 11.6z"/></svg>;
}
function LinkedinGlyph() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#0A66C2" aria-hidden><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5V9h3v10zM6.5 7.7a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4zM19 19h-3v-5.2c0-1.2-.5-2-1.6-2-1.2 0-1.9.8-1.9 2V19h-3V9h3v1.4c.4-.8 1.5-1.7 3.1-1.7 2.2 0 3.4 1.4 3.4 4V19z"/></svg>;
}

function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = step >= n;
        return (
          <div key={n} className="flex-1 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition"
              style={{ background: active ? "linear-gradient(180deg,#E0C384,#D4AF37)" : "transparent", color: active ? "#161208" : "#9A958A", border: active ? "none" : "1px solid rgba(255,255,255,0.12)" }}>
              {n}
            </div>
            {n < total && <div className="flex-1 h-px" style={{ background: step > n ? "#D4AF37" : "rgba(255,255,255,0.08)" }} />}
          </div>
        );
      })}
    </div>
  );
}
