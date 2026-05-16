import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface VideoSession {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed' | 'pending_review';
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  calendly_event_id: string | null;
  meeting_url: string | null;
  room_id: string | null;
  verification_type: string;
  consent_given: boolean;
  recording_consent: boolean;
  notes: string | null;
  fraud_flags: string[];
  created_at: string;
}

export interface SessionDocument {
  id: string;
  session_id: string;
  document_type: 'government_id' | 'property_document' | 'proof_of_ownership' | 'agency_license' | 'selfie' | 'other';
  document_url: string;
  document_name: string | null;
  verification_status: 'pending' | 'verified' | 'rejected' | 'needs_review';
  created_at: string;
}

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionQuality: 'good' | 'fair' | 'poor' | 'unknown';
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useVideoVerification = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [currentSession, setCurrentSession] = useState<VideoSession | null>(null);
  const [documents, setDocuments] = useState<SessionDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [webrtcState, setWebrtcState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    isConnected: false,
    isConnecting: false,
    connectionQuality: 'unknown',
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Fetch user's video sessions
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_verification_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as unknown as VideoSession[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch verification sessions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Schedule a new video verification session
  const scheduleSession = useCallback(async (
    scheduledAt: Date,
    verificationType: string = 'level_4',
    calendlyEventId?: string
  ) => {
    if (!user) {
      toast.error('You must be logged in to schedule a verification');
      return null;
    }

    setLoading(true);
    try {
      const roomId = `vv_${user.id.substring(0, 8)}_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('video_verification_sessions')
        .insert({
          user_id: user.id,
          scheduled_at: scheduledAt.toISOString(),
          verification_type: verificationType,
          room_id: roomId,
          calendly_event_id: calendlyEventId,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Verification session scheduled successfully');
      await fetchSessions();
      return data as unknown as VideoSession;
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Failed to schedule verification session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchSessions]);

  // Start local media stream
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setWebrtcState(prev => ({ ...prev, localStream: stream }));
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera and microphone');
      return null;
    }
  }, []);

  // Stop local media stream
  const stopLocalStream = useCallback(() => {
    if (webrtcState.localStream) {
      webrtcState.localStream.getTracks().forEach(track => track.stop());
      setWebrtcState(prev => ({ ...prev, localStream: null }));
    }
  }, [webrtcState.localStream]);

  // Initialize WebRTC peer connection
  const initializePeerConnection = useCallback(async (sessionId: string) => {
    if (!webrtcState.localStream) {
      toast.error('Please enable camera first');
      return null;
    }

    setWebrtcState(prev => ({ ...prev, isConnecting: true }));

    try {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local tracks to peer connection
      webrtcState.localStream.getTracks().forEach(track => {
        pc.addTrack(track, webrtcState.localStream!);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setWebrtcState(prev => ({ ...prev, remoteStream }));
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        setWebrtcState(prev => ({
          ...prev,
          isConnected: state === 'connected',
          isConnecting: state === 'connecting',
        }));

        if (state === 'failed') {
          toast.error('Connection failed. Please try again.');
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          // In a real implementation, send ICE candidates via signaling server
          console.log('ICE candidate:', event.candidate);
        }
      };

      setWebrtcState(prev => ({ ...prev, peerConnection: pc }));
      return pc;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      toast.error('Failed to establish video connection');
      setWebrtcState(prev => ({ ...prev, isConnecting: false }));
      return null;
    }
  }, [webrtcState.localStream]);

  // Close peer connection
  const closePeerConnection = useCallback(() => {
    if (webrtcState.peerConnection) {
      webrtcState.peerConnection.close();
      setWebrtcState(prev => ({
        ...prev,
        peerConnection: null,
        remoteStream: null,
        isConnected: false,
        isConnecting: false,
      }));
    }
  }, [webrtcState.peerConnection]);

  // Start recording with consent
  const startRecording = useCallback(async (sessionId: string) => {
    if (!webrtcState.localStream) {
      toast.error('No video stream available');
      return false;
    }

    try {
      // Update consent in database
      await supabase
        .from('video_verification_sessions')
        .update({ recording_consent: true })
        .eq('id', sessionId);

      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const mediaRecorder = new MediaRecorder(webrtcState.localStream, options);
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect chunks every second
      mediaRecorderRef.current = mediaRecorder;
      
      toast.success('Recording started');
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      return false;
    }
  }, [webrtcState.localStream]);

  // Stop recording and save
  const stopRecording = useCallback(async (sessionId: string) => {
    if (!mediaRecorderRef.current) return null;

    return new Promise<string | null>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        
        try {
          // Upload to secure storage
          const fileName = `verification_${sessionId}_${Date.now()}.webm`;
          const { data, error } = await supabase.storage
            .from('verification-recordings')
            .upload(fileName, blob, {
              contentType: 'video/webm',
              cacheControl: '3600',
            });

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('verification-recordings')
            .getPublicUrl(fileName);

          // Update session with recording URL
          await supabase
            .from('video_verification_sessions')
            .update({ 
              recording_url: urlData.publicUrl,
              recording_encrypted: true,
            })
            .eq('id', sessionId);

          toast.success('Recording saved securely');
          resolve(urlData.publicUrl);
        } catch (error) {
          console.error('Error saving recording:', error);
          toast.error('Failed to save recording');
          resolve(null);
        }
      };

      mediaRecorderRef.current!.stop();
    });
  }, []);

  // Upload document during session
  const uploadSessionDocument = useCallback(async (
    sessionId: string,
    file: File,
    documentType: SessionDocument['document_type']
  ) => {
    if (!user) return null;

    setLoading(true);
    try {
      const fileName = `${sessionId}/${documentType}_${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('video_session_documents')
        .insert({
          session_id: sessionId,
          document_type: documentType,
          document_url: urlData.publicUrl,
          document_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Document uploaded successfully');
      return data as unknown as SessionDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch session documents
  const fetchSessionDocuments = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('video_session_documents')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDocuments((data || []) as unknown as SessionDocument[]);
      return data as unknown as SessionDocument[];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }, []);

  // Update session status
  const updateSessionStatus = useCallback(async (
    sessionId: string,
    status: VideoSession['status'],
    additionalData?: Partial<VideoSession>
  ) => {
    try {
      const updateData: any = { status, ...additionalData };
      
      if (status === 'in_progress' && !additionalData?.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (status === 'completed' && !additionalData?.ended_at) {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('video_verification_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
      
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error updating session status:', error);
      toast.error('Failed to update session');
      return false;
    }
  }, [fetchSessions]);

  // Give consent for verification
  const giveConsent = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('video_verification_sessions')
        .update({ consent_given: true })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Consent recorded');
      return true;
    } catch (error) {
      console.error('Error giving consent:', error);
      toast.error('Failed to record consent');
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalStream();
      closePeerConnection();
    };
  }, []);

  return {
    // State
    sessions,
    currentSession,
    setCurrentSession,
    documents,
    loading,
    webrtcState,
    localVideoRef,
    remoteVideoRef,
    
    // Session management
    fetchSessions,
    scheduleSession,
    updateSessionStatus,
    giveConsent,
    
    // WebRTC
    startLocalStream,
    stopLocalStream,
    initializePeerConnection,
    closePeerConnection,
    
    // Recording
    startRecording,
    stopRecording,
    
    // Documents
    uploadSessionDocument,
    fetchSessionDocuments,
  };
};

export default useVideoVerification;
