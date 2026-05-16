import { supabase } from '@/integrations/supabase/client';

type InvestorAlertType = 'elite_opportunity' | 'price_drop' | 'watchlist_update' | 'portfolio_risk' | 'deal_alert';
type TransactionAlertType = 'offer_received' | 'negotiation_update' | 'booking_confirmation' | 'document_progress';
type SystemAlertType = 'listing_approved' | 'service_request' | 'project_inquiry';

type AlertType = InvestorAlertType | TransactionAlertType | SystemAlertType;

interface SendNotificationParams {
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  propertyId?: string;
  metadata?: Record<string, any>;
}

/**
 * Send an in-app notification to a specific user.
 * Used for investor alerts, transaction updates, and system events.
 */
export async function sendUserNotification({
  userId,
  type,
  title,
  message,
  propertyId,
  metadata = {},
}: SendNotificationParams): Promise<boolean> {
  try {
    const { error } = await supabase.from('in_app_notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      property_id: propertyId || null,
      metadata,
    });
    if (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error sending notification:', err);
    return false;
  }
}

// ── Convenience functions ──

export const notifyEliteOpportunity = (userId: string, propertyTitle: string, propertyId: string, score: number) =>
  sendUserNotification({
    userId,
    type: 'elite_opportunity',
    title: '🔥 Elite Opportunity Detected',
    message: `${propertyTitle} has been identified as an elite investment opportunity with a score of ${score}/100.`,
    propertyId,
    metadata: { score },
  });

export const notifyPriceDrop = (userId: string, propertyTitle: string, propertyId: string, dropPercent: number, newPrice: number) =>
  sendUserNotification({
    userId,
    type: 'price_drop',
    title: '📉 Price Drop Alert',
    message: `${propertyTitle} dropped ${dropPercent.toFixed(1)}% — now listed at IDR ${newPrice.toLocaleString()}.`,
    propertyId,
    metadata: { drop_percent: dropPercent, new_price: newPrice },
  });

export const notifyWatchlistUpdate = (userId: string, propertyTitle: string, propertyId: string, updateType: string) =>
  sendUserNotification({
    userId,
    type: 'watchlist_update',
    title: '📋 Watchlist Intelligence Update',
    message: `${propertyTitle} on your watchlist has a new ${updateType}.`,
    propertyId,
    metadata: { update_type: updateType },
  });

export const notifyPortfolioRisk = (userId: string, riskSignal: string, affectedProperties: number) =>
  sendUserNotification({
    userId,
    type: 'portfolio_risk',
    title: '⚠️ Portfolio Risk Signal',
    message: `${riskSignal} — affecting ${affectedProperties} properties in your portfolio.`,
    metadata: { risk_signal: riskSignal, affected_count: affectedProperties },
  });

export const notifyOfferReceived = (userId: string, buyerName: string, propertyTitle: string, propertyId: string, offerAmount: number) =>
  sendUserNotification({
    userId,
    type: 'offer_received',
    title: '💰 New Offer Received',
    message: `${buyerName} submitted an offer of IDR ${offerAmount.toLocaleString()} for ${propertyTitle}.`,
    propertyId,
    metadata: { buyer_name: buyerName, offer_amount: offerAmount },
  });

export const notifyNegotiationUpdate = (userId: string, propertyTitle: string, propertyId: string, update: string) =>
  sendUserNotification({
    userId,
    type: 'negotiation_update',
    title: '🤝 Negotiation Update',
    message: `${propertyTitle}: ${update}`,
    propertyId,
    metadata: { update },
  });

export const notifyBookingConfirmation = (userId: string, propertyTitle: string, propertyId: string, bookingDate: string) =>
  sendUserNotification({
    userId,
    type: 'booking_confirmation',
    title: '✅ Booking Confirmed',
    message: `Your booking for ${propertyTitle} on ${bookingDate} has been confirmed.`,
    propertyId,
    metadata: { booking_date: bookingDate },
  });

export const notifyDocumentProgress = (userId: string, documentType: string, status: string) =>
  sendUserNotification({
    userId,
    type: 'document_progress',
    title: '📄 Document Request Progress',
    message: `Your ${documentType} request has been updated to: ${status}.`,
    metadata: { document_type: documentType, status },
  });

export const notifyListingApproved = (userId: string, propertyTitle: string, propertyId: string) =>
  sendUserNotification({
    userId,
    type: 'listing_approved',
    title: '✅ Listing Approved',
    message: `${propertyTitle} has been approved and is now live on the platform.`,
    propertyId,
  });

export const notifyServiceRequest = (userId: string, serviceName: string, requesterName: string) =>
  sendUserNotification({
    userId,
    type: 'service_request',
    title: '📦 New Service Booking Request',
    message: `${requesterName} has requested your service: ${serviceName}.`,
    metadata: { service_name: serviceName, requester_name: requesterName },
  });

export const notifyProjectInquiry = (userId: string, projectName: string, inquirerName: string) =>
  sendUserNotification({
    userId,
    type: 'project_inquiry',
    title: '🏗️ Developer Project Inquiry',
    message: `${inquirerName} is interested in your project: ${projectName}.`,
    metadata: { project_name: projectName, inquirer_name: inquirerName },
  });
