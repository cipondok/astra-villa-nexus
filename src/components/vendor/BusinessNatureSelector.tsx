
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Lock, Clock } from "lucide-react";

interface BusinessNature {
  id: string;
  name: string;
  description: string;
  allowed_duration_units: string[];
  change_restriction_days: number;
}

interface BusinessNatureSelectorProps {
  currentNatureId?: string;
  canChange: boolean;
  onNatureSelect: (natureId: string) => void;
  onFinalize: () => void;
  isFinalized: boolean;
}

const BusinessNatureSelector = ({
  currentNatureId,
  canChange,
  onNatureSelect,
  onFinalize,
  isFinalized
}: BusinessNatureSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessNatures, setBusinessNatures] = useState<BusinessNature[]>([]);
  const [selectedNature, setSelectedNature] = useState(currentNatureId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessNatures();
  }, []);

  const fetchBusinessNatures = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_business_nature_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setBusinessNatures(data || []);
    } catch (error: any) {
      console.error('Error fetching business natures:', error);
      toast({
        title: "Error",
        description: "Failed to load business nature categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNatureChange = (value: string) => {
    setSelectedNature(value);
    onNatureSelect(value);
  };

  const handleFinalize = () => {
    if (!selectedNature) {
      toast({
        title: "Error",
        description: "Please select a business nature first",
        variant: "destructive"
      });
      return;
    }
    onFinalize();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading business categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Business Nature Selection
          {isFinalized && <Lock className="h-4 w-4 text-orange-500" />}
        </CardTitle>
        <CardDescription>
          Select your main business nature. This determines available service options and duration units.
          {isFinalized && " Changes are restricted for 30 days after finalization."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business_nature">Business Nature *</Label>
          <Select
            value={selectedNature}
            onValueChange={handleNatureChange}
            disabled={!canChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your business nature" />
            </SelectTrigger>
            <SelectContent>
              {businessNatures.map((nature) => (
                <SelectItem key={nature.id} value={nature.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{nature.name}</span>
                    <span className="text-sm text-muted-foreground">{nature.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedNature && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Available Duration Units:</h4>
            <div className="flex gap-2">
              {businessNatures
                .find(n => n.id === selectedNature)
                ?.allowed_duration_units.map((unit) => (
                <Badge key={unit} variant="secondary" className="bg-blue-100 text-blue-800">
                  {unit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!canChange && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Business nature changes are currently restricted. Please contact admin for assistance.
            </span>
          </div>
        )}

        {!isFinalized && selectedNature && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Once finalized, you won't be able to change your business nature for 30 days.
            </span>
          </div>
        )}

        {!isFinalized && (
          <Button 
            onClick={handleFinalize}
            disabled={!selectedNature}
            className="w-full"
          >
            Finalize Business Setup
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessNatureSelector;
