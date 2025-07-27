import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { 
  User, Settings, BarChart3, Shield, Users, Building2, 
  MessageSquare, Wrench, FileText, Mail, CreditCard, Search,
  Globe, CheckCircle, Clock, Wifi, Battery,
  VolumeX, Minimize2, Maximize2, X, Folder, FolderOpen,
  ChevronRight, Menu, Home, Cog, Monitor, Database, Sun, Moon,
  LogOut, ChevronDown, Bell, AlertTriangle, UserPlus, Activity,
  Database as DatabaseIcon, Brain
} from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import DynamicAdminContent from './DynamicAdminContent';
import SystemSettings from './SystemSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Desktop Apps Configuration with real components
const desktopApps = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    description: 'View system overview, analytics, and key performance metrics',
    icon: BarChart3, 
    section: 'dashboard',
    color: 'bg-blue-500'
  },
  { 
    id: 'users', 
    name: 'Users', 
    description: 'Manage user accounts, roles, and permissions',
    icon: Users, 
    section: 'users',
    color: 'bg-purple-500'
  },
  { 
    id: 'properties', 
    name: 'Properties', 
    description: 'Manage property listings, details, and availability',
    icon: Building2, 
    section: 'properties',
    color: 'bg-green-500'
  },
  { 
    id: 'security', 
    name: 'Security', 
    description: 'Security settings, audit logs, and access control',
    icon: Shield, 
    section: 'security',
    color: 'bg-red-500'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    description: 'Advanced analytics, reports, and data insights',
    icon: BarChart3, 
    section: 'analytics',
    color: 'bg-yellow-500'
  },
  { 
    id: 'messages', 
    name: 'Messages', 
    description: 'Customer service, support tickets, and communication',
    icon: MessageSquare, 
    section: 'customer-service',
    color: 'bg-pink-500'
  },
  { 
    id: 'tools', 
    name: 'Tools', 
    description: 'Administrative tools, utilities, and system functions',
    icon: Wrench, 
    section: 'tools',
    color: 'bg-indigo-500'
  },
  { 
    id: 'reports', 
    name: 'Reports', 
    description: 'Generate and manage system reports and documents',
    icon: FileText, 
    section: 'reports',
    color: 'bg-orange-500'
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    description: 'System configuration, preferences, and setup',
    icon: Settings, 
    section: 'settings',
    color: 'bg-gray-500'
  },
  { 
    id: 'billing', 
    name: 'Billing', 
    description: 'Payment management, billing, and financial settings',
    icon: CreditCard, 
    section: 'billing',
    color: 'bg-emerald-500'
  },
  { 
    id: 'seo', 
    name: 'SEO', 
    description: 'Search engine optimization and website configuration',
    icon: Globe, 
    section: 'seo',
    color: 'bg-cyan-500'
  },
  { 
    id: 'kyc', 
    name: 'KYC Review', 
    description: 'Know Your Customer verification and compliance',
    icon: CheckCircle, 
    section: 'kyc',
    color: 'bg-teal-500'
  }
];

