import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoTour {
  id: string;
  property_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  is_vr_enabled: boolean;
  tour_type: 'panorama' | '360_video' | 'walkthrough';
  view_count: number;
  settings: {
    autoRotate: boolean;
    rotateSpeed: number;
    enableZoom: boolean;
    defaultFov: number;
  };
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TourScene {
  id: string;
  tour_id: string;
  title: string;
  scene_order: number;
  image_url: string;
  thumbnail_url: string | null;
  initial_view: {
    pitch: number;
    yaw: number;
    fov: number;
  };
  is_entry_point: boolean;
  created_at: string;
}

export interface TourHotspot {
  id: string;
  scene_id: string;
  hotspot_type: 'navigation' | 'info' | 'media' | 'link';
  title: string;
  description: string | null;
  icon: string;
  position: {
    pitch: number;
    yaw: number;
  };
  target_scene_id: string | null;
  media_url: string | null;
  link_url: string | null;
  style: {
    color: string;
    size: string;
  };
  created_at: string;
}

export interface TourAnalytics {
  id: string;
  tour_id: string;
  session_id: string;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  scenes_visited: string[];
  hotspots_clicked: string[];
  device_type: string | null;
  is_vr_session: boolean;
  created_at: string;
}

export const useVideoTours = (propertyId?: string) => {
  const queryClient = useQueryClient();

  // Fetch tours for a property
  const { data: tours = [], isLoading: loadingTours } = useQuery({
    queryKey: ['video-tours', propertyId],
    queryFn: async () => {
      let query = supabase
        .from('video_tours')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as VideoTour[];
    },
    enabled: true
  });

  // Fetch a single tour with scenes and hotspots
  const useTourDetails = (tourId: string) => {
    return useQuery({
      queryKey: ['video-tour-details', tourId],
      queryFn: async () => {
        const [tourResult, scenesResult] = await Promise.all([
          supabase.from('video_tours').select('*').eq('id', tourId).single(),
          supabase.from('tour_scenes').select('*').eq('tour_id', tourId).order('scene_order')
        ]);

        if (tourResult.error) throw tourResult.error;
        if (scenesResult.error) throw scenesResult.error;

        const scenes = scenesResult.data as TourScene[];
        const sceneIds = scenes.map(s => s.id);

        let hotspots: TourHotspot[] = [];
        if (sceneIds.length > 0) {
          const { data: hotspotsData, error: hotspotsError } = await supabase
            .from('tour_hotspots')
            .select('*')
            .in('scene_id', sceneIds);
          
          if (!hotspotsError && hotspotsData) {
            hotspots = hotspotsData as TourHotspot[];
          }
        }

        return {
          tour: tourResult.data as VideoTour,
          scenes,
          hotspots
        };
      },
      enabled: !!tourId
    });
  };

  // Create tour
  const createTourMutation = useMutation({
    mutationFn: async (data: Partial<VideoTour> & { property_id: string; title: string }) => {
      const { data: result, error } = await supabase
        .from('video_tours')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as VideoTour;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tours'] });
      toast.success('Tour created successfully');
    },
    onError: () => toast.error('Failed to create tour')
  });

  // Update tour
  const updateTourMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<VideoTour> & { id: string }) => {
      const { error } = await supabase
        .from('video_tours')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tours'] });
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
      toast.success('Tour updated');
    },
    onError: () => toast.error('Failed to update tour')
  });

  // Delete tour
  const deleteTourMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('video_tours').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tours'] });
      toast.success('Tour deleted');
    },
    onError: () => toast.error('Failed to delete tour')
  });

  // Scene mutations
  const createSceneMutation = useMutation({
    mutationFn: async (data: Partial<TourScene> & { tour_id: string; title: string; image_url: string }) => {
      const { data: result, error } = await supabase
        .from('tour_scenes')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as TourScene;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
      toast.success('Scene added');
    },
    onError: () => toast.error('Failed to add scene')
  });

  const updateSceneMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TourScene> & { id: string }) => {
      const { error } = await supabase.from('tour_scenes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
    },
    onError: () => toast.error('Failed to update scene')
  });

  const deleteSceneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tour_scenes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
      toast.success('Scene deleted');
    },
    onError: () => toast.error('Failed to delete scene')
  });

  // Hotspot mutations
  const createHotspotMutation = useMutation({
    mutationFn: async (data: Partial<TourHotspot> & { scene_id: string; hotspot_type: string; title: string }) => {
      const { data: result, error } = await supabase
        .from('tour_hotspots')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as TourHotspot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
      toast.success('Hotspot added');
    },
    onError: () => toast.error('Failed to add hotspot')
  });

  const updateHotspotMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TourHotspot> & { id: string }) => {
      const { error } = await supabase.from('tour_hotspots').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
    },
    onError: () => toast.error('Failed to update hotspot')
  });

  const deleteHotspotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tour_hotspots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-tour-details'] });
      toast.success('Hotspot deleted');
    },
    onError: () => toast.error('Failed to delete hotspot')
  });

  // Track tour view
  const trackViewMutation = useMutation({
    mutationFn: async (data: {
      tour_id: string;
      session_id: string;
      device_type?: string;
      is_vr_session?: boolean;
    }) => {
      await supabase.from('tour_analytics').insert({
        ...data,
        started_at: new Date().toISOString()
      });
      
      // Increment view count manually
      const { data: tour } = await supabase
        .from('video_tours')
        .select('view_count')
        .eq('id', data.tour_id)
        .single();
      
      if (tour) {
        await supabase
          .from('video_tours')
          .update({ view_count: (tour.view_count || 0) + 1 })
          .eq('id', data.tour_id);
      }
    }
  });

  return {
    tours,
    loadingTours,
    useTourDetails,
    
    createTour: createTourMutation.mutateAsync,
    updateTour: updateTourMutation.mutate,
    deleteTour: deleteTourMutation.mutate,
    
    createScene: createSceneMutation.mutateAsync,
    updateScene: updateSceneMutation.mutate,
    deleteScene: deleteSceneMutation.mutate,
    
    createHotspot: createHotspotMutation.mutateAsync,
    updateHotspot: updateHotspotMutation.mutate,
    deleteHotspot: deleteHotspotMutation.mutate,
    
    trackView: trackViewMutation.mutate,
    
    isCreating: createTourMutation.isPending,
    isUpdating: updateTourMutation.isPending
  };
};

export default useVideoTours;
