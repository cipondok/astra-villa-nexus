import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CustomerServiceDashboard from '@/components/dashboard/CustomerServiceDashboard';
import ProfileUpgradeCard from '@/components/ProfileUpgradeCard';
import ApplicationStatusBar from '@/components/dashboard/ApplicationStatusBar';
import AstraWalletCard from '@/components/dashboard/AstraWalletCard';
import { useUserDashboardData } from '@/hooks/useUserDashboardData';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useUserMembership } from '@/hooks/useUserMembership';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  User, 
  Home, 
  Settings, 
  Bell, 
  Activity,
  Heart,
  Calendar,
  MessageSquare,
  Coins,
  Search,
  ChevronRight,
  UserPlus,
  Sparkles,
  TrendingUp,
  Clock,
  Edit,
  LogOut
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { stats, savedProperties, recentActivity, isLoading } = useUserDashboardData();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  const { balance } = useAstraToken();
  const { membershipLevel } = useUserMembership();

  const primaryRoleRaw = userRoles.find(role => role !== 'general_user') || userRoles[0] || 'general_user';
  const hasUpgradedRole = userRoles.some(role => 
    ['property_owner', 'agent', 'vendor'].includes(role)
  );
  
  // Format role for display (convert snake_case to Title Case)
  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  const primaryRole = formatRole(primaryRoleRaw);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/?auth=true');
    }
  }, [user, loading, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <Sparkles className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-sm font-medium text-muted-foreground">Loading your dashboard...</h2>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  if (userRoles.includes('customer_service')) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pt-16 sm:pt-20">
        <CustomerServiceDashboard />
      </div>
    );
  }

  const statsData = [
    { icon: Heart, value: stats.savedProperties, label: 'Saved', color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-500/10' },
    { icon: Calendar, value: stats.messages, label: 'Bookings', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10' },
    { icon: Activity, value: recentActivity.length, label: 'Activities', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/10' },
    { icon: Coins, value: balance?.available_tokens || 0, label: 'ASTRA', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-500/10' },
  ];

  const quickActions = [
    { icon: Search, label: 'Browse', path: '/dijual', color: 'text-primary' },
    { icon: Heart, label: `Saved (${stats.savedProperties})`, path: '/favorites', color: 'text-rose-500' },
    { icon: Coins, label: 'ASTRA', path: '/astra-tokens', color: 'text-amber-500' },
    { icon: MessageSquare, label: 'Support', path: '/contact', color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
        
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 via-primary to-accent/90 p-4 sm:p-5 shadow-lg shadow-primary/20"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative flex items-center gap-4">
            {/* User Avatar - Larger Display */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full ring-3 ring-white/40 flex-shrink-0 overflow-hidden shadow-lg"
            >
              <Avatar className="h-full w-full">
                <AvatarImage 
                  src={profile?.avatar_url || ''} 
                  alt={profile?.full_name || 'User'} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-lg sm:text-xl font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </motion.div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-primary-foreground truncate">
                {profile?.full_name || user.email?.split('@')[0] || 'User'}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge className="bg-white/25 text-white border-white/40 text-[10px] sm:text-xs px-2 py-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {primaryRole}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-[10px] sm:text-xs px-2 py-0.5 border-amber-400/50 bg-amber-500/30 text-white"
                >
                  🏆 {membershipLevel || 'Basic'}
                </Badge>
              </div>
              <p className="text-primary-foreground/80 text-xs sm:text-sm flex items-center gap-1 mt-1.5">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Last login: Today
              </p>
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/30 transition-colors"
                >
                  <Settings className="h-5 w-5 text-white" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal py-1.5">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-medium leading-none">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-[10px] leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer text-xs py-1.5">
                  <User className="mr-2 h-3.5 w-3.5" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile/edit')} className="cursor-pointer text-xs py-1.5">
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-xs py-1.5">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/notifications')} className="cursor-pointer text-xs py-1.5">
                  <Bell className="mr-2 h-3.5 w-3.5" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Role Dashboard Card - Slim */}
        {hasUpgradedRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white border-0 cursor-pointer group shadow-md shadow-emerald-500/20"
              onClick={() => {
                if (userRoles.includes('property_owner')) navigate('/dashboard/property-owner');
                else if (userRoles.includes('agent')) navigate('/dashboard/agent');
                else if (userRoles.includes('vendor')) navigate('/dashboard/vendor');
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <CardContent className="p-2 sm:p-2.5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div>
                      <p className="text-[8px] text-white/70 flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" /> Your Dashboard
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold capitalize">
                        {primaryRole?.replace('_', ' ')} Portal
                      </h3>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid - Slim Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="relative overflow-hidden backdrop-blur-sm bg-card/80 border-border/50 hover:shadow-sm transition-all duration-300 group">
                <CardContent className="p-2 sm:p-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-md ${stat.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 bg-gradient-to-br ${stat.color} bg-clip-text`} style={{ color: `hsl(var(--primary))` }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{stat.value}</p>
                      <p className="text-[8px] sm:text-[9px] text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Application Status */}
        <ApplicationStatusBar />

        {/* Upgrade Card */}
        {!hasUpgradedRole && <ProfileUpgradeCard />}

        {/* ASTRA Wallet Card */}
        <AstraWalletCard />

        {/* Dashboard Tabs - Slim */}
        <Tabs defaultValue="overview" className="space-y-2">
          <TabsList className="grid w-full grid-cols-2 h-8 bg-muted/50 backdrop-blur-sm p-0.5">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Home className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="h-3 w-3" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-2 mt-2">
            {/* Quick Actions - Slim */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Button 
                    variant="outline" 
                    className="h-auto w-full p-1.5 sm:p-2 flex flex-col items-center gap-0.5 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all" 
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className={`h-3.5 w-3.5 ${action.color}`} />
                    <span className="text-[7px] sm:text-[9px] text-muted-foreground truncate w-full text-center">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity - Slim */}
            <Card className="backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader className="p-2 pb-1.5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-1.5 text-xs">
                    <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                      <Activity className="h-3 w-3 text-primary" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  {recentActivity.length > 0 && (
                    <Badge variant="secondary" className="text-[8px] px-1 py-0">
                      {recentActivity.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary"></div>
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-1.5 p-1.5 bg-muted/30 hover:bg-muted/50 rounded-md transition-colors group"
                      >
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-2.5 w-2.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium truncate capitalize">
                            {activity.activity_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[8px] text-muted-foreground truncate">
                            {activity.activity_description}
                          </p>
                        </div>
                        <span className="text-[8px] text-muted-foreground flex-shrink-0 opacity-70">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                      <Bell className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">No recent activity</p>
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                      Start browsing to see activity
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 h-6 text-[9px] px-2" 
                      onClick={() => navigate('/dijual')}
                    >
                      <Search className="h-2.5 w-2.5 mr-0.5" />
                      Browse
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-2 mt-2">
            <Card className="backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader className="p-2 pb-1.5">
                <CardTitle className="flex items-center gap-1.5 text-xs">
                  <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: 'Full Name', value: profile?.full_name || 'Not set' },
                    { label: 'Email', value: user.email || 'Not set' },
                    { label: 'Role', value: primaryRole?.replace('_', ' ') || 'User' },
                    { label: 'Status', value: hasUpgradedRole ? 'Active' : 'Basic', badge: true },
                  ].map((item) => (
                    <div key={item.label} className="p-1.5 bg-muted/30 rounded">
                      <label className="text-[8px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</label>
                      {item.badge ? (
                        <Badge 
                          className={`text-[8px] mt-0.5 ${hasUpgradedRole ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' : ''}`}
                          variant={hasUpgradedRole ? 'outline' : 'secondary'}
                        >
                          {item.value}
                        </Badge>
                      ) : (
                        <p className="text-[10px] font-medium truncate capitalize">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button 
                    onClick={() => navigate('/profile/edit')} 
                    className="h-7 text-[9px] flex-1"
                    size="sm"
                  >
                    <User className="h-2.5 w-2.5 mr-0.5" />
                    Edit Profile
                  </Button>
                  {hasUpgradedRole ? (
                    <Button 
                      variant="default"
                      onClick={() => {
                        if (userRoles.includes('property_owner')) navigate('/dashboard/property-owner');
                        else if (userRoles.includes('agent')) navigate('/dashboard/agent');
                        else if (userRoles.includes('vendor')) navigate('/dashboard/vendor');
                      }} 
                      className="h-7 text-[9px] flex-1 bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      <ChevronRight className="h-2.5 w-2.5 mr-0.5" />
                      Dashboard
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => {}} 
                      className="h-7 text-[9px] flex-1"
                      size="sm"
                    >
                      <UserPlus className="h-2.5 w-2.5 mr-0.5" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboardPage;
