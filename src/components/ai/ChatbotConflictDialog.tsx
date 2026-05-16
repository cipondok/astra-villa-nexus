import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, Laptop, AlertCircle } from "lucide-react";

interface ConflictData {
  local: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    viewMode: string;
    lastModified: Date;
  };
  cloud: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    viewMode: string;
    lastModified: Date;
  };
}

interface ChatbotConflictDialogProps {
  open: boolean;
  conflictData: ConflictData | null;
  onResolve: (choice: 'local' | 'cloud') => void;
  onCancel: () => void;
}

export const ChatbotConflictDialog = ({ open, conflictData, onResolve, onCancel }: ChatbotConflictDialogProps) => {
  if (!conflictData) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Sync Conflict
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choose which chatbot preferences to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-3">
          {/* Local Version */}
          <div className="border border-border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Laptop className="h-3.5 w-3.5 text-primary" />
              <h3 className="font-semibold text-sm">This Device</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">View:</span>
                <span className="font-medium capitalize">{conflictData.local.viewMode}</span>
              </div>
              <div className="pt-1.5 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  {conflictData.local.lastModified.toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              onClick={() => onResolve('local')}
              className="w-full mt-3"
              variant="default"
              size="sm"
            >
              Keep This
            </Button>
          </div>

          {/* Cloud Version */}
          <div className="border border-border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-3.5 w-3.5 text-primary" />
              <h3 className="font-semibold text-sm">Cloud</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">View:</span>
                <span className="font-medium capitalize">{conflictData.cloud.viewMode}</span>
              </div>
              <div className="pt-1.5 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  {conflictData.cloud.lastModified.toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              onClick={() => onResolve('cloud')}
              className="w-full mt-3"
              variant="outline"
              size="sm"
            >
              Keep Cloud
            </Button>
          </div>
        </div>

        <div className="mt-2 p-2.5 bg-muted/50 border border-border/50 rounded-lg">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your choice will sync across all devices.
          </p>
        </div>

        <div className="flex justify-end mt-3">
          <Button onClick={onCancel} variant="ghost" size="sm">
            Decide Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
