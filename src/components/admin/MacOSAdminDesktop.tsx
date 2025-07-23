import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Settings, BarChart3, Shield, Users, Building2, 
  MessageSquare, Wrench, FileText, Mail, CreditCard, Search,
  Globe, CheckCircle, Clock, Apple, Wifi, Battery,
  VolumeX, Minimize2, Maximize2, X, Folder, FolderOpen,
  ChevronRight, Menu, Home, Cog, Monitor, Database
} from 'lucide-react';

// File Categories Configuration
const fileCategories = [
  {
    id: 'admin',
    name: 'Administration',
    icon: Shield,
    color: 'bg-red-500',
    files: [
      { name: 'User Management', type: 'component', path: '/admin/users' },
      { name: 'Role Permissions', type: 'config', path: '/admin/roles' },
      { name: 'System Logs', type: 'log', path: '/admin/logs' },
      { name: 'Audit Trail', type: 'report', path: '/admin/audit' }
    ]
  },
  {
    id: 'properties',
    name: 'Properties',
    icon: Building2,
    color: 'bg-green-500',
    files: [
      { name: 'Property Listings', type: 'data', path: '/properties/list' },
      { name: 'Property Types', type: 'config', path: '/properties/types' },
      { name: 'Location Management', type: 'component', path: '/properties/locations' },
      { name: 'Media Gallery', type: 'media', path: '/properties/media' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    icon: BarChart3,
    color: 'bg-blue-500',
    files: [
      { name: 'Dashboard Stats', type: 'report', path: '/analytics/dashboard' },
      { name: 'Revenue Reports', type: 'report', path: '/analytics/revenue' },
      { name: 'User Activity', type: 'log', path: '/analytics/activity' },
      { name: 'Performance Metrics', type: 'data', path: '/analytics/performance' }
    ]
  },
  {
    id: 'system',
    name: 'System Configuration',
    icon: Cog,
    color: 'bg-gray-500',
    files: [
      { name: 'SMTP Settings', type: 'config', path: '/system/smtp' },
      { name: 'SEO Configuration', type: 'config', path: '/system/seo' },
      { name: 'API Settings', type: 'config', path: '/system/api' },
      { name: 'Database Config', type: 'config', path: '/system/database' }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Management',
    icon: CreditCard,
    color: 'bg-emerald-500',
    files: [
      { name: 'Billing System', type: 'component', path: '/financial/billing' },
      { name: 'Payment Methods', type: 'config', path: '/financial/payments' },
      { name: 'Transaction Logs', type: 'log', path: '/financial/transactions' },
      { name: 'Revenue Analytics', type: 'report', path: '/financial/revenue' }
    ]
  }
];

// Desktop Apps Configuration
const desktopApps = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: BarChart3, 
    component: 'AdminDashboardStats',
    color: 'bg-blue-500'
  },
  { 
    id: 'users', 
    name: 'Users', 
    icon: Users, 
    component: 'UserManagement',
    color: 'bg-purple-500'
  },
  { 
    id: 'properties', 
    name: 'Properties', 
    icon: Building2, 
    component: 'PropertyManagement',
    color: 'bg-green-500'
  },
  { 
    id: 'security', 
    name: 'Security', 
    icon: Shield, 
    component: 'SecurityComplianceDashboard',
    color: 'bg-red-500'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    icon: BarChart3, 
    component: 'RealTimeDashboardStats',
    color: 'bg-yellow-500'
  },
  { 
    id: 'messages', 
    name: 'Messages', 
    icon: MessageSquare, 
    component: 'CustomerServiceHub',
    color: 'bg-pink-500'
  },
  { 
    id: 'tools', 
    name: 'Tools', 
    icon: Wrench, 
    component: 'ToolsManagement',
    color: 'bg-indigo-500'
  },
  { 
    id: 'reports', 
    name: 'Reports', 
    icon: FileText, 
    component: 'SystemReports',
    color: 'bg-orange-500'
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: Settings, 
    component: 'SMTPSettings',
    color: 'bg-gray-500'
  },
  { 
    id: 'billing', 
    name: 'Billing', 
    icon: CreditCard, 
    component: 'BillingManagement',
    color: 'bg-emerald-500'
  },
  { 
    id: 'seo', 
    name: 'SEO', 
    icon: Globe, 
    component: 'SEOSettings',
    color: 'bg-cyan-500'
  },
  { 
    id: 'kyc', 
    name: 'KYC Review', 
    icon: CheckCircle, 
    component: 'KYCReviewSystem',
    color: 'bg-teal-500'
  }
];

interface Window {
  id: string;
  appId: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export const MacOSAdminDesktop = () => {
  const { user, profile } = useAuth();
  const [openWindows, setOpenWindows] = useState<Window[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showConfigurations, setShowConfigurations] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; windowId: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openApp = (app: typeof desktopApps[0]) => {
    const existingWindow = openWindows.find(w => w.appId === app.id);
    if (existingWindow) {
      setActiveWindow(existingWindow.id);
      return;
    }

    const newWindow: Window = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      title: app.name,
      component: app.component,
      position: { 
        x: 100 + openWindows.length * 30, 
        y: 100 + openWindows.length * 30 
      },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: openWindows.length + 1
    };

    setOpenWindows([...openWindows, newWindow]);
    setActiveWindow(newWindow.id);
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

  const openFileExplorer = (category: any, file?: any) => {
    const newWindow: Window = {
      id: `explorer-${Date.now()}`,
      appId: 'file-explorer',
      title: file ? `${file.name}` : `File Explorer - ${category.name}`,
      component: 'FileExplorer',
      position: { 
        x: 150 + openWindows.length * 30, 
        y: 150 + openWindows.length * 30 
      },
      size: { width: 900, height: 700 },
      isMinimized: false,
      isMaximized: false,
      zIndex: openWindows.length + 1
    };

    setOpenWindows([...openWindows, newWindow]);
    setActiveWindow(newWindow.id);
    setShowStartMenu(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Menu Bar */}
      <div className="h-8 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 text-white text-sm relative z-50">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowStartMenu(!showStartMenu)}
            className="hover:bg-white/10 px-2 py-1 rounded text-xs flex items-center space-x-1"
          >
            <Apple className="w-4 h-4" />
          </button>
          <span className="font-medium">Admin Desktop</span>
          <button 
            onClick={() => setShowSpotlight(true)}
            className="hover:bg-white/10 px-2 py-1 rounded text-xs"
          >
            File
          </button>
          <button className="hover:bg-white/10 px-2 py-1 rounded text-xs">Edit</button>
          <button className="hover:bg-white/10 px-2 py-1 rounded text-xs">View</button>
          <button 
            onClick={() => setShowConfigurations(true)}
            className="hover:bg-white/10 px-2 py-1 rounded text-xs"
          >
            Window
          </button>
        </div>
        
        <div className="flex items-center space-x-3 text-xs">
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
            className={`absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden ${
              activeWindow === window.id ? 'z-50' : 'z-40'
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
              className="h-8 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3 cursor-move"
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(window.id);
                    }}
                    className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 flex items-center justify-center"
                    title="Close"
                  >
                    <X className="w-2 h-2 text-white" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeWindow(window.id);
                    }}
                    className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 flex items-center justify-center"
                    title="Minimize"
                  >
                    <Minimize2 className="w-2 h-2 text-white" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      maximizeWindow(window.id);
                    }}
                    className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 flex items-center justify-center"
                    title="Maximize"
                  >
                    <Maximize2 className="w-2 h-2 text-white" />
                  </button>
                </div>
                <span className="text-sm font-medium text-gray-700">{window.title}</span>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="h-[calc(100%-2rem)] bg-white overflow-auto">
              {window.appId === 'file-explorer' ? (
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <span className="text-lg font-semibold">File Explorer</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fileCategories.map(category => (
                      <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                            <category.icon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-medium text-gray-800">{category.name}</h3>
                        </div>
                        <div className="space-y-2">
                          {category.files.map((file, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                              <FileText className="w-3 h-3" />
                              <span>{file.name}</span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{file.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🚀</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{window.title}</h2>
                    <p className="text-gray-600">Admin module: {window.component}</p>
                    <p className="text-sm text-gray-500 mt-4">This window would load the actual {window.component} component</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/30">
        <div className="flex items-center space-x-3">
          {desktopApps.map((app) => {
            const Icon = app.icon;
            const isOpen = openWindows.some(w => w.appId === app.id);
            
            return (
              <button
                key={app.id}
                onClick={() => openApp(app)}
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-white
                  hover:scale-110 transition-all duration-200 relative
                  ${app.color}
                  ${isOpen ? 'ring-2 ring-white/50' : ''}
                `}
                title={app.name}
              >
                <Icon className="w-6 h-6" />
                {isOpen && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
          
          {/* File Explorer */}
          <button
            onClick={() => openFileExplorer({ name: 'All Files' })}
            className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-200"
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
            className="absolute top-8 left-4 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 w-80 max-h-96 overflow-y-auto z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Admin Control Center</h3>
              <p className="text-sm text-gray-600">Project Files & Configuration</p>
            </div>
            
            <div className="p-2">
              {fileCategories.map(category => (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${category.color}`}>
                        <category.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{category.name}</span>
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
                          onClick={() => openFileExplorer(category, file)}
                          className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 rounded text-left"
                        >
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{file.name}</span>
                          <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">{file.type}</span>
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

      {/* Configurations Panel */}
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
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Display Settings</span>
                </div>
                <button className="text-blue-600 text-sm hover:underline">Configure</button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Database Connection</span>
                </div>
                <button className="text-green-600 text-sm hover:underline">Manage</button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">System Preferences</span>
                </div>
                <button className="text-gray-600 text-sm hover:underline">Edit</button>
              </div>
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
  );
};

export default MacOSAdminDesktop;