// File Categories Configuration
const fileCategories = [
  {
    id: 'admin',
    name: 'Administration',
    icon: Shield,
    color: 'bg-red-500',
    section: 'users',
    files: [
      { name: 'User Management', section: 'users' },
      { name: 'Role Permissions', section: 'security' },
      { name: 'System Logs', section: 'system-logs' },
      { name: 'Audit Trail', section: 'security' }
    ]
  },
  {
    id: 'properties',
    name: 'Properties',
    icon: Building2,
    color: 'bg-green-500',
    section: 'properties',
    files: [
      { name: 'Property Listings', section: 'properties' },
      { name: 'Property Types', section: 'properties' },
      { name: 'Location Management', section: 'locations' },
      { name: 'Media Gallery', section: 'media' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    icon: BarChart3,
    color: 'bg-blue-500',
    section: 'analytics',
    files: [
      { name: 'Dashboard Stats', section: 'analytics' },
      { name: 'Revenue Reports', section: 'reports' },
      { name: 'User Activity', section: 'analytics' },
      { name: 'Performance Metrics', section: 'analytics' }
    ]
  },
  {
    id: 'system',
    name: 'System Configuration',
    icon: Cog,
    color: 'bg-gray-500',
    section: 'settings',
    files: [
      { name: 'SMTP Settings', section: 'smtp' },
      { name: 'SEO Configuration', section: 'seo' },
      { name: 'API Settings', section: 'settings' },
      { name: 'Database Config', section: 'settings' }
    ]
  }
];

interface Window {
  id: string;
  appId: string;
  title: string;
  section: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export const MacOSAdminDesktop = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [openWindows, setOpenWindows] = useState<Window[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [time, setTime] = useState(new Date());
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showConfigurations, setShowConfigurations] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dragRef = useRef<{ startX: number; startY: number; windowId: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch system alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const mockAlerts = [
          {
            id: 1,
            type: 'error',
            title: 'Database Connection Issue',
            message: 'Periodic connection check detected intermittent delays',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            read: false,
            severity: 'high'
          },
          {
            id: 2,
            type: 'user_activity',
            title: 'New User Registration',
            message: 'New user registered: john.doe@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            severity: 'medium'
          },
          {
            id: 3,
            type: 'security',
            title: 'Multiple Login Attempts',
            message: 'Detected 3 failed login attempts from IP 192.168.1.100',
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            read: true,
            severity: 'high'
          },
          {
            id: 4,
            type: 'system',
            title: 'System Update',
            message: 'Property listings cache refreshed successfully',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            read: false,
            severity: 'low'
          },
          {
            id: 5,
            type: 'admin',
            title: 'Admin Access',
            message: 'Administrator logged in from new device',
            timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
            read: true,
            severity: 'medium'
          }
        ];
        
        setAlerts(mockAlerts);
        setUnreadCount(mockAlerts.filter(alert => !alert.read).length);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
    // Refresh alerts every 30 seconds
    const alertTimer = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(alertTimer);
  }, []);

  const markAlertAsRead = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'user_activity': return UserPlus;
      case 'security': return Shield;
      case 'system': return Activity;
      case 'admin': return DatabaseIcon;
      default: return Bell;
    }
  };

  const getAlertColor = (severity: string, type: string) => {
    if (severity === 'high') return 'text-red-500';
    if (severity === 'medium') return 'text-yellow-500';
    if (type === 'security') return 'text-orange-500';
    return 'text-blue-500';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const openApp = (app: typeof desktopApps[0]) => {
    const existingWindow = openWindows.find(w => w.appId === app.id);
    if (existingWindow) {
      setActiveWindow(existingWindow.id);
      restoreWindow(existingWindow.id);
      return;
    }

    const newWindow: Window = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      title: app.name,
      section: app.section,
      position: { 
        x: 100 + openWindows.length * 30, 
        y: 100 + openWindows.length * 30 
      },
      size: { width: 1000, height: 700 },
      isMinimized: false,
      isMaximized: false,
      zIndex: openWindows.length + 1
    };

    setOpenWindows([...openWindows, newWindow]);
    setActiveWindow(newWindow.id);
    setActiveSection(app.section);
  };

  const openSection = (section: string, title: string) => {
    const existingWindow = openWindows.find(w => w.section === section);
    if (existingWindow) {
      setActiveWindow(existingWindow.id);
      restoreWindow(existingWindow.id);
      return;
    }

    const newWindow: Window = {
      id: `${section}-${Date.now()}`,
      appId: section,
      title: title,
      section: section,
      position: { 
        x: 150 + openWindows.length * 30, 
        y: 150 + openWindows.length * 30 
      },
      size: { width: 1000, height: 700 },
      isMinimized: false,
      isMaximized: false,
      zIndex: openWindows.length + 1
    };

    setOpenWindows([...openWindows, newWindow]);
    setActiveWindow(newWindow.id);
    setActiveSection(section);
    setShowStartMenu(false);
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter(w => w.id !== windowId));
    if (activeWindow === windowId) {
      const remaining = openWindows.filter(w => w.id !== windowId);
      setActiveWindow(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const minimizeWindow = (windowId: string) => {
    setOpenWindows(openWindows.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  };

  const restoreWindow = (windowId: string) => {
    setOpenWindows(openWindows.map(w => 
      w.id === windowId ? { ...w, isMinimized: false, isMaximized: false } : w
    ));
    setActiveWindow(windowId);
  };

  const maximizeWindow = (windowId: string) => {
    setOpenWindows(openWindows.map(w => 
      w.id === windowId ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        position: w.isMaximized ? w.position : { x: 0, y: 32 },
        size: w.isMaximized ? w.size : { width: window.innerWidth, height: window.innerHeight - 32 }
      } : w
    ));
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    setActiveWindow(windowId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      windowId
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    setOpenWindows(windows => windows.map(w => 
      w.id === dragRef.current?.windowId && !w.isMaximized ? {
        ...w,
        position: {
          x: Math.max(0, w.position.x + deltaX),
          y: Math.max(32, w.position.y + deltaY)
        }
      } : w
    ));
    
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut();
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <TooltipProvider>
    <div className={`h-screen w-screen bg-gradient-to-br relative overflow-hidden ${
      theme === 'dark' 
        ? 'from-blue-950 via-blue-900 to-blue-950' 
        : 'from-blue-100 via-blue-200 to-blue-300'
    }`}>
      {/* Menu Bar */}
      <div className={`h-8 backdrop-blur-md border-b flex items-center justify-between px-4 text-sm relative z-50 ${
        theme === 'dark'
          ? 'bg-blue-950/30 border-blue-400/20 text-white'
          : 'bg-blue-50/30 border-blue-400/30 text-blue-900'
      }`}>
        <div className="flex items-center space-x-4">
            <button 
            onClick={() => setShowStartMenu(!showStartMenu)}
            className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${
              theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <AnimatedLogo className="scale-75" />
            </div>
          </button>
          <span className="font-medium">ASTRA Admin</span>
          <button 
            onClick={() => setShowSpotlight(true)}
            className={`px-2 py-1 rounded text-xs ${
              theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
            }`}
          >
            File
          </button>
          <button className={`px-2 py-1 rounded text-xs ${
            theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
          }`}>Edit</button>
          <button className={`px-2 py-1 rounded text-xs ${
            theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
          }`}>View</button>
          <button 
            onClick={() => setShowConfigurations(true)}
            className={`px-2 py-1 rounded text-xs ${
              theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
            }`}
          >
            Window
          </button>
        </div>
        
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={goHome}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
            }`}
            title="Go to Home"
          >
            <Home className="w-3 h-3" />
            <span className="hidden md:inline">Home</span>
          </button>
          
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`flex items-center space-x-1 px-2 py-1 rounded relative ${
                theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
              }`}
              title="System Alerts"
            >
              <Bell className="w-3 h-3" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showAlerts && (
              <div 
                className="fixed inset-0 bg-transparent z-40"
                onClick={() => setShowAlerts(false)}
              >
                <div 
                  className={`absolute top-8 right-16 backdrop-blur-md rounded-lg shadow-2xl border w-96 max-h-96 overflow-y-auto z-50 ${
                    theme === 'dark'
                      ? 'bg-blue-950/95 border-blue-700'
                      : 'bg-white/95 border-blue-200'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`p-4 border-b ${
                    theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-blue-200' : 'text-gray-800'
                      }`}>System Alerts</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {unreadCount} unread
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center">
                        <Bell className={`w-8 h-8 mx-auto mb-2 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-blue-300' : 'text-gray-600'
                        }`}>No alerts at this time</p>
                      </div>
                    ) : (
                      alerts.map(alert => {
                        const AlertIcon = getAlertIcon(alert.type);
                        return (
                          <div
                            key={alert.id}
                            className={`p-3 border-b cursor-pointer transition-colors ${
                              theme === 'dark' 
                                ? 'border-blue-800 hover:bg-blue-900/50' 
                                : 'border-gray-100 hover:bg-gray-50'
                            } ${!alert.read ? (theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50/50') : ''}`}
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <AlertIcon className={`w-4 h-4 mt-0.5 ${getAlertColor(alert.severity, alert.type)}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-sm font-medium truncate ${
                                    theme === 'dark' ? 'text-blue-200' : 'text-gray-900'
                                  }`}>
                                    {alert.title}
                                  </h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${getSeverityBadge(alert.severity)}`}>
                                    {alert.severity}
                                  </span>
                                </div>
                                <p className={`text-xs mt-1 ${
                                  theme === 'dark' ? 'text-blue-300' : 'text-gray-600'
                                }`}>
                                  {alert.message}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  theme === 'dark' ? 'text-blue-400' : 'text-gray-500'
                                }`}>
                                  {alert.timestamp.toLocaleString()}
                                </p>
                              </div>
                              {!alert.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  <div className={`p-3 border-t ${
                    theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
                  }`}>
                    <button
                      onClick={() => {
                        openSection('system-alerts', 'System Alerts');
                        setShowAlerts(false);
                      }}
                      className={`w-full text-xs text-center py-2 rounded ${
                        theme === 'dark' 
                          ? 'text-blue-300 hover:bg-blue-800/50' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      View All Alerts
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center space-x-1 px-2 py-1 rounded ${
                theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
              }`}
            >
              <User className="w-3 h-3" />
              <span className="hidden md:inline">{user?.email?.split('@')[0] || 'Admin'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showProfileMenu && (
              <div 
                className="fixed inset-0 bg-transparent z-40"
                onClick={() => setShowProfileMenu(false)}
              >
                <div 
                  className={`absolute top-8 right-4 backdrop-blur-md rounded-lg shadow-2xl border w-48 z-50 ${
                    theme === 'dark'
                      ? 'bg-blue-950/95 border-blue-700'
                      : 'bg-white/95 border-blue-200'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`p-3 border-b ${
                    theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'
                      }`}>
                        <User className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-blue-200' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-blue-200' : 'text-gray-800'
                        }`}>
                          {user?.email?.split('@')[0] || 'Admin'}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-blue-300' : 'text-gray-600'
                        }`}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        openSection('admin-profile', 'Profile Settings');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 p-2 rounded text-left ${
                        theme === 'dark' ? 'hover:bg-blue-800/50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-blue-200' : 'text-gray-700'
                      }`}>Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 p-2 rounded text-left ${
                        theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className={`text-sm text-red-500`}>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <VolumeX className="w-4 h-4" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="relative h-[calc(100vh-8rem)]">
        {/* Windows */}
        {openWindows
          .filter(w => !w.isMinimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(window => (
          <div
            key={window.id}
            className={`absolute rounded-lg shadow-2xl border overflow-hidden ${
              activeWindow === window.id ? 'z-50' : 'z-40'
            } ${
              theme === 'dark' 
                ? 'bg-blue-950 border-blue-800' 
                : 'bg-white border-blue-200'
            }`}
            style={{
              left: window.position.x,
              top: window.position.y,
              width: window.size.width,
              height: window.size.height,
            }}
            onClick={() => setActiveWindow(window.id)}
          >
            {/* Window Title Bar */}
            <div 
              className={`h-8 border-b flex items-center justify-between px-3 cursor-move ${
                theme === 'dark'
                  ? 'bg-blue-900 border-blue-700'
                  : 'bg-blue-100 border-blue-200'
              }`}
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(window.id);
                    }}
                    className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-600 flex items-center justify-center transition-colors duration-200 hover:scale-110"
                    title="Close"
                  >
                    <X className="w-3 h-3 text-white font-bold" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeWindow(window.id);
                    }}
                    className="w-4 h-4 bg-yellow-500 rounded-full hover:bg-yellow-600 flex items-center justify-center transition-colors duration-200 hover:scale-110"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3 h-3 text-white" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      maximizeWindow(window.id);
                    }}
                    className="w-4 h-4 bg-green-500 rounded-full hover:bg-green-600 flex items-center justify-center transition-colors duration-200 hover:scale-110"
                    title="Maximize"
                  >
                    <Maximize2 className="w-3 h-3 text-white" />
                  </button>
                </div>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                }`}>{window.title}</span>
              </div>
            </div>
            
            {/* Window Content */}
            <div className={`h-[calc(100%-2rem)] overflow-auto ${
              theme === 'dark' ? 'bg-blue-950' : 'bg-blue-50'
            }`}>
              {window.section === 'settings' ? (
                <SystemSettings />
              ) : (
                <DynamicAdminContent 
                  activeSection={window.section} 
                  onSectionChange={setActiveSection}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Window Tabs Bar */}
      {openWindows.length > 0 && (
        <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 backdrop-blur-md rounded-2xl px-4 py-2 border ${
          theme === 'dark'
            ? 'bg-blue-900/40 border-blue-600/30'
            : 'bg-blue-100/40 border-blue-300/40'
        }`}>
          <div className="flex items-center space-x-2">
            {openWindows.map((window) => (
              <div
                key={window.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                  activeWindow === window.id
                    ? (theme === 'dark' ? 'bg-blue-600/50 text-white' : 'bg-blue-200/60 text-blue-900')
                    : (theme === 'dark' ? 'bg-blue-800/30 text-blue-200 hover:bg-blue-700/40' : 'bg-white/40 text-blue-800 hover:bg-white/60')
                } ${window.isMinimized ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => {
                    if (window.isMinimized) {
                      restoreWindow(window.id);
                    } else {
                      setActiveWindow(window.id);
                    }
                  }}
                  className="flex items-center space-x-2 max-w-32"
                >
                  <span className="text-sm font-medium truncate">{window.title}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-red-500/80 text-red-300 hover:text-white' 
                      : 'hover:bg-red-500 text-red-600 hover:text-white'
                  }`}
                  title={`Close ${window.title}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 backdrop-blur-md rounded-2xl px-4 py-3 border ${
        theme === 'dark'
          ? 'bg-blue-900/40 border-blue-600/30'
          : 'bg-blue-100/40 border-blue-300/40'
      }`}>
        <div className="flex items-center space-x-3">
          {desktopApps.map((app) => {
            const Icon = app.icon;
            const isOpen = openWindows.some(w => w.appId === app.id);
            
            return (
              <Tooltip key={app.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => openApp(app)}
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-white
                      hover:scale-110 transition-all duration-200 relative
                      ${app.color}
                      ${isOpen ? 'ring-2 ring-white/50' : ''}
                    `}
                  >
                    <Icon className="w-6 h-6" />
                    {isOpen && (
                      <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{app.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{app.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {/* File Explorer */}
          <button
            onClick={() => openSection('file-explorer', 'File Explorer')}
            className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-200"
            title="File Explorer"
          >
            <Folder className="w-6 h-6" />
          </button>
          
          {/* Divider */}
          <div className="w-px h-8 bg-white/30" />
          
          {/* Minimized Windows */}
          {openWindows.filter(w => w.isMinimized).map(window => (
            <button
              key={window.id}
              onClick={() => restoreWindow(window.id)}
              className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-200"
              title={`Restore ${window.title}`}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Start Menu */}
      {showStartMenu && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowStartMenu(false)}
        >
          <div 
            className={`absolute top-8 left-4 backdrop-blur-md rounded-lg shadow-2xl border w-80 max-h-96 overflow-y-auto z-50 ${
              theme === 'dark'
                ? 'bg-blue-950/95 border-blue-700'
                : 'bg-white/95 border-blue-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b ${
              theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <AnimatedLogo className="scale-75" />
              </div>
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-blue-200' : 'text-gray-800'
              }`}>ASTRA Admin</h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-300' : 'text-gray-600'
              }`}>Project Management & Configuration</p>
            </div>
            
            <div className="p-2">
              {fileCategories.map(category => (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${
                      theme === 'dark' ? 'hover:bg-blue-800/50' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${category.color}`}>
                        <category.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-blue-200' : 'text-gray-800'
                      }`}>{category.name}</span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedCategories.includes(category.id) ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {expandedCategories.includes(category.id) && (
                    <div className="ml-6 space-y-1">
                      {category.files.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => openSection(file.section, file.name)}
                          className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 rounded text-left"
                        >
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{file.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Configurations Panel */}
      {showConfigurations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-96 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">System Configurations</h3>
              <button 
                onClick={() => setShowConfigurations(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <button 
                onClick={() => {
                  openSection('settings', 'System Settings');
                  setShowConfigurations(false);
                }}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">System Settings</span>
                </div>
                <span className="text-blue-600 text-sm">Configure</span>
              </button>
              
              <button 
                onClick={() => {
                  openSection('database', 'Database Management');
                  setShowConfigurations(false);
                }}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Database Management</span>
                </div>
                <span className="text-green-600 text-sm">Manage</span>
              </button>
              
              <button 
                onClick={() => {
                  openSection('payment-system', 'Payment System');
                  setShowConfigurations(false);
                }}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Payment System</span>
                </div>
                <span className="text-orange-600 text-sm">Status</span>
              </button>
              
              <button 
                onClick={() => {
                  openSection('image-optimization', 'Image Optimization');
                  setShowConfigurations(false);
                }}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Image Optimization</span>
                </div>
                <span className="text-purple-600 text-sm">Optimize</span>
              </button>
              
              <button 
                onClick={() => {
                  openSection('monitoring', 'System Monitoring');
                  setShowConfigurations(false);
                }}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">System Monitoring</span>
                </div>
                <span className="text-blue-600 text-sm">View</span>
              </button>
              
              <button 
                onClick={() => {
                  openSection('ai-diagnostics', 'AI Diagnostics');
                  setShowConfigurations(false);
                }}
                className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">AI Diagnostics</span>
                </div>
                <span className="text-purple-600 text-sm">Analyze</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight Search */}
      {showSpotlight && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-lg w-96 max-w-md">
            <div className="flex items-center p-4 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search admin functions..."
                className="flex-1 bg-transparent border-none outline-none text-gray-800"
                autoFocus
                onKeyDown={(e) => e.key === 'Escape' && setShowSpotlight(false)}
              />
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {desktopApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => {
                    openApp(app);
                    setShowSpotlight(false);
                  }}
                  className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${app.color}`}>
                    <app.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};

export default MacOSAdminDesktop;