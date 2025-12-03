import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, Mail, Phone, Building2, Briefcase, FileText, 
  Send, Loader2, MapPin, Globe, CheckCircle2
} from 'lucide-react';

interface DeveloperPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const partnerCategories = [
  { value: 'architect', label: 'Architect' },
  { value: 'civil_engineer', label: 'Civil Engineer' },
  { value: 'interior_designer', label: 'Interior Designer' },
  { value: '3d_artist', label: '3D Artist / Render Specialist' },
  { value: 'contractor', label: 'Construction Contractor' },
  { value: 'landscape_designer', label: 'Landscape Designer' },
  { value: 'smart_home_tech', label: 'Smart-Home Technician' },
  { value: 'material_supplier', label: 'Material Supplier' },
  { value: 'other', label: 'Other' }
];

const experienceLevels = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' }
];

const DeveloperPartnerModal: React.FC<DeveloperPartnerModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    category: '',
    experience: '',
    location: '',
    portfolio: '',
    description: '',
    agreeTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Partnership application submitted successfully!', {
      description: 'Our team will review your application and contact you soon.'
    });
    
    setIsSubmitting(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      category: '',
      experience: '',
      location: '',
      portfolio: '',
      description: '',
      agreeTerms: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-3 pb-2 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Developer Partner Application
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Join the ASTRA Villa Developer Network</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Personal Info */}
          <div className="space-y-2">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">Personal Information</Badge>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" /> Full Name *
                </Label>
                <Input
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email *
                </Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone *
                </Label>
                <Input
                  placeholder="+62 812 3456 7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </Label>
                <Input
                  placeholder="Bali, Indonesia"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-2">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">Professional Information</Badge>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Company Name
                </Label>
                <Input
                  placeholder="Company / Studio"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Portfolio URL
                </Label>
                <Input
                  placeholder="https://portfolio.com"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-xs">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Experience *</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  required
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((exp) => (
                      <SelectItem key={exp.value} value={exp.value} className="text-xs">
                        {exp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <FileText className="h-3 w-3" /> About Your Work *
            </Label>
            <Textarea
              placeholder="Tell us about your expertise, past projects, and why you want to partner with ASTRA Villa..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-xs min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-[10px] text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the terms and conditions and consent to ASTRA Villa contacting me regarding partnership opportunities.
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1.5" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperPartnerModal;
