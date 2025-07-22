import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Menu, Star, Pin, Trash2, Edit, Plus, Check, X, Save } from 'lucide-react';
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
  isNew?: boolean;
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

const SortableQuickNavItem = ({ link, isActive, onTabChange, onRemove, getBadgeColor, usageStats }: {
  link: QuickLink;
  isActive: boolean;
  onTabChange: (tab: string) => void;
  onRemove: (id: string) => void;
  getBadgeColor: (color?: string) => string;
  usageStats: Record<string, number>;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 shadow-lg'
          : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white mr-1"
      >
        <Menu className="h-3 w-3" />
      </div>

      {/* Link Content */}
      <button
        onClick={() => onTabChange(link.id)}
        className="flex items-center gap-2"
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

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(link.id);
        }}
        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

const EnhancedTreeNavigation = ({ activeTab, onTabChange, headerCounts }: EnhancedTreeNavigationProps) => {
  const { toast } = useToast();
  const [expansionState, setExpansionState] = useState<'collapsed' | 'half-open' | 'fully-open'>('collapsed');
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
        { id: 'system-reports', label: 'Reports', icon: '📋', count: '24', color: 'purple', category: 'core' },
        { id: 'system-settings', label: 'System Settings', icon: '⚙️', count: '12', color: 'orange', category: 'core' },
        { id: 'api-configuration', label: 'API Config', icon: '🔧', count: '8', color: 'blue', category: 'core' },
        { id: 'loading-customization', label: 'Loading Page', icon: '⏳', count: '3', color: 'purple', category: 'core' }
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
        { id: 'content-management', label: 'Content', icon: '📝', count: '89', color: 'orange', category: 'management' },
        { id: 'admin-messaging', label: 'Messaging', icon: '💬', count: '156', color: 'blue', category: 'management' },
        { id: 'file-management', label: 'Files', icon: '📁', count: '245', color: 'cyan', category: 'management' }
      ]
    },
    {
      id: 'security',
      label: 'Security & Monitoring',
      icon: '🛡️',
      children: [
        { id: 'security-monitoring', label: 'Security Monitor', icon: '🛡️', count: '0', color: 'red', category: 'security' },
        { id: 'admin-alerts', label: 'Alert System', icon: '🚨', count: headerCounts.alerts, color: 'red', category: 'security' },
        { id: 'error-logs', label: 'Error Logs', icon: '📋', count: '0', color: 'red', isNew: true, category: 'security' },
        { id: 'audit-logs', label: 'Audit Logs', icon: '📜', count: '1,245', color: 'orange', category: 'security' },
        { id: 'backup-management', label: 'Backups', icon: '💾', count: '12', color: 'green', category: 'security' },
        { id: 'permission-management', label: 'Permissions', icon: '🔐', count: '67', color: 'purple', category: 'security' }
      ]
    },
    {
      id: 'tools',
      label: 'Tools & Utilities',
      icon: '🔧',
      children: [
        { id: 'database-tools', label: 'Database Tools', icon: '🗄️', count: '8', color: 'cyan', category: 'tools' },
        { id: 'import-export', label: 'Import/Export', icon: '↔️', count: '4', color: 'orange', category: 'tools' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧', count: '3', color: 'yellow', category: 'tools' },
        { id: 'performance-monitor', label: 'Performance', icon: '⚡', count: 'OK', color: 'green', category: 'tools' },
        { id: 'cache-management', label: 'Cache', icon: '🏃', count: '89%', color: 'blue', category: 'tools' }
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
      try {
        const parsed = JSON.parse(savedQuickLinks);
        setQuickLinks(parsed);
        console.log('Loaded quick links from localStorage:', parsed);
      } catch (error) {
        console.error('Error parsing saved quick links:', error);
        // Reset to empty if corrupted
        localStorage.removeItem('admin-quick-links');
        setQuickLinks([]);
      }
    } else {
      console.log('No saved quick links found, initializing with empty array');
      setQuickLinks([]);
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
    return getAllLinks(treeData);
  };

  const allLinks = getAllLinksFlat();
  
  // Display actual quick links with enhanced usage data
  const displayQuickLinks = quickLinks.map(ql => ({
    ...ql,
    usage: usageStats[ql.id] || ql.usage || 0
  })).slice(0, 8);

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

  const handleSaveSelection = () => {
    const allLinks = getAllLinksFlat();
    const newQuickLinks = Array.from(selectedItems).map(id => {
      const link = allLinks.find(l => l.id === id);
      return link ? {
        ...link,
        usage: usageStats[id] || 0,
        isPinned: true
      } : null;
    }).filter(Boolean) as QuickLink[];
    
    console.log('Saving quick links:', newQuickLinks);
    setQuickLinks(newQuickLinks);
    setIsEditMode(false);
    setSelectedItems(new Set());
    
    toast({
      title: "Quick nav updated",
      description: `${newQuickLinks.length} items saved to quick navigation.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setQuickLinks(prev => prev.filter(link => link.id !== id));
    toast({
      title: "Item removed",
      description: "Item removed from quick navigation.",
    });
  };

  const handleToggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setSelectedItems(new Set(quickLinks.map(link => link.id)));
    setExpansionState('fully-open');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedItems(new Set());
  };

  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-4">
      {/* Inline Navigation Buttons */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold text-white">Quick Nav</span>
            <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
              Smart
            </Badge>
          </div>
          
          {!isEditMode && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayQuickLinks.map(link => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-2">
                  {displayQuickLinks.map((link) => (
                    <SortableQuickNavItem
                      key={link.id}
                      link={link}
                      isActive={activeTab === link.id}
                      onTabChange={handleTabChange}
                      onRemove={handleRemoveItem}
                      getBadgeColor={getBadgeColor}
                      usageStats={usageStats}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button
                size="sm"
                onClick={handleSaveSelection}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Save ({selectedItems.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditMode}
                className="text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <button
                onClick={handleToggleExpansion}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-500/30 transition-all duration-200"
              >
                <Menu className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">More</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Menu - appears below when "More" is clicked or in Edit Mode */}
      {(expansionState !== 'collapsed' || isEditMode) && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Edit className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Edit Mode</span>
                <Badge className="text-xs bg-yellow-500/20 text-yellow-400">
                  {selectedItems.size} selected
                </Badge>
              </div>
              <p className="text-xs text-gray-300">
                Click items to add/remove from quick navigation. Click Save to apply changes.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => isEditMode ? handleToggleSelection(link.id) : handleTabChange(link.id)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 relative ${
                  isEditMode 
                    ? selectedItems.has(link.id)
                      ? 'bg-green-500/20 border border-green-400/50 text-green-400'
                      : 'bg-gray-700/50 border border-gray-500/30 hover:bg-gray-600/50'
                    : activeTab === link.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                      : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {isEditMode && (
                  <div className="absolute top-1 right-1">
                    {selectedItems.has(link.id) ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Plus className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                )}
                
                <span className="text-sm">{link.icon}</span>
                <span className="text-sm text-white truncate">{link.label}</span>
                {link.count !== undefined && !isEditMode && (
                  <Badge className={`text-xs px-1 py-0.5 ${getBadgeColor(link.color)}`}>
                    {link.count}
                  </Badge>
                )}
                {link.isNew && !isEditMode && (
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