import React from 'react';

/**
 * MOBILE-FIRST WIREFRAME DESCRIPTIONS
 * ====================================
 * 
 * These wireframes follow the mobile-first design principles:
 * - 5-tap maximum for key actions
 * - Thumb-zone optimized navigation
 * - Progressive disclosure of complex information
 * - Offline-capable architecture
 * - Strategic push notification triggers
 */

export const WireframeDescriptions = {
  
  /**
   * SCREEN 1: HOME / DISCOVERY
   * --------------------------
   * Purpose: Quick property discovery and personalized recommendations
   * 
   * Layout:
   * ┌─────────────────────────────────┐
   * │  [Logo]    Search Bar    [🔔] │  <- Top zone (status/brand)
   * ├─────────────────────────────────┤
   * │                                 │
   * │  Featured Property Carousel     │  <- Auto-sliding hero
   * │  [< swipe indicators >]         │
   * │                                 │
   * ├─────────────────────────────────┤
   * │  Quick Filters (pill buttons)   │  <- 1-tap filter access
   * │  [Buy] [Rent] [Area] [Price]    │
   * ├─────────────────────────────────┤
   * │                                 │
   * │  For You (AI Recommendations)   │  <- Personalized feed
   * │  ┌────┐ ┌────┐ ┌────┐          │
   * │  │    │ │    │ │    │          │
   * │  └────┘ └────┘ └────┘          │
   * │                                 │
   * │  New Listings                   │  <- Fresh content
   * │  ┌────┐ ┌────┐                  │
   * │  │    │ │    │ [View All]       │
   * │  └────┘ └────┘                  │
   * │                                 │
   * ├─────────────────────────────────┤
   * │ [🏠] [🔍] [+] [❤️] [👤]        │  <- Bottom thumb zone
   * └─────────────────────────────────┘
   * 
   * Tap Flow (View Property): Home → Tap Card → Property Detail (2 taps)
   * Tap Flow (Search): Home → Tap Search → Enter Query → Results (3 taps)
   * 
   * Offline: Cached recommendations, images, and last 20 viewed properties
   * Push Triggers: New match notifications appear as card badges
   */

  /**
   * SCREEN 2: PROPERTY DETAIL
   * -------------------------
   * Purpose: Comprehensive property info with progressive disclosure
   * 
   * Layout:
   * ┌─────────────────────────────────┐
   * │  [←]              [❤️] [📤]    │  <- Minimal header
   * ├─────────────────────────────────┤
   * │                                 │
   * │  ┌─────────────────────────┐   │
   * │  │                         │   │  <- Full-width image carousel
   * │  │      Property Image     │   │     Tap to fullscreen gallery
   * │  │                         │   │
   * │  │  [1/12]  [Virtual Tour] │   │
   * │  └─────────────────────────┘   │
   * │                                 │
   * │  Rp 2.5 M/month   ↓12%         │  <- Price (price drop badge)
   * │  Villa Sunset, Seminyak         │
   * │  ⭐ 4.8 (23) • 3🛏 • 2🛁 • 150m²│  <- Essential stats
   * │                                 │
   * ├─────────────────────────────────┤
   * │  [Overview] [Details] [Area]    │  <- Disclosure tabs
   * ├─────────────────────────────────┤
   * │                                 │
   * │  Overview (collapsed sections)  │
   * │  ├─ Description [v]             │  <- Expandable
   * │  ├─ Amenities [v]               │
   * │  ├─ Floor Plans [v]             │
   * │  └─ Reviews (4.8) [v]           │
   * │                                 │
   * ├─────────────────────────────────┤
   * │  [💬 Chat]    [📅 Schedule]    │  <- Primary actions
   * └─────────────────────────────────┘
   * 
   * Tap Flow (Schedule Viewing): Detail → Schedule → Select Date → Confirm (4 taps)
   * Tap Flow (Save): Detail → Tap Heart (2 taps)
   * 
   * Progressive Disclosure:
   * - Level 1: Price, location, key stats, main image
   * - Level 2: Full description, amenities list, more photos
   * - Level 3: Floor plans, documents, agent info, neighborhood
   * 
   * Offline: Full property data cached after view, images progressive-loaded
   */

  /**
   * SCREEN 3: SEARCH & FILTERS
   * --------------------------
   * Purpose: Fast property search with smart filters
   * 
   * Layout:
   * ┌─────────────────────────────────┐
   * │  [←] [________🔍________] [⚙️] │  <- Search with filter toggle
   * ├─────────────────────────────────┤
   * │  Recent: Seminyak, 2BR, <3M     │  <- Recent searches (1-tap)
   * ├─────────────────────────────────┤
   * │                                 │
   * │  Quick Filters (horizontal)     │
   * │  [Buy ▼] [1B+] [<2M] [Pool]    │  <- Most-used, 1-tap toggles
   * │                                 │
   * ├─────────────────────────────────┤
   * │  156 Properties Found           │
   * │  ┌──────────────────────────┐  │
   * │  │ [img]  Title             │  │
   * │  │        Rp 2.5M • 3BR     │  │  <- Compact cards
   * │  │        Location  [❤️]   │  │
   * │  └──────────────────────────┘  │
   * │  ┌──────────────────────────┐  │
   * │  │ ...                      │  │
   * │  └──────────────────────────┘  │
   * │                                 │
   * │  [Load More...]                 │
   * │                                 │
   * ├─────────────────────────────────┤
   * │  [🗺️ Map] [Sort ▼] [Save 🔔]   │  <- Map toggle, sort, save search
   * └─────────────────────────────────┘
   * 
   * Filter Sheet (slides up):
   * ┌─────────────────────────────────┐
   * │  [✕] Filters          [Reset]  │
   * ├─────────────────────────────────┤
   * │  Property Type                  │
   * │  [Villa] [House] [Apt] [Land]   │
   * │                                 │
   * │  Price Range                    │
   * │  [====●========●====]           │
   * │  Rp 500jt - Rp 5M               │
   * │                                 │
   * │  Bedrooms                       │
   * │  [Any] [1+] [2+] [3+] [4+]     │
   * │                                 │
   * │  More Filters [v]               │  <- Progressive disclosure
   * ├─────────────────────────────────┤
   * │  [Show 156 Results]             │
   * └─────────────────────────────────┘
   * 
   * Tap Flow (Filter Search): Search → Filter Icon → Adjust → Apply (4 taps)
   * Tap Flow (Save Search): Search → Save → Confirm Alerts (3 taps)
   * 
   * Offline: Recent searches cached, can browse last results offline
   * Push: "New Match" when saved search has new properties
   */

  /**
   * SCREEN 4: SAVED & FAVORITES
   * ---------------------------
   * Purpose: Manage saved properties and searches
   * 
   * Layout:
   * ┌─────────────────────────────────┐
   * │  [←] Saved              [Edit] │
   * ├─────────────────────────────────┤
   * │  [Properties (12)] [Searches (3)]│  <- Segmented tabs
   * ├─────────────────────────────────┤
   * │                                 │
   * │  Price Drop! 🔥                 │  <- Alert banner
   * │  2 properties reduced this week │
   * │                                 │
   * ├─────────────────────────────────┤
   * │  Sort: [Recently Added ▼]       │
   * │                                 │
   * │  ┌────────────────────────────┐│
   * │  │ [img]                      ││
   * │  │ Villa Harmony   🔻-15%     ││  <- Price drop indicator
   * │  │ Rp 2.1M → Rp 1.8M         ││
   * │  │ Saved 3 days ago          ││
   * │  │ [Remove] [Compare] [View] ││  <- Swipe actions
   * │  └────────────────────────────┘│
   * │                                 │
   * │  ┌────────────────────────────┐│
   * │  │ ...                        ││
   * │  └────────────────────────────┘│
   * │                                 │
   * ├─────────────────────────────────┤
   * │  [Compare Selected (2)]         │  <- Comparison CTA
   * └─────────────────────────────────┘
   * 
   * Swipe Actions (thumb-friendly):
   * - Swipe left: Delete
   * - Swipe right: Share
   * - Long press: Multi-select
   * 
   * Tap Flow (Compare): Saved → Select 2-3 → Compare (3 taps)
   * Tap Flow (View Price Drop): Saved → Tap Alert → View Property (2 taps)
   * 
   * Offline: Full saved list with images cached
   * Push: Price drop notifications with direct link
   */

  /**
   * SCREEN 5: PROFILE & SETTINGS
   * ----------------------------
   * Purpose: User management and app preferences
   * 
   * Layout:
   * ┌─────────────────────────────────┐
   * │  Profile                        │
   * ├─────────────────────────────────┤
   * │       ┌──────┐                  │
   * │       │ 👤  │                  │  <- Avatar
   * │       └──────┘                  │
   * │     John Doe                    │
   * │     john@email.com              │
   * │     [Edit Profile]              │
   * ├─────────────────────────────────┤
   * │  Activity                       │
   * │  ┌────┐ ┌────┐ ┌────┐         │
   * │  │ 12 │ │ 3  │ │ 5  │         │
   * │  │Saved│ │Views│ │Inquiries│    │
   * │  └────┘ └────┘ └────┘         │
   * ├─────────────────────────────────┤
   * │  Quick Actions                  │
   * │  [📋 My Properties]      [>]   │
   * │  [📊 Dashboard]          [>]   │
   * │  [🎫 My Bookings]        [>]   │
   * │  [💰 Astra Tokens]       [>]   │
   * ├─────────────────────────────────┤
   * │  Settings                       │
   * │  [🔔 Notifications]      [>]   │  <- Opens preferences panel
   * │  [🌙 Dark Mode]          [◉]   │
   * │  [🌐 Language]         [EN>]   │
   * │  [📴 Offline Mode]       [ ]   │
   * ├─────────────────────────────────┤
   * │  [🚪 Sign Out]                  │
   * └─────────────────────────────────┘
   * 
   * Notification Settings (nested):
   * - Price Drops: ON
   * - New Matches: ON
   * - Messages: ON
   * - Market Updates: Weekly
   * - [Test Notification]
   * 
   * Tap Flow (Enable Notifications): Profile → Notifications → Toggle (3 taps)
   * Tap Flow (List Property): Profile → My Properties → Add (3 taps)
   * 
   * Offline: Profile data cached, settings sync on reconnect
   */
};

