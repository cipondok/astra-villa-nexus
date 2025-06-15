
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash, Building2 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useForm } from "react-hook-form";

type OfficeLocation = {
  id: string;
  name_en: string;
  name_id: string;
  address_en: string;
  address_id: string;
  phone: string | null;
  business_hours_en: string | null;
  business_hours_id: string | null;
  is_main_office: boolean;
  is_active: boolean;
  display_order: number | null;
};

const OfficeForm = ({ office, onSave, onCancel }: { office: Partial<OfficeLocation> | null, onSave: (data: Partial<OfficeLocation>) => void, onCancel: () => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<OfficeLocation>({
    defaultValues: { ...office, is_active: office?.id ? office.is_active : true },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name_en">Name (EN)</Label>
          <Input id="name_en" {...register("name_en", { required: true })} />
          {errors.name_en && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
        </div>
        <div>
          <Label htmlFor="name_id">Name (ID)</Label>
          <Input id="name_id" {...register("name_id", { required: true })} />
          {errors.name_id && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="address_en">Address (EN)</Label>
        <Textarea id="address_en" {...register("address_en", { required: true })} />
         {errors.address_en && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
      </div>
      <div>
        <Label htmlFor="address_id">Address (ID)</Label>
        <Textarea id="address_id" {...register("address_id", { required: true })} />
        {errors.address_id && <p className="text-red-500 text-xs mt-1">This field is required.</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
         <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" type="number" {...register("display_order", { valueAsNumber: true })} />
        </div>
      </div>
      <div>
        <Label htmlFor="business_hours_en">Business Hours (EN)</Label>
        <Input id="business_hours_en" {...register("business_hours_en")} />
      </div>
      <div>
        <Label htmlFor="business_hours_id">Business Hours (ID)</Label>
        <Input id="business_hours_id" {...register("business_hours_id")} />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch id="is_main_office" {...register("is_main_office")} />
        <Label htmlFor="is_main_office">Is Main Office?</Label>
      </div>
       <div className="flex items-center space-x-2">
        <Switch id="is_active" {...register("is_active")} />
        <Label htmlFor="is_active">Is Active?</Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};


const OfficeManagement = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Partial<OfficeLocation> | null>(null);

  const { data: offices, isLoading } = useQuery<OfficeLocation[]>({
    queryKey: ['office_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_locations')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (officeData: Partial<OfficeLocation>) => {
      if (officeData.id) {
        const { id, ...updateData } = officeData;
        const { error } = await supabase.from('office_locations').update(updateData).eq('id', id);
        if (error) throw error;
      } else {
        const insertData = {
          name_en: officeData.name_en!,
          name_id: officeData.name_id!,
          address_en: officeData.address_en!,
          address_id: officeData.address_id!,
          phone: officeData.phone || null,
          business_hours_en: officeData.business_hours_en || null,
          business_hours_id: officeData.business_hours_id || null,
          is_main_office: officeData.is_main_office || false,
          is_active: typeof officeData.is_active === 'boolean' ? officeData.is_active : true,
          display_order: typeof officeData.display_order === 'number' ? officeData.display_order : null,
        };
        const { error } = await supabase.from('office_locations').insert(insertData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", `Office ${selectedOffice?.id ? 'updated' : 'created'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ['office_locations'] });
      setIsDialogOpen(false);
      setSelectedOffice(null);
    },
    onError: (error: any) => {
      showError("Operation Failed", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('office_locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Office deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['office_locations'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  const handleOpenDialog = (office: Partial<OfficeLocation> | null = null) => {
    setSelectedOffice(office);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this office?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (data: Partial<OfficeLocation>) => {
    mutation.mutate({ ...selectedOffice, ...data });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Office Locations Management</CardTitle>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Office
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Main</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
            {offices?.map(office => (
              <TableRow key={office.id}>
                <TableCell>{office.display_order}</TableCell>
                <TableCell>{office.name_en}</TableCell>
                <TableCell>{office.is_main_office ? 'Yes' : 'No'}</TableCell>
                <TableCell>{office.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(office)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(office.id)}>
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOffice?.id ? 'Edit Office' : 'Add New Office'}</DialogTitle>
          </DialogHeader>
          <OfficeForm 
            office={selectedOffice} 
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OfficeManagement;
