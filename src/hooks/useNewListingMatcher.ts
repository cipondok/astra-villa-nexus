import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Real-time hook that listens for new property INSERTs via Supabase Realtime,
 * scores them against the user's learned preferences + preference profile,
 * and creates in-app notifications for strong matches (≥60%).
 */

interface UserPreferenceProfile {
  preferred_locations: string[] | null;
  preferred_property_types: string[] | null;
  min_budget: number | null;
  max_budget: number | null;
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  must_have_features: string[] | null;
  deal_breakers: string[] | null;
  location_weight: number | null;
  price_weight: number | null;
  size_weight: number | null;
  type_weight: number | null;
  features_weight: number | null;
}

interface LearnedPref {
  pattern_type: string;
  pattern_key: string;
  pattern_value: unknown;
  confidence_score: number | null;
}

interface NewProperty {
  id: string;
  title: string;
  city: string | null;
  location: string;
  price: number | null;
  property_type: string;
  bedrooms: number | null;
  has_pool: boolean | null;
  property_features: unknown;
  images: string[] | null;
  image_urls: string[] | null;
  status: string | null;
}

function scorePropertyMatch(
  property: NewProperty,
  profile: UserPreferenceProfile | null,
  learned: LearnedPref[]
): { score: number; reasons: string[] } {
  if (!profile && learned.length === 0) return { score: 0, reasons: [] };

  const weights = {
    location: profile?.location_weight ?? 25,
    price: profile?.price_weight ?? 25,
    type: profile?.type_weight ?? 20,
    size: profile?.size_weight ?? 15,
    features: profile?.features_weight ?? 15,
  };
  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0) || 100;

  let totalScore = 0;
  const reasons: string[] = [];

  // --- Location ---
  const prefLocations = profile?.preferred_locations ?? [];
  const learnedLocations = learned
    .filter(l => l.pattern_type === 'location' && (l.confidence_score ?? 0) > 0.3)
    .map(l => String(l.pattern_value ?? l.pattern_key).toLowerCase());
  const allLocations = [...prefLocations.map(l => l.toLowerCase()), ...learnedLocations];

  if (allLocations.length > 0) {
    const propCity = (property.city || '').toLowerCase();
    const propLoc = (property.location || '').toLowerCase();
    const locMatch = allLocations.some(l => propCity.includes(l) || propLoc.includes(l) || l.includes(propCity));
    if (locMatch) {
      totalScore += weights.location;
      reasons.push(`In your preferred area: ${property.city || property.location}`);
    }
  } else {
    totalScore += weights.location * 0.5; // neutral
  }

  // --- Price ---
  const minBudget = profile?.min_budget ?? 0;
  const maxBudget = profile?.max_budget ?? Infinity;
  const learnedBudget = learned.find(l => l.pattern_type === 'budget');
  const effectiveMax = maxBudget === Infinity && learnedBudget
    ? Number((learnedBudget.pattern_value as any)?.max ?? Infinity)
    : maxBudget;
  const effectiveMin = minBudget === 0 && learnedBudget
    ? Number((learnedBudget.pattern_value as any)?.min ?? 0)
    : minBudget;

  if (property.price != null) {
    if (property.price >= effectiveMin && property.price <= effectiveMax) {
      totalScore += weights.price;
      reasons.push('Within your budget range');
    } else if (property.price < effectiveMin * 0.8 || property.price > effectiveMax * 1.2) {
      // way off
    } else {
      totalScore += weights.price * 0.5;
    }
  } else {
    totalScore += weights.price * 0.5;
  }

  // --- Type ---
  const prefTypes = (profile?.preferred_property_types ?? []).map(t => t.toLowerCase());
  const learnedTypes = learned
    .filter(l => l.pattern_type === 'property_type' && (l.confidence_score ?? 0) > 0.3)
    .map(l => String(l.pattern_value ?? l.pattern_key).toLowerCase());
  const allTypes = [...prefTypes, ...learnedTypes];

  if (allTypes.length > 0) {
    if (allTypes.includes(property.property_type.toLowerCase())) {
      totalScore += weights.type;
      reasons.push(`Matches your preferred type: ${property.property_type}`);
    }
  } else {
    totalScore += weights.type * 0.5;
  }

  // --- Size (bedrooms) ---
  const minBed = profile?.min_bedrooms ?? 0;
  const maxBed = profile?.max_bedrooms ?? Infinity;
  if (property.bedrooms != null) {
    if (property.bedrooms >= minBed && property.bedrooms <= maxBed) {
      totalScore += weights.size;
    } else {
      totalScore += weights.size * 0.3;
    }
  } else {
    totalScore += weights.size * 0.5;
  }

  // --- Features ---
  const mustHaves = (profile?.must_have_features ?? []).map(f => f.toLowerCase());
  const dealBreakers = (profile?.deal_breakers ?? []).map(f => f.toLowerCase());
  const propFeatures = extractFeatures(property);

  if (dealBreakers.some(d => propFeatures.includes(d))) {
    return { score: 0, reasons: ['Contains a deal-breaker feature'] };
  }

  if (mustHaves.length > 0) {
    const matched = mustHaves.filter(m => propFeatures.includes(m)).length;
    totalScore += weights.features * (matched / mustHaves.length);
    if (matched > 0) reasons.push(`Has ${matched}/${mustHaves.length} must-have features`);
  } else {
    totalScore += weights.features * 0.5;
  }

  const score = Math.round((totalScore / totalWeight) * 100);
  return { score, reasons };
}

