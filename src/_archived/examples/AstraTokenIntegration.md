# ASTRA Token Integration Guide

This guide shows how to integrate ASTRA Token daily check-in and transaction bonuses into user accounts.

## Components Created

### 1. AstraTokenWidget (`src/components/astra/AstraTokenWidget.tsx`)
A flexible widget that can be used in two modes:
- **Compact mode**: For headers/sidebars
- **Full mode**: For dashboards/dedicated spaces

### 2. AstraTokensPage (`src/pages/AstraTokensPage.tsx`)
A dedicated page for managing ASTRA tokens with full functionality.

### 3. useAstraToken Hook (`src/hooks/useAstraToken.ts`)
A comprehensive hook for all ASTRA token operations.

## Integration Examples

### 1. Adding Daily Check-in to User Dashboard

```tsx
import AstraTokenWidget from '@/components/astra/AstraTokenWidget';

const UserDashboard = () => {
  return (
    <div className="dashboard-grid">
      {/* Other dashboard content */}
      
      {/* Add ASTRA Token Widget */}
      <AstraTokenWidget />
    </div>
  );
};
```

### 2. Compact Token Display in Header

```tsx
import AstraTokenWidget from '@/components/astra/AstraTokenWidget';

const Header = () => {
  return (
    <header>
      {/* Other header content */}
      
      {/* Compact ASTRA display */}
      <AstraTokenWidget compact />
    </header>
  );
};
```

### 3. Transaction Bonus Integration

```tsx
import { useTransactionBonus } from '@/components/astra/AstraTokenWidget';
// or
import useAstraToken from '@/hooks/useAstraToken';

const BookingPage = () => {
  const { triggerTransactionBonus } = useAstraToken();
  
  const handlePaymentSuccess = async (amount: number) => {
    // Process payment...
    
    // Award transaction bonus
    const tokensEarned = await triggerTransactionBonus(
      amount, 
      'property_booking',
      `Booking bonus for ${amount} IDR`
    );
    
    console.log(`User earned ${tokensEarned} ASTRA tokens!`);
  };
  
  return (
    // Your booking UI
  );
};
```

### 4. Manual Token Awards (Admin)

```tsx
import useAstraToken from '@/hooks/useAstraToken';

const AdminPanel = () => {
  const { awardTokens } = useAstraToken();
  
  const handleSpecialReward = async () => {
    await awardTokens(100, 'special_event', 'Holiday bonus tokens');
  };
  
  return (
    <button onClick={handleSpecialReward}>
      Award Special Tokens
    </button>
  );
};
```

## ASTRA Token Features

### Daily Check-in System
- ✅ Automatic streak tracking
- ✅ Progressive bonuses (1.5x at 7 days, 2x at 14 days, 3x at 30 days)
- ✅ Visual progress indicators
- ✅ One-click check-in

### Transaction Bonuses
- ✅ Automatic rewards on purchases
- ✅ Configurable reward percentages
- ✅ Support for different transaction types
- ✅ Real-time balance updates

### User Experience
- ✅ Beautiful, responsive design
- ✅ Real-time notifications
- ✅ Token balance tracking
- ✅ Transaction history
- ✅ Referral system

## Database Structure

The system uses these tables:
- `astra_token_balances` - User token balances
- `astra_token_transactions` - Transaction history
- `astra_daily_checkins` - Check-in records
- `astra_reward_config` - Reward configurations

## Edge Function

The `astra-token-hub` edge function handles:
- Token balance management
- Daily check-ins
- Transaction rewards
- Welcome bonuses
- Referral rewards

## Configuration

Admins can configure:
- Daily check-in rewards
- Transaction bonus percentages
- Welcome bonus amounts
- API settings

## Navigation Integration

- ✅ Added to main navigation for authenticated users
- ✅ Mobile-responsive menu item
- ✅ Direct access to ASTRA Token hub

## Usage in Your App

1. **For daily check-in**: Use `AstraTokenWidget` in user dashboards
2. **For transaction bonuses**: Call `triggerTransactionBonus()` after successful payments
3. **For compact display**: Use `AstraTokenWidget` with `compact={true}` prop
4. **For full management**: Direct users to `/astra-tokens` page

The system is now fully integrated and ready to use!
