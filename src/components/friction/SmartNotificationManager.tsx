import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellOff, TrendingDown, Home, MessageCircle, 
  BarChart3, Volume2, VolumeX, Clock, Moon,
  Check, Filter, Zap, Mail, Smartphone
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

/**
 * Smart Notification Manager
 * Solves: Notification overload, unclear customization, all-or-nothing
 * 
 * Technical: Granular controls, smart bundling, quiet hours, AI filtering
 * Psychological: Clear value props, preview samples, "you're in control"
 * Alternative: Email digest, WhatsApp-only, weekly summary
 */

interface NotificationCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'off';
  sample: string;
  color: string;
}

const SmartNotificationManager: React.FC = () => {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState(22);
  const [quietEnd, setQuietEnd] = useState(7);
  const [deliveryMethod, setDeliveryMethod] = useState<'all' | 'app' | 'email' | 'whatsapp'>('all');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'price_drops',
      name: 'Price Drops',
      icon: TrendingDown,
      description: 'When saved properties reduce in price',
      enabled: true,
      frequency: 'instant',
      sample: '🔻 Villa Sunset dropped 15%! Now Rp 1.8M/month',
      color: 'text-green-500',
    },
    {
      id: 'new_matches',
      name: 'New Matches',
      icon: Home,
      description: 'Properties matching your saved searches',
      enabled: true,
      frequency: 'daily',
      sample: '🏠 5 new properties match your "3BR Seminyak" search',
      color: 'text-primary',
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: MessageCircle,
      description: 'Agent replies and inquiry updates',
      enabled: true,
      frequency: 'instant',
      sample: '💬 Agent Budi replied to your inquiry',
      color: 'text-blue-500',
    },
    {
      id: 'market_updates',
      name: 'Market Updates',
      icon: BarChart3,
      description: 'Weekly trends and insights',
      enabled: false,
      frequency: 'weekly',
      sample: '📊 Bali market report: +5% prices in Seminyak',
      color: 'text-purple-500',
    },
  ]);

  const updateCategory = (id: string, updates: Partial<NotificationCategory>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const frequencyOptions = [
    { value: 'instant', label: 'Instant', icon: Zap },
    { value: 'daily', label: 'Daily', icon: Clock },
    { value: 'weekly', label: 'Weekly', icon: Clock },
    { value: 'off', label: 'Off', icon: BellOff },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Master toggle with empowerment message (Psychological) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-xl border",
          masterEnabled 
            ? "bg-primary/5 border-primary/30" 
            : "bg-muted/50 border-border/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              masterEnabled ? "bg-primary/20" : "bg-muted"
            )}>
              {masterEnabled ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {masterEnabled ? 'Notifications On' : 'Notifications Off'}
              </h3>
              <p className="text-xs text-muted-foreground">
                You're in control of what you receive
              </p>
            </div>
          </div>
          <Switch
            checked={masterEnabled}
            onCheckedChange={setMasterEnabled}
          />
        </div>
      </motion.div>

      {/* Delivery method (Alternative - channel choice) */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Deliver via:</p>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All', icon: Bell },
            { value: 'app', label: 'App', icon: Smartphone },
            { value: 'email', label: 'Email', icon: Mail },
            { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
          ].map((method) => (
            <button
              key={method.value}
              onClick={() => setDeliveryMethod(method.value as any)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all",
                "active:scale-95",
                deliveryMethod === method.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/30"
              )}
            >
              <method.icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category controls (Technical - Granular) */}
      <div className={cn("space-y-3", !masterEnabled && "opacity-50 pointer-events-none")}>
        <p className="text-sm font-medium text-foreground">Notification Types</p>
        
        {categories.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 bg-card rounded-xl border border-border/50"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                category.enabled ? "bg-primary/10" : "bg-muted"
              )}>
                <category.icon className={cn("h-4 w-4", category.enabled ? category.color : "text-muted-foreground")} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{category.name}</h4>
                  <Switch
                    checked={category.enabled}
                    onCheckedChange={(checked) => updateCategory(category.id, { enabled: checked })}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{category.description}</p>

                {/* Frequency selector */}
                {category.enabled && (
                  <div className="flex gap-1 mt-2">
                    {frequencyOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateCategory(category.id, { frequency: opt.value as any })}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                          "active:scale-95",
                          category.frequency === opt.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Preview sample (Psychological) */}
                <button
                  onClick={() => setShowPreview(showPreview === category.id ? null : category.id)}
                  className="mt-2 text-[10px] text-primary"
                >
                  {showPreview === category.id ? 'Hide preview' : 'Preview sample'}
                </button>
                
                <AnimatePresence>
                  {showPreview === category.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <p className="text-xs text-foreground">{category.sample}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quiet hours (Technical - Smart Bundling) */}
      <div className={cn(
        "p-4 bg-card rounded-xl border border-border/50 space-y-4",
        !masterEnabled && "opacity-50 pointer-events-none"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Moon className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Quiet Hours</h4>
              <p className="text-[11px] text-muted-foreground">Silence non-urgent notifications</p>
            </div>
          </div>
          <Switch
            checked={quietHoursEnabled}
            onCheckedChange={setQuietHoursEnabled}
          />
        </div>

        {quietHoursEnabled && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">From {quietStart}:00</span>
              <span className="text-muted-foreground">To {quietEnd}:00</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Start</span>
              <Slider
                value={[quietStart]}
                onValueChange={([val]) => setQuietStart(val)}
                min={18}
                max={23}
                step={1}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">End</span>
              <Slider
                value={[quietEnd]}
                onValueChange={([val]) => setQuietEnd(val)}
                min={5}
                max={10}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick mute options (Psychological - Easy escape) */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs active:scale-95">
          <VolumeX className="h-3.5 w-3.5 mr-1.5" />
          Mute 24 hours
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs active:scale-95">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Mute 1 week
        </Button>
      </div>

      {/* Save confirmation */}
      <div className="pt-4 border-t border-border/30">
        <Button className="w-full h-11 active:scale-95">
          <Check className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default SmartNotificationManager;
