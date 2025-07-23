import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { 
  User, Settings, BarChart3, Shield, Users, Building2, 
  MessageSquare, Wrench, FileText, Mail, CreditCard, Search,
  Globe, CheckCircle, Clock, Wifi, Battery,
  VolumeX, Minimize2, Maximize2, X, Folder, FolderOpen,
  ChevronRight, Menu, Home, Cog, Monitor, Database, Sun, Moon
} from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import DynamicAdminContent from './DynamicAdminContent';
import SystemSettings from './SystemSettings';

// Desktop Apps Configuration with real components
const desktopApps = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: BarChart3, 
    section: 'dashboard',
    color: 'bg-blue-500'
  },
  { 
    id: 'users', 
    name: 'Users', 
    icon: Users, 
    section: 'users',
    color: 'bg-purple-500'
  },
  { 
    id: 'properties', 
    name: 'Properties', 
    icon: Building2, 
    section: 'properties',
    color: 'bg-green-500'
  },
  { 
    id: 'security', 
    name: 'Security', 
    icon: Shield, 
    section: 'security',
    color: 'bg-red-500'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    icon: BarChart3, 
    section: 'analytics',
    color: 'bg-yellow-500'
  },
  { 
    id: 'messages', 
    name: 'Messages', 
    icon: MessageSquare, 
    section: 'customer-service',
    color: 'bg-pink-500'
  },
  { 
    id: 'tools', 
    name: 'Tools', 
    icon: Wrench, 
    section: 'tools',
    color: 'bg-indigo-500'
  },
  { 
    id: 'reports', 
    name: 'Reports', 
    icon: FileText, 
    section: 'reports',
    color: 'bg-orange-500'
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: Settings, 
    section: 'settings',
    color: 'bg-gray-500'
  },
  { 
    id: 'billing', 
    name: 'Billing', 
    icon: CreditCard, 
    section: 'billing',
    color: 'bg-emerald-500'
  },
  { 
    id: 'seo', 
    name: 'SEO', 
    icon: Globe, 
    section: 'seo',
    color: 'bg-cyan-500'
  },
  { 
    id: 'kyc', 
    name: 'KYC Review', 
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
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [openWindows, setOpenWindows] = useState<Window[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
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

  return (
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
            onClick={toggleTheme}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              theme === 'dark' ? 'hover:bg-blue-600/20' : 'hover:bg-blue-200/40'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
          </button>
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

      {/* Dock */}
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