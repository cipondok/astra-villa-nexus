import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LandingLeadCapture = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [investorForm, setInvestorForm] = useState({ name: '', email: '', phone: '', budget: '' });
  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorForm.name || !investorForm.email) return;
    setLoading(true);
    try {
      await supabase.from('foreign_investment_inquiries').insert({
        subject: `Investor Lead: ${investorForm.name}`,
        message: `Budget: ${investorForm.budget}\nPhone: ${investorForm.phone}`,
        inquiry_type: 'financial',
        status: 'new',
        user_id: null as any,
      });
      toast({ title: 'Thank you!', description: "We'll contact you within 24 hours." });
      setInvestorForm({ name: '', email: '', phone: '', budget: '' });
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerForm.name || !ownerForm.email) return;
    setLoading(true);
    try {
      await supabase.from('foreign_investment_inquiries').insert({
        subject: `Property Listing Inquiry: ${ownerForm.name}`,
        message: `${ownerForm.message}\nPhone: ${ownerForm.phone}`,
        inquiry_type: 'property',
        status: 'new',
        user_id: null as any,
      });
      toast({ title: 'Inquiry Received!', description: "Our team will reach out shortly." });
      setOwnerForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "bg-card/10 border-border/20 text-titanium-white placeholder:text-text-muted focus:border-gold-primary/50";

  return (
    <section className="relative py-20 md:py-32 bg-astra-navy-dark" id="contact">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="font-inter text-xs uppercase tracking-[0.2em] text-gold-primary mb-4 block">
            Get Started
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-titanium-white mb-3">
            Get Early Access to Premium Deals
          </h2>
          <p className="font-inter text-text-muted">
            Join investors exploring Indonesia's highest-yield property markets. Whether you're buying or listing — we're here to help.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gold-primary/15 bg-card/5 p-6 md:p-8"
        >
          <Tabs defaultValue="investor">
            <TabsList className="w-full bg-card/10 border border-border/15 mb-6">
              <TabsTrigger value="investor" className="flex-1 data-[state=active]:bg-gold-primary/20 data-[state=active]:text-gold-primary">
                <TrendingUp className="w-4 h-4 mr-2" /> Investor
              </TabsTrigger>
              <TabsTrigger value="owner" className="flex-1 data-[state=active]:bg-gold-primary/20 data-[state=active]:text-gold-primary">
                <Building2 className="w-4 h-4 mr-2" /> Property Owner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="investor">
              <form onSubmit={handleInvestorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-text-muted text-xs">Full Name *</Label><Input value={investorForm.name} onChange={e => setInvestorForm(p => ({ ...p, name: e.target.value }))} required className={inputCls} placeholder="John Doe" /></div>
                  <div><Label className="text-text-muted text-xs">Email *</Label><Input type="email" value={investorForm.email} onChange={e => setInvestorForm(p => ({ ...p, email: e.target.value }))} required className={inputCls} placeholder="john@email.com" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-text-muted text-xs">Phone</Label><Input value={investorForm.phone} onChange={e => setInvestorForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+62..." /></div>
                  <div><Label className="text-text-muted text-xs">Investment Budget</Label><Input value={investorForm.budget} onChange={e => setInvestorForm(p => ({ ...p, budget: e.target.value }))} className={inputCls} placeholder="e.g. Rp 2-5 Miliar" /></div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-gold-primary to-astra-gold-muted text-astra-navy-dark font-semibold rounded-xl py-5">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : 'Get Investment Opportunities'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="owner">
              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label className="text-text-muted text-xs">Full Name *</Label><Input value={ownerForm.name} onChange={e => setOwnerForm(p => ({ ...p, name: e.target.value }))} required className={inputCls} placeholder="Your Name" /></div>
                  <div><Label className="text-text-muted text-xs">Email *</Label><Input type="email" value={ownerForm.email} onChange={e => setOwnerForm(p => ({ ...p, email: e.target.value }))} required className={inputCls} placeholder="you@email.com" /></div>
                </div>
                <div><Label className="text-text-muted text-xs">Phone</Label><Input value={ownerForm.phone} onChange={e => setOwnerForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+62..." /></div>
                <div><Label className="text-text-muted text-xs">Property Details</Label><Textarea value={ownerForm.message} onChange={e => setOwnerForm(p => ({ ...p, message: e.target.value }))} className={`${inputCls} min-h-[100px]`} placeholder="Tell us about your property…" /></div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-gold-primary to-astra-gold-muted text-astra-navy-dark font-semibold rounded-xl py-5">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : 'Submit Listing Inquiry'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingLeadCapture;
