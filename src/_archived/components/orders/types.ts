export type OrderType = 'property_investment' | 'consultation_request' | 'service_booking';
export type OrderStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

export interface UserOrder {
  id: string;
  user_id: string;
  order_number: string;
  order_type: OrderType;
  status: OrderStatus;
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  total_amount: number | null;
  currency: string;
  assigned_to: string | null;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  completed_at: string | null;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  document_name: string;
  document_url: string;
  document_type: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface OrderActivityLog {
  id: string;
  order_id: string;
  user_id: string | null;
  action: string;
  details: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
