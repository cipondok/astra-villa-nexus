import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/admin/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

export default function AdminLogin() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && isAdmin) {
    const dest = location.state?.from?.pathname ?? "/admin";
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "Sign in failed", description: error, variant: "destructive" });
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <>
      <SEO title="Admin Login" path="/admin/login" />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 p-8 border border-border rounded-2xl bg-card shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Admin Sign In</h1>
            <p className="text-sm text-muted-foreground mt-1">Restricted to authorized administrators.</p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">{submitting ? "…" : "Sign in"}</Button>
        </form>
      </div>
    </>
  );
}
