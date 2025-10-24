import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, TrendingUp } from "lucide-react";
import { z } from "zod";

const investmentSchema = z.object({
  property_type: z.enum(['residential', 'commercial', 'industrial', 'mixed-use', 'land'], {
    required_error: "Property type is required"
  }),
  investment_amount: z.number({
    required_error: "Investment amount is required",
    invalid_type_error: "Investment amount must be a number"
  }).min(1000000, "Minimum investment is IDR 1,000,000").max(100000000000, "Maximum investment is IDR 100,000,000,000"),
  location_preference: z.string().trim().max(200, "Location must be less than 200 characters").optional(),
  investment_timeline: z.enum(['immediate', 'short-term', 'medium-term', 'long-term'], {
    required_error: "Investment timeline is required"
  }),
  notes: z.string().trim().max(2000, "Notes must be less than 2000 characters").optional()
});

export const InvestmentOrderForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    property_type: "",
    investment_amount: "",
    location_preference: "",
    investment_timeline: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an investment order.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Validate form data
      const validatedData = investmentSchema.parse({
        property_type: formData.property_type,
        investment_amount: parseFloat(formData.investment_amount),
        location_preference: formData.location_preference || undefined,
        investment_timeline: formData.investment_timeline,
        notes: formData.notes || undefined,
      });

      const { error } = await supabase.from("foreign_investment_orders").insert({
        user_id: user.id,
        property_type: validatedData.property_type,
        investment_amount: validatedData.investment_amount,
        location_preference: validatedData.location_preference,
        investment_timeline: validatedData.investment_timeline,
        notes: validatedData.notes,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Order Submitted Successfully",
        description: "We'll review your investment order and contact you soon.",
      });

      setFormData({
        property_type: "",
        investment_amount: "",
        location_preference: "",
        investment_timeline: "",
        notes: "",
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
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Investment Order Form
            </CardTitle>
            <CardDescription className="text-base">
              Submit your investment requirements
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="property_type">Property Type</Label>
            <Select
              value={formData.property_type}
              onValueChange={(value) =>
                setFormData({ ...formData, property_type: value })
              }
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="mixed-use">Mixed Use</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_amount">Investment Amount (IDR)</Label>
            <Input
              id="investment_amount"
              type="number"
              min="0"
              step="1000000"
              placeholder="e.g., 5000000000"
              value={formData.investment_amount}
              onChange={(e) =>
                setFormData({ ...formData, investment_amount: e.target.value })
              }
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_preference">Location Preference</Label>
            <Input
              id="location_preference"
              placeholder="e.g., Jakarta, Bali"
              value={formData.location_preference}
              onChange={(e) =>
                setFormData({ ...formData, location_preference: e.target.value })
              }
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_timeline">Investment Timeline</Label>
            <Select
              value={formData.investment_timeline}
              onValueChange={(value) =>
                setFormData({ ...formData, investment_timeline: value })
              }
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (0-3 months)</SelectItem>
                <SelectItem value="short-term">Short Term (3-6 months)</SelectItem>
                <SelectItem value="medium-term">Medium Term (6-12 months)</SelectItem>
                <SelectItem value="long-term">Long Term (12+ months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or questions..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="min-h-[120px] bg-background/50"
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
              "Submit Investment Order"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
