import React from 'react';
import { Badge } from '@/components/ui/badge';

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
        { id: 'document-ocr', label: 'Document OCR', icon: '🔍', count: '12', color: 'blue' }
      ]
    },
    {
      id: 'tools',
      label: 'Tools & Settings',
      icon: '⚙️',
      children: [
        { id: 'system-settings', label: 'System Settings', icon: '⚙️', count: '15', color: 'gray' },
        { id: 'tools-management', label: 'Tools Management', icon: '🔧', count: '8', color: 'orange' },
        { id: 'api-settings', label: 'API Settings', icon: '⚡', count: '12', color: 'yellow' },
        { id: 'database-management', label: 'Database', icon: '💾', count: '45', color: 'indigo' },
        { id: 'smtp-settings', label: 'SMTP Settings', icon: '📧', count: '3', color: 'blue' },
        { id: 'seo-settings', label: 'SEO Settings', icon: '🔍', count: '7', color: 'green' }
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
        { id: 'bulk-kyc-operations', label: 'Bulk KYC', icon: '📦', count: '3', color: 'purple' }
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
        { id: 'database-errors', label: 'DB Error Manager', icon: '❌', count: '3', color: 'red' }
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
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'pink': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'amber': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'emerald': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'violet': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'indigo': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'yellow': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rose': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'gray': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const allLinks = getAllLinks(treeData);

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span className="text-lg">🔗</span>
          <h3 className="text-sm font-semibold text-white">Admin Navigation</h3>
          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
            {allLinks.length} Links
          </Badge>
        </div>
        
        {/* Inline Navigation Links */}
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {allLinks.map((link) => {
            const isActive = activeTab === link.id;
            
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
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
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
                        : getBadgeColor(link.color)
                    }`}
                  >
                    {link.count}
                  </Badge>
                )}

                {/* New Badge */}
                {link.isNew && (
                  <Badge className="text-xs px-1 py-0.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30 animate-pulse">
                    NEW
                  </Badge>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModernTreeNavigation;