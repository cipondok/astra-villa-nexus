
# Vercel Deployment Environment Variables Checklist

## Required Environment Variables for Web3/Supabase Integration

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)

### Web3/Wallet Configuration
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID from Cloud
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key for RPC connections (optional)
- `NEXT_PUBLIC_INFURA_PROJECT_ID` - Infura project ID for RPC connections (optional)

### Smart Contract Addresses
- `NEXT_PUBLIC_ASTRA_TOKEN_ADDRESS` - ASTRA token contract address on BSC
- `NEXT_PUBLIC_RENTAL_CONTRACT_ADDRESS` - Property rental contract address
- `NEXT_PUBLIC_BSC_RPC_URL` - Custom BSC RPC URL (optional, defaults to public)

### Security & API Keys
- `OPENAI_API_KEY` - OpenAI API key for AI features (server-side only)
- `NEXTAUTH_SECRET` - NextAuth secret for session encryption
- `NEXTAUTH_URL` - Your deployment URL

## Deployment Steps

1. **Set Environment Variables in Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add all variables listed above
   - Set appropriate scope (Production, Preview, Development)

2. **Update Supabase Auth Settings:**
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: Add your Vercel domain

3. **Test Web3 Functionality:**
   - Verify wallet connection works
   - Test token balance reading
   - Confirm transaction signing

4. **Verify Database Connections:**
   - Test RLS policies with authenticated users
   - Confirm rent_payments table access
   - Validate wallet_connections table

## Post-Deployment Verification

- [ ] Wallet connection successful
- [ ] Token balance displays correctly
- [ ] Premium content gates work
- [ ] Rent payment flow functional
- [ ] Database queries execute properly
- [ ] Real-time updates working (if enabled)

## Common Issues & Solutions

**Wallet Connection Fails:**
- Check NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set
- Verify project ID is active in WalletConnect Cloud

**Database Access Denied:**
- Confirm RLS policies are correctly configured
- Check user authentication state
- Verify Supabase keys are correct

**Token Balance Not Loading:**
- Ensure ASTRA_TOKEN_ADDRESS is correct
- Check BSC network configuration
- Verify RPC endpoint is responding

**Environment Variable Not Found:**
- Variables must be prefixed with NEXT_PUBLIC_ for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)