/**
 * IMPLEMENTATION NOTES
 * ====================
 * 
 * 5-TAP MAXIMUM PATHS:
 * 1. Home → Property → View Details (2 taps)
 * 2. Home → Search → Filter → Results (3 taps)
 * 3. Property → Save → Confirm (2 taps)
 * 4. Property → Schedule → Date → Time → Confirm (5 taps)
 * 5. Profile → List Property → Photos → Price → Publish (5 taps)
 * 
 * THUMB ZONE OPTIMIZATION:
 * - Primary navigation at bottom (most reachable)
 * - FAB for quick actions (center-bottom)
 * - Swipe gestures for common actions
 * - All CTAs in lower 1/3 of screen
 * 
 * PROGRESSIVE DISCLOSURE:
 * - Level 1: Critical info visible immediately
 * - Level 2: Supporting details on first interaction
 * - Level 3: Deep dive content on explicit request
 * 
 * OFFLINE STRATEGY:
 * - Cache: Last 20 viewed properties, all saved, search results
 * - Queue: Inquiries, saves, and form submissions
 * - Sync: On reconnect with conflict resolution
 * 
 * PUSH NOTIFICATION TRIGGERS:
 * - Price drop on saved property (immediate)
 * - New match for saved search (batched daily or immediate if < 3/day)
 * - Inquiry response (immediate)
 * - Market update digest (weekly)
 */

export default WireframeDescriptions;
