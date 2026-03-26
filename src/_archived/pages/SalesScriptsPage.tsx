import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ChevronDown, Copy, CheckCircle2, Users,
  Building2, TrendingUp, Target, Zap, ArrowRight, Phone,
  Mail, Shield, Star, Sparkles, BarChart3, Layers,
  UserCheck, Handshake, Clock, Gift, FileText, Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ScriptBlock {
  id: string;
  label: string;
  timing: string;
  goal: string;
  lines: { speaker: 'you' | 'note'; text: string }[];
}

interface Objection {
  question: string;
  answer: string;
}

interface ScriptSection {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof MessageSquare;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  audience: string;
  blocks: ScriptBlock[];
  objections: Objection[];
  valuePoints: { icon: typeof Zap; title: string; detail: string }[];
}

const SCRIPTS: ScriptSection[] = [
  {
    id: 'developer', title: 'Developer Partnership Script', subtitle: 'For property developers launching new projects',
    icon: Building2, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    audience: 'Developer Directors, Marketing Heads, Sales Managers',
    valuePoints: [
      { icon: Sparkles, title: 'AI Demand Forecast', detail: 'Show predicted absorption speed, optimal pricing bands, and buyer readiness signals for their launch area before they commit marketing budget.' },
      { icon: Target, title: 'Qualified Investor Leads', detail: 'Our platform matches their project to investors actively searching in their price range, location, and property type — not cold leads.' },
      { icon: Layers, title: 'Digital Launch Infrastructure', detail: 'Interactive masterplan, unit inventory management, launch phase tracking, and countdown timers — all handled through one dashboard.' },
      { icon: BarChart3, title: 'Real-Time Performance Analytics', detail: 'Track views, inquiries, unit reservations, and conversion funnel in real-time through the developer dashboard.' },
    ],
    blocks: [
      {
        id: 'dev-open', label: 'Opening', timing: '30 seconds', goal: 'Establish relevance and earn 2 minutes of attention',
        lines: [
          { speaker: 'you', text: '"Selamat siang, Pak/Bu [Name]. Saya [Your Name] dari ASTRA Villa — platform investasi properti berbasis AI."' },
          { speaker: 'you', text: '"Kami membantu developer menjual properti lebih cepat dengan mencocokkan proyek Anda langsung ke investor yang sudah aktif mencari di area dan range harga yang tepat."' },
          { speaker: 'you', text: '"Boleh saya jelaskan singkat bagaimana sistem kami bekerja? Hanya 2 menit."' },
          { speaker: 'note', text: 'Key: Lead with the outcome (sell faster), not the technology. Mention AI only as the method.' },
        ],
      },
      {
        id: 'dev-value', label: 'Value Delivery', timing: '2 minutes', goal: 'Demonstrate specific, measurable value',
        lines: [
          { speaker: 'you', text: '"Platform kami memiliki fitur AI Demand Forecast — sebelum Bapak/Ibu launch, kami bisa tunjukkan data prediksi: berapa cepat unit akan terserap, range harga optimal, dan profil investor yang paling cocok."' },
          { speaker: 'you', text: '"Saat ini kami punya [X] investor aktif yang mencari properti di [their area]. Artinya, dari hari pertama launch, proyek Anda sudah terekspos ke pembeli yang qualified."' },
          { speaker: 'you', text: '"Developer juga mendapat dashboard lengkap — kelola inventory unit, track leads, dan pantau performa listing secara real-time. Semua digital, tidak perlu setup tambahan."' },
          { speaker: 'note', text: 'Adapt numbers to actual data. If early stage, say "growing investor base focused on [area]" instead of specific numbers.' },
        ],
      },
      {
        id: 'dev-proof', label: 'Social Proof / Credibility', timing: '30 seconds', goal: 'Build trust through specifics',
        lines: [
          { speaker: 'you', text: '"Kami sudah bekerja sama dengan [X] developer di area [cities]. Platform kami menggunakan data market intelligence dari [number] listing untuk menghasilkan insight yang akurat."' },
          { speaker: 'you', text: '"Yang membedakan kami — investor di platform kami bukan browser biasa. Mereka menggunakan AI scoring kami untuk mencari peluang investasi serius."' },
          { speaker: 'note', text: 'If pre-traction, pivot to: "Kami sedang onboard partner awal dan developer yang join sekarang mendapat featured placement gratis selama 90 hari."' },
        ],
      },
      {
        id: 'dev-close', label: 'Closing & Next Step', timing: '30 seconds', goal: 'Secure a concrete next action',
        lines: [
          { speaker: 'you', text: '"Untuk partner awal, kami berikan akses prioritas: featured placement di homepage, AI demand report gratis untuk proyek pertama, dan dedicated support untuk setup."' },
          { speaker: 'you', text: '"Langkah selanjutnya sangat simple — saya bisa kirim contoh demand report untuk area proyek Bapak/Ibu, dan kita jadwalkan demo 15 menit minggu ini. Kapan waktu yang cocok?"' },
          { speaker: 'note', text: 'Always end with a specific next step. "Demo 15 menit" is less intimidating than "meeting". Offer to send the demand report first as a value-first approach.' },
        ],
      },
    ],
    objections: [
      { question: '"Kami sudah punya channel marketing sendiri."', answer: '"Bagus, Pak/Bu. Kami bukan pengganti — kami tambahan channel yang membawa tipe investor berbeda. Investor kami menggunakan AI untuk mencari deal, jadi mereka cenderung lebih serius dan closing lebih cepat. Ini complementary dengan channel existing Bapak/Ibu."' },
      { question: '"Berapa biayanya?"', answer: '"Untuk partner awal, featured listing gratis 90 hari. Setelah itu, model kami performance-based — Bapak/Ibu hanya bayar untuk leads yang qualified. Tidak ada upfront cost."' },
      { question: '"Platform baru, belum ada track record."', answer: '"Betul, kami masih tahap awal — dan justru itu advantage untuk Bapak/Ibu. Partner awal mendapat visibility dan support level yang tidak akan tersedia saat platform sudah ramai. Plus, demand report kami berdasarkan data market yang sudah tervalidasi."' },
      { question: '"Nanti saja, proyek kami belum launch."', answer: '"Justru waktu terbaik untuk join adalah sebelum launch. Kami bisa generate pre-launch buzz ke investor base kami, dan AI demand forecast bisa membantu fine-tune pricing strategy sebelum Bapak/Ibu commit."' },
    ],
  },
  {
    id: 'agent', title: 'Agent Recruitment Script', subtitle: 'For independent agents and agency teams',
    icon: UserCheck, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    audience: 'Independent Agents, Agency Principals, Senior Brokers',
    valuePoints: [
      { icon: TrendingUp, title: 'AI-Powered Listing Exposure', detail: 'Listings are ranked by AI opportunity scoring — high-quality listings get matched to investors actively searching, not buried in a feed.' },
      { icon: Users, title: 'Qualified Lead Pipeline', detail: 'CRM-style lead management with priority scoring. No more chasing cold leads — investors on the platform are pre-qualified by their search behavior.' },
      { icon: Briefcase, title: 'Transaction Workflow Tools', detail: 'From inquiry to viewing to offer — manage the entire pipeline digitally. Schedule viewings, track follow-ups, and close deals faster.' },
      { icon: Gift, title: 'Leaderboard & Rewards', detail: 'Top-performing agents earn badges, priority placement, and monthly rewards. Build your reputation with a verified performance track record.' },
    ],
    blocks: [
      {
        id: 'agent-open', label: 'Opening', timing: '30 seconds', goal: 'Connect through shared pain point',
        lines: [
          { speaker: 'you', text: '"Halo Pak/Bu [Name], saya [Your Name] dari ASTRA Villa. Kami platform properti yang menggunakan AI untuk mencocokkan listing agent langsung ke investor yang tepat."' },
          { speaker: 'you', text: '"Saya tahu tantangan terbesar agent adalah mendapat leads yang benar-benar serius. Platform kami didesain khusus untuk solve masalah itu."' },
          { speaker: 'you', text: '"Boleh saya share 1 menit bagaimana agent di platform kami mendapat leads lebih berkualitas?"' },
          { speaker: 'note', text: 'Agents are busy and skeptical. Lead with the pain point (bad leads), not features. Keep the ask small (1 minute).' },
        ],
      },
      {
        id: 'agent-value', label: 'Value Delivery', timing: '90 seconds', goal: 'Show how their daily workflow improves',
        lines: [
          { speaker: 'you', text: '"Di ASTRA Villa, listing Bapak/Ibu tidak sekadar ditampilkan — AI kami secara aktif mencocokkan properti dengan investor yang search behavior-nya match. Jadi yang lihat listing Anda memang yang sedang cari tipe properti itu."' },
          { speaker: 'you', text: '"Kami juga sediakan tools CRM — kelola semua leads dari satu dashboard, set follow-up reminders, track mana leads yang hot, dan schedule viewings langsung dari platform."' },
          { speaker: 'you', text: '"Plus, agent top performer mendapat rewards bulanan dan badge yang terlihat di profil — ini membangun trust dengan calon client baru."' },
          { speaker: 'note', text: 'Focus on workflow improvement, not technology. Agents care about: more leads, better leads, easier management, more closings.' },
        ],
      },
      {
        id: 'agent-proof', label: 'Differentiation', timing: '30 seconds', goal: 'Explain why this is different from other portals',
        lines: [
          { speaker: 'you', text: '"Bedanya dengan portal lain — kami fokus ke investor serius, bukan browser. User kami menggunakan AI opportunity scoring untuk cari deal investasi. Artinya, leads yang masuk ke Bapak/Ibu sudah terfilter intent-nya."' },
          { speaker: 'you', text: '"Kami juga transparent — Bapak/Ibu bisa lihat berapa kali listing dilihat, di-save, dan dibandingkan. Data ini membantu optimasi strategi listing."' },
          { speaker: 'note', text: 'The key differentiator is investor-focused (not general public) + AI matching (not just listing display).' },
        ],
      },
      {
        id: 'agent-close', label: 'Closing & Onboarding', timing: '30 seconds', goal: 'Make joining feel effortless',
        lines: [
          { speaker: 'you', text: '"Join-nya sangat mudah — upload 3 listing pertama, dan dalam 24 jam sudah live dan terekspos ke investor base kami. Gratis untuk mulai, tidak ada commitment."' },
          { speaker: 'you', text: '"Agent yang join di periode awal ini mendapat featured placement gratis untuk 10 listing pertama. Mau saya bantu setup sekarang? Cuma 5 menit."' },
          { speaker: 'note', text: 'Remove all friction: free, no commitment, fast setup, immediate benefit. The "5 menit" framing makes it feel effortless.' },
        ],
      },
    ],
    objections: [
      { question: '"Saya sudah listing di portal lain."', answer: '"Bagus — kami bukan pengganti, tapi tambahan channel. Bedanya, investor di platform kami menggunakan AI scoring, jadi mereka lebih targeted. Bapak/Ibu bisa listing di kedua platform sekaligus, tidak exclusive."' },
      { question: '"Leads dari portal online biasanya tidak berkualitas."', answer: '"Kami setuju itu masalah umum. Makanya platform kami berbeda — user kami adalah investor yang aktif menggunakan AI tools untuk analisis. Mereka bukan window shoppers. Plus, sistem CRM kami membantu prioritaskan leads yang paling hot."' },
      { question: '"Saya tidak punya waktu untuk platform baru."', answer: '"Setup cuma 5 menit — upload foto, isi specs, done. Setelah itu platform bekerja untuk Bapak/Ibu secara otomatis. AI kami yang match-kan listing ke investor, Bapak/Ibu tinggal respond leads yang masuk."' },
      { question: '"Gratis sekarang, nanti pasti bayar."', answer: '"Model kami performance-based — Bapak/Ibu hanya invest ketika sudah merasakan hasilnya. Dan untuk early adopters, benefit premium placement tetap berlaku selamanya selama aktif di platform."' },
    ],
  },
];

