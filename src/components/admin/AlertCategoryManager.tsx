import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Settings, 
  Bell, 
  Users, 
  Building2, 
  MessageSquare, 
  Shield, 
  Flag, 
  Wrench, 
  CreditCard, 
  Activity,
  AlertTriangle,
  Trash2,
  Edit
} from 'lucide-react';

interface AlertCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  urgencyLevels: number[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

const AlertCategoryManager = () => {
  const [categories, setCategories] = useState<AlertCategory[]>([
    {
      id: 'users',
      name: 'User Management',
      description: 'User registrations, verifications, and account issues',
      icon: 'Users',
      color: '#3B82F6',
      priority: 'medium',
      isActive: true,
      urgencyLevels: [1, 2, 3],
      notificationSettings: { email: true, push: true, sms: false }
    },
    {
      id: 'properties',
      name: 'Property Listings',
      description: 'New properties, approvals, and listing updates',
      icon: 'Building2',
      color: '#10B981',
      priority: 'medium',
      isActive: true,
      urgencyLevels: [1, 2, 3, 4],
      notificationSettings: { email: true, push: true, sms: false }
    },
    {
      id: 'support',
      name: 'Customer Support',
      description: 'Complaints, inquiries, and support tickets',
      icon: 'MessageSquare',
      color: '#F59E0B',
      priority: 'high',
      isActive: true,
      urgencyLevels: [2, 3, 4, 5],
      notificationSettings: { email: true, push: true, sms: true }
    },
    {
      id: 'security',
      name: 'Security Alerts',
      description: 'Login attempts, security breaches, and fraud detection',
      icon: 'Shield',
      color: '#EF4444',
      priority: 'urgent',
      isActive: true,
      urgencyLevels: [4, 5],
      notificationSettings: { email: true, push: true, sms: true }
    },
    {
      id: 'moderation',
      name: 'Content Moderation',
      description: 'Reports, flags, and content review requests',
      icon: 'Flag',
      color: '#8B5CF6',
      priority: 'high',
      isActive: true,
      urgencyLevels: [3, 4, 5],
      notificationSettings: { email: true, push: true, sms: false }
    },
    {
      id: 'vendors',
      name: 'Vendor Management',
      description: 'Vendor applications, services, and compliance',
      icon: 'Wrench',
      color: '#06B6D4',
      priority: 'medium',
      isActive: true,
      urgencyLevels: [1, 2, 3],
      notificationSettings: { email: true, push: false, sms: false }
    },
    {
      id: 'payments',
      name: 'Payment & Billing',
      description: 'Payment issues, billing problems, and transaction alerts',
      icon: 'CreditCard',
      color: '#84CC16',
      priority: 'high',
      isActive: true,
      urgencyLevels: [3, 4, 5],
      notificationSettings: { email: true, push: true, sms: true }
    },
    {
      id: 'system',
      name: 'System Operations',
      description: 'System health, performance, and maintenance alerts',
      icon: 'Activity',
      color: '#64748B',
      priority: 'medium',
      isActive: true,
      urgencyLevels: [2, 3, 4],
      notificationSettings: { email: true, push: false, sms: false }
    }
  ]);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'Bell',
    color: '#3B82F6',
    priority: 'medium' as const
  });

  const getIcon = (iconName: string, size = 20) => {
    const iconProps = { size, className: "text-current" };
    switch (iconName) {
      case 'Users': return <Users {...iconProps} />;
      case 'Building2': return <Building2 {...iconProps} />;
      case 'MessageSquare': return <MessageSquare {...iconProps} />;
      case 'Shield': return <Shield {...iconProps} />;
      case 'Flag': return <Flag {...iconProps} />;
      case 'Wrench': return <Wrench {...iconProps} />;
      case 'CreditCard': return <CreditCard {...iconProps} />;
      case 'Activity': return <Activity {...iconProps} />;
      case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const updateNotificationSetting = (categoryId: string, setting: keyof AlertCategory['notificationSettings'], value: boolean) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, notificationSettings: { ...cat.notificationSettings, [setting]: value } }
        : cat
    ));
  };

  const addNewCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const category: AlertCategory = {
      id: Date.now().toString(),
      ...newCategory,
      isActive: true,
      urgencyLevels: [1, 2, 3],
      notificationSettings: { email: true, push: true, sms: false }
    };
    
    setCategories(prev => [...prev, category]);
    setNewCategory({
      name: '',
      description: '',
      icon: 'Bell',
      color: '#3B82F6',
      priority: 'medium'
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Category Management
          </CardTitle>
          <CardDescription>
            Customize alert categories, priorities, and notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add New Category */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium mb-3">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              />
              <select
                className="px-3 py-2 border rounded-md"
                value={newCategory.priority}
                onChange={(e) => setNewCategory(prev => ({ ...prev, priority: e.target.value as any }))}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
              <Button onClick={addNewCategory} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {getIcon(category.icon)}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(category.priority)}>
                        {category.priority}
                      </Badge>
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => toggleCategoryStatus(category.id)}
                      />
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Email Notifications</span>
                      <Switch
                        checked={category.notificationSettings.email}
                        onCheckedChange={(value) => updateNotificationSetting(category.id, 'email', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Push Notifications</span>
                      <Switch
                        checked={category.notificationSettings.push}
                        onCheckedChange={(value) => updateNotificationSetting(category.id, 'push', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">SMS Notifications</span>
                      <Switch
                        checked={category.notificationSettings.sms}
                        onCheckedChange={(value) => updateNotificationSetting(category.id, 'sms', value)}
                      />
                    </div>
                  </div>

                  {/* Urgency Levels */}
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground">Urgency Levels: </span>
                    {category.urgencyLevels.map(level => (
                      <Badge key={level} variant="outline" className="ml-1 text-xs">
                        L{level}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Global Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Global Alert Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Real-time Alerts</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-mark as Read after 24h</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sound Notifications</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Desktop Notifications</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertCategoryManager;
