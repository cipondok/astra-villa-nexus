// Google Analytics 4 Service
// Provides type-safe event tracking for the property platform

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// GA4 Measurement ID - should be set via admin settings
let GA_MEASUREMENT_ID: string | null = null;

// Event categories for property platform
export type GAEventCategory = 
  | 'property'
  | 'search'
  | 'booking'
  | 'payment'
  | 'user'
  | 'engagement'
  | 'conversion';

// Predefined events for the property platform
export interface PropertyViewEvent {
  property_id: string;
  property_type: string;
  property_price: number;
  property_location: string;
  currency: string;
}

export interface SearchEvent {
  search_term: string;
  search_type: 'text' | 'voice' | 'image' | 'filter';
  results_count: number;
  filters_applied?: string[];
}

export interface BookingEvent {
  booking_id: string;
  property_id: string;
  booking_type: 'viewing' | 'rental' | 'purchase';
  booking_value: number;
  currency: string;
}

export interface PaymentEvent {
  transaction_id: string;
  payment_method: string;
  payment_gateway: 'midtrans' | 'paypal' | 'crypto';
  value: number;
  currency: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}

export interface UserEvent {
  method: 'email' | 'whatsapp' | 'google' | 'facebook';
  user_type?: 'buyer' | 'seller' | 'agent' | 'investor';
}

export interface EngagementEvent {
  content_type: string;
  content_id: string;
  engagement_type: 'view' | 'like' | 'share' | 'save' | 'compare';
}

class GoogleAnalyticsService {
  private initialized = false;
  private eventQueue: Array<{ name: string; params: any }> = [];

  /**
   * Initialize GA4 with measurement ID
   */
  initialize(measurementId: string): void {
    if (this.initialized || !measurementId) return;
    
    GA_MEASUREMENT_ID = measurementId;
    
    // Add gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // We'll send page views manually for SPA
      cookie_flags: 'SameSite=None;Secure',
    });

    this.initialized = true;
    console.log('[GA4] Initialized with ID:', measurementId);

    // Process queued events
    this.processQueue();
  }

  /**
   * Check if GA4 is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Process queued events after initialization
   */
  private processQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.trackEvent(event.name, event.params);
      }
    }
  }

  /**
   * Track page view (for SPA navigation)
   */
  trackPageView(path: string, title?: string): void {
    if (!this.initialized) {
      console.log('[GA4] Not initialized, queuing page view:', path);
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });

    console.log('[GA4] Page view:', path);
  }

  /**
   * Track generic event
   */
  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!this.initialized) {
      this.eventQueue.push({ name: eventName, params });
      return;
    }

    window.gtag('event', eventName, {
      ...params,
      send_to: GA_MEASUREMENT_ID,
    });

    console.log('[GA4] Event:', eventName, params);
  }

  /**
   * Track property view
   */
  trackPropertyView(event: PropertyViewEvent): void {
    this.trackEvent('view_item', {
      currency: event.currency,
      value: event.property_price,
      items: [{
        item_id: event.property_id,
        item_name: event.property_type,
        item_category: 'property',
        price: event.property_price,
        location_id: event.property_location,
      }],
    });
  }

  /**
   * Track search
   */
  trackSearch(event: SearchEvent): void {
    this.trackEvent('search', {
      search_term: event.search_term,
      search_type: event.search_type,
      results_count: event.results_count,
      filters: event.filters_applied?.join(','),
    });
  }

  /**
   * Track booking initiation
   */
  trackBookingStart(event: BookingEvent): void {
    this.trackEvent('begin_checkout', {
      currency: event.currency,
      value: event.booking_value,
      items: [{
        item_id: event.property_id,
        item_name: event.booking_type,
        item_category: 'booking',
        price: event.booking_value,
      }],
      booking_id: event.booking_id,
    });
  }

  /**
   * Track booking completion
   */
  trackBookingComplete(event: BookingEvent): void {
    this.trackEvent('purchase', {
      transaction_id: event.booking_id,
      currency: event.currency,
      value: event.booking_value,
      items: [{
        item_id: event.property_id,
        item_name: event.booking_type,
        item_category: 'booking',
        price: event.booking_value,
      }],
    });
  }

  /**
   * Track payment initiation
   */
  trackPaymentStart(event: PaymentEvent): void {
    this.trackEvent('add_payment_info', {
      currency: event.currency,
      value: event.value,
      payment_type: event.payment_method,
      items: event.items,
    });
  }

  /**
   * Track successful payment
   */
  trackPaymentSuccess(event: PaymentEvent): void {
    this.trackEvent('purchase', {
      transaction_id: event.transaction_id,
      currency: event.currency,
      value: event.value,
      payment_type: event.payment_method,
      items: event.items,
    });
  }

  /**
   * Track user sign up
   */
  trackSignUp(event: UserEvent): void {
    this.trackEvent('sign_up', {
      method: event.method,
      user_type: event.user_type,
    });
  }

  /**
   * Track user login
   */
  trackLogin(event: UserEvent): void {
    this.trackEvent('login', {
      method: event.method,
    });
  }

  /**
   * Track content engagement
   */
  trackEngagement(event: EngagementEvent): void {
    this.trackEvent('select_content', {
      content_type: event.content_type,
      content_id: event.content_id,
      engagement_type: event.engagement_type,
    });
  }

  /**
   * Track property inquiry (lead generation)
   */
  trackInquiry(propertyId: string, inquiryType: 'whatsapp' | 'email' | 'phone' | 'form'): void {
    this.trackEvent('generate_lead', {
      property_id: propertyId,
      inquiry_type: inquiryType,
      currency: 'IDR',
    });
  }

  /**
   * Track property comparison
   */
  trackCompare(propertyIds: string[]): void {
    this.trackEvent('view_item_list', {
      item_list_id: 'compare',
      item_list_name: 'Property Comparison',
      items: propertyIds.map((id, index) => ({
        item_id: id,
        index,
      })),
    });
  }

  /**
   * Track property saved/favorited
   */
  trackSaveProperty(propertyId: string, propertyPrice: number): void {
    this.trackEvent('add_to_wishlist', {
      currency: 'IDR',
      value: propertyPrice,
      items: [{
        item_id: propertyId,
        item_category: 'property',
        price: propertyPrice,
      }],
    });
  }

  /**
   * Track valuation request
   */
  trackValuationRequest(propertyId: string, estimatedValue: number): void {
    this.trackEvent('valuation_requested', {
      property_id: propertyId,
      estimated_value: estimatedValue,
      currency: 'IDR',
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(userId: string, properties: Record<string, any>): void {
    if (!this.initialized) return;

    window.gtag('set', 'user_properties', {
      user_id: userId,
      ...properties,
    });

    window.gtag('config', GA_MEASUREMENT_ID!, {
      user_id: userId,
    });
  }

  /**
   * Track exception/error
   */
  trackException(description: string, fatal: boolean = false): void {
    this.trackEvent('exception', {
      description,
      fatal,
    });
  }

  /**
   * Track timing (performance)
   */
  trackTiming(name: string, value: number, category?: string): void {
    this.trackEvent('timing_complete', {
      name,
      value,
      event_category: category,
    });
  }
}

// Export singleton instance
export const ga4 = new GoogleAnalyticsService();
export default ga4;
