
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, Plus, X, ArrowUpDown } from "lucide-react";

interface FilterEditModalProps {
  filter: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (filterData: any) => void;
}

const FilterEditModal = ({ filter, isOpen, onClose, onSave }: FilterEditModalProps) => {
  const [filterData, setFilterData] = useState({
    filter_name: "",
    filter_type: "select",
    category: "property",
    filter_options: "",
    is_active: true,
    display_order: 0,
    description: "",
  });

  const [previewValue, setPreviewValue] = useState<any>("");
  const [optionsList, setOptionsList] = useState<string[]>([]);

  useEffect(() => {
    if (filter) {
      setFilterData({
        filter_name: filter.filter_name || "",
        filter_type: filter.filter_type || "select",
        category: filter.category || "property",
        filter_options: Array.isArray(filter.filter_options) 
          ? filter.filter_options.join(", ") 
          : filter.filter_options || "",
        is_active: filter.is_active ?? true,
        display_order: filter.display_order || 0,
        description: filter.description || "",
      });
      
      if (filter.filter_options) {
        const options = Array.isArray(filter.filter_options) 
          ? filter.filter_options 
          : filter.filter_options.split(",").map((opt: string) => opt.trim());
        setOptionsList(options);
      }
    } else {
      // Reset for new filter
      setFilterData({
        filter_name: "",
        filter_type: "select",
        category: "property",
        filter_options: "",
        is_active: true,
        display_order: 0,
        description: "",
      });
      setOptionsList([]);
    }
    setPreviewValue("");
  }, [filter, isOpen]);

  const handleOptionsChange = (value: string) => {
    setFilterData({ ...filterData, filter_options: value });
    const options = value.split(",").map(opt => opt.trim()).filter(opt => opt);
    setOptionsList(options);
  };

  const addOption = () => {
    const newOption = `Option ${optionsList.length + 1}`;
    const updatedOptions = [...optionsList, newOption];
    setOptionsList(updatedOptions);
    setFilterData({ ...filterData, filter_options: updatedOptions.join(", ") });
  };

  const removeOption = (index: number) => {
    const updatedOptions = optionsList.filter((_, i) => i !== index);
    setOptionsList(updatedOptions);
    setFilterData({ ...filterData, filter_options: updatedOptions.join(", ") });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...optionsList];
    updatedOptions[index] = value;
    setOptionsList(updatedOptions);
    setFilterData({ ...filterData, filter_options: updatedOptions.join(", ") });
  };

  const renderPreview = () => {
    switch (filterData.filter_type) {
      case "select":
        return (
          <div className="space-y-2">
            <Label>{filterData.filter_name || "Filter Name"}</Label>
            <Select value={previewValue} onValueChange={setPreviewValue}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${filterData.filter_name || "option"}`} />
              </SelectTrigger>
              <SelectContent>
                {optionsList.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            <Label>{filterData.filter_name || "Filter Name"}</Label>
            <div className="space-y-2">
              {optionsList.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`preview-${index}`}
                    checked={(previewValue as string[])?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (previewValue as string[]) || [];
                      if (checked) {
                        setPreviewValue([...currentValues, option]);
                      } else {
                        setPreviewValue(currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`preview-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            <Label>{filterData.filter_name || "Filter Name"}</Label>
            <RadioGroup value={previewValue} onValueChange={setPreviewValue}>
              {optionsList.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`radio-${index}`} />
                  <Label htmlFor={`radio-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "range":
        return (
          <div className="space-y-3">
            <Label>{filterData.filter_name || "Filter Name"}</Label>
            <div className="px-2">
              <Slider
                value={previewValue || [0, 100]}
                onValueChange={setPreviewValue}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>{(previewValue || [0, 100])[0]}</span>
                <span>{(previewValue || [0, 100])[1]}</span>
              </div>
            </div>
          </div>
        );

      case "input":
        return (
          <div className="space-y-2">
            <Label>{filterData.filter_name || "Filter Name"}</Label>
            <Input
              value={previewValue}
              onChange={(e) => setPreviewValue(e.target.value)}
              placeholder={`Enter ${filterData.filter_name || "value"}`}
            />
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-4">
            Select a filter type to see preview
          </div>
        );
    }
  };

  const handleSave = () => {
    const saveData = {
      ...filterData,
      filter_options: filterData.filter_type === "range" || filterData.filter_type === "input" 
        ? null 
        : optionsList,
    };
    onSave(saveData);
  };

  const filterTypes = [
    { value: "select", label: "Dropdown Select", description: "Single choice from dropdown" },
    { value: "checkbox", label: "Multiple Checkboxes", description: "Multiple selections allowed" },
    { value: "radio", label: "Radio Buttons", description: "Single choice with radio buttons" },
    { value: "range", label: "Range Slider", description: "Numeric range selection" },
    { value: "input", label: "Text Input", description: "Free text input field" },
  ];

  const categories = [
    { value: "property", label: "Property Features" },
    { value: "location", label: "Location & Environment" },
    { value: "amenities", label: "Facilities & Amenities" },
    { value: "lifestyle", label: "Lifestyle & Comfort" },
    { value: "sustainability", label: "Sustainability" },
    { value: "investment", label: "Investment Potential" },
    { value: "neighborhood", label: "Neighborhood" },
    { value: "developer", label: "Developer Info" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {filter ? "Edit Filter" : "Create New Filter"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filter_name">Filter Name</Label>
                  <Input
                    id="filter_name"
                    value={filterData.filter_name}
                    onChange={(e) => setFilterData({ ...filterData, filter_name: e.target.value })}
                    placeholder="e.g., Property Type, Location, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={filterData.description}
                    onChange={(e) => setFilterData({ ...filterData, description: e.target.value })}
                    placeholder="Brief description of this filter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={filterData.category} onValueChange={(value) => setFilterData({ ...filterData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Filter Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {filterTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          filterData.filter_type === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setFilterData({ ...filterData, filter_type: type.value })}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            filterData.filter_type === type.value
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`} />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(filterData.filter_type === "select" || filterData.filter_type === "checkbox" || filterData.filter_type === "radio") && (
                  <div className="space-y-3">
                    <Label>Options</Label>
                    <Textarea
                      value={filterData.filter_options}
                      onChange={(e) => handleOptionsChange(e.target.value)}
                      placeholder="Enter options separated by commas (e.g., Villa, Apartment, House)"
                      rows={3}
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Quick Options Editor</Label>
                        <Button size="sm" variant="outline" onClick={addOption}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {optionsList.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeOption(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={filterData.is_active}
                    onCheckedChange={(checked) => setFilterData({ ...filterData, is_active: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={filterData.display_order}
                    onChange={(e) => setFilterData({ ...filterData, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/20">
                  {renderPreview()}
                </div>
                
                {filterData.description && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                    <strong>Description:</strong> {filterData.description}
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{filterData.category}</Badge>
                    <Badge variant={filterData.is_active ? "default" : "secondary"}>
                      {filterData.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Display Order: {filterData.display_order}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Select:</strong> Best for single choice from many options</div>
                <div><strong>Checkbox:</strong> Allow multiple selections</div>
                <div><strong>Radio:</strong> Single choice, all options visible</div>
                <div><strong>Range:</strong> Perfect for prices, areas, or numeric values</div>
                <div><strong>Input:</strong> Free text for locations, descriptions</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!filterData.filter_name.trim()}>
            {filter ? "Update Filter" : "Create Filter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterEditModal;
