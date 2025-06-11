
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { 
  CheckCircle, 
  Circle, 
  Star, 
  Coins, 
  TrendingUp,
  Trophy,
  Gift
} from "lucide-react";

const VendorProfileProgress = () => {
  const { user } = useAuth();
  const { showSuccess } = useAlert();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['vendor-profile-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      // Get business profile
      const { data: businessProfile, error: businessError } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (businessError && businessError.code !== 'PGRST116') throw businessError;

      // Get services count
      const { data: services, error: servicesError } = await supabase
        .from('vendor_services')
        .select('id')
        .eq('vendor_id', user.id);
      
      if (servicesError) throw servicesError;

      // Get KYC status
      const { data: kycData, error: kycError } = await supabase
        .from('vendor_kyc_verification')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (kycError && kycError.code !== 'PGRST116') throw kycError;

      // Get ASTRA balance
      const { data: astraBalance, error: balanceError } = await supabase
        .from('vendor_astra_balances')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

      return {
        businessProfile,
        servicesCount: services?.length || 0,
        kycData,
        astraBalance
      };
    },
  });

  const calculateProgress = () => {
    if (!profileData) return 0;
    
    let completed = 0;
    const total = 6;

    // Business profile completion
    if (profileData.businessProfile?.business_name) completed++;
    if (profileData.businessProfile?.business_description) completed++;
    if (profileData.businessProfile?.business_phone) completed++;
    if (profileData.businessProfile?.business_address) completed++;
    
    // Services created
    if (profileData.servicesCount > 0) completed++;
    
    // KYC verification
    if (profileData.kycData?.overall_status === 'approved') completed++;

    return Math.round((completed / total) * 100);
  };

  const claimSignupBonusMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('claim_signup_bonus', {
        vendor_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "ASTRA signup bonus claimed!");
      queryClient.invalidateQueries({ queryKey: ['vendor-profile-progress'] });
    },
  });

  const progress = calculateProgress();
  const canClaimBonus = progress === 100 && !profileData?.businessProfile?.astra_profile_bonus_claimed;

  const progressSteps = [
    {
      title: "Business Information",
      description: "Complete your business profile",
      completed: profileData?.businessProfile?.business_name && 
                 profileData?.businessProfile?.business_description,
      icon: Circle
    },
    {
      title: "Contact Details",
      description: "Add phone and address",
      completed: profileData?.businessProfile?.business_phone && 
                 profileData?.businessProfile?.business_address,
      icon: Circle
    },
    {
      title: "Create Services",
      description: "Add at least one service",
      completed: (profileData?.servicesCount || 0) > 0,
      icon: Circle
    },
    {
      title: "KYC Verification",
      description: "Complete identity verification",
      completed: profileData?.kycData?.overall_status === 'approved',
      icon: Circle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="card-ios">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Profile Completion
              </CardTitle>
              <CardDescription>
                Complete your profile to unlock ASTRA tokens and benefits
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{progress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} className="w-full h-3" />
          
          {/* ASTRA Token Balance */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">ASTRA Token Balance</div>
                <div className="text-sm text-muted-foreground">Digital reward coins</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {profileData?.astraBalance?.balance || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Lifetime: {profileData?.astraBalance?.lifetime_earned || 0}
              </div>
            </div>
          </div>

          {/* Profile Completion Bonus */}
          {canClaimBonus && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Profile Complete!</div>
                    <div className="text-sm text-green-600">Claim your 200 ASTRA bonus</div>
                  </div>
                </div>
                <Button 
                  onClick={() => claimSignupBonusMutation.mutate()}
                  disabled={claimSignupBonusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Claim Bonus
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card className="card-ios">
        <CardHeader>
          <CardTitle>Complete Your Setup</CardTitle>
          <CardDescription>
            Follow these steps to get started on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressSteps.map((step, index) => {
              const Icon = step.completed ? CheckCircle : Circle;
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                  <Icon className={`h-6 w-6 ${step.completed ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  {step.completed ? (
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfileProgress;
