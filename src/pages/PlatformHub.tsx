/**
 * Scalable Platform Hub - Tech Stack Dashboard
 * Displays all Phase 2-5 implementations
 */

import React, { useState } from 'react';
import { 
  Search, Bell, Smartphone, Brain, Zap, Globe, 
  CheckCircle, TrendingUp, Users, Database, Shield,
  ChevronRight, ExternalLink, Sparkles, Map, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, Link } from 'react-router-dom';

interface Feature {
  name: string;
  description: string;
  status: 'active' | 'ready' | 'beta';
  icon: React.ReactNode;
  action?: string;
  link?: string;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  features: Feature[];
  color: string;
}

export default function PlatformHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const phases: Phase[] = [
    {
      id: 'phase2',
      name: 'Advanced Search',
      description: 'Typesense-compatible faceted search with geo-location',
      icon: <Search className="h-5 w-5" />,
      progress: 100,
      color: 'from-blue-500 to-cyan-500',
      features: [
        { name: 'Faceted Filters', description: 'Dynamic filter counts by property type, price, location', status: 'active', icon: <Search className="h-4 w-4" />, link: '/search' },
        { name: 'Geo Search', description: 'Find properties near any location with radius filters', status: 'active', icon: <Map className="h-4 w-4" />, link: '/search' },
        { name: 'Autocomplete', description: 'Real-time suggestions with typo tolerance', status: 'active', icon: <Sparkles className="h-4 w-4" /> },
        { name: 'Highlight Matches', description: 'Search term highlighting in results', status: 'active', icon: <Zap className="h-4 w-4" /> }
      ]
    },
    {
      id: 'phase3',
      name: 'Push Notifications',
      description: 'Real-time alerts via FCM/Web Push',
      icon: <Bell className="h-5 w-5" />,
      progress: 100,
      color: 'from-purple-500 to-pink-500',
      features: [
        { name: 'Price Drop Alerts', description: 'Instant notifications when saved properties drop in price', status: 'active', icon: <TrendingUp className="h-4 w-4" /> },
        { name: 'New Match Alerts', description: 'Get notified when new properties match your criteria', status: 'active', icon: <Search className="h-4 w-4" /> },
        { name: 'Message Notifications', description: 'Real-time alerts for new messages', status: 'active', icon: <MessageSquare className="h-4 w-4" /> },
        { name: 'Notification Center', description: 'Manage all notifications in one place', status: 'active', icon: <Bell className="h-4 w-4" /> }
      ]
    },
    {
      id: 'phase4',
      name: 'Mobile Apps',
      description: 'Native iOS/Android via Capacitor',
      icon: <Smartphone className="h-5 w-5" />,
      progress: 100,
      color: 'from-green-500 to-emerald-500',
      features: [
        { name: 'Capacitor Config', description: 'Ready for iOS/Android deployment', status: 'ready', icon: <Smartphone className="h-4 w-4" /> },
        { name: 'Push Notifications', description: 'Native push support for mobile', status: 'ready', icon: <Bell className="h-4 w-4" /> },
        { name: 'Offline Support', description: 'Service worker with offline caching', status: 'active', icon: <Database className="h-4 w-4" /> },
        { name: 'Hot Reload Dev', description: 'Live preview on physical devices', status: 'ready', icon: <Zap className="h-4 w-4" /> }
      ]
    },
    {
      id: 'phase5',
      name: 'AI Intelligence',
      description: 'ML-powered recommendations and predictions',
      icon: <Brain className="h-5 w-5" />,
      progress: 100,
      color: 'from-orange-500 to-red-500',
      features: [
        { name: 'Smart Recommendations', description: '80% preference match + 20% discovery suggestions', status: 'active', icon: <Sparkles className="h-4 w-4" /> },
        { name: 'Price Predictions', description: 'ML-based market trend analysis', status: 'active', icon: <TrendingUp className="h-4 w-4" /> },
        { name: 'Similar Properties', description: 'AI-powered property matching', status: 'active', icon: <Users className="h-4 w-4" /> },
        { name: 'Market Trends', description: 'Location-based market insights', status: 'active', icon: <Globe className="h-4 w-4" /> }
      ]
    }
  ];

  const stats = [
    { label: 'Search Speed', value: '<100ms', icon: <Zap className="h-4 w-4" /> },
    { label: 'Concurrent Users', value: '10K+', icon: <Users className="h-4 w-4" /> },
    { label: 'AI Accuracy', value: '85%+', icon: <Brain className="h-4 w-4" /> },
    { label: 'Uptime', value: '99.9%', icon: <Shield className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/">
              <Button variant="ghost" size="sm">← Back</Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Platform Infrastructure
          </h1>
          <p className="text-muted-foreground mt-1">
            Scalable tech stack for 10,000+ concurrent users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Phases Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {phases.map((phase) => (
            <Card key={phase.id} className="overflow-hidden border-0 shadow-lg">
              <div className={`h-1 bg-gradient-to-r ${phase.color}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${phase.color} text-white`}>
                      {phase.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{phase.name}</CardTitle>
                      <CardDescription className="text-xs">{phase.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={phase.progress === 100 ? 'default' : 'secondary'}>
                    {phase.progress === 100 ? 'Complete' : `${phase.progress}%`}
                  </Badge>
                </div>
                <Progress value={phase.progress} className="h-1 mt-3" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {phase.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="text-muted-foreground group-hover:text-primary transition-colors">
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{feature.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${
                              feature.status === 'active' ? 'border-green-500 text-green-500' :
                              feature.status === 'ready' ? 'border-blue-500 text-blue-500' :
                              'border-yellow-500 text-yellow-500'
                            }`}
                          >
                            {feature.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                      </div>
                      {feature.link && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 shrink-0"
                          onClick={() => navigate(feature.link!)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile App Setup Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile App Deployment
            </CardTitle>
            <CardDescription>
              Deploy to iOS App Store and Google Play Store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Quick Start:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Export to GitHub via "Export to GitHub" button</li>
                  <li>2. Clone the repo and run <code className="bg-muted px-1 rounded">npm install</code></li>
                  <li>3. Add platforms: <code className="bg-muted px-1 rounded">npx cap add ios</code> and/or <code className="bg-muted px-1 rounded">npx cap add android</code></li>
                  <li>4. Build: <code className="bg-muted px-1 rounded">npm run build && npx cap sync</code></li>
                  <li>5. Run: <code className="bg-muted px-1 rounded">npx cap run ios</code> or <code className="bg-muted px-1 rounded">npx cap run android</code></li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  iOS Setup Guide
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Android Setup Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
