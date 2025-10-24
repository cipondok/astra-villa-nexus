import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import { z } from "zod";

const inquirySchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  inquiry_type: z.enum(['legal', 'financial', 'process', 'property', 'taxation', 'other'], {
    required_error: "Inquiry type is required"
  })
});

export const InquiryForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    inquiry_type: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an inquiry.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Validate form data
      const validatedData = inquirySchema.parse({
        subject: formData.subject,
        message: formData.message,
        inquiry_type: formData.inquiry_type,
      });

      const { data: inquiry, error } = await supabase.from("foreign_investment_inquiries").insert({
        user_id: user.id,
        subject: validatedData.subject,
        message: validatedData.message,
        inquiry_type: validatedData.inquiry_type,
        status: "new",
      }).select().single();

      if (error) throw error;

      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      // Send confirmation email via SMTP
      if (inquiry && profile?.email) {
        await supabase.functions.invoke('send-inquiry-email', {
          body: {
            inquiry_id: inquiry.id,
            customer_email: profile.email,
            customer_name: profile.full_name || 'Valued Customer',
            inquiry_type: validatedData.inquiry_type,
            message: validatedData.message
          }
        });
      }

      toast({
        title: "Inquiry Submitted",
        description: "We'll respond to your inquiry within 24-48 hours.",
      });

      setFormData({
        subject: "",
        message: "",
        inquiry_type: "",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Submit an Inquiry
            </CardTitle>
            <CardDescription className="text-base">
              Ask us anything about foreign investment
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inquiry_type">Inquiry Type</Label>
            <Select
              value={formData.inquiry_type}
              onValueChange={(value) =>
                setFormData({ ...formData, inquiry_type: value })
              }
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select inquiry type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legal">Legal Requirements</SelectItem>
                <SelectItem value="financial">Financial Information</SelectItem>
                <SelectItem value="process">Investment Process</SelectItem>
                <SelectItem value="property">Property Details</SelectItem>
                <SelectItem value="taxation">Taxation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief subject of your inquiry"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Please provide details about your inquiry..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="min-h-[150px] bg-background/50"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-lg py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
