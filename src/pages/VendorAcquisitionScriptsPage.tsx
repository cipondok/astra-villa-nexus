import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, Copy, Check, ArrowUpRight, Layers,
  Phone, UserPlus, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeSlide = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
};

const INITIAL_SCRIPT = `Halo Pak/Bu,

Saya dari platform properti digital baru yang sedang membuka akses vendor eksklusif di area [Bandung / Jakarta].

Saat ini kami sedang membawa investor aktif yang mencari:
• jasa renovasi
• legal properti
• interior / konstruksi

Vendor early partner akan mendapatkan:
✓ prioritas lead proyek
✓ fitur promosi premium gratis 3 bulan
✓ potensi peningkatan proyek 30–70%

Apakah Bapak/Ibu berkenan jika saya jelaskan singkat via call 10 menit?

Terima kasih 🙏`;

const FOLLOWUP_SCRIPT = `Pak/Bu izin follow up 🙏

Saat ini sudah ada beberapa vendor yang mulai menerima lead proyek dari investor kami minggu ini.

Kami hanya membuka slot terbatas per area agar kualitas proyek terjaga.

Apakah hari ini atau besok ada waktu 10 menit untuk penjelasan?`;

interface ScriptCard {
  id: string;
  title: string;
  timing: string;
  icon: React.ElementType;
  script: string;
  accentClass: string;
  badgeClass: string;
  tactics: string[];
}

const scripts: ScriptCard[] = [
  {
    id: 'initial', title: 'Initial Outreach', timing: 'Day 1', icon: UserPlus,
    script: INITIAL_SCRIPT,
    accentClass: 'border-l-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20',
    tactics: [
      'Lead with exclusivity — "akses vendor eksklusif"',
      'Anchor value with specific investor demand categories',
      'Offer free premium trial to reduce friction',
      'End with low-commitment ask — 10 minute call',
    ],
  },
  {
    id: 'followup', title: 'Follow-Up Message', timing: 'Day 3–5', icon: Clock,
    script: FOLLOWUP_SCRIPT,
    accentClass: 'border-l-chart-2', badgeClass: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    tactics: [
      'Social proof — other vendors already receiving leads',
      'Scarcity signal — "slot terbatas per area"',
      'Quality framing — limited slots for quality control',
      'Urgency — "hari ini atau besok"',
    ],
  },
];

const psychologyTactics = [
  { principle: 'Exclusivity Anchoring', detail: '"Akses eksklusif" creates perceived scarcity and elevates vendor status before any value is delivered.' },
  { principle: 'Social Proof Trigger', detail: 'Follow-up references other vendors receiving leads — nobody wants to be the one who missed out.' },
  { principle: 'Low-Friction CTA', detail: '"10 menit via call" removes commitment anxiety. Short time + specific format = higher acceptance.' },
];

const metrics = [
  { label: 'Scripts', value: '2', sub: 'Outreach + Follow-up' },
  { label: 'Target response', value: '>35%', sub: 'Reply rate' },
  { label: 'Conversion goal', value: '>18%', sub: 'Call booked' },
  { label: 'Follow-up timing', value: 'Day 3–5', sub: 'Optimal window' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy Script'}
    </Button>
  );
}

export default function VendorAcquisitionScriptsPage() {
  return (
    <div className="min-h-screen bg-background">
      <motion.section initial="hidden" animate="visible" variants={stagger} className="border-b border-border bg-card/50">
        <div className="container max-w-6xl py-8 space-y-3">
          <motion.div variants={fadeSlide} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="text-[10px] tracking-widest font-semibold uppercase mb-1">Sales Playbook</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">WhatsApp Vendor Acquisition Scripts</h1>
            </div>
          </motion.div>
          <motion.p variants={fadeSlide} className="text-sm text-muted-foreground max-w-2xl">
            Ready-to-send outreach and follow-up scripts for vendor onboarding — optimized for Indonesian B2B WhatsApp communication patterns.
          </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-6xl py-6 space-y-6">
        {/* Metrics */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <motion.div key={m.label} variants={fadeSlide}>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                  <div className="text-xl font-bold font-mono text-foreground">{m.value}</div>
                  <span className="text-[10px] text-primary flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{m.sub}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Scripts */}
        {scripts.map((s) => (
          <motion.div key={s.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeSlide}>
              <Card className={`border-border/50 border-l-4 ${s.accentClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                        <s.icon className="h-4.5 w-4.5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] font-mono ${s.badgeClass}`}>{s.timing}</Badge>
                        </div>
                        <CardTitle className="text-base">{s.title}</CardTitle>
                      </div>
                    </div>
                    <CopyButton text={s.script} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-5 gap-4">
                    {/* Script */}
                    <div className="md:col-span-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp Message</span>
                      </div>
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{s.script}</pre>
                    </div>
                    {/* Tactics */}
                    <div className="md:col-span-2 space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Psychology Tactics</span>
                      {s.tactics.map((t, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-foreground">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}

        {/* Psychology Framework */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeSlide}>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Persuasion Framework</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {psychologyTactics.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs font-semibold text-foreground mb-1">{item.principle}</p>
                    <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
