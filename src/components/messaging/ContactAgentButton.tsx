import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useStartConversation } from '@/hooks/useMessaging';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContactAgentButtonProps {
  agentId: string;
  propertyId?: string;
  propertyTitle?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ContactAgentButton: React.FC<ContactAgentButtonProps> = ({
  agentId,
  propertyId,
  propertyTitle,
  variant = 'outline',
  size = 'sm',
  className,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    propertyTitle ? `Hi, I'm interested in "${propertyTitle}". Could you provide more details?` : ''
  );

  const handleSend = async () => {
    if (!message.trim()) return;

    if (!user) {
      toast.error('Please sign in to contact the agent');
      navigate('/?auth=true');
      return;
    }

    if (user.id === agentId) {
      toast.error("You can't message yourself");
      return;
    }

    try {
      const conversationId = await startConversation.mutateAsync({
        agentId,
        propertyId,
        initialMessage: message.trim(),
      });
      setOpen(false);
      navigate(`/messages?id=${conversationId}`);
      toast.success('Message sent!');
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Message Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Send Message to Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {propertyTitle && (
            <p className="text-xs text-muted-foreground">
              Re: <span className="font-medium text-foreground">{propertyTitle}</span>
            </p>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            onClick={handleSend}
            className="w-full"
            disabled={!message.trim() || startConversation.isPending}
          >
            {startConversation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAgentButton;
