import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send } from "lucide-react";

interface Inquiry {
  id: string;
  subject: string;
  message?: string;
  inquiry_type: string;
  contact_email: string;
  contact_phone?: string;
  status: string;
  created_at: string;
}

interface CSInquiriesTableProps {
  inquiries: Inquiry[] | undefined;
  isLoading: boolean;
  onReply: (inquiry: Inquiry) => void;
}

const CSInquiriesTable = ({ inquiries, isLoading, onReply }: CSInquiriesTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
      case 'new':
        return <Badge className="bg-blue-500 text-white">Open</Badge>;
      case 'in_progress':
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">In Progress</Badge>;
      case 'resolved':
      case 'responded':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500 text-white">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading inquiries...
              </TableCell>
            </TableRow>
          ) : inquiries?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No pending inquiries
              </TableCell>
            </TableRow>
          ) : (
            inquiries?.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{inquiry.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {inquiry.message?.substring(0, 100)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{inquiry.contact_email}</div>
                    {inquiry.contact_phone && (
                      <div className="text-muted-foreground">{inquiry.contact_phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onReply(inquiry)}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CSInquiriesTable;