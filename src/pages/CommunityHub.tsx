import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  MessageCircle,
  Wrench,
  Calendar,
  Target,
  Trophy,
  ArrowLeft,
  Users,
  Sparkles
} from 'lucide-react';
import NeighborhoodGuides from '@/components/community/NeighborhoodGuides';
import LocalServiceDirectory from '@/components/community/LocalServiceDirectory';
import CommunityEvents from '@/components/community/CommunityEvents';
import GroupBuyingDeals from '@/components/community/GroupBuyingDeals';
import CommunityLeaderboard from '@/components/community/CommunityLeaderboard';

const CommunityHub: React.FC = () => {
  const navigate = useNavigate();

  const tabs = [
    { value: 'guides', label: 'Neighborhood Guides', icon: MapPin },
    { value: 'services', label: 'Local Services', icon: Wrench },
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'deals', label: 'Group Deals', icon: Target },
    { value: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Community Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Connect, share, and grow with your neighbors
                </p>
              </div>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="guides" className="space-y-6">
          <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-5 h-auto p-1">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="guides" className="mt-6">
              <NeighborhoodGuides />
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <LocalServiceDirectory />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <CommunityEvents />
            </TabsContent>

            <TabsContent value="deals" className="mt-6">
              <GroupBuyingDeals />
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <CommunityLeaderboard />
            </TabsContent>
          </motion.div>
        </Tabs>
      </main>
    </div>
  );
};

export default CommunityHub;
