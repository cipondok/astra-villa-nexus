

## Premium Membership System Revamp

### Current State
The app already has a membership system with 6 tiers (basic → diamond), a `user_levels` table in Supabase, pricing cards on `/membership`, and an upgrade flow dialog. The existing tiers are identity-based (basic, verified, vip, gold, platinum, diamond).

### What's Changing
Reframe the membership around **role-based premium tiers** that match the user's request:

| New Tier | Maps To | Monthly Price | Key Benefits |
|----------|---------|--------------|--------------|
| **Free** | basic | Rp 0 | Browse, save favorites, basic search |
| **Pro Agent** | verified/vip | Rp 199,000 | More listing exposure, priority placement, agent badge |
| **Developer** | gold/platinum | Rp 499,000 | AI analytics, bulk listings, project showcase, SEO tools |
| **VIP Investor** | diamond | Rp 999,000 | Homepage spotlight, 3D featured badge, concierge, first access |

### Implementation Plan

**1. Update membership types** (`src/types/membership.ts`)
- Rename `MembershipLevel` values to `'free' | 'pro_agent' | 'developer' | 'vip_investor'`
- Update `MEMBERSHIP_LEVELS` config with new labels, icons, colors, and benefit lists tailored to each role
- Update `getMembershipFromUserLevel()` mapping function
- Keep backward compatibility by mapping old level names in the function

**2. Update MembershipPage** (`src/pages/MembershipPage.tsx`)
- Redesign to show 4 clear tiers instead of 6
- Add a comparison table showing features across tiers (listing exposure multiplier, AI analytics access, homepage spotlight, 3D badge)
- Update `TIER_PRICING` to reflect new pricing
- Add annual discount display (save 17%)
- Add recurring billing context ("Recurring income model")

**3. Update MembershipUpgradeFlow** (`src/components/membership/MembershipUpgradeFlow.tsx`)
- Update `UPGRADE_REQUIREMENTS` for new 4 tiers
- Simplify step flows per tier

**4. Update useUserMembership hook** (`src/hooks/useUserMembership.ts`)
- Map existing `user_levels` names to new tier names
- Keep backward compatibility

**5. Update all badge/display components**
- `UserMembershipBadge`, `VIPUpgradePrompt`, `VIPFeatureGate`, `TierFeatureBanner` — update references to new tier names and configs

**6. Database migration**
- Add new rows to `user_levels` table for `Pro Agent`, `Developer`, `VIP Investor` with appropriate limits
- Update existing level descriptions and privileges

**7. New benefit components**
- Create `MembershipBenefitComparison.tsx` — a feature comparison grid
- Add visual indicators for: listing exposure multiplier, AI analytics toggle, homepage spotlight badge, 3D featured badge availability

### Technical Notes
- The `user_levels` table schema stays the same — we just add/update rows via the insert tool
- The `privileges` JSON column on `user_levels` can store feature flags like `{ ai_analytics: true, homepage_spotlight: true, 3d_badge: true }`
- All components referencing `MembershipLevel` type will need updates
- Stripe integration can be added later for actual recurring billing

