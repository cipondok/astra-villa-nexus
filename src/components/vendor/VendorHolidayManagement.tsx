
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";

interface Holiday {
  id: string;
  holiday_name: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  affects_all_services: boolean;
  is_active: boolean;
}

const VendorHolidayManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({
    holiday_name: '',
    start_date: '',
    end_date: '',
    is_recurring: false,
    recurrence_pattern: '',
    affects_all_services: true
  });

  useEffect(() => {
    if (user) {
      fetchHolidays();
    }
  }, [user]);

  const fetchHolidays = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vendor_holidays')
        .select('*')
        .eq('vendor_id', user.id)
        .order('start_date');

      if (error) throw error;
      setHolidays(data || []);
    } catch (error: any) {
      console.error('Error fetching holidays:', error);
      toast({
        title: "Error",
        description: "Failed to load holidays",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const holidayData = {
        ...formData,
        vendor_id: user.id
      };

      if (editingHoliday) {
        const { error } = await supabase
          .from('vendor_holidays')
          .update(holidayData)
          .eq('id', editingHoliday.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Holiday updated successfully" });
      } else {
        const { error } = await supabase
          .from('vendor_holidays')
          .insert([holidayData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Holiday added successfully" });
      }

      setIsDialogOpen(false);
      setEditingHoliday(null);
      resetForm();
      fetchHolidays();
    } catch (error: any) {
      console.error('Error saving holiday:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save holiday",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      holiday_name: holiday.holiday_name,
      start_date: holiday.start_date,
      end_date: holiday.end_date,
      is_recurring: holiday.is_recurring,
      recurrence_pattern: holiday.recurrence_pattern || '',
      affects_all_services: holiday.affects_all_services
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (holidayId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_holidays')
        .delete()
        .eq('id', holidayId);

      if (error) throw error;
      toast({ title: "Success", description: "Holiday deleted successfully" });
      fetchHolidays();
    } catch (error: any) {
      console.error('Error deleting holiday:', error);
      toast({
        title: "Error",
        description: "Failed to delete holiday",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      holiday_name: '',
      start_date: '',
      end_date: '',
      is_recurring: false,
      recurrence_pattern: '',
      affects_all_services: true
    });
  };

  const openDialog = () => {
    setEditingHoliday(null);
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Holiday Management
            </CardTitle>
            <CardDescription>
              Manage your service holidays and off days
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="holiday_name">Holiday Name</Label>
                  <Input
                    id="holiday_name"
                    value={formData.holiday_name}
                    onChange={(e) => setFormData({ ...formData, holiday_name: e.target.value })}
                    placeholder="e.g., Christmas, Summer Break"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  />
                  <Label htmlFor="is_recurring">Recurring Holiday</Label>
                </div>

                {formData.is_recurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                    <Select
                      value={formData.recurrence_pattern}
                      onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="affects_all_services"
                    checked={formData.affects_all_services}
                    onCheckedChange={(checked) => setFormData({ ...formData, affects_all_services: checked })}
                  />
                  <Label htmlFor="affects_all_services">Affects All Services</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingHoliday ? 'Update' : 'Add'} Holiday
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No holidays configured yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">{holiday.holiday_name}</TableCell>
                  <TableCell>{new Date(holiday.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(holiday.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {holiday.is_recurring ? (
                      <Badge variant="secondary">{holiday.recurrence_pattern}</Badge>
                    ) : (
                      <Badge variant="outline">One-time</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={holiday.affects_all_services ? "default" : "secondary"}>
                      {holiday.affects_all_services ? "All Services" : "Selected Services"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(holiday)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(holiday.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorHolidayManagement;
