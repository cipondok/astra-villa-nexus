

## Add Email/Push Notification Alerts for Listing Subscriptions

### Current State
- **Database tables exist**: `user_searches`, `push_subscriptions`, `search_notifications` -- all with RLS
- **Edge function exists**: `check-search-notifications` checks for new matches and price drops, but only sends push notifications (not email)
- **Push subscription logic exists**: In `StickySearchPanel.tsx` (toggle per saved search, VAPID-based push)
- **Email service exists**: `send-email` edge function with template support

### What's Missing
1. The `check-search-notifications` edge function doesn't send email alerts
2. No "Subscribe to alerts" UI on listing pages (`PropertyListingPage.tsx`)
3. No user-facing frequency preference (instant vs daily digest)

### Plan

#### 1. Update `check-search-notifications` Edge Function
- After finding new matches or price drops, also send email notifications via the existing `send-email` function
- Look up user email from `auth.users` using the service role key
- Send a summary email with property titles, prices, and links
- Add a `notification_channel` preference check (email, push, or both) from user preferences

#### 2. Create `src/components/search/SearchAlertSubscribeButton.tsx`
A compact, reusable button/card component for listing pages:
- Shows a bell icon with "Get Alerts" label
- On click (if logged in): saves current filters as a `user_search` entry + creates a `push_subscription` record
- Lets user pick notification channel: Email, Push, or Both
- Shows confirmation toast on success
- If already subscribed with current filters, shows "Subscribed" state with option to unsubscribe
- Requires authentication -- shows sign-in prompt if not logged in

#### 3. Integrate into `PropertyListingPage.tsx`
- Add the `SearchAlertSubscribeButton` in the sticky header area, next to the view mode toggle and filter button
- Pass current active filters (property type, price range, location, listing type, bedrooms) to the component
- Button updates reactively when filters change

#### 4. Add `email_enabled` column to `push_subscriptions` table
- Migration to add `email_enabled BOOLEAN DEFAULT true` column
- The edge function checks this flag before sending emails

### Technical Details

**SearchAlertSubscribeButton flow:**
```
User clicks "Get Alerts"
  -> Check auth (prompt sign-in if needed)
  -> Show channel picker popover (Email / Push / Both)
  -> Save to user_searches with current filters
  -> Create push_subscription record with email_enabled flag
  -> Show success toast
```

**Edge function email integration (in check-search-notifications):**
```
For each subscription with new matches:
  1. Send push notification (existing)
  2. If email_enabled:
     - Look up user email via auth.admin.getUserById()
     - Invoke send-email with template containing:
       - Search name
       - Number of new matches
       - Top 3 property previews (title, price, location, image)
       - "View All" link to the listing page with filters
```

**Files to create:**
- `src/components/search/SearchAlertSubscribeButton.tsx`

**Files to modify:**
- `supabase/functions/check-search-notifications/index.ts` -- add email sending
- `src/pages/PropertyListingPage.tsx` -- add subscribe button to header

**Database migration:**
- Add `email_enabled` boolean column to `push_subscriptions`
