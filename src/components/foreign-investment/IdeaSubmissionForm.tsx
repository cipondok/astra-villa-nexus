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
import { Loader2, Lightbulb } from "lucide-react";

export const IdeaSubmissionForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an idea.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("user_ideas").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: "submitted",
      });

      if (error) throw error;

      toast({
        title: "Idea Submitted",
        description: "Thank you for your suggestion! We'll review it soon.",
      });

      setFormData({
        title: "",
        description: "",
        category: "",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Share Your Idea
            </CardTitle>
            <CardDescription className="text-base">
              Help us improve our foreign investment services
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-feature">New Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="service">Service Enhancement</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief title of your idea"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your idea in detail..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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
              "Submit Idea"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
