import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Menu, Star, Pin, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TreeNode {
  id: string;
  label: string;
  icon: string;
  count?: string | number;
  color?: string;
  children?: TreeNode[];
  isNew?: boolean;
  usage?: number;
  isPinned?: boolean;
  category?: string;
}

interface QuickLink {
  id: string;
  label: string;
  icon: string;
  count?: string | number;
  color?: string;
  usage: number;
  isPinned: boolean;
}

interface EnhancedTreeNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  headerCounts: {
    users: number;
    properties: number;
    alerts: number;
    vendors: number;
  };
}

const SortableQuickLink = ({ link, isActive, onTabChange, onPin, onUnpin }: {
  link: QuickLink;
  isActive: boolean;
  onTabChange: (tab: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 p-3 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-lg'
          : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white p-1"
      >
        <Menu className="h-3 w-3" />
      </div>

      {/* Link Content */}
      <button
        onClick={() => onTabChange(link.id)}
        className="flex-1 flex items-center gap-2 text-left"
      >
        <span className="text-base">{link.icon}</span>
        <span className="text-sm font-medium text-white">{link.label}</span>
        
        {link.count !== undefined && (
          <Badge className={`text-xs px-1.5 py-0.5 ${getBadgeColor(link.color)}`}>
            {link.count}
          </Badge>
        )}
        
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Star className="h-3 w-3" />
          <span>{link.usage}</span>
        </div>
      </button>

      {/* Pin/Unpin Button */}
      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
        onClick={() => link.isPinned ? onUnpin(link.id) : onPin(link.id)}
      >
        <Pin className={`h-3 w-3 ${link.isPinned ? 'text-yellow-400' : 'text-gray-400'}`} />
      </Button>
    </div>
  );
};

const EnhancedTreeNavigation = ({ activeTab, onTabChange, headerCounts }: EnhancedTreeNavigationProps) => {
  const { toast } = useToast();
  const [expansionState, setExpansionState] = useState<'collapsed' | 'half-open' | 'fully-open'>('collapsed');
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const treeData: TreeNode[] = [
    {
      id: 'core',
      label: 'Core System',
      icon: '🏠',
      children: [
        { id: 'overview', label: 'Dashboard', icon: '📊', count: 'LIVE', color: 'green', category: 'core' },
        { id: 'analytics', label: 'Analytics', icon: '📈', count: headerCounts.properties, color: 'blue', category: 'core' },
        { id: 'diagnostic', label: 'Diagnostics', icon: '🔍', count: '0', color: 'cyan', category: 'core' },
        { id: 'system-reports', label: 'Reports', icon: '📋', count: '24', color: 'purple', category: 'core' }
      ]
    },
    {
      id: 'management',
      label: 'Management',
      icon: '👥',
      children: [
        { id: 'user-management', label: 'Users', icon: '👤', count: headerCounts.users, color: 'purple', category: 'management' },
        { id: 'property-management-hub', label: 'Properties', icon: '🏢', count: headerCounts.properties, color: 'cyan', category: 'management' },
        { id: 'vendors-hub', label: 'Vendors', icon: '🛠️', count: '147', color: 'orange', category: 'management' },
        { id: 'location-management', label: 'Locations', icon: '📍', count: '34', color: 'purple', category: 'management' },
        { id: 'content-management', label: 'Content', icon: '📝', count: '89', color: 'orange', category: 'management' }
      ]
    },
    {
      id: 'security',
      label: 'Security & Monitoring',
      icon: '🛡️',
      children: [
        { id: 'security-monitoring', label: 'Security Monitor', icon: '🛡️', count: '0', color: 'red', category: 'security' },
        { id: 'admin-alerts', label: 'Alert System', icon: '🚨', count: headerCounts.alerts, color: 'red', category: 'security' },
        { id: 'error-logs', label: 'Error Logs', icon: '📋', count: '0', color: 'red', isNew: true, category: 'security' }
      ]
    }
  ];

  // Initialize usage stats and quick links
  useEffect(() => {
    const savedStats = localStorage.getItem('admin-nav-usage');
    const savedQuickLinks = localStorage.getItem('admin-quick-links');
    
    if (savedStats) {
      setUsageStats(JSON.parse(savedStats));
    }

    if (savedQuickLinks) {
      setQuickLinks(JSON.parse(savedQuickLinks));
    } else {
      // Initialize with default quick links
      const allLinks = getAllLinks(treeData);
      const defaultQuickLinks = allLinks
        .slice(0, 6)
        .map(link => ({
          ...link,
          usage: 0,
          isPinned: false
        }));
      setQuickLinks(defaultQuickLinks);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('admin-nav-usage', JSON.stringify(usageStats));
  }, [usageStats]);

  useEffect(() => {
    localStorage.setItem('admin-quick-links', JSON.stringify(quickLinks));
  }, [quickLinks]);

  // Track usage when tab changes
  const handleTabChange = useCallback((tab: string) => {
    setUsageStats(prev => ({
      ...prev,
      [tab]: (prev[tab] || 0) + 1
    }));

    // Update quick links usage
    setQuickLinks(prev => 
      prev.map(link => 
        link.id === tab 
          ? { ...link, usage: link.usage + 1 }
          : link
      )
    );

    onTabChange(tab);
  }, [onTabChange]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setQuickLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });

      toast({
        title: "Quick links reordered",
        description: "Your navigation order has been saved.",
      });
    }
  };

  const handlePin = (id: string) => {
    const allLinks = getAllLinks(treeData);
    const linkToPin = allLinks.find(link => link.id === id);
    
    if (linkToPin && !quickLinks.find(ql => ql.id === id)) {
      const newQuickLink: QuickLink = {
        ...linkToPin,
        usage: usageStats[id] || 0,
        isPinned: true
      };
      
      setQuickLinks(prev => [...prev, newQuickLink]);
      
      toast({
        title: "Link pinned",
        description: `${linkToPin.label} added to quick access.`,
      });
    }
  };

  const handleUnpin = (id: string) => {
    setQuickLinks(prev => prev.filter(link => link.id !== id));
    
    toast({
      title: "Link unpinned",
      description: "Link removed from quick access.",
    });
  };

  const handleToggleExpansion = () => {
    if (expansionState === 'collapsed') {
      setExpansionState('half-open');
    } else if (expansionState === 'half-open') {
      setExpansionState('fully-open');
    } else {
      setExpansionState('collapsed');
    }
  };

  const sortedQuickLinks = [...quickLinks].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return b.usage - a.usage;
  });

  const getHeaderText = () => {
    switch (expansionState) {
      case 'collapsed': return 'Smart Navigation Panel';
      case 'half-open': return `Quick Access (${quickLinks.length})`;
      case 'fully-open': return 'All Navigation Links';
    }
  };

  const getHeaderIcon = () => {
    switch (expansionState) {
      case 'collapsed': return <Menu className="h-4 w-4" />;
      case 'half-open': return <ChevronRight className="h-4 w-4" />;
      case 'fully-open': return <ChevronDown className="h-4 w-4" />;
    }
  };

  // Get all links for inline display
  const getAllLinksFlat = () => {
    const links: TreeNode[] = [];
    treeData.forEach(category => {
      if (category.children) {
        links.push(...category.children);
      }
    });
    return links;
  };

  const allLinks = getAllLinksFlat();
  const mostUsedLinks = allLinks
    .sort((a, b) => (usageStats[b.id] || 0) - (usageStats[a.id] || 0))
    .slice(0, 8);

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-4">
      {/* Inline Navigation Buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-semibold text-white">Quick Nav</span>
          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
            Smart
          </Badge>
        </div>
        
        {mostUsedLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => handleTabChange(link.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
              activeTab === link.id
                ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 shadow-lg'
                : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
            }`}
          >
            <span className="text-sm">{link.icon}</span>
            <span className="text-sm font-medium text-white">{link.label}</span>
            
            {link.count !== undefined && (
              <Badge className={`text-xs px-1.5 py-0.5 ${getBadgeColor(link.color)}`}>
                {link.count}
              </Badge>
            )}
            
            {link.isNew && (
              <Badge className="text-xs px-1 py-0.5 bg-pink-500/20 text-pink-400 border-pink-500/30">
                NEW
              </Badge>
            )}
            
            {usageStats[link.id] && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Star className="h-3 w-3" />
                <span>{usageStats[link.id]}</span>
              </div>
            )}
          </button>
        ))}
        
        {/* More Options Button */}
        <button
          onClick={handleToggleExpansion}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-500/30 transition-all duration-200"
        >
          <Menu className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">More</span>
        </button>
      </div>

      {/* Expanded Menu - appears below when "More" is clicked */}
      {expansionState !== 'collapsed' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleTabChange(link.id)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                  activeTab === link.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                <span className="text-sm text-white truncate">{link.label}</span>
                {link.count !== undefined && (
                  <Badge className={`text-xs px-1 py-0.5 ${getBadgeColor(link.color)}`}>
                    {link.count}
                  </Badge>
                )}
                {link.isNew && (
                  <Badge className="text-xs px-1 py-0.5 bg-pink-500/20 text-pink-400 border-pink-500/30">
                    NEW
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTreeNavigation;