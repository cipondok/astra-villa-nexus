import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

type Action = 'create_topup' | 'get_wallet' | 'get_transactions' | 'webhook' | 'lock_escrow' | 'release_escrow' | 'request_payout';

const log = (step: string, details?: unknown) => {
  console.log(`[WALLET-TOPUP] ${step}`, details ? JSON.stringify(details) : '');
};

function midtransAuth() {
  if (!MIDTRANS_SERVER_KEY) throw new Error("MIDTRANS_SERVER_KEY not configured — contact admin to add payment gateway keys");
  return `Basic ${btoa(`${MIDTRANS_SERVER_KEY}:`)}`;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

async function getUserId(req: Request, supabase: any): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error("Authentication required");
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Invalid authentication token");
  return user.id;
}

async function ensureWallet(supabase: any, userId: string, currency = 'IDR') {
  const { data } = await supabase.rpc('get_or_create_wallet', { p_user_id: userId, p_currency: currency });
  if (!data) throw new Error("Failed to create wallet");

  const { data: wallet, error } = await supabase
    .from('wallet_accounts')
    .select('*')
    .eq('id', data)
    .single();
  if (error) throw error;
  return wallet;
}

// ─── CREATE TOPUP SESSION ───
// FX conversion helper — fetches rate from Frankfurter API
async function convertToIDR(amount: number, fromCurrency: string, supabase: any): Promise<{ idrAmount: number; fxRate: number; source: string }> {
  if (fromCurrency === 'IDR') return { idrAmount: amount, fxRate: 1, source: 'none' };

  // Check cached rate from DB (today)
  const today = new Date().toISOString().slice(0, 10);
  const { data: cached } = await supabase
    .from('daily_fx_snapshots')
    .select('rate')
    .eq('target_currency', fromCurrency)
    .eq('snapshot_date', today)
    .single();

  if (cached?.rate) {
    const fxRate = 1 / cached.rate; // rate is stored as IDR per 1 foreign
    return { idrAmount: Math.round(amount * cached.rate), fxRate: cached.rate, source: 'cached' };
  }

  // Fetch live rate
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=IDR`);
    const data = await res.json();
    const rate = data?.rates?.IDR;
    if (rate) {
      // Store snapshot
      await supabase.from('daily_fx_snapshots').upsert({
        base_currency: 'IDR',
        target_currency: fromCurrency,
        rate: rate,
        inverse_rate: 1 / rate,
        snapshot_date: today,
        source: 'frankfurter',
      }, { onConflict: 'base_currency,target_currency,snapshot_date' });
      return { idrAmount: Math.round(amount * rate), fxRate: rate, source: 'live' };
    }
  } catch (err) {
    log("FX fetch failed", { fromCurrency, error: String(err) });
  }

  // Fallback rates
  const fallbacks: Record<string, number> = { USD: 16200, SGD: 11900, AUD: 10500, EUR: 17500, GBP: 20500 };
  const fallbackRate = fallbacks[fromCurrency] || 16000;
  return { idrAmount: Math.round(amount * fallbackRate), fxRate: fallbackRate, source: 'fallback' };
}

async function createTopup(params: Record<string, any>, supabase: any, userId: string) {
  const { amount, currency = 'IDR', deposit_currency, payment_type } = params;
  const sourceCurrency = deposit_currency || currency;
  
  // Convert foreign currency to IDR
  const { idrAmount, fxRate, source: fxSource } = await convertToIDR(amount, sourceCurrency, supabase);
  
  if (idrAmount < 10000) throw new Error("Minimum deposit equivalent is Rp 10,000");
  if (idrAmount > 500000000) throw new Error("Maximum single deposit equivalent is Rp 500,000,000");

  // Always store wallet in IDR
  const wallet = await ensureWallet(supabase, userId, 'IDR');
  const orderId = `TOPUP-${userId.slice(0, 8)}-${Date.now()}`;

  // Create pending ledger entry with FX info
  const { data: ledgerEntry, error: ledgerErr } = await supabase
    .from('wallet_transaction_ledger')
    .insert({
      wallet_id: wallet.id,
      user_id: userId,
      transaction_type: 'deposit',
      amount: idrAmount,
      currency: 'IDR',
      original_currency: sourceCurrency !== 'IDR' ? sourceCurrency : null,
      original_amount: sourceCurrency !== 'IDR' ? amount : null,
      fx_rate_used: sourceCurrency !== 'IDR' ? fxRate : null,
      fx_source: sourceCurrency !== 'IDR' ? fxSource : null,
      external_payment_ref: orderId,
      status: 'pending',
      description: sourceCurrency !== 'IDR'
        ? `Wallet top-up: ${sourceCurrency} ${amount} → IDR ${idrAmount} (rate: ${fxRate})`
        : `Wallet top-up via ${payment_type || 'snap'}`,
    })
    .select()
    .single();
  if (ledgerErr) throw ledgerErr;

  // Get user profile for customer details
  const { data: profile } = await supabase.from('profiles').select('full_name, email, phone').eq('id', userId).single();

  // Create Midtrans Snap session
  const snapPayload: Record<string, any> = {
    transaction_details: { order_id: orderId, gross_amount: Math.round(amount) },
    customer_details: {
      first_name: profile?.full_name?.split(' ')[0] || 'Investor',
      last_name: profile?.full_name?.split(' ').slice(1).join(' ') || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    },
    item_details: [{
      id: 'wallet-topup',
      price: Math.round(amount),
      quantity: 1,
      name: 'ASTRA Wallet Top-Up',
    }],
  };

  if (payment_type) {
    const typeMap: Record<string, () => void> = {
      gopay: () => { snapPayload.payment_type = "gopay"; snapPayload.gopay = { enable_callback: true }; },
      qris: () => { snapPayload.payment_type = "qris"; },
      bank_transfer_bca: () => { snapPayload.payment_type = "bank_transfer"; snapPayload.bank_transfer = { bank: "bca" }; },
      bank_transfer_bni: () => { snapPayload.payment_type = "bank_transfer"; snapPayload.bank_transfer = { bank: "bni" }; },
      bank_transfer_bri: () => { snapPayload.payment_type = "bank_transfer"; snapPayload.bank_transfer = { bank: "bri" }; },
      bank_transfer_mandiri: () => {
        snapPayload.payment_type = "echannel";
        snapPayload.echannel = { bill_info1: "Wallet TopUp", bill_info2: orderId };
      },
    };
    if (typeMap[payment_type]) typeMap[payment_type]();
  }

  const res = await fetch(MIDTRANS_SNAP_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: midtransAuth() },
    body: JSON.stringify(snapPayload),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error_messages?.join(", ") || "Failed to create payment session");

  // Update ledger with payment reference
  await supabase.from('wallet_transaction_ledger')
    .update({ metadata: { snap_token: result.token, redirect_url: result.redirect_url } })
    .eq('id', ledgerEntry.id);

  return {
    success: true,
    order_id: orderId,
    snap_token: result.token,
    redirect_url: result.redirect_url,
    amount,
    ledger_id: ledgerEntry.id,
  };
}

// ─── GET WALLET ───
async function getWallet(supabase: any, userId: string) {
  const wallet = await ensureWallet(supabase, userId);
  return { success: true, wallet };
}

// ─── GET TRANSACTIONS ───
async function getTransactions(params: Record<string, any>, supabase: any, userId: string) {
  const { limit = 20, offset = 0 } = params;
  const { data, error, count } = await supabase
    .from('wallet_transaction_ledger')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { success: true, transactions: data || [], total: count || 0 };
}

// ─── WEBHOOK HANDLER ───
async function handleWebhook(params: Record<string, any>, supabase: any) {
  const { order_id, transaction_status, fraud_status, gross_amount, signature_key, status_code, payment_type } = params;
  if (!order_id) throw new Error("Missing order_id in webhook");

  // Check for duplicate webhook
  const webhookEventId = `${order_id}-${transaction_status}-${Date.now()}`;
  const { error: dupErr } = await supabase.from('payment_webhook_logs').insert({
    webhook_event_id: webhookEventId,
    provider: 'midtrans',
    event_type: transaction_status,
    payload: params,
  });
  // If duplicate, return success silently
  if (dupErr?.code === '23505') {
    return { success: true, message: 'Duplicate webhook ignored' };
  }

  // Only process wallet topup orders
  if (!order_id.startsWith('TOPUP-')) {
    return { success: true, message: 'Not a wallet topup order' };
  }

  // Verify signature if server key available
  if (MIDTRANS_SERVER_KEY && signature_key) {
    const crypto = globalThis.crypto;
    const data = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-512', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedSig = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (computedSig !== signature_key) {
      log("Signature mismatch", { order_id });
      throw new Error("Invalid webhook signature");
    }
  }

  // Map status
  const isSuccess = (transaction_status === 'settlement' || transaction_status === 'capture') && fraud_status !== 'deny';
  const isFailed = ['deny', 'cancel', 'expire'].includes(transaction_status);

  if (isSuccess) {
    // Find the pending ledger entry
    const { data: ledger } = await supabase
      .from('wallet_transaction_ledger')
      .select('*, wallet_accounts!inner(id, user_id, available_balance)')
      .eq('external_payment_ref', order_id)
      .eq('status', 'pending')
      .single();

    if (ledger) {
      const newBalance = Number(ledger.wallet_accounts.available_balance) + Number(ledger.amount);

      // Update wallet balance
      await supabase.from('wallet_accounts')
        .update({ available_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', ledger.wallet_id);

      // Confirm ledger entry
      await supabase.from('wallet_transaction_ledger')
        .update({
          status: 'confirmed',
          metadata: { ...ledger.metadata, payment_type, confirmed_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        })
        .eq('id', ledger.id);

      log("Wallet funded", { order_id, amount: ledger.amount, new_balance: newBalance });
    }
  } else if (isFailed) {
    await supabase.from('wallet_transaction_ledger')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('external_payment_ref', order_id)
      .eq('status', 'pending');
  }

  return { success: true, status: isSuccess ? 'confirmed' : isFailed ? 'failed' : 'pending' };
}

// ─── LOCK ESCROW ───
async function lockEscrow(params: Record<string, any>, supabase: any, userId: string) {
  const { amount, deal_id, property_id, currency = 'IDR' } = params;
  if (!amount || amount <= 0) throw new Error("Invalid escrow amount");

  const wallet = await ensureWallet(supabase, userId, currency);
  if (Number(wallet.available_balance) < amount) {
    throw new Error(`Insufficient balance. Available: ${wallet.available_balance}, Required: ${amount}`);
  }

  // Atomically move funds
  const newAvailable = Number(wallet.available_balance) - amount;
  const newLocked = Number(wallet.locked_balance) + amount;

  await supabase.from('wallet_accounts')
    .update({ available_balance: newAvailable, locked_balance: newLocked, updated_at: new Date().toISOString() })
    .eq('id', wallet.id);

  const { data: entry } = await supabase.from('wallet_transaction_ledger')
    .insert({
      wallet_id: wallet.id,
      user_id: userId,
      transaction_type: 'escrow_lock',
      amount,
      currency,
      status: 'confirmed',
      description: `Escrow lock for deal ${deal_id || 'N/A'}`,
      metadata: { deal_id, property_id },
    })
    .select()
    .single();

  return { success: true, locked_amount: amount, new_available: newAvailable, ledger_id: entry?.id };
}

// ─── RELEASE ESCROW ───
async function releaseEscrow(params: Record<string, any>, supabase: any, userId: string) {
  const { amount, deal_id, release_to_user_id, currency = 'IDR' } = params;
  if (!amount || amount <= 0) throw new Error("Invalid release amount");

  const wallet = await ensureWallet(supabase, userId, currency);
  if (Number(wallet.locked_balance) < amount) {
    throw new Error("Insufficient locked balance for release");
  }

  // Reduce locked balance
  await supabase.from('wallet_accounts')
    .update({
      locked_balance: Number(wallet.locked_balance) - amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', wallet.id);

  // Log release
  await supabase.from('wallet_transaction_ledger').insert({
    wallet_id: wallet.id,
    user_id: userId,
    transaction_type: 'escrow_release',
    amount,
    currency,
    status: 'confirmed',
    description: `Escrow release for deal ${deal_id || 'N/A'}`,
    metadata: { deal_id, release_to_user_id },
  });

  // If releasing to another user, credit their wallet
  if (release_to_user_id) {
    const sellerWallet = await ensureWallet(supabase, release_to_user_id, currency);
    await supabase.from('wallet_accounts')
      .update({
        available_balance: Number(sellerWallet.available_balance) + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerWallet.id);

    await supabase.from('wallet_transaction_ledger').insert({
      wallet_id: sellerWallet.id,
      user_id: release_to_user_id,
      transaction_type: 'deposit',
      amount,
      currency,
      status: 'confirmed',
      description: `Escrow payout from deal ${deal_id || 'N/A'}`,
      metadata: { deal_id, from_user_id: userId },
    });
  }

  return { success: true, released_amount: amount };
}

// ─── REQUEST PAYOUT ───
async function requestPayout(params: Record<string, any>, supabase: any, userId: string) {
  const { amount, payout_method, payout_details, currency = 'IDR' } = params;
  if (!amount || amount < 50000) throw new Error("Minimum payout is Rp 50,000");
  if (!payout_method) throw new Error("Payout method required");

  const wallet = await ensureWallet(supabase, userId, currency);
  if (Number(wallet.available_balance) < amount) {
    throw new Error("Insufficient balance for payout");
  }

  // Lock the payout amount
  await supabase.from('wallet_accounts')
    .update({
      available_balance: Number(wallet.available_balance) - amount,
      locked_balance: Number(wallet.locked_balance) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', wallet.id);

  // Create payout request
  const { data: payout } = await supabase.from('payout_requests').insert({
    user_id: userId,
    amount,
    currency,
    payout_method,
    payout_details: payout_details || {},
    status: 'pending',
  }).select().single();

  // Create ledger entry
  await supabase.from('wallet_transaction_ledger').insert({
    wallet_id: wallet.id,
    user_id: userId,
    transaction_type: 'withdrawal',
    amount,
    currency,
    status: 'pending',
    description: `Withdrawal via ${payout_method}`,
    metadata: { payout_request_id: payout?.id },
  });

  return { success: true, payout_id: payout?.id, amount };
}

// ─── MAIN HANDLER ───
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { action, ...params } = body as { action: Action } & Record<string, any>;
    log("Invoked", { action });

    let result: Record<string, unknown>;

    // Webhook doesn't require auth
    if (action === 'webhook') {
      result = await handleWebhook(params, supabase);
    } else {
      const userId = await getUserId(req, supabase);
      
      switch (action) {
        case 'create_topup':
          result = await createTopup(params, supabase, userId);
          break;
        case 'get_wallet':
          result = await getWallet(supabase, userId);
          break;
        case 'get_transactions':
          result = await getTransactions(params, supabase, userId);
          break;
        case 'lock_escrow':
          result = await lockEscrow(params, supabase, userId);
          break;
        case 'release_escrow':
          result = await releaseEscrow(params, supabase, userId);
          break;
        case 'request_payout':
          result = await requestPayout(params, supabase, userId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
