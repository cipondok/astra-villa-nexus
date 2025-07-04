import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import IndonesianValidator from "@/utils/indonesianValidation";

interface FormField {
  name: string;
  type: 'text' | 'file' | 'select' | 'checkbox' | 'number' | 'textarea';
  label: string;
  labelId?: string;
  required?: boolean;
  options?: string[];
  validation?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number;
}

interface DynamicFormGeneratorProps {
  categoryId: string;
  categoryCode: string;
  onFormChange: (data: { [key: string]: any }) => void;
  initialData?: { [key: string]: any };
}

const DynamicFormGenerator = ({ 
  categoryId, 
  categoryCode, 
  onFormChange, 
  initialData = {} 
}: DynamicFormGeneratorProps) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>(initialData);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});

  // Category-specific form fields
  const getFormFields = (categoryCode: string): FormField[] => {
    const fieldDefinitions: { [key: string]: FormField[] } = {
      // AC Repair Services
      'ac_repair': [
        {
          name: 'sertifikat_teknisi',
          type: 'file',
          label: 'Sertifikat Teknisi AC',
          labelId: 'AC Technician Certificate',
          required: true,
          accept: '.pdf,.jpg,.png',
          maxSize: 5
        },
        {
          name: 'unit_types',
          type: 'checkbox',
          label: 'Jenis Unit yang Dikuasai',
          labelId: 'AC Unit Types',
          options: ['Split AC', 'Window AC', 'Central AC', 'Cassette AC', 'Standing AC']
        },
        {
          name: 'service_areas',
          type: 'select',
          label: 'Area Layanan',
          options: ['Residential', 'Commercial', 'Industrial', 'All Areas']
        },
        {
          name: 'experience_years',
          type: 'number',
          label: 'Pengalaman (Tahun)',
          required: true,
          placeholder: 'Minimal 2 tahun'
        }
      ],

      // Cleaning Services
      'cleaning_residential': [
        {
          name: 'sertifikat_kebersihan',
          type: 'file',
          label: 'Sertifikat Pelatihan Kebersihan',
          accept: '.pdf,.jpg,.png',
          maxSize: 5
        },
        {
          name: 'cleaning_types',
          type: 'checkbox',
          label: 'Jenis Layanan Kebersihan',
          options: ['General Cleaning', 'Deep Cleaning', 'Post Construction', 'Move In/Out']
        },
        {
          name: 'equipment_owned',
          type: 'checkbox',
          label: 'Peralatan yang Dimiliki',
          options: ['Vacuum Cleaner', 'Mop & Bucket', 'Cleaning Chemicals', 'Floor Polisher', 'Window Squeegee']
        },
        {
          name: 'team_size',
          type: 'number',
          label: 'Jumlah Tim',
          placeholder: 'Jumlah anggota tim'
        }
      ],

      // Furniture Sales
      'furniture': [
        {
          name: 'material_types',
          type: 'checkbox',
          label: 'Jenis Material',
          options: ['Kayu Jati', 'Kayu Mahoni', 'Kayu Meranti', 'Besi', 'Plastik', 'Rotan']
        },
        {
          name: 'furniture_categories',
          type: 'checkbox',
          label: 'Kategori Furniture',
          options: ['Sofa', 'Meja', 'Kursi', 'Lemari', 'Tempat Tidur', 'Rak Buku']
        },
        {
          name: 'showroom_address',
          type: 'textarea',
          label: 'Alamat Showroom',
          placeholder: 'Alamat lengkap showroom atau toko'
        },
        {
          name: 'delivery_radius',
          type: 'number',
          label: 'Radius Pengiriman (KM)',
          placeholder: 'Maksimal jarak pengiriman'
        }
      ],

      // Car Rental
      'car_rentals': [
        {
          name: 'vehicle_types',
          type: 'checkbox',
          label: 'Jenis Kendaraan',
          options: ['City Car', 'Sedan', 'SUV', 'MPV', 'Luxury Car', 'Van']
        },
        {
          name: 'fleet_size',
          type: 'number',
          label: 'Jumlah Armada',
          required: true,
          placeholder: 'Total kendaraan yang dimiliki'
        },
        {
          name: 'insurance_coverage',
          type: 'select',
          label: 'Asuransi Kendaraan',
          options: ['All Risk', 'Total Loss Only', 'Third Party', 'Comprehensive']
        },
        {
          name: 'driver_available',
          type: 'checkbox',
          label: 'Layanan Tersedia',
          options: ['Self Drive', 'With Driver', '24 Hour Service', 'Airport Pickup']
        }
      ],

      // Shifting Services
      'shifting_services': [
        {
          name: 'truck_types',
          type: 'checkbox',
          label: 'Jenis Truk',
          options: ['Pickup', 'Engkel', 'Colt Diesel', 'Truk Besar', 'Container']
        },
        {
          name: 'service_types',
          type: 'checkbox',
          label: 'Jenis Layanan',
          options: ['Pindahan Rumah', 'Pindahan Kantor', 'Barang Berat', 'Furniture', 'Elektronik']
        },
        {
          name: 'team_workers',
          type: 'number',
          label: 'Jumlah Pekerja',
          placeholder: 'Tim pekerja per unit'
        },
        {
          name: 'coverage_areas',
          type: 'textarea',
          label: 'Area Jangkauan',
          placeholder: 'Daerah yang bisa dilayani'
        }
      ]
    };

    return fieldDefinitions[categoryCode] || [];
  };

  const formFields = getFormFields(categoryCode);

  useEffect(() => {
    onFormChange(formData);
  }, [formData, onFormChange]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleFileUpload = (fieldName: string, file: File) => {
    const validation = IndonesianValidator.validateFile(file, 5, ['image/jpeg', 'image/png', 'application/pdf']);
    
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: validation.message
      }));
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));

    handleInputChange(fieldName, file.name);
  };

  const handleCheckboxChange = (fieldName: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldName] || [];
    const newValues = checked 
      ? [...currentValues, option]
      : currentValues.filter((item: string) => item !== option);
    
    handleInputChange(fieldName, newValues);
  };

  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || value === '')) {
      return `${field.label} wajib diisi`;
    }

    if (field.validation) {
      const validation = IndonesianValidator.validateDocument(field.validation, value);
      if (!validation.isValid) {
        return validation.message;
      }
    }

    return '';
  };

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.name];
    const error = validationErrors[field.name];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <textarea
              id={field.name}
              value={fieldValue || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-input'}`}
              rows={3}
            />
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select onValueChange={(value) => handleInputChange(field.name, value)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Pilih ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-3">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    checked={(fieldValue || []).includes(option)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(field.name, option, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`${field.name}-${option}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {fieldValue && fieldValue.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {fieldValue.map((item: string) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id={field.name}
                accept={field.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(field.name, file);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(field.name)?.click()}
                className="mb-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <p className="text-sm text-gray-500">
                {field.accept?.toUpperCase()} files, max {field.maxSize}MB
              </p>
              {uploadedFiles[field.name] && (
                <div className="mt-2 flex items-center justify-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{uploadedFiles[field.name].name}</span>
                </div>
              )}
            </div>
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (formFields.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No specific requirements for this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 Category Requirements
          <Badge variant="outline">{formFields.length} fields</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {formFields.map(renderField)}
      </CardContent>
    </Card>
  );
};

export default DynamicFormGenerator;