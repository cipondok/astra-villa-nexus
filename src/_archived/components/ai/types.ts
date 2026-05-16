
import { ElementType } from 'react';

export interface ChatProperty {
  id: string;
  title: string;
  city?: string;
  district?: string | null;
  price: number;
  property_type?: string | null;
  bedrooms?: number | null;
  area_sqm?: number;
  image_url?: string | null;
  opportunity_score?: number;
  rental_yield?: number;
  forecast_growth?: number;
  developer?: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: any;
  reaction?: 'positive' | 'negative' | null;
  starred?: boolean;
  properties?: ChatProperty[];
  insights?: { label: string; value: string }[];
}

export interface QuickAction {
  icon: ElementType;
  text: string;
  action: string;
}
