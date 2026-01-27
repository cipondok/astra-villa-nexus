import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock, Copy, Eye } from "lucide-react";
import { ContentType, CONTENT_TEMPLATES } from "@/hooks/useAIContentGenerator";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface ContentHistoryItem {
  type: ContentType;
  content: string;
  timestamp: Date;
  variables: Record<string, any>;
}

interface ContentHistoryPanelProps {
  history: ContentHistoryItem[];
  onCopy: (text: string) => void;
}

const ContentHistoryPanel = ({ history, onCopy }: ContentHistoryPanelProps) => {
  const getTemplateInfo = (type: ContentType) => {
    return CONTENT_TEMPLATES.find(t => t.id === type);
  };

  if (history.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <History className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No content generated yet.<br />
            Your generation history will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4" />
          Recent Generations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {history.map((item, index) => {
              const template = getTemplateInfo(item.type);
              return (
                <div 
                  key={index} 
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{template?.icon || '📄'}</span>
                      <div>
                        <p className="font-medium text-sm">{template?.name || item.type}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <span className="text-2xl">{template?.icon}</span>
                              {template?.name}
                            </DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh]">
                            <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                              <ReactMarkdown>{item.content}</ReactMarkdown>
                            </div>
                          </ScrollArea>
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button 
                              variant="outline" 
                              onClick={() => onCopy(item.content)}
                              className="gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Content
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => onCopy(item.content)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(item.variables).slice(0, 3).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {String(value).slice(0, 15)}
                        {String(value).length > 15 && '...'}
                      </Badge>
                    ))}
                    {Object.keys(item.variables).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{Object.keys(item.variables).length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContentHistoryPanel;
