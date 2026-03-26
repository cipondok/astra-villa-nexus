import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Users, Building2, Handshake, Brain, Wrench, DollarSign,
  ChevronDown, CheckCircle2, Table2, Key, Link2, Shield, Layers,
  ArrowRight, Target, Lock, Eye, Zap, Clock, Circle, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// ─── Types ───────────────────────────────────────────────────────────
type ColType = 'uuid' | 'text' | 'int' | 'numeric' | 'bool' | 'timestamp' | 'jsonb' | 'enum' | 'inet' | 'text[]';
type TableStatus = 'deployed' | 'active' | 'planned';
type PhaseKey = 1 | 2 | 3 | 4 | 5 | 6;

interface Column {
  name: string;
  type: ColType;
  pk?: boolean;
  fk?: string;
  nullable?: boolean;
  default?: string;
  note?: string;
}

interface TableDef {
  name: string;
  description: string;
  status: TableStatus;
  rls: boolean;
  columns: Column[];
  indexes?: string[];
  policies?: string[];
}

interface SchemaPhase {
  phase: PhaseKey;
  name: string;
  subtitle: string;
  goal: string;
  icon: typeof Database;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  tables: TableDef[];
}

// ─── Status Config ───────────────────────────────────────────────────
const STATUS_CFG: Record<TableStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  deployed: { label: 'Deployed', icon: CheckCircle2, className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  active: { label: 'Active', icon: Zap, className: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  planned: { label: 'Planned', icon: Circle, className: 'text-muted-foreground bg-muted/10 border-border/30' },
};

const TYPE_COLORS: Record<ColType, string> = {
  uuid: 'text-violet-400',
  text: 'text-sky-400',
  int: 'text-amber-400',
  numeric: 'text-amber-400',
  bool: 'text-rose-400',
  timestamp: 'text-emerald-400',
  jsonb: 'text-orange-400',
  enum: 'text-pink-400',
  inet: 'text-teal-400',
  'text[]': 'text-sky-400',
};

// ─── Schema Phases ───────────────────────────────────────────────────
const SCHEMA_PHASES: SchemaPhase[] = [
  {
    phase: 1,
    name: 'Core User & Authentication',
    subtitle: 'Build first — foundation for all modules',
    goal: 'Enable login, role routing, session management, and user personalization. All other tables depend on user identity.',
    icon: Users,
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-400/30',
    bgClass: 'bg-emerald-400',
    tables: [
      {
        name: 'profiles',
        description: 'Extended user data linked to auth.users — auto-created on signup via trigger',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, fk: 'auth.users(id)', note: 'ON DELETE CASCADE' },
          { name: 'full_name', type: 'text', nullable: true },
          { name: 'email', type: 'text' },
          { name: 'phone', type: 'text', nullable: true },
          { name: 'avatar_url', type: 'text', nullable: true },
          { name: 'preferred_city', type: 'text', nullable: true },
          { name: 'preferred_language', type: 'text', default: "'id'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_profiles_email ON profiles(email)'],
        policies: ['Users can view own profile (SELECT: auth.uid() = id)', 'Users can update own profile (UPDATE: auth.uid() = id)', 'Public profiles viewable by all (SELECT: true)'],
      },
      {
        name: 'user_roles',
        description: 'Separate role table — NEVER store roles on profiles to prevent privilege escalation',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'role', type: 'enum', note: 'app_role enum: admin, agent, investor, developer, owner, buyer, etc.' },
          { name: 'is_active', type: 'bool', default: 'true' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['UNIQUE(user_id, role)'],
        policies: ['Users can read own roles', 'has_role() SECURITY DEFINER function bypasses RLS'],
      },
      {
        name: 'investor_profiles',
        description: 'Extended investor-specific data for WNA/WNI classification and preferences',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)', note: 'UNIQUE' },
          { name: 'investor_type', type: 'enum', note: "'wna' | 'wni'" },
          { name: 'nationality', type: 'text', nullable: true },
          { name: 'investment_budget_min', type: 'numeric', nullable: true },
          { name: 'investment_budget_max', type: 'numeric', nullable: true },
          { name: 'preferred_property_types', type: 'text[]', nullable: true },
          { name: 'preferred_locations', type: 'text[]', nullable: true },
          { name: 'eligibility_score', type: 'numeric', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Users can CRUD own investor profile'],
      },
      {
        name: 'user_sessions',
        description: 'Session tracking with fingerprinting, heartbeat, and inactivity timeout',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'device_fingerprint', type: 'text', nullable: true },
          { name: 'ip_address', type: 'inet', nullable: true },
          { name: 'last_heartbeat', type: 'timestamp' },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Users can manage own sessions'],
      },
    ],
  },
  {
    phase: 2,
    name: 'Property Marketplace',
    subtitle: 'Core listing, media, and inquiry tables',
    goal: 'Make the marketplace functional with listings, images, search, and basic agent inquiry workflow.',
    icon: Building2,
    accentClass: 'text-sky-400',
    borderClass: 'border-sky-400/30',
    bgClass: 'bg-sky-400',
    tables: [
      {
        name: 'properties',
        description: 'Central property listing table with Indonesian real estate columns (LT, LB, KT, KM)',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'title', type: 'text' },
          { name: 'description', type: 'text', nullable: true },
          { name: 'price', type: 'numeric' },
          { name: 'property_type', type: 'text', note: 'villa, apartment, house, land, commercial' },
          { name: 'listing_type', type: 'text', note: "'sale' | 'rent'" },
          { name: 'city', type: 'text' },
          { name: 'district', type: 'text', nullable: true },
          { name: 'address', type: 'text', nullable: true },
          { name: 'latitude', type: 'numeric', nullable: true },
          { name: 'longitude', type: 'numeric', nullable: true },
          { name: 'land_size', type: 'numeric', nullable: true, note: 'LT (m²)' },
          { name: 'building_size', type: 'numeric', nullable: true, note: 'LB (m²)' },
          { name: 'bedrooms', type: 'int', nullable: true, note: 'KT' },
          { name: 'bathrooms', type: 'int', nullable: true, note: 'KM' },
          { name: 'certificate_type', type: 'text', nullable: true, note: 'SHM, SHGB, AJB, etc.' },
          { name: 'status', type: 'text', default: "'active'", note: 'draft, active, reserved, sold' },
          { name: 'owner_id', type: 'uuid', fk: 'profiles(id)' },
          { name: 'agent_id', type: 'uuid', fk: 'profiles(id)', nullable: true },
          { name: 'views_count', type: 'int', default: '0' },
          { name: 'inquiry_count', type: 'int', default: '0' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_properties_city ON properties(city)', 'idx_properties_type ON properties(property_type)', 'idx_properties_price ON properties(price)', 'idx_properties_status ON properties(status)'],
        policies: ['Public read for active listings (SELECT: status = active)', 'Owners can CRUD own listings', 'Agents can manage assigned listings'],
      },
      {
        name: 'property_images',
        description: 'Property media gallery with ordering and primary image flag',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'image_url', type: 'text' },
          { name: 'display_order', type: 'int', default: '0' },
          { name: 'is_primary', type: 'bool', default: 'false' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Public read', 'Property owners can manage'],
      },
      {
        name: 'property_inquiries',
        description: 'Buyer-to-agent inquiry system with status tracking',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'agent_id', type: 'uuid', fk: 'profiles(id)', nullable: true },
          { name: 'message', type: 'text' },
          { name: 'status', type: 'text', default: "'new'", note: 'new, responded, closed' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Users can create inquiries (INSERT: auth.uid() = user_id)', 'Users/agents can read own inquiries'],
      },
      {
        name: 'saved_properties',
        description: 'User bookmark/save system for quick property access',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['UNIQUE(user_id, property_id)'],
        policies: ['Users can manage own saves'],
      },
    ],
  },
  {
    phase: 3,
    name: 'Transaction & Watchlist',
    subtitle: 'Investor interaction and deal flow',
    goal: 'Enable watchlists, offers, negotiations, and structured deal lifecycle management.',
    icon: Handshake,
    accentClass: 'text-violet-400',
    borderClass: 'border-violet-400/30',
    bgClass: 'bg-violet-400',
    tables: [
      {
        name: 'watchlist_items',
        description: 'Investor property monitoring with custom categories and AI alert triggers',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'category', type: 'text', default: "'general'" },
          { name: 'alert_on_price_drop', type: 'bool', default: 'true' },
          { name: 'alert_on_score_change', type: 'bool', default: 'true' },
          { name: 'notes', type: 'text', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['UNIQUE(user_id, property_id)'],
        policies: ['Users can manage own watchlist'],
      },
      {
        name: 'property_offers',
        description: 'Structured offer lifecycle: Submitted → Reviewing → Counter → Accepted → Completed',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'buyer_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'seller_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'offer_price', type: 'numeric' },
          { name: 'financing_method', type: 'text', note: "'cash' | 'mortgage'" },
          { name: 'status', type: 'text', default: "'submitted'" },
          { name: 'counter_price', type: 'numeric', nullable: true },
          { name: 'expires_at', type: 'timestamp', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Buyers can create offers', 'Buyers/sellers can view & update own offers'],
      },
      {
        name: 'offer_messages',
        description: 'Chat-style negotiation thread attached to each offer',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'offer_id', type: 'uuid', fk: 'property_offers(id)' },
          { name: 'sender_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'message', type: 'text' },
          { name: 'message_type', type: 'text', default: "'text'", note: 'text, counter, accept, reject' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Offer participants can read/write messages'],
      },
      {
        name: 'notifications',
        description: 'Unified notification hub with category filtering and real-time delivery',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'type', type: 'text', note: 'investor, transaction, property, system' },
          { name: 'title', type: 'text' },
          { name: 'message', type: 'text' },
          { name: 'is_read', type: 'bool', default: 'false' },
          { name: 'metadata', type: 'jsonb', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false'],
        policies: ['Users can read own notifications', 'System can insert via service_role'],
      },
    ],
  },
  {
    phase: 4,
    name: 'AI Intelligence Data',
    subtitle: 'Support scoring, prediction, and analytics engines',
    goal: 'Store computed AI scores, price history, and recommendation signals for intelligent investment features.',
    icon: Brain,
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-400/30',
    bgClass: 'bg-amber-400',
    tables: [
      {
        name: 'ai_property_scores',
        description: 'Central AI scoring table — opportunity, demand, valuation, rental yield, luxury index',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)', note: 'UNIQUE' },
          { name: 'opportunity_score', type: 'numeric', note: '0-100 weighted composite' },
          { name: 'demand_score', type: 'numeric' },
          { name: 'valuation_estimate', type: 'numeric', nullable: true },
          { name: 'valuation_gap_pct', type: 'numeric', nullable: true },
          { name: 'rental_yield_score', type: 'numeric', nullable: true },
          { name: 'luxury_index', type: 'numeric', nullable: true },
          { name: 'ai_confidence', type: 'numeric', note: '0-100' },
          { name: 'last_computed', type: 'timestamp', default: 'now()' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_ai_scores_opportunity ON ai_property_scores(opportunity_score DESC)'],
        policies: ['Public read for scores', 'Service role can upsert'],
      },
      {
        name: 'price_history',
        description: 'Historical price tracking for trend analysis and prediction models',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'price', type: 'numeric' },
          { name: 'source', type: 'text', default: "'listing'", note: 'listing, appraisal, market' },
          { name: 'recorded_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_price_history_property ON price_history(property_id, recorded_at DESC)'],
        policies: ['Public read'],
      },
      {
        name: 'ai_investment_recommendations',
        description: 'Tiered recommendations: Strong Buy, Early Growth, Tactical Flip, Long-Term Hold',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'recommendation_tier', type: 'text' },
          { name: 'reasoning', type: 'text' },
          { name: 'confidence', type: 'numeric' },
          { name: 'buy_window_start', type: 'timestamp', nullable: true },
          { name: 'buy_window_end', type: 'timestamp', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Authenticated users can read'],
      },
      {
        name: 'ai_event_signals',
        description: 'Real-time event pipeline — triggers from property changes dispatch AI recalculations',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'signal_type', type: 'text', note: 'price_drop, status_change, demand_spike' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)', nullable: true },
          { name: 'payload', type: 'jsonb' },
          { name: 'status', type: 'text', default: "'pending'" },
          { name: 'claimed_at', type: 'timestamp', nullable: true },
          { name: 'processed_at', type: 'timestamp', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_signals_pending ON ai_event_signals(status) WHERE status = pending'],
        policies: ['Service role only'],
      },
    ],
  },
  {
    phase: 5,
    name: 'Ecosystem Services',
    subtitle: 'Vendor marketplace, legal, and lifecycle',
    goal: 'Expand platform with service providers, legal workflows, and property ownership management tools.',
    icon: Wrench,
    accentClass: 'text-rose-400',
    borderClass: 'border-rose-400/30',
    bgClass: 'bg-rose-400',
    tables: [
      {
        name: 'vendor_services',
        description: '10-category vendor marketplace with admin approval workflow',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'provider_id', type: 'uuid', fk: 'profiles(id)' },
          { name: 'category', type: 'text', note: 'renovation, plumbing, legal, smart_home, etc.' },
          { name: 'service_name', type: 'text' },
          { name: 'description', type: 'text', nullable: true },
          { name: 'service_area', type: 'text' },
          { name: 'price_range', type: 'text', nullable: true },
          { name: 'rating', type: 'numeric', default: '0' },
          { name: 'is_verified', type: 'bool', default: 'false' },
          { name: 'status', type: 'text', default: "'pending'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Public read for approved services', 'Providers can manage own', 'Admin can approve'],
      },
      {
        name: 'service_requests',
        description: 'Quotation requests linking properties to service providers',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)', nullable: true },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'service_id', type: 'uuid', fk: 'vendor_services(id)' },
          { name: 'budget_range', type: 'text', nullable: true },
          { name: 'urgency', type: 'text', default: "'normal'" },
          { name: 'description', type: 'text' },
          { name: 'status', type: 'text', default: "'pending'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Users can manage own requests', 'Providers can view assigned'],
      },
      {
        name: 'legal_documents',
        description: 'Property legal document tracking with renewal reminders',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'document_type', type: 'text', note: 'SHM, SHGB, IMB, PBB, AJB' },
          { name: 'document_number', type: 'text', nullable: true },
          { name: 'expires_at', type: 'timestamp', nullable: true },
          { name: 'file_url', type: 'text', nullable: true },
          { name: 'status', type: 'text', default: "'active'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Users can manage own documents'],
      },
    ],
  },
  {
    phase: 6,
    name: 'Revenue & Analytics',
    subtitle: 'Track monetization and platform performance',
    goal: 'Enable commission tracking, subscription management, and activity audit trails for business intelligence.',
    icon: DollarSign,
    accentClass: 'text-primary',
    borderClass: 'border-primary/30',
    bgClass: 'bg-primary',
    tables: [
      {
        name: 'transactions',
        description: 'Completed property transactions with commission and fee tracking',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'property_id', type: 'uuid', fk: 'properties(id)' },
          { name: 'buyer_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'seller_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'agent_id', type: 'uuid', fk: 'profiles(id)', nullable: true },
          { name: 'sale_price', type: 'numeric' },
          { name: 'commission_rate', type: 'numeric' },
          { name: 'commission_amount', type: 'numeric' },
          { name: 'transaction_type', type: 'text', note: "'sale' | 'rental'" },
          { name: 'status', type: 'text', default: "'pending'" },
          { name: 'completed_at', type: 'timestamp', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Participants can view own transactions', 'Admin can view all'],
      },
      {
        name: 'subscriptions',
        description: 'Tiered SaaS subscriptions: Free, Pro, Premium, Diamond',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'plan', type: 'text', note: 'free, pro, premium, diamond' },
          { name: 'status', type: 'text', default: "'active'" },
          { name: 'payment_provider', type: 'text', nullable: true, note: 'midtrans' },
          { name: 'payment_reference', type: 'text', nullable: true },
          { name: 'starts_at', type: 'timestamp', default: 'now()' },
          { name: 'expires_at', type: 'timestamp', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        policies: ['Users can view own subscription', 'Admin can manage all'],
      },
      {
        name: 'activity_logs',
        description: 'Comprehensive audit trail for security and analytics',
        status: 'deployed', rls: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', fk: 'auth.users(id)' },
          { name: 'activity_type', type: 'text' },
          { name: 'activity_description', type: 'text' },
          { name: 'ip_address', type: 'inet', nullable: true },
          { name: 'metadata', type: 'jsonb', nullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
        indexes: ['idx_activity_user ON activity_logs(user_id, created_at DESC)'],
        policies: ['Users can view own activity', 'Admin can view all'],
      },
    ],
  },
];

// ─── Column Row ──────────────────────────────────────────────────────
function ColumnRow({ col }: { col: Column }) {
  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/5 transition-colors text-[10px] font-mono">
      <div className="w-3 flex justify-center shrink-0">
        {col.pk && <Key className="h-2.5 w-2.5 text-amber-400" />}
        {col.fk && !col.pk && <Link2 className="h-2.5 w-2.5 text-violet-400" />}
      </div>
      <span className="text-foreground font-medium w-40 shrink-0">{col.name}</span>
      <span className={`w-16 shrink-0 ${TYPE_COLORS[col.type]}`}>{col.type}</span>
      <span className="text-muted-foreground flex-1 truncate">
        {[
          col.pk && 'PK',
          col.fk && `FK → ${col.fk}`,
          col.nullable && 'nullable',
          col.default && `default: ${col.default}`,
          col.note,
        ].filter(Boolean).join(' · ')}
      </span>
    </div>
  );
}

