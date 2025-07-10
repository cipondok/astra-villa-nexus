import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenRequest {
  action: string;
  userId?: string;
  amount?: number;
  transactionType?: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, amount, transactionType, description, referenceType, referenceId, metadata }: TokenRequest = await req.json();

    console.log('ASTRA Token Hub action:', action, { userId, amount, transactionType });

    switch (action) {
      case 'get_balance':
        return await getTokenBalance(supabase, userId!);
      
      case 'award_tokens':
        return await awardTokens(supabase, userId!, amount!, transactionType!, description, referenceType, referenceId, metadata);
      
      case 'spend_tokens':
        return await spendTokens(supabase, userId!, amount!, description, referenceType, referenceId);
      
      case 'daily_checkin':
        return await processDailyCheckin(supabase, userId!);
      
      case 'welcome_bonus':
        return await processWelcomeBonus(supabase, userId!);
      
      case 'transaction_reward':
        return await processTransactionReward(supabase, userId!, amount!, referenceType, referenceId);
      
      case 'referral_reward':
        return await processReferralReward(supabase, userId!, metadata?.referredUserId);
      
      case 'get_transactions':
        return await getTokenTransactions(supabase, userId!);
      
      case 'get_checkin_status':
        return await getCheckinStatus(supabase, userId!);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in ASTRA Token Hub:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getTokenBalance(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('astra_token_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get token balance: ${error.message}`);
  }

  const balance = data || {
    total_tokens: 0,
    available_tokens: 0,
    locked_tokens: 0,
    lifetime_earned: 0
  };

  return new Response(
    JSON.stringify({ balance }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function awardTokens(supabase: any, userId: string, amount: number, transactionType: string, description?: string, referenceType?: string, referenceId?: string, metadata?: Record<string, any>) {
  // Get user's current balance
  const { data: currentBalance, error: balanceError } = await supabase
    .from('astra_token_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (balanceError && balanceError.code !== 'PGRST116') {
    throw new Error(`Failed to get current balance: ${balanceError.message}`);
  }

  const newTotalTokens = (currentBalance?.total_tokens || 0) + amount;
  const newAvailableTokens = (currentBalance?.available_tokens || 0) + amount;
  const newLifetimeEarned = (currentBalance?.lifetime_earned || 0) + amount;

  // Update or insert balance
  const { error: upsertError } = await supabase
    .from('astra_token_balances')
    .upsert({
      user_id: userId,
      total_tokens: newTotalTokens,
      available_tokens: newAvailableTokens,
      locked_tokens: currentBalance?.locked_tokens || 0,
      lifetime_earned: newLifetimeEarned,
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    throw new Error(`Failed to update balance: ${upsertError.message}`);
  }

  // Create transaction record
  const { error: transactionError } = await supabase
    .from('astra_token_transactions')
    .insert({
      user_id: userId,
      transaction_type: transactionType,
      amount: amount,
      description: description,
      reference_type: referenceType,
      reference_id: referenceId,
      status: 'completed',
      metadata: metadata || {},
      processed_at: new Date().toISOString()
    });

  if (transactionError) {
    throw new Error(`Failed to create transaction: ${transactionError.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      newBalance: newTotalTokens,
      tokensAwarded: amount 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function spendTokens(supabase: any, userId: string, amount: number, description?: string, referenceType?: string, referenceId?: string) {
  // Get user's current balance
  const { data: currentBalance, error: balanceError } = await supabase
    .from('astra_token_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (balanceError) {
    throw new Error(`Failed to get current balance: ${balanceError.message}`);
  }

  if (!currentBalance || currentBalance.available_tokens < amount) {
    throw new Error('Insufficient token balance');
  }

  const newTotalTokens = currentBalance.total_tokens - amount;
  const newAvailableTokens = currentBalance.available_tokens - amount;

  // Update balance
  const { error: updateError } = await supabase
    .from('astra_token_balances')
    .update({
      total_tokens: newTotalTokens,
      available_tokens: newAvailableTokens,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (updateError) {
    throw new Error(`Failed to update balance: ${updateError.message}`);
  }

  // Create transaction record
  const { error: transactionError } = await supabase
    .from('astra_token_transactions')
    .insert({
      user_id: userId,
      transaction_type: 'spend',
      amount: -amount,
      description: description,
      reference_type: referenceType,
      reference_id: referenceId,
      status: 'completed',
      processed_at: new Date().toISOString()
    });

  if (transactionError) {
    throw new Error(`Failed to create transaction: ${transactionError.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      newBalance: newTotalTokens,
      tokensSpent: amount 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processWelcomeBonus(supabase: any, userId: string) {
  // Get user role
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError) {
    throw new Error(`Failed to get user profile: ${profileError.message}`);
  }

  // Check if user already received welcome bonus
  const { data: existingClaim, error: claimError } = await supabase
    .from('astra_reward_claims')
    .select('id')
    .eq('user_id', userId)
    .eq('claim_type', 'welcome_bonus')
    .single();

  if (claimError && claimError.code !== 'PGRST116') {
    throw new Error(`Failed to check existing claims: ${claimError.message}`);
  }

  if (existingClaim) {
    return new Response(
      JSON.stringify({ success: false, message: 'Welcome bonus already claimed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get welcome bonus amount for user role
  const { data: rewardConfig, error: configError } = await supabase
    .from('astra_reward_config')
    .select('reward_amount')
    .eq('reward_type', 'welcome_bonus')
    .eq('user_role', userProfile.role)
    .eq('is_active', true)
    .single();

  if (configError) {
    throw new Error(`Failed to get reward config: ${configError.message}`);
  }

  const welcomeAmount = rewardConfig.reward_amount;

  // Award welcome bonus
  const awardResult = await awardTokens(
    supabase, 
    userId, 
    welcomeAmount, 
    'welcome_bonus', 
    `Welcome bonus for ${userProfile.role}`,
    'welcome_bonus',
    userId
  );

  // Record the claim
  const { error: recordError } = await supabase
    .from('astra_reward_claims')
    .insert({
      user_id: userId,
      claim_type: 'welcome_bonus',
      amount: welcomeAmount,
      metadata: { user_role: userProfile.role }
    });

  if (recordError) {
    console.error('Failed to record welcome bonus claim:', recordError);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      welcomeBonus: welcomeAmount,
      message: `Welcome bonus of ${welcomeAmount} ASTRA tokens awarded!`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processTransactionReward(supabase: any, userId: string, transactionAmount: number, referenceType?: string, referenceId?: string) {
  // Get user role
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError) {
    throw new Error(`Failed to get user profile: ${profileError.message}`);
  }

  // Get transaction reward config for user role
  const { data: rewardConfig, error: configError } = await supabase
    .from('astra_reward_config')
    .select('*')
    .eq('reward_type', 'transaction_percentage')
    .eq('user_role', userProfile.role)
    .eq('is_active', true)
    .single();

  if (configError) {
    throw new Error(`Failed to get reward config: ${configError.message}`);
  }

  const conditions = rewardConfig.conditions || {};
  const minAmount = conditions.min_amount || 0;
  const maxReward = conditions.max_reward || Number.MAX_SAFE_INTEGER;

  if (transactionAmount < minAmount) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Transaction amount must be at least ${minAmount} to earn rewards`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const rewardAmount = Math.min(transactionAmount * rewardConfig.percentage_rate, maxReward);

  // Award transaction reward
  await awardTokens(
    supabase,
    userId,
    rewardAmount,
    'transaction_reward',
    `Transaction reward (${(rewardConfig.percentage_rate * 100).toFixed(2)}% of ${transactionAmount})`,
    referenceType,
    referenceId,
    { original_amount: transactionAmount, percentage: rewardConfig.percentage_rate }
  );

  return new Response(
    JSON.stringify({ 
      success: true, 
      rewardAmount,
      message: `Earned ${rewardAmount} ASTRA tokens for your transaction!`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processReferralReward(supabase: any, referrerId: string, referredUserId: string) {
  // Get referrer role
  const { data: referrerProfile, error: referrerError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', referrerId)
    .single();

  if (referrerError) {
    throw new Error(`Failed to get referrer profile: ${referrerError.message}`);
  }

  // Get referred user role
  const { data: referredProfile, error: referredError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', referredUserId)
    .single();

  if (referredError) {
    throw new Error(`Failed to get referred profile: ${referredError.message}`);
  }

  // Get referral reward config
  const { data: referrerConfig, error: referrerConfigError } = await supabase
    .from('astra_reward_config')
    .select('*')
    .eq('reward_type', 'referral_bonus')
    .eq('user_role', referrerProfile.role)
    .eq('is_active', true)
    .single();

  const { data: referredConfig, error: referredConfigError } = await supabase
    .from('astra_reward_config')
    .select('*')
    .eq('reward_type', 'referral_bonus')
    .eq('user_role', referredProfile.role)
    .eq('is_active', true)
    .single();

  if (referrerConfigError || referredConfigError) {
    throw new Error('Failed to get referral reward configs');
  }

  const referrerReward = referrerConfig.reward_amount;
  const referredReward = referredConfig.conditions?.referred_bonus || referredConfig.reward_amount * 0.5;

  // Record referral
  const { error: referralError } = await supabase
    .from('astra_referrals')
    .insert({
      referrer_id: referrerId,
      referred_id: referredUserId,
      status: 'completed',
      referrer_reward: referrerReward,
      referred_reward: referredReward,
      completed_at: new Date().toISOString()
    });

  if (referralError) {
    throw new Error(`Failed to record referral: ${referralError.message}`);
  }

  // Award tokens to both users
  await awardTokens(supabase, referrerId, referrerReward, 'referral', 'Referral bonus for inviting a friend', 'referral', referredUserId);
  await awardTokens(supabase, referredUserId, referredReward, 'referral', 'Welcome referral bonus', 'referral', referrerId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      referrerReward,
      referredReward,
      message: 'Referral rewards processed successfully!'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processDailyCheckin(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if user already checked in today
  const { data: existingCheckin, error: checkinError } = await supabase
    .from('astra_daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .single();

  if (checkinError && checkinError.code !== 'PGRST116') {
    throw new Error(`Failed to check existing checkin: ${checkinError.message}`);
  }

  if (existingCheckin) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Already checked in today',
        checkinData: existingCheckin
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get user role and streak
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError) {
    throw new Error(`Failed to get user profile: ${profileError.message}`);
  }

  // Get yesterday's checkin to calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const { data: previousCheckin, error: prevError } = await supabase
    .from('astra_daily_checkins')
    .select('streak_count')
    .eq('user_id', userId)
    .eq('checkin_date', yesterdayStr)
    .single();

  const streakCount = (prevError || !previousCheckin) ? 1 : previousCheckin.streak_count + 1;

  // Get daily checkin reward config
  const { data: rewardConfig, error: configError } = await supabase
    .from('astra_reward_config')
    .select('*')
    .eq('reward_type', 'daily_checkin')
    .eq('user_role', userProfile.role)
    .eq('is_active', true)
    .single();

  if (configError) {
    throw new Error(`Failed to get daily checkin config: ${configError.message}`);
  }

  // Calculate bonus multiplier based on streak
  const streakBonuses = rewardConfig.conditions?.streak_bonus || {};
  let bonusMultiplier = 1.0;
  
  for (const [streakThreshold, multiplier] of Object.entries(streakBonuses)) {
    if (streakCount >= parseInt(streakThreshold)) {
      bonusMultiplier = multiplier as number;
    }
  }

  const baseReward = rewardConfig.reward_amount;
  const finalReward = Math.floor(baseReward * bonusMultiplier);

  // Record daily checkin
  const { error: insertError } = await supabase
    .from('astra_daily_checkins')
    .insert({
      user_id: userId,
      checkin_date: today,
      streak_count: streakCount,
      tokens_earned: finalReward,
      bonus_multiplier: bonusMultiplier
    });

  if (insertError) {
    throw new Error(`Failed to record daily checkin: ${insertError.message}`);
  }

  // Award tokens
  await awardTokens(
    supabase,
    userId,
    finalReward,
    'daily_checkin',
    `Daily check-in reward (Day ${streakCount}${bonusMultiplier > 1 ? `, ${bonusMultiplier}x bonus!` : ''})`,
    'daily_checkin',
    userId,
    { streak_count: streakCount, bonus_multiplier: bonusMultiplier }
  );

  return new Response(
    JSON.stringify({ 
      success: true, 
      tokensEarned: finalReward,
      streakCount,
      bonusMultiplier,
      message: `Daily check-in complete! Earned ${finalReward} ASTRA tokens (Day ${streakCount}${bonusMultiplier > 1 ? ` with ${bonusMultiplier}x bonus!` : ''})`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTokenTransactions(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('astra_token_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to get transactions: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ transactions: data || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getCheckinStatus(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayCheckin, error: todayError } = await supabase
    .from('astra_daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .single();

  const { data: latestCheckin, error: latestError } = await supabase
    .from('astra_daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(1)
    .single();

  const hasCheckedInToday = !todayError && todayCheckin;
  const currentStreak = latestError ? 0 : (latestCheckin?.streak_count || 0);

  return new Response(
    JSON.stringify({ 
      hasCheckedInToday,
      currentStreak,
      todayCheckin: hasCheckedInToday ? todayCheckin : null
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}