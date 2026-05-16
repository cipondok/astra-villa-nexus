import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/LangProvider";

type Props = {
  propertyId?: string;
  defaultMessage?: string;
  source?: "website" | "whatsapp" | "contact";
};

export default function ContactForm({ propertyId, defaultMessage, source = "contact" }: Props) {
  const { t } = useT();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: defaultMessage ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("create-lead", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          message: form.message.trim(),
          property_id: propertyId ?? null,
          source,
        },
      });
      if (error) throw error;
      toast({ title: t("contact.success") });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      toast({ title: t("contact.error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t("contact.name")}</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">{t("contact.email")}</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">{t("contact.phone")}</Label>
        <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="message">{t("contact.message")}</Label>
        <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "…" : t("contact.submit")}
      </Button>
    </form>
  );
}