// ─── Table Card ──────────────────────────────────────────────────────
function TableCard({ table }: { table: TableDef }) {
  const [expanded, setExpanded] = useState(false);
  const sCfg = STATUS_CFG[table.status];
  const SIcon = sCfg.icon;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <Table2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-foreground">{table.name}</span>
            <Badge variant="outline" className="text-[8px] h-4">{table.columns.length} cols</Badge>
            {table.rls && (
              <Badge variant="outline" className="text-[8px] h-4 text-emerald-400 border-emerald-400/30 bg-emerald-400/5 gap-0.5">
                <Shield className="h-2 w-2" /> RLS
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{table.description}</p>
        </div>
        <Badge variant="outline" className={`text-[8px] h-5 gap-0.5 shrink-0 ${sCfg.className}`}>
          <SIcon className="h-2.5 w-2.5" /> {sCfg.label}
        </Badge>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-2">
              <Separator className="opacity-15" />
              {/* Columns */}
              <div className="space-y-0">
                <div className="flex items-center gap-2 py-1 px-2 text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                  <div className="w-3" />
                  <span className="w-40">Column</span>
                  <span className="w-16">Type</span>
                  <span className="flex-1">Constraints</span>
                </div>
                {table.columns.map((col) => <ColumnRow key={col.name} col={col} />)}
              </div>
              {/* Indexes */}
              {table.indexes && table.indexes.length > 0 && (
                <div className="pt-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium px-2">Indexes</span>
                  {table.indexes.map((idx, i) => (
                    <p key={i} className="text-[10px] font-mono text-muted-foreground px-2 py-0.5">{idx}</p>
                  ))}
                </div>
              )}
              {/* Policies */}
              {table.policies && table.policies.length > 0 && (
                <div className="pt-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium px-2">RLS Policies</span>
                  {table.policies.map((pol, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-0.5">
                      <Lock className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                      <p className="text-[10px] text-muted-foreground">{pol}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function SchemaArchitecturePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const allTables = SCHEMA_PHASES.flatMap(p => p.tables);
    const allCols = allTables.flatMap(t => t.columns);
    const rlsCount = allTables.filter(t => t.rls).length;
    return { tables: allTables.length, columns: allCols.length, rlsEnabled: rlsCount, phases: SCHEMA_PHASES.length };
  }, []);

  const filteredPhases = useMemo(() => {
    if (!searchQuery) return SCHEMA_PHASES;
    const q = searchQuery.toLowerCase();
    return SCHEMA_PHASES.map(p => ({
      ...p,
      tables: p.tables.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.columns.some(c => c.name.toLowerCase().includes(q))),
    })).filter(p => p.tables.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Schema Architecture</h1>
              <p className="text-xs text-muted-foreground">Database table priority order & relational structure blueprint</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Tables', value: stats.tables, icon: Table2 },
              { label: 'Columns', value: stats.columns, icon: Layers },
              { label: 'RLS Enabled', value: stats.rlsEnabled, icon: Shield },
              { label: 'Build Phases', value: stats.phases, icon: Target },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Dependency Flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Schema Dependency Flow</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {SCHEMA_PHASES.map((p, i) => (
                <div key={p.phase} className="flex items-center gap-1">
                  <div className={`px-2.5 py-1 rounded-lg border ${p.borderClass} ${p.bgClass}/5`}>
                    <span className={`text-[10px] font-bold ${p.accentClass}`}>P{p.phase}</span>
                    <span className="text-[9px] text-muted-foreground ml-1">{p.name}</span>
                  </div>
                  {i < SCHEMA_PHASES.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search tables, columns, descriptions..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {filteredPhases.map((phase) => (
          <div key={phase.phase}>
            {/* Phase Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${phase.borderClass} ${phase.bgClass}/10`}>
                <span className={`text-lg font-bold ${phase.accentClass}`}>{phase.phase}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">{phase.name}</h2>
                  <Badge variant="outline" className="text-[9px] h-5">{phase.tables.length} tables</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{phase.subtitle}</p>
              </div>
            </div>

            {/* Goal */}
            <div className={`rounded-lg border ${phase.borderClass} ${phase.bgClass}/5 p-3 mb-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Target className={`h-3 w-3 ${phase.accentClass}`} />
                <span className={`text-[10px] uppercase tracking-wider font-bold ${phase.accentClass}`}>Goal</span>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed">{phase.goal}</p>
            </div>

            {/* Tables */}
            <div className="space-y-2">
              {phase.tables.map((table) => <TableCard key={table.name} table={table} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
