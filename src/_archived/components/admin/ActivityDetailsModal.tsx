
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus, X } from "lucide-react";

interface Property {
  id: string;
  title: string;
  created_at: string;
  owner_id: string;
  status: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  created_at: string;
}

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'properties' | 'users';
  title: string;
  data: Property[] | User[];
}

const ActivityDetailsModal = ({ isOpen, onClose, type, title, data }: ActivityDetailsModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-chart-1';
      case 'pending_approval': return 'bg-chart-3';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-chart-4';
      case 'agent': return 'bg-chart-2';
      case 'property_owner': return 'bg-chart-1';
      case 'vendor': return 'bg-chart-3';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {type === 'properties' ? <Building2 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No {type} found for today</p>
              </div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {type === 'properties' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{(item as Property).title}</h4>
                        <Badge className={getStatusColor((item as Property).status)}>
                          {(item as Property).status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Property ID: {item.id}</p>
                        <p>Owner ID: {(item as Property).owner_id}</p>
                        <p>Created: {new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{(item as User).full_name || 'No name'}</h4>
                        <Badge className={getRoleColor((item as User).role || 'general_user')}>
                          {(item as User).role || 'general_user'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Email: {(item as User).email}</p>
                        <p>User ID: {item.id}</p>
                        <p>Registered: {new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailsModal;
