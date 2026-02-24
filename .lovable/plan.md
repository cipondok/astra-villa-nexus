

## Social Sharing and Referral System

### Overview
Build a social sharing feature for property listings and comparison results, plus a referral rewards system that leverages the existing `affiliates`, `referrals`, and `referral_tracking` tables.

### What Already Exists
- `affiliates` table with referral codes, earnings tracking
- `referrals` table linking affiliates to referred users
- `referral_tracking` table with UTM params, share channels, click counts
- `referral_campaigns` table for campaign management
- `AffiliatePanel` component with join/copy link functionality

### Implementation Plan

#### 1. Share Property Button Component
Create `src/components/property/SharePropertyButton.tsx` -- a dropdown button with share options:
- **Copy Link**: Copies property URL with the user's referral code appended (e.g., `/?ref=CODE&property=ID`)
- **WhatsApp**: Opens WhatsApp share with property title, price, and link
- **Facebook**: Opens Facebook share dialog
- **Twitter/X**: Opens tweet compose with property details
- **Telegram**: Opens Telegram share

The button uses the Web Share API as a fallback on mobile devices. If the user is logged in and has an affiliate record, all links automatically include their referral code.

#### 2. Share Comparison Results
Create `src/components/property/ShareComparisonButton.tsx` -- generates a shareable URL for the current comparison set (encodes property IDs in query params). Same social channels as above.

#### 3. Referral Landing Logic
Create `src/hooks/useReferralTracking.ts`:
- On app load, check URL for `ref` query parameter
- Store the referral code in `localStorage`
- Insert/update a row in `referral_tracking` with `share_channel`, UTM params, and increment `click_count`
- On user signup, link the new user to the referrer by inserting into `referrals` table and updating affiliate stats

#### 4. Database Migration
Create a new migration to add:
- A `property_shares` table to track individual share events (user_id, property_id, channel, shared_at) for analytics
- A trigger function `process_referral_signup` that fires when a new row is inserted into `referrals`, automatically incrementing the affiliate's `total_referrals` count

#### 5. Integration Points
- Add `SharePropertyButton` to `PropertyDetailModal`, `CompactPropertyCard`, and `PropertyCard` components
- Add `ShareComparisonButton` to the property comparison view
- Mount `useReferralTracking` in `App.tsx` to capture referral clicks on page load
- Add a "Referrals" tab to the user dashboard showing share stats, click counts, and conversion tracking from `referral_tracking`

#### 6. Referral Dashboard Tab
Create `src/components/dashboard/tabs/ReferralDashboardTab.tsx`:
- Shows the user's referral code and copy button
- Displays stats: total shares, clicks, sign-ups, rewards earned
- Lists recent referral activity from `referral_tracking`

### Technical Details

**Share URL format**: `https://astra-villa-realty.lovable.app/property/{id}?ref={code}&utm_source={channel}`

**Web Share API fallback**:
```typescript
if (navigator.share) {
  await navigator.share({ title, text, url });
} else {
  // Show dropdown with manual share options
}
```

**Tables touched**: `affiliates` (read), `referral_tracking` (insert/update), `referrals` (insert on signup), new `property_shares` (insert on share)

**RLS policies**: 
- `property_shares`: Users can insert their own rows, select their own rows
- Existing tables already have appropriate policies

### Files to Create
- `src/components/property/SharePropertyButton.tsx`
- `src/components/property/ShareComparisonButton.tsx`
- `src/hooks/useReferralTracking.ts`
- `src/components/dashboard/tabs/ReferralDashboardTab.tsx`
- Migration SQL for `property_shares` table and signup trigger

### Files to Edit
- `src/components/property/PropertyDetailModal.tsx` -- add share button
- `src/components/property/CompactPropertyCard.tsx` -- add share button
- `src/components/property/PropertyCard.tsx` -- add share button
- `src/App.tsx` -- mount referral tracking hook
- `src/pages/UserDashboardPage.tsx` -- add Referrals tab

