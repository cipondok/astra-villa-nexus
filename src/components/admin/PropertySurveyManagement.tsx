
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Clock, User, Eye, CheckCircle, XCircle } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const PropertySurveyManagement = () => {
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Mock data for demo - in real app this would come from a surveys table
  const { data: surveys, isLoading } = useQuery({
    queryKey: ['property-surveys'],
    queryFn: async () => {
      // Mock survey data
      return [
        {
          id: '1',
          property_title: 'Luxury Villa in Seminyak',
          customer_name: 'John Smith',
          customer_email: 'john@example.com',
          customer_phone: '+1234567890',
          preferred_date: '2024-12-15',
          preferred_time: '10:00',
          status: 'pending',
          created_at: new Date().toISOString(),
          notes: 'Interested in purchasing for investment purposes.',
          property_location: 'Seminyak, Bali',
          survey_type: 'viewing'
        },
        {
          id: '2',
          property_title: 'Modern Apartment in Canggu',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@example.com',
          customer_phone: '+9876543210',
          preferred_date: '2024-12-18',
          preferred_time: '14:00',
          status: 'confirmed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Looking for a holiday home near the beach.',
          property_location: 'Canggu, Bali',
          survey_type: 'inspection'
        },
        {
          id: '3',
          property_title: 'Traditional House in Ubud',
          customer_name: 'Mike Wilson',
          customer_email: 'mike@example.com',
          customer_phone: '+5555666777',
          preferred_date: '2024-12-20',
          preferred_time: '16:00',
          status: 'completed',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          notes: 'Interested in traditional Balinese architecture.',
          property_location: 'Ubud, Bali',
          survey_type: 'valuation'
        }
      ];
    },
  });

  const updateSurveyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // For demo purposes, we'll just return success
      return Promise.resolve();
    },
    onSuccess: () => {
      showSuccess("Survey Updated", "Survey status has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['property-surveys'] });
      setShowDetailDialog(false);
      setSelectedSurvey(null);
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleViewDetails = (survey: any) => {
    setSelectedSurvey(survey);
    setShowDetailDialog(true);
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedSurvey) {
      updateSurveyMutation.mutate({ id: selectedSurvey.id, status });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getSurveyTypeBadge = (type: string) => {
    const colors = {
      viewing: "bg-blue-500",
      inspection: "bg-purple-500",
      valuation: "bg-green-500"
    };
    return <Badge className={colors[type] || colors.viewing}>{type?.toUpperCase()}</Badge>;
  };

  const filteredSurveys = surveys?.filter(survey =>
    survey.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.property_location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Property Survey Booking System
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manage property viewing and survey appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <Input
                placeholder="Search by customer name, email, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => s.status === 'pending').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Confirmed</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => s.status === 'confirmed').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => s.status === 'completed').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Today</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => new Date(s.preferred_date).toDateString() === new Date().toDateString()).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Surveys Table */}
            <div className="border border-white/20 rounded-lg bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Property</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Date & Time</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                        Loading surveys...
                      </TableCell>
                    </TableRow>
                  ) : filteredSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                        No survey bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSurveys.map((survey) => (
                      <TableRow key={survey.id} className="border-white/20">
                        <TableCell className="text-white">
                          <div className="text-sm">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {survey.customer_name}
                            </div>
                            <div className="text-gray-400">{survey.customer_email}</div>
                            <div className="text-gray-400">{survey.customer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="text-sm">
                            <div className="font-medium">{survey.property_title}</div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {survey.property_location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSurveyTypeBadge(survey.survey_type)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(survey.preferred_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock className="h-3 w-3" />
                              {survey.preferred_time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(survey.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(survey)}
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Survey Booking Details</DialogTitle>
            <DialogDescription className="text-gray-300">
              Review and manage property survey appointment
            </DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-300 font-medium">Customer Name:</Label>
                  <p className="text-white">{selectedSurvey.customer_name}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Email:</Label>
                  <p className="text-white">{selectedSurvey.customer_email}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Phone:</Label>
                  <p className="text-white">{selectedSurvey.customer_phone}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Survey Type:</Label>
                  {getSurveyTypeBadge(selectedSurvey.survey_type)}
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Preferred Date:</Label>
                  <p className="text-white">{new Date(selectedSurvey.preferred_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Preferred Time:</Label>
                  <p className="text-white">{selectedSurvey.preferred_time}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-300 font-medium">Property:</Label>
                <p className="text-white">{selectedSurvey.property_title}</p>
                <p className="text-gray-400 text-sm">{selectedSurvey.property_location}</p>
              </div>
              <div>
                <Label className="text-gray-300 font-medium">Notes:</Label>
                <p className="text-white bg-gray-800 p-3 rounded mt-2">{selectedSurvey.notes}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updateSurveyMutation.isPending}
            >
              Cancel Survey
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={updateSurveyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('completed')}
              disabled={updateSurveyMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertySurveyManagement;
