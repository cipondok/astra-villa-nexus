import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon: string;
  count?: string | number;
  color?: string;
  children?: TreeNode[];
  isNew?: boolean;
}

interface ModernTreeNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  headerCounts: {
    users: number;
    properties: number;
    alerts: number;
    vendors: number;
  };
}

const ModernTreeNavigation = ({ activeTab, onTabChange, headerCounts }: ModernTreeNavigationProps) => {
  // Expansion states: 'collapsed', 'half-open', 'fully-open'
  const [expansionState, setExpansionState] = useState<'collapsed' | 'half-open' | 'fully-open'>('collapsed');
  const treeData: TreeNode[] = [
    {
      id: 'core',
      label: 'Core System',
      icon: '🏠',
      children: [
        { id: 'overview', label: 'Dashboard', icon: '📊', count: 'LIVE', color: 'green' },
        { id: 'analytics', label: 'Analytics', icon: '📈', count: headerCounts.properties, color: 'blue' },
        { id: 'diagnostic', label: 'Diagnostics', icon: '🔍', count: '0', color: 'cyan' },
        { id: 'system-reports', label: 'Reports', icon: '📋', count: '24', color: 'purple' }
      ]
    },
    {
      id: 'management',
      label: 'Management',
      icon: '👥',
      children: [
        { id: 'user-management', label: 'Users', icon: '👤', count: headerCounts.users, color: 'purple' },
        { id: 'property-management-hub', label: 'Properties', icon: '🏢', count: headerCounts.properties, color: 'cyan' },
        { id: 'vendors-hub', label: 'Vendors', icon: '🛠️', count: '147', color: 'orange' },
        { id: 'location-management', label: 'Locations', icon: '📍', count: '34', color: 'indigo' },
        { id: 'content-management', label: 'Content', icon: '📝', count: '89', color: 'amber' }
      ]
    },
    {
      id: 'customer',
      label: 'Customer Service',
      icon: '🎧',
      children: [
        { id: 'customer-service', label: 'Support Center', icon: '💬', count: '12', color: 'pink' },
        { id: 'customer-service-control', label: 'CS Control', icon: '🎛️', count: '5', color: 'rose' },
        { id: 'contact-management', label: 'Contacts', icon: '📞', count: '156', color: 'emerald' },
        { id: 'feedback-management', label: 'Feedback', icon: '⭐', count: '23', color: 'yellow' }
      ]
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: '💳',
      children: [
        { id: 'billing-management', label: 'Billing', icon: '💰', count: '156', color: 'emerald' },
        { id: 'indonesian-payment-config', label: 'Payment Config', icon: '🏦', count: '8', color: 'blue' },
        { id: 'booking-payment-settings', label: 'Booking Payments', icon: '💳', count: '12', color: 'violet' },
        { id: 'bpjs-api-settings', label: 'BPJS API', icon: '🏥', count: '3', color: 'red' }
      ]
    },
    {
      id: 'ai',
      label: 'AI & Automation',
      icon: '🤖',
      children: [
        { id: 'ai-bot-management', label: 'AI Bots', icon: '🤖', count: '5', color: 'violet', isNew: true },
        { id: 'ai-assistant', label: 'AI Assistant', icon: '🧠', count: '1', color: 'purple', isNew: true },
        { id: 'document-ocr', label: 'Document OCR', icon: '🔍', count: '12', color: 'blue' },
        { id: 'ai-intelligence-monitor', label: 'Intelligence Monitor', icon: '📡', count: '0', color: 'cyan', isNew: true }
      ]
    },
    {
      id: 'tools',
      label: 'Tools & Settings',
      icon: '⚙️',
      children: [
        { id: 'system-settings', label: 'System Settings', icon: '⚙️', count: '15', color: 'gray' },
        { id: 'tools-management', label: 'Tools Management', icon: '🔧', count: '8', color: 'orange' },
        { id: 'cookie-settings', label: 'Cookie Consent', icon: '🍪', count: '4', color: 'purple', isNew: true },
        { id: 'api-settings', label: 'API Settings', icon: '⚡', count: '12', color: 'yellow' },
        { id: 'database-management', label: 'Database', icon: '💾', count: '45', color: 'indigo' },
        { id: 'smtp-settings', label: 'SMTP Settings', icon: '📧', count: '3', color: 'blue' },
        { id: 'seo-settings', label: 'SEO Hub', icon: '🔍', count: '7', color: 'green' }
      ]
    },
    {
      id: 'security',
      label: 'Security & Monitoring',
      icon: '🛡️',
      children: [
        { id: 'security-monitoring', label: 'Security Monitor', icon: '🛡️', count: '0', color: 'red' },
        { id: 'authorization-monitoring', label: 'Auth Monitor', icon: '🔐', count: '2', color: 'orange' },
        { id: 'admin-alerts', label: 'Alert System', icon: '🚨', count: headerCounts.alerts, color: 'red' },
        { id: 'admin-kyc-review', label: 'KYC Review', icon: '📋', count: '8', color: 'blue' },
        { id: 'kyc-analytics', label: 'KYC Analytics', icon: '📊', count: '15', color: 'cyan' },
        { id: 'bulk-kyc-operations', label: 'Bulk KYC', icon: '📦', count: '3', color: 'purple' },
        { id: 'review-moderation', label: 'Review Moderation', icon: '⭐', count: '0', color: 'yellow' }
      ]
    },
    {
      id: 'specialized',
      label: 'Specialized Features',
      icon: '🎯',
      children: [
        { id: 'search-filters', label: 'Search Filters', icon: '🔍', count: '12', color: 'blue' },
        { id: 'property-3d-settings', label: '3D Property View', icon: '🏠', count: '5', color: 'cyan', isNew: true },
        { id: 'property-survey-management', label: 'Property Surveys', icon: '📋', count: '18', color: 'green' },
        { id: 'vendor-agent-control', label: 'Vendor Agents', icon: '👔', count: '24', color: 'orange' },
        { id: 'daily-checkin', label: 'Daily Check-in', icon: '✅', count: '156', color: 'emerald' },
        { id: 'astra-token-hub', label: 'ASTRA Tokens', icon: '🪙', count: '89', color: 'amber', isNew: true },
        { id: 'database-errors', label: 'DB Error Manager', icon: '❌', count: '3', color: 'red' },
        { id: 'error-logs', label: 'Error Logs', icon: '📋', count: '0', color: 'red', isNew: true }
      ]
    }
  ];

  // Flatten all links for inline display
  const getAllLinks = (nodes: TreeNode[]): TreeNode[] => {
    const links: TreeNode[] = [];
    nodes.forEach(node => {
      if (node.children) {
        links.push(...node.children);
      } else {
        links.push(node);
      }
    });
    return links;
  };

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'green': return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'blue': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      case 'purple': return 'bg-chart-5/20 text-chart-5 border-chart-5/30';
      case 'cyan': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'orange': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'pink': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'amber': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'emerald': return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'violet': return 'bg-chart-5/20 text-chart-5 border-chart-5/30';
      case 'red': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'indigo': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      case 'yellow': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'rose': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'gray': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const allLinks = getAllLinks(treeData);
  
  // Define priority links for half-open state (top 10 most used)
  const priorityLinkIds = [
    'overview', 'user-management', 'property-management-hub', 'analytics', 
    'admin-alerts', 'customer-service', 'billing-management', 'vendors-hub',
    'system-settings', 'security-monitoring'
  ];
  
  const priorityLinks = allLinks.filter(link => priorityLinkIds.includes(link.id));
  const displayLinks = expansionState === 'collapsed' ? [] : 
                     expansionState === 'half-open' ? priorityLinks : allLinks;

  const handleToggleExpansion = () => {
    if (expansionState === 'collapsed') {
      setExpansionState('half-open');
    } else if (expansionState === 'half-open') {
      setExpansionState('fully-open');
    } else {
      setExpansionState('collapsed');
    }
  };

  const getHeaderText = () => {
    switch (expansionState) {
      case 'collapsed': return 'Click to Open Navigation';
      case 'half-open': return `Showing ${priorityLinks.length} Main Links`;
      case 'fully-open': return `Showing All ${allLinks.length} Links`;
    }
  };

  const getHeaderIcon = () => {
    switch (expansionState) {
      case 'collapsed': return <Menu className="h-4 w-4" />;
      case 'half-open': return <ChevronRight className="h-4 w-4" />;
      case 'fully-open': return <ChevronDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-background/95 to-muted/95 backdrop-blur-xl border border-border/10 rounded-xl shadow-lg">
      <div className="p-4">
        {/* Clickable Header */}
        <button
          onClick={handleToggleExpansion}
          className="w-full flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/10 hover:bg-foreground/5 transition-all duration-300 rounded-lg px-2 py-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔗</span>
            <h3 className="text-sm font-semibold text-foreground">{getHeaderText()}</h3>
            {expansionState !== 'collapsed' && (
              <Badge className="text-xs bg-chart-4/20 text-chart-4 border-chart-4/30">
                {displayLinks.length}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground hover:text-foreground transition-colors">
            {getHeaderIcon()}
          </div>
        </button>
        
        {/* Progressive Navigation Links Display */}
        {expansionState !== 'collapsed' && (
          <div className={`transition-all duration-500 ease-in-out ${
            expansionState === 'half-open' ? 'animate-fade-in' : 'animate-scale-in'
          }`}>
            {/* State Indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  expansionState === 'half-open' ? 'bg-chart-3 animate-pulse' : 'bg-chart-1'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {expansionState === 'half-open' ? 'Essential Links' : 'Complete Navigation'}
                </span>
              </div>
              {expansionState === 'half-open' && (
                <span className="text-xs text-chart-3 animate-pulse">
                  Click again for all links
                </span>
              )}
            </div>
            
            {/* Navigation Links */}
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-transparent">
              {displayLinks.map((link) => {
                  const isActive = activeTab === link.id;
                  
                  return (
                    <button
                      key={link.id}
                      onClick={() => onTabChange(link.id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/30 shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent hover:border-foreground/10'
                      }`}
                    >
                {/* Link Icon */}
                <span className="text-base">{link.icon}</span>

                {/* Link Label */}
                <span className="text-sm font-medium">{link.label}</span>

                {/* Count Badge */}
                {link.count !== undefined && (
                  <Badge 
                    className={`text-xs px-1.5 py-0.5 ml-1 ${
                      link.color === 'green' && link.count === 'LIVE' 
                        ? 'bg-chart-1/20 text-chart-1 border-chart-1/30 animate-pulse'
                        : getBadgeColor(link.color)
                    }`}
                  >
                    {link.count}
                  </Badge>
                )}

                {/* New Badge */}
                {link.isNew && (
                  <Badge className="text-xs px-1 py-0.5 bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/30 animate-pulse">
                    NEW
                  </Badge>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Expansion Hint */}
        {expansionState === 'half-open' && (
          <div className="mt-3 pt-3 border-t border-border/10 text-center">
            <span className="text-xs text-muted-foreground">
              {allLinks.length - priorityLinks.length} more links available
            </span>
          </div>
        )}
        </div>
        )}
      </div>
    </div>
  );
};

export default ModernTreeNavigation;