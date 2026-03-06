import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Bot, MessageSquare, Brain, Zap, Plus, Trash2, Edit, Search,
  FileText, Settings, Play, Send, Loader2, Save, X
} from 'lucide-react';
import {
  useTrainingPairs, useCreateTrainingPair, useUpdateTrainingPair, useDeleteTrainingPair,
  useResponseTemplates, useCreateResponseTemplate, useUpdateResponseTemplate, useDeleteResponseTemplate,
  useChatbotSettings, useUpdateChatbotSetting, useTestChatbotResponse,
  type TrainingPair, type ResponseTemplate,
} from '@/hooks/useChatbotTraining';

// ─── Intent categories ──────────────────────────────────────────────
const CATEGORIES = [
  'property_search', 'pricing', 'booking', 'mortgage', 'location',
  'agent_contact', 'complaints', 'legal', 'general',
];

const TONES = ['professional', 'friendly', 'casual', 'formal', 'empathetic'];

// ─── Training Pair Form ─────────────────────────────────────────────
function TrainingPairForm({ pair, onClose }: { pair?: TrainingPair; onClose: () => void }) {
  const create = useCreateTrainingPair();
  const update = useUpdateTrainingPair();
  const [q, setQ] = useState(pair?.question ?? '');
  const [a, setA] = useState(pair?.answer ?? '');
  const [cat, setCat] = useState(pair?.intent_category ?? 'general');
  const [vars, setVars] = useState(pair?.variations?.join('\n') ?? '');
  const [tags, setTags] = useState(pair?.tags?.join(', ') ?? '');
  const [priority, setPriority] = useState(pair?.priority ?? 0);

  const saving = create.isPending || update.isPending;

  const handleSave = () => {
    const payload = {
      question: q,
      answer: a,
      intent_category: cat,
      variations: vars.split('\n').map(v => v.trim()).filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
    };
    if (pair) {
      update.mutate({ id: pair.id, ...payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Priority</Label>
          <Input type="number" value={priority} onChange={e => setPriority(+e.target.value)} className="h-8 text-xs" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Question</Label>
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="User question..." className="text-xs" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Answer</Label>
        <Textarea value={a} onChange={e => setA(e.target.value)} placeholder="Bot response..." className="text-xs min-h-[80px]" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Variations (one per line)</Label>
        <Textarea value={vars} onChange={e => setVars(e.target.value)} placeholder="Alternative phrasings..." className="text-xs min-h-[60px]" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Tags (comma separated)</Label>
        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="villa, bali, price..." className="text-xs" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !q || !a} className="text-xs">
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {pair ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

// ─── Template Form ──────────────────────────────────────────────────
function TemplateForm({ template, onClose }: { template?: ResponseTemplate; onClose: () => void }) {
  const create = useCreateResponseTemplate();
  const update = useUpdateResponseTemplate();
  const [name, setName] = useState(template?.template_name ?? '');
  const [content, setContent] = useState(template?.template_content ?? '');
  const [cat, setCat] = useState(template?.category ?? 'general');
  const [tone, setTone] = useState(template?.tone ?? 'professional');
  const [variables, setVariables] = useState(template?.variables?.join(', ') ?? '');

  const saving = create.isPending || update.isPending;

  const handleSave = () => {
    const payload = {
      template_name: name,
      template_content: content,
      category: cat,
      tone,
      variables: variables.split(',').map(v => v.trim()).filter(Boolean),
    };
    if (template) {
      update.mutate({ id: template.id, ...payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Template Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} className="text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Template Content</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} className="text-xs min-h-[100px]" placeholder="Use {{variable}} for dynamic content..." />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Variables (comma separated)</Label>
        <Input value={variables} onChange={e => setVariables(e.target.value)} placeholder="property_name, price, location..." className="text-xs" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !name || !content} className="text-xs">
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          {template ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

// ─── AI Test Playground ─────────────────────────────────────────────
function TestPlayground() {
  const test = useTestChatbotResponse();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    test.mutate(userMsg, {
      onSuccess: (data) => {
        const reply = typeof data === 'string' ? data : (data as any)?.response || (data as any)?.message || JSON.stringify(data);
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      },
      onError: (e) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          AI Test Playground
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="border border-border rounded-lg p-3 h-64 overflow-y-auto space-y-2 bg-muted/20">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-8">Send a test message to see how the chatbot responds...</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {test.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg px-3 py-2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a test message..."
            className="text-xs"
          />
          <Button size="sm" onClick={handleSend} disabled={test.isPending || !input.trim()}>
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────
function SettingsTab() {
  const { data: settings, isLoading } = useChatbotSettings();
  const update = useUpdateChatbotSetting();

  const tone = settings?.tone ?? {};
  const behavior = settings?.behavior ?? {};
  const branding = settings?.branding ?? {};

  const [toneState, setToneState] = useState<Record<string, any>>({});
  const [behaviorState, setBehaviorState] = useState<Record<string, any>>({});
  const [brandingState, setBrandingState] = useState<Record<string, any>>({});

  // Initialize states when data loads
  const toneData = { ...tone, ...toneState };
  const behaviorData = { ...behavior, ...behaviorState };
  const brandingData = { ...branding, ...brandingState };

  if (isLoading) return <div className="text-xs text-muted-foreground p-4">Loading settings...</div>;

  return (
    <div className="space-y-4">
      {/* Tone Settings */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Tone & Style</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Communication Style</Label>
              <Select value={toneData.style || 'professional'} onValueChange={v => setToneState(p => ({ ...p, style: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Formality Level</Label>
              <Select value={toneData.formality || 'semi-formal'} onValueChange={v => setToneState(p => ({ ...p, formality: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['formal', 'semi-formal', 'casual'].map(f => <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Emoji Usage</Label>
              <Select value={toneData.emoji_usage || 'minimal'} onValueChange={v => setToneState(p => ({ ...p, emoji_usage: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['none', 'minimal', 'moderate', 'frequent'].map(e => <SelectItem key={e} value={e} className="text-xs capitalize">{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Language</Label>
              <Select value={toneData.language_preference || 'bilingual'} onValueChange={v => setToneState(p => ({ ...p, language_preference: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['indonesian', 'english', 'bilingual'].map(l => <SelectItem key={l} value={l} className="text-xs capitalize">{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" className="text-xs" onClick={() => update.mutate({ key: 'tone', value: toneData })} disabled={update.isPending}>
            <Save className="h-3 w-3 mr-1" /> Save Tone
          </Button>
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Behavior</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Max Response Length (words)</Label>
            <Input
              type="number"
              value={behaviorData.max_response_length || 150}
              onChange={e => setBehaviorState(p => ({ ...p, max_response_length: +e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Greeting Message</Label>
            <Textarea
              value={behaviorData.greeting_message || ''}
              onChange={e => setBehaviorState(p => ({ ...p, greeting_message: e.target.value }))}
              className="text-xs min-h-[60px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fallback Message</Label>
            <Textarea
              value={behaviorData.fallback_message || ''}
              onChange={e => setBehaviorState(p => ({ ...p, fallback_message: e.target.value }))}
              className="text-xs min-h-[60px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Escalation Threshold (failed attempts before escalate)</Label>
            <Input
              type="number"
              value={behaviorData.escalation_threshold || 2}
              onChange={e => setBehaviorState(p => ({ ...p, escalation_threshold: +e.target.value }))}
              className="h-8 text-xs"
            />
          </div>
          <Button size="sm" className="text-xs" onClick={() => update.mutate({ key: 'behavior', value: behaviorData })} disabled={update.isPending}>
            <Save className="h-3 w-3 mr-1" /> Save Behavior
          </Button>
        </CardContent>
      </Card>

      {/* Branding Settings */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Branding</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Assistant Name</Label>
              <Input
                value={brandingData.assistant_name || ''}
                onChange={e => setBrandingState(p => ({ ...p, assistant_name: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Avatar Emoji</Label>
              <Input
                value={brandingData.avatar_emoji || ''}
                onChange={e => setBrandingState(p => ({ ...p, avatar_emoji: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button size="sm" className="text-xs" onClick={() => update.mutate({ key: 'branding', value: brandingData })} disabled={update.isPending}>
            <Save className="h-3 w-3 mr-1" /> Save Branding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
const ChatBotTraining = () => {
  const { data: pairs = [], isLoading: loadingPairs } = useTrainingPairs();
  const { data: templates = [], isLoading: loadingTemplates } = useResponseTemplates();
  const deletePair = useDeleteTrainingPair();
  const deleteTemplate = useDeleteResponseTemplate();
  const togglePair = useUpdateTrainingPair();
  const toggleTemplate = useUpdateResponseTemplate();

  const [search, setSearch] = useState('');
  const [editPair, setEditPair] = useState<TrainingPair | null>(null);
  const [editTemplate, setEditTemplate] = useState<ResponseTemplate | null>(null);
  const [showNewPair, setShowNewPair] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');

  const filteredPairs = pairs.filter(p => {
    const matchSearch = !search || p.question.toLowerCase().includes(search.toLowerCase()) || p.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.intent_category === filterCat;
    return matchSearch && matchCat;
  });

  const filteredTemplates = templates.filter(t =>
    !search || t.template_name.toLowerCase().includes(search.toLowerCase()) || t.template_content.toLowerCase().includes(search.toLowerCase())
  );

  const activePairs = pairs.filter(p => p.is_active).length;
  const categories = [...new Set(pairs.map(p => p.intent_category))];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Chatbot Training Studio</h2>
          <p className="text-xs text-muted-foreground">Manage Q&A pairs, response templates, tone settings, and test AI responses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Brain className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Training Pairs</span></div>
          <div className="text-lg font-bold text-foreground">{pairs.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><Zap className="h-4 w-4 text-chart-3" /><span className="text-[10px] text-muted-foreground">Active Pairs</span></div>
          <div className="text-lg font-bold text-foreground">{activePairs}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-chart-4" /><span className="text-[10px] text-muted-foreground">Templates</span></div>
          <div className="text-lg font-bold text-foreground">{templates.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-4 w-4 text-primary" /><span className="text-[10px] text-muted-foreground">Categories</span></div>
          <div className="text-lg font-bold text-foreground">{categories.length}</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="pairs" className="w-full">
        <TabsList className="h-8 bg-muted/30">
          <TabsTrigger value="pairs" className="text-xs">Q&A Pairs</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Tone & Settings</TabsTrigger>
          <TabsTrigger value="playground" className="text-xs">Test Playground</TabsTrigger>
        </TabsList>

        {/* ─── Q&A Pairs Tab ──────────────────────────────────────── */}
        <TabsContent value="pairs" className="space-y-3 mt-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Q&A pairs..." className="pl-8 h-8 text-xs" />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={showNewPair} onOpenChange={setShowNewPair}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs"><Plus className="h-3 w-3 mr-1" /> Add Pair</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="text-sm">New Training Pair</DialogTitle></DialogHeader>
                <TrainingPairForm onClose={() => setShowNewPair(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {loadingPairs && <p className="text-xs text-muted-foreground p-4">Loading...</p>}

          {filteredPairs.map(pair => (
            <Card key={pair.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Bot className="h-3.5 w-3.5 text-primary shrink-0" />
                      <Badge variant="outline" className="text-[9px]">{pair.intent_category.replace('_', ' ')}</Badge>
                      {pair.tags?.map(t => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                      {!pair.is_active && <Badge variant="destructive" className="text-[9px]">Inactive</Badge>}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">Q: {pair.question}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">A: {pair.answer}</p>
                    {pair.variations?.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{pair.variations.length} variation(s)</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={pair.is_active}
                      onCheckedChange={v => togglePair.mutate({ id: pair.id, is_active: v })}
                      className="scale-75"
                    />
                    <Dialog open={editPair?.id === pair.id} onOpenChange={open => !open && setEditPair(null)}>
                      <DialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" onClick={() => setEditPair(pair)}><Edit className="h-3 w-3" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="text-sm">Edit Training Pair</DialogTitle></DialogHeader>
                        <TrainingPairForm pair={pair} onClose={() => setEditPair(null)} />
                      </DialogContent>
                    </Dialog>
                    <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => deletePair.mutate(pair.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loadingPairs && filteredPairs.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No training pairs yet. Add your first Q&A pair to start training.</p>
            </div>
          )}
        </TabsContent>

        {/* ─── Templates Tab ──────────────────────────────────────── */}
        <TabsContent value="templates" className="space-y-3 mt-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="pl-8 h-8 text-xs" />
            </div>
            <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs"><Plus className="h-3 w-3 mr-1" /> Add Template</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="text-sm">New Response Template</DialogTitle></DialogHeader>
                <TemplateForm onClose={() => setShowNewTemplate(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {loadingTemplates && <p className="text-xs text-muted-foreground p-4">Loading...</p>}

          {filteredTemplates.map(tmpl => (
            <Card key={tmpl.id} className="border-border/40">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                      <span className="text-xs font-medium text-foreground">{tmpl.template_name}</span>
                      <Badge variant="outline" className="text-[9px]">{tmpl.category}</Badge>
                      <Badge variant="secondary" className="text-[9px] capitalize">{tmpl.tone}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{tmpl.template_content}</p>
                    {tmpl.variables?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {tmpl.variables.map(v => (
                          <span key={v} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{`{{${v}}}`}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={tmpl.is_active}
                      onCheckedChange={v => toggleTemplate.mutate({ id: tmpl.id, is_active: v })}
                      className="scale-75"
                    />
                    <Dialog open={editTemplate?.id === tmpl.id} onOpenChange={open => !open && setEditTemplate(null)}>
                      <DialogTrigger asChild>
                        <Button size="icon-sm" variant="ghost" onClick={() => setEditTemplate(tmpl)}><Edit className="h-3 w-3" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="text-sm">Edit Template</DialogTitle></DialogHeader>
                        <TemplateForm template={tmpl} onClose={() => setEditTemplate(null)} />
                      </DialogContent>
                    </Dialog>
                    <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => deleteTemplate.mutate(tmpl.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loadingTemplates && filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No templates yet. Create response templates to standardize chatbot replies.</p>
            </div>
          )}
        </TabsContent>

        {/* ─── Settings Tab ───────────────────────────────────────── */}
        <TabsContent value="settings" className="mt-3">
          <SettingsTab />
        </TabsContent>

        {/* ─── Playground Tab ─────────────────────────────────────── */}
        <TabsContent value="playground" className="mt-3">
          <TestPlayground />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatBotTraining;
