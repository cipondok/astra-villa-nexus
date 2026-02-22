import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CreditCard, Video, X, ChevronDown,
  Instagram, MessageCircle, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import SocialCommerceHub from './SocialCommerceHub';
import OneClickPreApproval from './OneClickPreApproval';
import VirtualTourBooking from './VirtualTourBooking';

interface PropertySocialActionsProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyAddress?: string;
  propertyImage?: string;
  className?: string;
}

const PropertySocialActions: React.FC<PropertySocialActionsProps> = ({
  propertyId,
  propertyTitle,
  propertyPrice,
  propertyAddress,
  propertyImage,
  className
}) => {
  const [activeSheet, setActiveSheet] = useState<'commerce' | 'preapproval' | 'booking' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      key: 'commerce',
      icon: ShoppingBag,
      label: 'Shop',
      color: 'bg-gradient-to-r from-accent to-primary',
      description: 'Buy via social platforms'
    },
    {
      key: 'preapproval',
      icon: CreditCard,
      label: 'KPR',
      color: 'bg-gradient-to-r from-primary to-primary/80',
      description: 'One-click pre-approval'
    },
    {
      key: 'booking',
      icon: Video,
      label: 'Tour',
      color: 'bg-gradient-to-r from-accent to-primary',
      description: 'Book virtual/in-person'
    }
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 md:hidden">
        <AnimatePresence>
          {isExpanded && (
            <>
              {actions.map((action, idx) => (
                <motion.div
                  key={action.key}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { delay: (actions.length - 1 - idx) * 0.05 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: 20,
                    transition: { delay: idx * 0.03 }
                  }}
                >
                  <Sheet open={activeSheet === action.key} onOpenChange={(open) => setActiveSheet(open ? action.key as any : null)}>
                    <SheetTrigger asChild>
                      <Button
                        className={cn(
                          "h-12 w-12 rounded-full shadow-lg",
                          action.color,
                          "text-white"
                        )}
                      >
                        <action.icon className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
                      <SheetHeader className="text-left pb-4">
                        <SheetTitle className="flex items-center gap-2">
                          <action.icon className="h-5 w-5" />
                          {action.label === 'Shop' && 'Social Commerce'}
                          {action.label === 'KPR' && 'Mortgage Pre-Approval'}
                          {action.label === 'Tour' && 'Book a Tour'}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="overflow-y-auto h-[calc(85vh-80px)] pb-8">
                        {action.key === 'commerce' && (
                          <SocialCommerceHub
                            propertyId={propertyId}
                            propertyTitle={propertyTitle}
                            propertyImage={propertyImage}
                            propertyPrice={propertyPrice}
                          />
                        )}
                        {action.key === 'preapproval' && (
                          <OneClickPreApproval
                            propertyId={propertyId}
                            propertyPrice={propertyPrice}
                          />
                        )}
                        {action.key === 'booking' && (
                          <VirtualTourBooking
                            propertyId={propertyId}
                            propertyTitle={propertyTitle}
                            propertyAddress={propertyAddress}
                          />
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-14 w-14 rounded-full shadow-xl flex items-center justify-center",
            "bg-gradient-to-br from-primary to-primary/80",
            "text-white transition-transform"
          )}
          animate={{ rotate: isExpanded ? 45 : 0 }}
        >
          {isExpanded ? <X className="h-6 w-6" /> : <Share2 className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Desktop Inline Actions */}
      <div className="hidden md:block">
        <div className="flex gap-3 flex-wrap">
          {actions.map((action) => (
            <Sheet key={action.key} open={activeSheet === action.key} onOpenChange={(open) => setActiveSheet(open ? action.key as any : null)}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 hover:shadow-md transition-all"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[450px] sm:w-[540px]">
                <SheetHeader className="pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <action.icon className="h-5 w-5" />
                    {action.label === 'Shop' && 'Social Commerce'}
                    {action.label === 'KPR' && 'Mortgage Pre-Approval'}
                    {action.label === 'Tour' && 'Book a Tour'}
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(100vh-120px)] pr-2">
                  {action.key === 'commerce' && (
                    <SocialCommerceHub
                      propertyId={propertyId}
                      propertyTitle={propertyTitle}
                      propertyImage={propertyImage}
                      propertyPrice={propertyPrice}
                    />
                  )}
                  {action.key === 'preapproval' && (
                    <OneClickPreApproval
                      propertyId={propertyId}
                      propertyPrice={propertyPrice}
                    />
                  )}
                  {action.key === 'booking' && (
                    <VirtualTourBooking
                      propertyId={propertyId}
                      propertyTitle={propertyTitle}
                      propertyAddress={propertyAddress}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </div>

      {/* Compact Quick Actions Bar */}
      <div className="md:hidden mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => setActiveSheet('preapproval'), 100);
            }}
          >
            <CreditCard className="h-4 w-4" />
            Quick KPR
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => setActiveSheet('booking'), 100);
            }}
          >
            <Video className="h-4 w-4" />
            Book Tour
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 whitespace-nowrap"
          >
            <MessageCircle className="h-4 w-4 text-chart-1" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertySocialActions;
