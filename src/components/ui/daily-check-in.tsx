
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Calendar, Gift } from "lucide-react";

const DailyCheckIn = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('process_daily_check_in');
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Check-in Complete!", data.message);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } else {
        showError("Check-in Failed", data.message);
      }
    },
    onError: (error) => {
      console.error('Check-in error:', error);
      showError("Error", "Failed to process daily check-in");
    },
  });

  if (!user) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Check-In
        </CardTitle>
        <CardDescription>
          Check in daily to earn rewards and stay active!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => checkInMutation.mutate()}
          disabled={checkInMutation.isPending}
          className="w-full"
        >
          <Gift className="h-4 w-4 mr-2" />
          {checkInMutation.isPending ? 'Checking in...' : 'Check In Today'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyCheckIn;
