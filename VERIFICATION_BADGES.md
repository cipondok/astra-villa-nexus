# Property Owner/Agent Verification Badges

This document explains how to display verification badges for property owners, agents, and agencies.

## Overview

The application now supports displaying verification badges on property cards to indicate:
- **Verified Owner** - Individual property owners with verified identity
- **Verified Agent** - Real estate agents with verified profiles
- **Verified Agency** - Real estate agencies with verified business profiles

## Components

### VerificationBadge Component

Location: `src/components/ui/VerificationBadge.tsx`

```tsx
<VerificationBadge 
  type="owner" | "agent" | "agency"
  verified={true}
  size="sm" | "md" | "lg"
/>
```

### Property Card Components

The following components now support verification badges:
- `CompactPropertyCard` - Shows badges on property image (bottom-left)
- `PropertyCard` - Shows badges on property image (bottom-left)

## Data Structure

Properties need the following fields to display verification badges:

```typescript
interface Property {
  // ... other fields
  owner_type?: 'individual' | 'agent' | 'agency';
  owner_verified?: boolean;    // For individual owners
  agent_verified?: boolean;     // For agents
  agency_verified?: boolean;    // For agencies
}
```

## Database Schema

The verification status comes from:

### For Individual Owners (`owner_type = 'individual'`)
- Table: `user_verification`
- Field: `identity_verified` (boolean)
- Also checks: `email_verified`, `phone_verified`

### For Agents (`owner_type = 'agent'`)
- Table: `vendor_profiles`
- Field: `is_verified` (boolean)
- Also checks: `ktp_verified`, `npwp_verified`

### For Agencies (`owner_type = 'agency'`)
- Table: `vendor_profiles`
- Field: `is_verified` (boolean)
- Also checks: `ktp_verified`, `npwp_verified`, `siup_verified`

## Fetching Properties with Verification Data

Use the helper function in `src/utils/propertyQueries.ts`:

```typescript
import { fetchPropertiesWithVerification } from '@/utils/propertyQueries';

const properties = await fetchPropertiesWithVerification({
  limit: 10,
  status: 'active',
  approval_status: 'approved',
  listing_type: 'sale'  // optional
});
```

This function automatically joins the necessary tables and adds the verification flags.

## Using in React Components

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchPropertiesWithVerification } from '@/utils/propertyQueries';
import CompactPropertyCard from '@/components/property/CompactPropertyCard';

function PropertyList() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-verified'],
    queryFn: () => fetchPropertiesWithVerification({ limit: 20 })
  });

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <CompactPropertyCard
          key={property.id}
          property={property}
          language="en"
        />
      ))}
    </div>
  );
}
```

## Styling

Verification badges use a blue gradient background:
- `from-blue-500 to-blue-600` (light mode)
- White text
- Shadow and backdrop blur for visibility
- Responsive sizing (sm/md/lg)

## Icons

- **Owner**: `ShieldCheck` - Represents identity verification
- **Agent**: `UserCheck` - Represents professional verification
- **Agency**: `Building2` - Represents business verification

## Display Logic

Badges only show when:
1. The `owner_type` matches the badge type
2. The corresponding `*_verified` flag is `true`
3. The property card is rendered in a context that includes verification data

## Migration Path

If your existing property queries don't include verification data:

1. Update your Supabase queries to use the `fetchPropertiesWithVerification` helper
2. Or manually add the joins to your existing queries:

```typescript
const { data } = await supabase
  .from('properties')
  .select(`
    *,
    owner_verification:user_verification!inner(identity_verified),
    vendor_profile:vendor_profiles(is_verified)
  `);
```

3. Transform the data to include `owner_verified`, `agent_verified`, `agency_verified` flags

## Testing

To test verification badges:

1. Create a property with `owner_type = 'individual'`
2. Ensure the owner has a record in `user_verification` with `identity_verified = true`
3. The property card should display the "Verified Owner" badge

## Future Enhancements

Potential improvements:
- Tooltip showing verification date
- Different verification levels (basic, premium, elite)
- Agency rating display
- Click to view verification details
- Verification expiry warnings
