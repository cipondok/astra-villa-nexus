import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { Building2, User, Mail, Phone, MapPin, FileText } from "lucide-react";

interface BecomePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BecomePartnerModal = ({ isOpen, onClose }: BecomePartnerModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "", contactName: "", email: "", phone: "",
    address: "", businessType: "", experience: "", description: "",
    agreedToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast({ title: "Error", description: t('becomePartner.errorAgreeTerms'), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: t('becomePartner.applicationSubmitted'), description: t('becomePartner.applicationSubmittedDesc') });
      setFormData({ companyName: "", contactName: "", email: "", phone: "", address: "", businessType: "", experience: "", description: "", agreedToTerms: false });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: t('becomePartner.submitFailed'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{t('becomePartner.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('becomePartner.companyName')} *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="companyName" placeholder={t('becomePartner.companyNamePlaceholder')} value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">{t('becomePartner.contactPerson')} *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="contactName" placeholder={t('becomePartner.contactPersonPlaceholder')} value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('becomePartner.emailAddress')} *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder={t('becomePartner.emailPlaceholder')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('becomePartner.phoneNumber')} *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" placeholder={t('becomePartner.phonePlaceholder')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-10" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('becomePartner.businessAddress')} *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="address" placeholder={t('becomePartner.addressPlaceholder')} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="pl-10" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">{t('becomePartner.businessType')} *</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                <SelectTrigger><SelectValue placeholder={t('becomePartner.selectBusinessType')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-estate-agency">{t('becomePartner.realEstateAgency')}</SelectItem>
                  <SelectItem value="property-developer">{t('becomePartner.propertyDeveloper')}</SelectItem>
                  <SelectItem value="investment-company">{t('becomePartner.investmentCompany')}</SelectItem>
                  <SelectItem value="construction-company">{t('becomePartner.constructionCompany')}</SelectItem>
                  <SelectItem value="property-management">{t('becomePartner.propertyManagement')}</SelectItem>
                  <SelectItem value="other">{t('becomePartner.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">{t('becomePartner.yearsOfExperience')} *</Label>
              <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                <SelectTrigger><SelectValue placeholder={t('becomePartner.selectExperience')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">{t('becomePartner.years1_2')}</SelectItem>
                  <SelectItem value="3-5">{t('becomePartner.years3_5')}</SelectItem>
                  <SelectItem value="6-10">{t('becomePartner.years6_10')}</SelectItem>
                  <SelectItem value="10+">{t('becomePartner.years10Plus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('becomePartner.businessDescription')} *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea id="description" placeholder={t('becomePartner.descriptionPlaceholder')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="pl-10 min-h-[100px]" required />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })} />
            <Label htmlFor="terms" className="text-sm">{t('becomePartner.agreeTerms')}</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">{t('becomePartner.cancel')}</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? t('becomePartner.submitting') : t('becomePartner.submitApplication')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BecomePartnerModal;
