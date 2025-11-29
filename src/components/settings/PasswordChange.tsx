import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const PasswordChange = () => {
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = passwordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsChanging(true);
    try {
      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User not found');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) throw updateError;

      // Log the password change activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'password_change',
        activity_description: 'Password changed successfully',
        metadata: { timestamp: new Date().toISOString() }
      });

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Lock className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-xs font-semibold">Password</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-1.5">
        <div>
          <Label htmlFor="currentPassword" className="text-[10px]">Current</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={handleChange}
              className={`pr-7 h-7 text-xs ${errors.currentPassword ? 'border-destructive' : ''}`}
              placeholder="Current password"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
              {showCurrentPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          {errors.currentPassword && <p className="text-[10px] text-destructive">{errors.currentPassword}</p>}
        </div>

        <div>
          <Label htmlFor="newPassword" className="text-[10px]">New</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              className={`pr-7 h-7 text-xs ${errors.newPassword ? 'border-destructive' : ''}`}
              placeholder="New password"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          {errors.newPassword && <p className="text-[10px] text-destructive">{errors.newPassword}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-[10px]">Confirm</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`pr-7 h-7 text-xs ${errors.confirmPassword ? 'border-destructive' : ''}`}
              placeholder="Confirm password"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-[10px] text-destructive">{errors.confirmPassword}</p>}
        </div>

        <div className="p-1.5 rounded-md bg-muted/30 border text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1 mb-0.5">
            <ShieldCheck className="h-2.5 w-2.5 text-primary" />
            <span className="font-medium text-foreground">Requirements:</span>
          </div>
          <span>8+ chars, uppercase, lowercase, number</span>
        </div>

        <Button type="submit" disabled={isChanging} className="w-full h-6 text-[10px]">
          {isChanging ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
};
