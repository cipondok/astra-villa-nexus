
import { ElementType } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: any;
}

export interface QuickAction {
  icon: ElementType;
  text: string;
  action: string;
}