function extractFeatures(property: NewProperty): string[] {
  const features: string[] = [];
  if (property.has_pool) features.push('pool');
  if (property.property_features && typeof property.property_features === 'object') {
    const pf = property.property_features as Record<string, unknown>;
    Object.entries(pf).forEach(([key, val]) => {
      if (val === true || val === 'true') features.push(key.toLowerCase());
    });
  }
  return features;
}

export const useNewListingMatcher = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileRef = useRef<UserPreferenceProfile | null>(null);
  const learnedRef = useRef<LearnedPref[]>([]);

  // Load preferences once and refresh periodically
  const loadPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const [{ data: profile }, { data: learned }] = await Promise.all([
        supabase
          .from('user_preference_profiles')
          .select('preferred_locations, preferred_property_types, min_budget, max_budget, min_bedrooms, max_bedrooms, must_have_features, deal_breakers, location_weight, price_weight, size_weight, type_weight, features_weight')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('learned_preferences')
          .select('pattern_type, pattern_key, pattern_value, confidence_score')
          .eq('user_id', user.id)
          .gte('confidence_score', 0.3)
          .order('confidence_score', { ascending: false })
          .limit(50),
      ]);
      profileRef.current = profile as UserPreferenceProfile | null;
      learnedRef.current = (learned ?? []) as LearnedPref[];
    } catch (err) {
      console.error('[NewListingMatcher] Failed to load preferences:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadPreferences();

    // Refresh preferences every 5 minutes
    const refreshInterval = setInterval(loadPreferences, 5 * 60 * 1000);

    // Subscribe to new property listings
    const channel = supabase
      .channel('new-listings-matcher')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'properties',
        },
        async (payload) => {
          const property = payload.new as NewProperty;

          // Skip non-active / draft listings
          if (property.status && property.status !== 'active') return;

          // Don't notify for own listings
          if ((payload.new as any).owner_id === user.id) return;

          // Must have preferences loaded
          if (!profileRef.current && learnedRef.current.length === 0) return;

          const { score, reasons } = scorePropertyMatch(
            property,
            profileRef.current,
            learnedRef.current
          );

          // Only notify for ≥60% match
          if (score < 60) return;

          const matchLabel = score >= 80 ? '🏠 Strong Match' : '🔍 Good Match';
          const primaryReason = reasons[0] || 'Matches your preferences';
          const image = property.images?.[0] || property.image_urls?.[0] || null;

          // Insert in-app notification
          try {
            await supabase.from('in_app_notifications').insert({
              user_id: user.id,
              type: 'new_match',
              title: `${matchLabel}: ${property.title}`,
              message: `${score}% match — ${primaryReason}`,
              property_id: property.id,
              metadata: { match_score: score, reasons },
            });
          } catch (err) {
            console.error('[NewListingMatcher] Failed to insert notification:', err);
          }

          // Show toast immediately
          toast(`${matchLabel}: ${property.title}`, {
            description: `${score}% match — ${primaryReason}`,
            icon: score >= 80 ? '🏠' : '🔍',
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = `/properties/${property.id}`;
              },
            },
          });

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${matchLabel}: ${property.title}`, {
              body: `${score}% match — ${primaryReason}`,
              icon: image || '/favicon.ico',
            });
          }

          // Invalidate recommendation queries so homepage updates
          queryClient.invalidateQueries({ queryKey: ['smart-recommendations'] });
          queryClient.invalidateQueries({ queryKey: ['property-alerts'] });
        }
      )
      .subscribe();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [user, loadPreferences, queryClient]);
};