const APPROACH_CHANNELS = [
  { icon: Phone, name: 'WhatsApp / Cold Call', best: 'Agents', timing: 'Tue–Thu, 10am–12pm', tip: 'Send value-first message (demand data snippet) before calling' },
  { icon: Mail, name: 'Email Outreach', best: 'Developers', timing: 'Mon/Wed morning', tip: 'Subject line: "Data permintaan investor di [area proyek Anda]"' },
  { icon: Handshake, name: 'In-Person / Event', best: 'Both', timing: 'Property expos, networking events', tip: 'Bring tablet with live platform demo, show their area specifically' },
  { icon: Users, name: 'Warm Referral', best: 'Both', timing: 'Anytime', tip: 'Ask existing partners: "Siapa developer/agent lain yang mungkin tertarik?"' },
];

function CopyButton({ text }: { text: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-muted/10 transition-colors shrink-0" title="Copy">
      {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </button>
  );
}

function ScriptBlockCard({ block }: { block: ScriptBlock }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{block.label}</span>
            <Badge variant="outline" className="text-[8px] h-4"><Clock className="h-2 w-2 mr-0.5" />{block.timing}</Badge>
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">Goal: {block.goal}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1.5">
              <Separator className="opacity-10" />
              {block.lines.map((line, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 ${line.speaker === 'you' ? 'bg-primary/5 border border-primary/10' : 'bg-amber-400/5 border border-amber-400/10'}`}>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className={`text-[7px] h-3.5 shrink-0 mt-0.5 ${line.speaker === 'you' ? 'text-primary border-primary/30' : 'text-amber-400 border-amber-400/30'}`}>
                      {line.speaker === 'you' ? 'SAY' : 'NOTE'}
                    </Badge>
                    <p className={`text-[10px] leading-relaxed flex-1 ${line.speaker === 'you' ? 'text-foreground' : 'text-muted-foreground italic'}`}>{line.text}</p>
                    {line.speaker === 'you' && <CopyButton text={line.text.replace(/^"|"$/g, '')} />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ObjectionCard({ obj }: { obj: Objection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Shield className="h-3 w-3 text-rose-400 shrink-0" />
        <span className="text-[10px] font-medium text-foreground flex-1">{obj.question}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5">
              <Separator className="opacity-10 mb-1.5" />
              <div className="rounded-lg bg-emerald-400/5 border border-emerald-400/10 px-3 py-2 flex items-start gap-2">
                <Badge variant="outline" className="text-[7px] h-3.5 text-emerald-400 border-emerald-400/30 shrink-0 mt-0.5">RESPOND</Badge>
                <p className="text-[10px] text-foreground leading-relaxed flex-1">{obj.answer}</p>
                <CopyButton text={obj.answer.replace(/^"|"$/g, '')} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScriptCard({ section }: { section: ScriptSection }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = section.icon;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${section.borderClass} ${section.bgClass}/10 shrink-0`}>
          <Icon className={`h-5 w-5 ${section.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{section.blocks.length} sections</Badge>
            <Badge variant="outline" className="text-[9px] h-5">{section.objections.length} objections</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{section.subtitle} · Target: {section.audience}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              <Separator className="opacity-15" />

              {/* Value points */}
              <div>
                <span className="text-[10px] font-bold text-foreground mb-1.5 block">Key Value Points to Emphasize</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {section.valuePoints.map(v => (
                    <div key={v.title} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <v.icon className={`h-3 w-3 ${section.accentClass}`} />
                        <span className="text-[10px] font-bold text-foreground">{v.title}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed">{v.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation flow */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-foreground">Conversation Flow</span>
                  <div className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                    {section.blocks.map((b, i) => (
                      <span key={b.id} className="flex items-center gap-0.5">
                        <span>{b.label}</span>
                        {i < section.blocks.length - 1 && <ArrowRight className="h-2 w-2" />}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {section.blocks.map(b => <ScriptBlockCard key={b.id} block={b} />)}
                </div>
              </div>

              {/* Objection handling */}
              <div>
                <span className="text-[10px] font-bold text-foreground mb-1.5 block">Objection Handling</span>
                <div className="space-y-1.5">
                  {section.objections.map((o, i) => <ObjectionCard key={i} obj={o} />)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SalesScriptsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Sales Communication Scripts</h1>
              <p className="text-xs text-muted-foreground">Structured outreach conversations for developer partnerships and agent recruitment</p>
            </div>
          </div>

          {/* Core positioning */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Core Positioning Statement</span>
            </div>
            <blockquote className="text-sm text-foreground font-medium italic border-l-2 border-primary/40 pl-3">
              "Kami membantu developer dan agent menjual properti lebih cepat menggunakan AI demand analytics dan targeted investor discovery."
            </blockquote>
            <p className="text-[10px] text-muted-foreground mt-2">
              Closing anchor: <span className="text-foreground font-medium">"Kami ingin menjadi smart distribution channel untuk investor properti serius. Partner awal mendapat visibility dan growth advantage lebih tinggi."</span>
            </p>
          </div>

          {/* Approach channels */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Outreach Channels & Timing</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {APPROACH_CHANNELS.map(c => (
                <div key={c.name} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <c.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-foreground">{c.name}</span>
                  </div>
                  <div className="space-y-0.5 text-[9px]">
                    <p className="text-muted-foreground">Best for: <span className="text-foreground">{c.best}</span></p>
                    <p className="text-muted-foreground">Timing: <span className="text-foreground">{c.timing}</span></p>
                    <p className="text-muted-foreground/60 italic mt-1">{c.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Script Types', value: '2', icon: FileText },
              { label: 'Talk Sections', value: '8', icon: MessageSquare },
              { label: 'Objection Rebuttals', value: '8', icon: Shield },
              { label: 'Est. Call Duration', value: '4 min', icon: Clock },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {SCRIPTS.map(s => <ScriptCard key={s.id} section={s} />)}

        {/* Follow-up cadence */}
        <div className="rounded-xl border border-border/20 bg-card/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-bold text-foreground">Follow-Up Cadence</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap text-[9px]">
            {[
              { day: 'Day 0', action: 'Initial outreach', detail: 'WhatsApp / Call / Email' },
              { day: 'Day 2', action: 'Value follow-up', detail: 'Send demand report or listing stats' },
              { day: 'Day 5', action: 'Demo invite', detail: '"Mau saya tunjukkan dashboard-nya?"' },
              { day: 'Day 10', action: 'Social proof', detail: 'Share partner success story' },
              { day: 'Day 15', action: 'Final nudge', detail: '"Early partner benefit expires soon"' },
            ].map((step, i) => (
              <div key={step.day} className="flex items-center gap-1">
                <div className="px-2.5 py-2 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[90px]">
                  <span className="text-foreground font-bold block">{step.day}</span>
                  <span className="text-foreground text-[10px] block">{step.action}</span>
                  <span className="text-muted-foreground/50 text-[8px]">{step.detail}</span>
                </div>
                {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
