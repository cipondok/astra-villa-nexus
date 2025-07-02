
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingUp } from "lucide-react";

interface VendorInventory {
  id: string;
  vendor_id: string;
  service_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  reserved_stock: number;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  supplier_info: any;
  product_images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VendorService {
  id: string;
  service_name: string;
  business_model: string;
}

const VendorInventoryManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorInventory | null>(null);
  const [formData, setFormData] = useState({
    service_id: "",
    product_name: "",
    sku: "",
    current_stock: 0,
    reorder_level: 5,
    cost_price: 0,
    selling_price: 0,
    supplier_info: "{}",
    is_active: true
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor inventory
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['vendor-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VendorInventory[];
    }
  });

  // Fetch vendor services that sell products
  const { data: productServices } = useQuery({
    queryKey: ['product-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select('id, service_name, business_model')
        .in('business_model', ['product_sales', 'both'])
        .eq('is_active', true);
      
      if (error) throw error;
      return data as VendorService[];
    }
  });

  // Create inventory item mutation
  const createItemMutation = useMutation({
    mutationFn: async (itemData: typeof formData) => {
      const { error } = await supabase
        .from('vendor_inventory')
        .insert({
          ...itemData,
          supplier_info: JSON.parse(itemData.supplier_info || '{}')
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Inventory item created successfully");
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendor-inventory'] });
    },
    onError: () => {
      showError("Error", "Failed to create inventory item");
    }
  });

  // Update inventory item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('vendor_inventory')
        .update({
          ...data,
          supplier_info: JSON.parse(data.supplier_info || '{}')
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Inventory item updated successfully");
      setEditingItem(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendor-inventory'] });
    },
    onError: () => {
      showError("Error", "Failed to update inventory item");
    }
  });

  // Delete inventory item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_inventory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Inventory item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-inventory'] });
    },
    onError: () => {
      showError("Error", "Failed to delete inventory item");
    }
  });

  const resetForm = () => {
    setFormData({
      service_id: "",
      product_name: "",
      sku: "",
      current_stock: 0,
      reorder_level: 5,
      cost_price: 0,
      selling_price: 0,
      supplier_info: "{}",
      is_active: true
    });
  };

  const handleSubmit = () => {
    if (!formData.product_name.trim() || !formData.service_id) {
      showError("Error", "Product name and service selection are required");
      return;
    }

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const handleEdit = (item: VendorInventory) => {
    setEditingItem(item);
    setFormData({
      service_id: item.service_id,
      product_name: item.product_name,
      sku: item.sku || "",
      current_stock: item.current_stock,
      reorder_level: item.reorder_level,
      cost_price: item.cost_price,
      selling_price: item.selling_price,
      supplier_info: JSON.stringify(item.supplier_info || {}),
      is_active: item.is_active
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const getStockStatus = (current: number, reorder: number) => {
    if (current === 0) return { status: "Out of Stock", color: "destructive" };
    if (current <= reorder) return { status: "Low Stock", color: "warning" };
    return { status: "In Stock", color: "default" };
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Manage product inventory and stock levels</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setEditingItem(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service_id">Service Category</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {productServices?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.service_name} ({service.business_model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reorder_level">Reorder Level</Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorder_level: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplier_info">Supplier Info (JSON)</Label>
                <Textarea
                  id="supplier_info"
                  value={formData.supplier_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier_info: e.target.value }))}
                  placeholder='{"supplier_name": "ABC Corp", "contact": "123-456-7890"}'
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingItem ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Inventory ({inventory?.length || 0})
          </CardTitle>
          <CardDescription>
            Track and manage your product inventory levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inventory && inventory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item.current_stock, item.reorder_level);
                  const margin = item.selling_price - item.cost_price;
                  const marginPercent = item.cost_price > 0 ? ((margin / item.cost_price) * 100).toFixed(1) : 0;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.is_active ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.sku || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.current_stock}</span>
                          {item.reserved_stock > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({item.reserved_stock} reserved)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.status}
                        </Badge>
                        {item.current_stock <= item.reorder_level && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </TableCell>
                      <TableCell>${item.cost_price.toFixed(2)}</TableCell>
                      <TableCell>${item.selling_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">
                            ${margin.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({marginPercent}%)
                          </span>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items found. Add your first product to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorInventoryManagement;
