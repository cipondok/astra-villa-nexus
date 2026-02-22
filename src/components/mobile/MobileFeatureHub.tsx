import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Gavel, MessageCircle, MapPin, Crown,
  Sparkles, Lock, Check, Star, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isPremium: boolean;
  productId?: string;
  color: string;
}

const MOBILE_FEATURES: MobileFeature[] = [
  {
    id: 'ar-preview',
    name: 'AR Property Preview',
    description: 'View properties through your camera with virtual staging',
    icon: Camera,
    path: '/mobile/ar-preview',
    isPremium: true,
    productId: 'ar_preview_unlock',
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'live-auctions',
    name: 'Live Auctions',
    description: 'Bid on properties in real-time',
    icon: Gavel,
    path: '/mobile/auctions',
    isPremium: false,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'community-chat',
    name: 'Community Chat',
    description: 'Connect with neighbors and local communities',
    icon: MessageCircle,
    path: '/mobile/community',
    isPremium: false,
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'property-journey',
    name: 'Property Journey',
    description: 'Track your search-to-purchase timeline',
    icon: MapPin,
    path: '/mobile/journey',
    isPremium: true,
    productId: 'journey_pro',
    color: 'from-blue-500 to-cyan-600'
  }
];

const MobileFeatureHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(null);

  // Fetch user's purchased products
  const { data: purchases = [] } = useQuery({
    queryKey: ['iap-purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mobile_iap_transactions')
        .select('product_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');
      if (error) throw error;
      return data.map(p => p.product_id);
    },
    enabled: !!user
  });

  // Fetch available IAP products
  const { data: products = [] } = useQuery({
    queryKey: ['iap-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_iap_products')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Login required');
      
      const product = products.find(p => p.product_id === productId);
      if (!product) throw new Error('Product not found');

      // Create purchase record (simulated - in production would integrate with app store)
      const { error } = await supabase
        .from('mobile_iap_transactions')
        .insert({
          user_id: user.id,
          product_id: productId,
          amount: product.price_idr,
          currency: 'IDR',
          status: 'completed',
          store: 'web', // Would be 'ios' or 'android' in native app
          transaction_id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['iap-purchases'] });
      toast({
        title: 'Purchase Successful!',
        description: 'Feature unlocked. Enjoy!',
      });
      setPurchasingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive'
      });
      setPurchasingProduct(null);
    }
  });

  const hasAccess = (feature: MobileFeature) => {
    if (!feature.isPremium) return true;
    if (!feature.productId) return true;
    return purchases.includes(feature.productId);
  };

  const getProductPrice = (productId?: string) => {
    if (!productId) return null;
    const product = products.find(p => p.product_id === productId);
    return product ? `IDR ${product.price_idr.toLocaleString()}` : null;
  };

  const handleFeatureClick = (feature: MobileFeature) => {
    if (!hasAccess(feature)) {
      if (!user) {
        toast({
          title: 'Login Required',
          description: 'Please login to access premium features',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }
      // Show purchase option
      setPurchasingProduct(feature.productId || null);
      return;
    }
    navigate(feature.path);
  };

  const handlePurchase = () => {
    if (purchasingProduct) {
      purchaseMutation.mutate(purchasingProduct);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Mobile Features
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unlock powerful tools for your property search
        </p>
      </div>

      {/* Premium Banner */}
      {user && purchases.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Unlock Premium Features</h3>
              <p className="text-xs text-muted-foreground">Get AR Preview & Journey Pro</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature Grid */}
      <div className="grid gap-4">
        {MOBILE_FEATURES.map((feature, idx) => {
          const hasFeatureAccess = hasAccess(feature);
          const price = getProductPrice(feature.productId);

          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden cursor-pointer transition-all duration-300",
                  "active:scale-[0.98]",
                  !hasFeatureAccess && "opacity-80"
                )}
                onClick={() => handleFeatureClick(feature)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Icon Section */}
                    <div className={cn(
                      "w-20 flex items-center justify-center",
                      `bg-gradient-to-br ${feature.color}`
                    )}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {feature.name}
                            {feature.isPremium && !hasFeatureAccess && (
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            {hasFeatureAccess && feature.isPremium && (
                              <Check className="h-3.5 w-3.5 text-chart-1" />
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                      </div>

                      {/* Premium badge or access indicator */}
                      <div className="mt-2 flex items-center gap-2">
                        {feature.isPremium ? (
                          hasFeatureAccess ? (
                            <Badge variant="secondary" className="text-[10px]">
                              <Star className="h-2.5 w-2.5 mr-1" /> Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              <Crown className="h-2.5 w-2.5 mr-1" /> Premium • {price}
                            </Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Free
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchasingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setPurchasingProduct(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              
              {(() => {
                const product = products.find(p => p.product_id === purchasingProduct);
                const feature = MOBILE_FEATURES.find(f => f.productId === purchasingProduct);
                
                return (
                  <>
                    <div className="text-center mb-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                        `bg-gradient-to-br ${feature?.color || 'from-primary to-primary/80'}`
                      )}>
                        {feature && <feature.icon className="h-8 w-8 text-white" />}
                      </div>
                      <h2 className="text-xl font-bold">{product?.name || 'Premium Feature'}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product?.description || 'Unlock this premium feature'}
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">One-time purchase</span>
                        <span className="text-xl font-bold">
                          {product ? `IDR ${product.price_idr.toLocaleString()}` : 'Loading...'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 text-lg"
                      onClick={handlePurchase}
                      disabled={purchaseMutation.isPending}
                    >
                      {purchaseMutation.isPending ? 'Processing...' : 'Purchase Now'}
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground mt-4">
                      By purchasing, you agree to our Terms of Service
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFeatureHub;
