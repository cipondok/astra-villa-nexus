import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ForeignInvestmentContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForeignInvestmentContactDialog = ({ open, onOpenChange }: ForeignInvestmentContactDialogProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    nationality: "",
    investmentType: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: inquiry, error } = await supabase.from("inquiries").insert({
        inquiry_type: "foreign_investment",
        subject: `Foreign Investment Inquiry - ${formData.investmentType || "General"}`,
        message: `Name: ${formData.name}\nNationality: ${formData.nationality}\nInvestment Type: ${formData.investmentType}\n\nMessage:\n${formData.message}`,
        contact_email: formData.email,
        contact_phone: formData.phone,
        status: "new"
      }).select().single();

      if (error) throw error;

      // Send confirmation email via SMTP
      if (inquiry) {
        await supabase.functions.invoke('send-inquiry-email', {
          body: {
            inquiry_id: inquiry.id,
            customer_email: formData.email,
            customer_name: formData.name,
            inquiry_type: "foreign_investment",
            message: formData.message
          }
        });
      }

      toast({
        title: language === "id" ? "Berhasil!" : "Success!",
        description: language === "id" 
          ? "Pertanyaan Anda telah dikirim. Spesialis kami akan menghubungi Anda segera."
          : "Your inquiry has been submitted. Our specialist will contact you shortly.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        nationality: "",
        investmentType: ""
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast({
        title: language === "id" ? "Error" : "Error",
        description: language === "id" 
          ? "Terjadi kesalahan. Silakan coba lagi."
          : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === "id" ? "Hubungi Spesialis Investasi Asing" : "Contact Foreign Investment Specialist"}
          </DialogTitle>
          <DialogDescription>
            {language === "id" 
              ? "Tim spesialis kami yang berbahasa Inggris akan membantu Anda dengan pertanyaan investasi properti di Indonesia"
              : "Our English-speaking specialists will assist you with your Indonesian property investment questions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {language === "id" ? "Nama Lengkap" : "Full Name"} *
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === "id" ? "John Doe" : "John Doe"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">
                {language === "id" ? "Kewarganegaraan" : "Nationality"} *
              </Label>
              <Input
                id="nationality"
                required
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder={language === "id" ? "Contoh: USA, UK, Australia" : "e.g., USA, UK, Australia"}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === "id" ? "Email" : "Email"} *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === "id" ? "Nomor Telepon" : "Phone Number"} *
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 xxx xxxx xxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investmentType">
              {language === "id" ? "Tipe Investasi" : "Investment Type"}
            </Label>
            <select
              id="investmentType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.investmentType}
              onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
            >
              <option value="">
                {language === "id" ? "Pilih Tipe Investasi" : "Select Investment Type"}
              </option>
              <option value="apartment">{language === "id" ? "Apartemen/Kondominium" : "Apartment/Condominium"}</option>
              <option value="house">{language === "id" ? "Rumah (Hak Pakai)" : "House (Hak Pakai)"}</option>
              <option value="villa">{language === "id" ? "Villa" : "Villa"}</option>
              <option value="land">{language === "id" ? "Tanah" : "Land"}</option>
              <option value="commercial">{language === "id" ? "Properti Komersial" : "Commercial Property"}</option>
              <option value="other">{language === "id" ? "Lainnya" : "Other"}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              {language === "id" ? "Pesan Anda" : "Your Message"} *
            </Label>
            <Textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={language === "id" 
                ? "Jelaskan pertanyaan atau kebutuhan investasi Anda..."
                : "Describe your investment questions or needs..."}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "id" ? "Mengirim..." : "Sending..."}
                </>
              ) : (
                language === "id" ? "Kirim Pertanyaan" : "Submit Inquiry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
