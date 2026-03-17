import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DeveloperProject {
  id: string;
  developer_id: string;
  project_name: string;
  developer_name: string | null;
  developer_logo_url: string | null;
  description: string | null;
  concept: string | null;
  city: string;
  district: string | null;
  province: string | null;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;
  nearby_landmarks: any[];
  property_type: string;
  hero_images: string[];
  masterplan_images: string[];
  gallery_images: string[];
  video_url: string | null;
  total_units: number;
  available_units: number;
  reserved_units: number;
  sold_units: number;
  price_range_min: number | null;
  price_range_max: number | null;
  expected_completion_date: string | null;
  launch_date: string | null;
  launch_phase: string;
  amenities: string[];
  facilities: any[];
  ai_demand_label: string | null;
  ai_demand_score: number | null;
  ai_investment_grade: string | null;
  ai_rental_yield: number | null;
  ai_roi_5y: number | null;
  project_score: number | null;
  is_featured: boolean;
  is_published: boolean;
  early_investor_access: boolean;
  commission_rate: number;
  total_leads: number;
  total_views: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectUnit {
  id: string;
  project_id: string;
  unit_name: string;
  unit_type: string;
  floor_plan_url: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_area_sqm: number | null;
  land_area_sqm: number | null;
  price: number;
  status: string;
  reserved_by: string | null;
  reserved_at: string | null;
  features: string[];
  floor_level: number | null;
  view_direction: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProjectLead {
  id: string;
  project_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  budget_range: string | null;
  preferred_unit_type: string | null;
  message: string | null;
  intent: string;
  status: string;
  source: string;
  notes: string | null;
  contacted_at: string | null;
  created_at: string;
}

// ─── Public Queries ───

export function usePublishedProjects(city?: string) {
  return useQuery({
    queryKey: ['published-projects', city],
    queryFn: async () => {
      let q = (supabase as any)
        .from('developer_projects')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (city) q = q.ilike('city', `%${city}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as DeveloperProject[];
    },
    staleTime: 60_000,
  });
}

export function useProjectDetail(projectId?: string) {
  return useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await (supabase as any)
        .from('developer_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data as DeveloperProject;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useProjectUnits(projectId?: string) {
  return useQuery({
    queryKey: ['project-units', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await (supabase as any)
        .from('project_units')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as ProjectUnit[];
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

// ─── Lead Capture ───

export function useRegisterProjectInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      project_id: string;
      full_name: string;
      email: string;
      phone?: string;
      budget_range?: string;
      preferred_unit_type?: string;
      message?: string;
      intent?: string;
      user_id?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('project_leads')
        .insert({
          project_id: input.project_id,
          full_name: input.full_name,
          email: input.email,
          phone: input.phone || null,
          budget_range: input.budget_range || null,
          preferred_unit_type: input.preferred_unit_type || null,
          message: input.message || null,
          intent: input.intent || 'interest',
          user_id: input.user_id || null,
          source: 'website',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-leads'] });
      toast.success('Pendaftaran minat berhasil! Developer akan menghubungi Anda.');
    },
    onError: (e: Error) => toast.error(e.message || 'Gagal mendaftar'),
  });
}

// ─── Developer Dashboard Queries ───

export function useMyDeveloperProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-developer-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from('developer_projects')
        .select('*')
        .eq('developer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DeveloperProject[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

export function useProjectLeads(projectId?: string) {
  return useQuery({
    queryKey: ['project-leads', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await (supabase as any)
        .from('project_leads')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProjectLead[];
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateDeveloperProject() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<DeveloperProject>) => {
      if (!user?.id) throw new Error('Login required');
      const { data, error } = await (supabase as any)
        .from('developer_projects')
        .insert({ developer_id: user.id, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as DeveloperProject;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-developer-projects'] });
      toast.success('Proyek berhasil dibuat!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDeveloperProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DeveloperProject> & { id: string }) => {
      const { error } = await (supabase as any)
        .from('developer_projects')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-developer-projects'] });
      qc.invalidateQueries({ queryKey: ['project-detail'] });
      qc.invalidateQueries({ queryKey: ['published-projects'] });
      toast.success('Proyek diperbarui');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateProjectUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ProjectUnit> & { project_id: string }) => {
      const { data, error } = await (supabase as any)
        .from('project_units')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectUnit;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['project-units', vars.project_id] });
      toast.success('Unit ditambahkan');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProjectUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...updates }: Partial<ProjectUnit> & { id: string; project_id: string }) => {
      const { error } = await (supabase as any)
        .from('project_units')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['project-units', vars.project_id] });
    },
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: any = { status };
      if (notes) updates.notes = notes;
      if (status === 'contacted') updates.contacted_at = new Date().toISOString();
      const { error } = await (supabase as any)
        .from('project_leads')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-leads'] });
      toast.success('Status lead diperbarui');
    },
  });
}

// ─── Helpers ───

export const PHASE_CONFIG = {
  pre_launch: { label: 'Pre-Launch', color: 'bg-chart-4/15 text-chart-4 border-chart-4/25', icon: '🔒' },
  soft_launch: { label: 'Soft Launch', color: 'bg-chart-3/15 text-chart-3 border-chart-3/25', icon: '🌅' },
  launching: { label: 'Launching', color: 'bg-primary/15 text-primary border-primary/25', icon: '🚀' },
  active_sales: { label: 'Active Sales', color: 'bg-chart-2/15 text-chart-2 border-chart-2/25', icon: '🏗️' },
  sold_out: { label: 'Sold Out', color: 'bg-destructive/15 text-destructive border-destructive/25', icon: '🔴' },
  completed: { label: 'Completed', color: 'bg-chart-1/15 text-chart-1 border-chart-1/25', icon: '✅' },
} as const;

export const DEMAND_CONFIG = {
  'high_demand': { label: 'High Demand Potential', emoji: '🔥', color: 'text-destructive' },
  'investment_zone': { label: 'Strong Investment Zone', emoji: '💎', color: 'text-primary' },
  'rental_hotspot': { label: 'Rental Income Hotspot', emoji: '📈', color: 'text-chart-2' },
  'moderate': { label: 'Moderate Demand', emoji: '📊', color: 'text-chart-4' },
} as const;

export const LEAD_STATUS_CONFIG = {
  new: { label: 'Baru', color: 'bg-primary/15 text-primary' },
  contacted: { label: 'Dihubungi', color: 'bg-chart-4/15 text-chart-4' },
  qualified: { label: 'Qualified', color: 'bg-chart-2/15 text-chart-2' },
  converted: { label: 'Converted', color: 'bg-chart-1/15 text-chart-1' },
  lost: { label: 'Lost', color: 'bg-muted text-muted-foreground' },
} as const;
