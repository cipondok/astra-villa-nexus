import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  text: string;
  user_id: string;
  user_name: string;
  timestamp: string;
}

interface ChatBubbleProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

const ChatBubble = ({ messages, onSendMessage, currentUserId }: ChatBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.user_id !== currentUserId) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isOpen, currentUserId]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg relative"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-background border rounded-xl shadow-2xl"
            style={{ width: '360px', height: isMinimized ? 'auto' : '480px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Team Chat</h3>
                <span className="text-xs text-muted-foreground">
                  {messages.length} messages
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="h-[360px] p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.user_id === currentUserId;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold mb-1">
                                {msg.user_name}
                              </p>
                            )}
                            <p className="text-sm break-words">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(msg.timestamp), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBubble;
