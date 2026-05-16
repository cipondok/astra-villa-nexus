export type TicketCategory = 
  | 'general_inquiry'
  | 'order_issue'
  | 'payment_issue'
  | 'technical_support'
  | 'account_issue'
  | 'complaint'
  | 'suggestion'
  | 'other';

export type TicketStatus = 'open' | 'in_progress' | 'awaiting_response' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: string;
  assigned_to: string | null;
  related_order_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'support' | 'system';
  message: string;
  attachments: any[];
  is_internal: boolean;
  created_at: string;
}
