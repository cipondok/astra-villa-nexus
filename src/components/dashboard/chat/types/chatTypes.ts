export interface ChatSession {
  id: string;
  customer_user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  agent_user_id: string | null;
  status: 'waiting' | 'active' | 'resolved' | 'abandoned';
  subject: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  started_at: string;
  ended_at: string | null;
  last_activity_at: string;
  customer_ip: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_user_id: string | null;
  sender_type: 'customer' | 'agent' | 'system';
  message_type: 'text' | 'file' | 'image' | 'system';
  content: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface ChatParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  participant_type: 'customer' | 'agent';
  joined_at: string;
  left_at: string | null;
  is_online: boolean;
  last_seen_at: string;
}

export interface ChatSessionListProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onAssignSession: (sessionId: string) => void;
  isLoading: boolean;
}

export interface ChatWindowProps {
  session: ChatSession | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onCloseSession: (sessionId: string) => void;
  isLoading: boolean;
  isSending: boolean;
}

export interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  isLoading: boolean;
}

export interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export interface ChatHeaderProps {
  session: ChatSession;
  onClose: (sessionId: string) => void;
  onPriorityChange: (sessionId: string, priority: ChatSession['priority']) => void;
}

export type ChatStatus = ChatSession['status'];
export type ChatPriority = ChatSession['priority'];
export type MessageType = ChatMessage['message_type'];
export type SenderType = ChatMessage['sender_type'];