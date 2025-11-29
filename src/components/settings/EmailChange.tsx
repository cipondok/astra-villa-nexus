import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Mail, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  newEmail: z.string().trim().email('Please enter a valid email address'),
});

export const EmailChange = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const result = emailSchema.safeParse({ newEmail });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (newEmail === user?.email) {
      setError('New email must be different from current email');
      return;
    }

    setIsChanging(true);
    try {
      const redirectUrl = `${window.location.origin}/settings`;
      
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: redirectUrl }
      );

      if (updateError) throw updateError;

      // Log the email change activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'email_change',
        activity_description: `Email change requested to ${newEmail}`,
        metadata: { new_email: newEmail, timestamp: new Date().toISOString() }
      });

      toast({
        title: "Verification Email Sent",
        description: "Please check both your old and new email addresses to confirm the change",
      });

      setNewEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Mail className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-semibold">Email</span>
      </div>
      
      <div className="p-1.5 rounded-md bg-muted/30 border text-[10px]">
        <span className="text-muted-foreground">Current: </span>
        <span className="font-medium break-all">{user?.email}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-1.5">
        <div>
          <Label htmlFor="newEmail" className="text-[10px]">New Email</Label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); if (error) setError(''); }}
            className={`h-7 text-xs ${error ? 'border-destructive' : ''}`}
            placeholder="Enter new email"
          />
          {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
        </div>

        <div className="flex items-start gap-1 p-1.5 rounded-md bg-blue-500/5 border border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>Verify from both old & new email</span>
        </div>

        <Button type="submit" disabled={isChanging || !newEmail} className="w-full h-6 text-[10px]">
          {isChanging ? 'Sending...' : 'Send Verification'}
        </Button>
      </form>
    </div>
  );
};
