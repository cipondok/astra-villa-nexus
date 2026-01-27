import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  MessageCircle,
  Clock,
  CheckCircle2,
  Star,
  Home,
  Calendar,
  Send,
  Loader2,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResidentConnection {
  id: string;
  property_id: string;
  resident_id: string;
  is_current_resident: boolean;
  is_verified: boolean;
  is_available_for_questions: boolean;
  response_rate: number;
  avg_response_time_hours: number;
  topics_willing_to_discuss: string[];
  bio: string;
  residence_start_date: string;
}

interface AskResidentsProps {
  propertyId: string;
  className?: string;
}

const AskResidents: React.FC<AskResidentsProps> = ({ propertyId, className }) => {
  const { toast } = useToast();
  const [residents, setResidents] = useState<ResidentConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<ResidentConnection | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, [propertyId]);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('resident_connections')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_available_for_questions', true);

      if (error) throw error;
      setResidents(data || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!message.trim() || !selectedResident) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in', description: 'You need to be signed in to contact residents', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('resident_inquiries')
        .insert({
          property_id: propertyId,
          resident_id: selectedResident.resident_id,
          inquirer_id: user.id,
          message: message
        });

      if (error) throw error;

      toast({ 
        title: 'Message Sent!', 
        description: 'The resident will be notified and can respond to your inquiry.' 
      });
      setMessage('');
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResidenceDuration = (startDate: string) => {
    if (!startDate) return 'Unknown';
    const start = new Date(startDate);
    const now = new Date();
    const years = Math.floor((now.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor(((now.getTime() - start.getTime()) % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
    
    if (years > 0) return `${years}y ${months}m`;
    return `${months}m`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Ask Current Residents
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get real insights from people who live here
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        {residents.length === 0 ? (
          <div className="text-center py-8">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No residents available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No current residents have opted in to answer questions yet.
            </p>
            <Button variant="outline" size="sm">
              Request Resident Info
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {residents.map((resident, index) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>R{index + 1}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Resident {index + 1}</span>
                      {resident.is_verified && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {resident.is_current_resident && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Living here {getResidenceDuration(resident.residence_start_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{resident.avg_response_time_hours || 24}h response
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {resident.response_rate || 0}% response rate
                      </span>
                    </div>
                    
                    {resident.bio && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {resident.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resident.topics_willing_to_discuss?.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    
                    <Dialog open={dialogOpen && selectedResident?.id === resident.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setSelectedResident(resident);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ask a Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Message Resident
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>R</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">Resident</p>
                                <p className="text-xs text-muted-foreground">
                                  Usually responds within {resident.avg_response_time_hours || 24} hours
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Question</label>
                            <Textarea
                              placeholder="What would you like to know about living here?"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                              Your identity will be shared with the resident for direct communication.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <p className="text-xs text-blue-700">
                              Messages are monitored for safety. Be respectful and avoid sharing personal info.
                            </p>
                          </div>
                          
                          <Button 
                            onClick={handleSendInquiry} 
                            disabled={isSubmitting || !message.trim()}
                            className="w-full"
                          >
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AskResidents;
