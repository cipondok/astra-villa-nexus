
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'token' | 'analytics' | 'communication' | 'content' | 'security' | 'integration' | 'other';
  version: string;
  enabled: boolean;
  status: 'healthy' | 'warning' | 'error' | 'disabled';
  lastChecked: string;
  dependencies?: string[];
  configRequired?: boolean;
  errorMessage?: string;
  healthEndpoint?: string;
  component?: string;
}

export interface ToolStatus {
  id: string;
  status: 'healthy' | 'warning' | 'error' | 'disabled';
  lastChecked: string;
  errorMessage?: string;
  responseTime?: number;
}

export interface ToolConfig {
  toolId: string;
  settings: Record<string, any>;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}
