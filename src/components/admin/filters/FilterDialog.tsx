import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FilterOption } from '@/hooks/usePropertyFilters';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<FilterOption, 'id'>) => void;
  filter?: FilterOption | null;
}

export const FilterDialog = ({ open, onClose, filter, onSave }: FilterDialogProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<FilterOption, 'id'>>({
    defaultValues: {
      filter_name: '',
      filter_category: 'facilities',
      filter_type: 'checkbox',
      listing_type: 'rent',
      is_active: true,
      display_order: 0,
      filter_options: [],
    },
  });

  const filterType = watch('filter_type');
  const filterCategory = watch('filter_category');

  useEffect(() => {
    if (filter) {
      setOptions(filter.filter_options || []);
      reset({
        filter_name: filter.filter_name,
        filter_category: filter.filter_category,
        filter_type: filter.filter_type,
        listing_type: filter.listing_type,
        is_active: filter.is_active,
        display_order: filter.display_order || 0,
        filter_options: filter.filter_options || [],
      });
    } else {
      setOptions([]);
      reset({
        filter_name: '',
        filter_category: 'facilities',
        filter_type: 'checkbox',
        listing_type: 'rent',
        is_active: true,
        display_order: 0,
        filter_options: [],
      });
    }
  }, [filter, reset]);

  const addOption = () => {
    if (newOption.trim()) {
      const updated = [...options, newOption.trim()];
      setOptions(updated);
      setValue('filter_options', updated);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    setValue('filter_options', updated);
  };

  const onSubmit = (data: Omit<FilterOption, 'id'>) => {
    onSave({ ...data, filter_options: options });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {filter ? '✏️ Edit Filter' : '✨ Create New Filter'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="filter_name" className="text-base">Filter Name *</Label>
                <Input
                  id="filter_name"
                  {...register('filter_name', { required: true })}
                  placeholder="e.g., Swimming Pool, Pet Friendly"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter_category" className="text-base">Category *</Label>
                <Select
                  value={filterCategory}
                  onValueChange={(value) => setValue('filter_category', value)}
                >
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facilities">🏊 Facilities</SelectItem>
                    <SelectItem value="search">🔍 Search Filters</SelectItem>
                    <SelectItem value="specifications">📐 Specifications</SelectItem>
                    <SelectItem value="location">📍 Location</SelectItem>
                    <SelectItem value="price">💰 Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter_type" className="text-base">Filter Type *</Label>
                <Select
                  value={filterType}
                  onValueChange={(value) => setValue('filter_type', value)}
                >
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkbox">☑️ Checkbox</SelectItem>
                    <SelectItem value="select">📋 Dropdown Select</SelectItem>
                    <SelectItem value="input">✏️ Text Input</SelectItem>
                    <SelectItem value="range">📊 Range Slider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listing_type" className="text-base">Listing Type *</Label>
                <Select
                  value={watch('listing_type')}
                  onValueChange={(value: 'sale' | 'rent') => setValue('listing_type', value)}
                >
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">🏠 Rent</SelectItem>
                    <SelectItem value="sale">💼 Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-base">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  {...register('display_order', { valueAsNumber: true })}
                  placeholder="0"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>
            </div>
          </div>

          {/* Filter Options/Sub-filters */}
          {(filterType === 'select' || filterType === 'checkbox') && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Sub-Filter Options
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add multiple options for users to choose from
                  </p>
                </div>
                <Badge variant="secondary">{options.length} options</Badge>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  placeholder="Type option and press Enter or click Add"
                  className="text-base"
                />
                <Button type="button" onClick={addOption} size="sm" className="shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-background rounded-md border">
                  {options.map((option, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm px-3 py-1.5 gap-2 hover:bg-secondary/80"
                    >
                      {option}
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {options.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm bg-background rounded-md border border-dashed">
                  No options added yet. Add options above.
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Settings</h3>
            <div className="flex items-center justify-between p-3 bg-background rounded-md border">
              <div className="space-y-1">
                <Label htmlFor="is_active" className="text-base font-medium cursor-pointer">
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable this filter to make it visible to users
                </p>
              </div>
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button type="submit" size="lg" className="gap-2">
              {filter ? '💾 Update Filter' : '✨ Create Filter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
