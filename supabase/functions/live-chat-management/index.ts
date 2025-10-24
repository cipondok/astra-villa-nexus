import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation schemas
const chatMessageSchema = z.object({
  session_id: z.string().uuid(),
  sender_type: z.enum(['customer', 'agent', 'system']),
  sender_id: z.string().uuid().optional(),
  sender_name: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
  message_type: z.enum(['text', 'file', 'image']).optional().default('text'),
  metadata: z.any().optional()
});

const chatSessionSchema = z.object({
  customer_name: z.string().trim().min(1).max(100),
  customer_email: z.string().trim().email().max(255).optional(),
  subject: z.string().trim().max(200).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  customer_ip: z.string().max(45).optional(),
  user_agent: z.string().max(500).optional(),
  referrer_url: z.string().url().max(500).optional()
});

interface ChatMessage {
  session_id: string
  sender_type: 'customer' | 'agent'
  sender_id?: string
  sender_name: string
  message: string
  message_type?: 'text' | 'file' | 'image'
  metadata?: any
}

interface ChatSession {
  customer_name: string
  customer_email?: string
  subject?: string
  priority?: 'low' | 'medium' | 'high'
  customer_ip?: string
  user_agent?: string
  referrer_url?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('💬 Live chat function called with action:', action)

    switch (action) {
      case 'start_chat':
        return await startChatSession(req, supabase)
      
      case 'send_message':
        return await sendChatMessage(req, supabase)
      
      case 'get_messages':
        return await getChatMessages(req, supabase)
      
      case 'get_active_sessions':
        return await getActiveSessions(supabase)
      
      case 'assign_agent':
        return await assignAgent(req, supabase)
      
      case 'end_session':
        return await endChatSession(req, supabase)
      
      case 'transfer_session':
        return await transferSession(req, supabase)
      
      case 'get_chat_analytics':
        return await getChatAnalytics(supabase)
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
    
  } catch (error) {
    console.error('❌ Live chat error:', error)
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Validation failed', details: error.errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function startChatSession(req: Request, supabase: any) {
  const rawData = await req.json();
  const sessionData = chatSessionSchema.parse(rawData);
  
  console.log('🚀 Starting new chat session for:', sessionData.customer_name)
  
  // Create new chat session
  const { data: session, error: sessionError } = await supabase
    .from('live_chat_sessions')
    .insert({
      customer_name: sessionData.customer_name,
      customer_email: sessionData.customer_email,
      subject: sessionData.subject,
      priority: sessionData.priority || 'medium',
      customer_ip: sessionData.customer_ip,
      user_agent: sessionData.user_agent,
      referrer_url: sessionData.referrer_url,
      status: 'waiting',
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    })
    .select()
    .single()

  if (sessionError) {
    console.error('❌ Error creating session:', sessionError)
    throw new Error(`Failed to create chat session: ${sessionError.message}`)
  }

  // Send initial welcome message
  await supabase
    .from('chat_messages')
    .insert({
      session_id: session.id,
      sender_type: 'system',
      sender_name: 'ASTRA Support',
      message: `Hello ${sessionData.customer_name}! Welcome to ASTRA support. An agent will be with you shortly.`,
      message_type: 'text',
      sent_at: new Date().toISOString()
    })

  // Create admin alert for new chat
  await supabase
    .from('admin_alerts')
    .insert({
      type: 'new_chat_session',
      title: 'New Live Chat',
      message: `New chat session started by ${sessionData.customer_name}`,
      priority: sessionData.priority === 'high' ? 'high' : 'medium',
      reference_id: session.id,
      reference_type: 'chat_session',
      action_required: true,
      metadata: {
        customer_name: sessionData.customer_name,
        customer_email: sessionData.customer_email,
        subject: sessionData.subject
      }
    })

  console.log('✅ Chat session created successfully:', session.id)

  return new Response(JSON.stringify({
    success: true,
    session: {
      id: session.id,
      status: 'waiting',
      created_at: session.started_at
    },
    message: 'Chat session started successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function sendChatMessage(req: Request, supabase: any) {
  const rawData = await req.json();
  const messageData = chatMessageSchema.parse(rawData);
  
  console.log('💌 Sending chat message in session:', messageData.session_id)
  
  // Insert message
  const { data: message, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      session_id: messageData.session_id,
      sender_type: messageData.sender_type,
      sender_id: messageData.sender_id,
      sender_name: messageData.sender_name,
      message: messageData.message,
      message_type: messageData.message_type || 'text',
      metadata: messageData.metadata,
      sent_at: new Date().toISOString()
    })
    .select()
    .single()

  if (messageError) {
    throw new Error(`Failed to send message: ${messageError.message}`)
  }

  // Update session last activity
  await supabase
    .from('live_chat_sessions')
    .update({
      last_activity_at: new Date().toISOString()
    })
    .eq('id', messageData.session_id)

  // Auto-response for customer messages when no agent is assigned
  if (messageData.sender_type === 'customer') {
    const { data: session } = await supabase
      .from('live_chat_sessions')
      .select('agent_user_id, status')
      .eq('id', messageData.session_id)
      .single()

    if (!session?.agent_user_id && session?.status === 'waiting') {
      // Send auto-response
      await supabase
        .from('chat_messages')
        .insert({
          session_id: messageData.session_id,
          sender_type: 'system',
          sender_name: 'ASTRA Bot',
          message: 'Thank you for your message. We are finding an available agent to assist you. Please wait a moment.',
          message_type: 'text',
          sent_at: new Date().toISOString()
        })
    }
  }

  console.log('✅ Message sent successfully')

  return new Response(JSON.stringify({
    success: true,
    message,
    sent_at: message.sent_at
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getChatMessages(req: Request, supabase: any) {
  const url = new URL(req.url)
  const session_id = url.searchParams.get('session_id')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  
  if (!session_id) {
    throw new Error('Session ID is required')
  }

  console.log('📨 Fetching messages for session:', session_id)
  
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session_id)
    .order('sent_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  console.log('✅ Fetched messages successfully:', messages?.length)

  return new Response(JSON.stringify({
    success: true,
    messages,
    count: messages?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getActiveSessions(supabase: any) {
  console.log('📋 Fetching active chat sessions')
  
  const { data: sessions, error } = await supabase
    .from('live_chat_sessions')
    .select(`
      *,
      chat_messages!inner(
        message,
        sent_at,
        sender_type
      )
    `)
    .in('status', ['waiting', 'active'])
    .order('started_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`)
  }

  // Get session counts
  const { data: allSessions } = await supabase
    .from('live_chat_sessions')
    .select('status')
  
  const counts = allSessions?.reduce((acc: any, session: any) => {
    acc[session.status] = (acc[session.status] || 0) + 1
    return acc
  }, {}) || {}

  console.log('✅ Fetched active sessions:', sessions?.length)

  return new Response(JSON.stringify({
    success: true,
    sessions,
    counts,
    active_count: sessions?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function assignAgent(req: Request, supabase: any) {
  const { session_id, agent_id, agent_name } = await req.json()
  
  console.log('👤 Assigning agent to session:', session_id)
  
  const { data: session, error } = await supabase
    .from('live_chat_sessions')
    .update({
      agent_user_id: agent_id,
      status: 'active',
      last_activity_at: new Date().toISOString()
    })
    .eq('id', session_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to assign agent: ${error.message}`)
  }

  // Send agent introduction message
  await supabase
    .from('chat_messages')
    .insert({
      session_id,
      sender_type: 'agent',
      sender_id: agent_id,
      sender_name: agent_name,
      message: `Hello! I'm ${agent_name} and I'll be assisting you today. How can I help you?`,
      message_type: 'text',
      sent_at: new Date().toISOString()
    })

  console.log('✅ Agent assigned successfully')

  return new Response(JSON.stringify({
    success: true,
    session,
    message: 'Agent assigned successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function endChatSession(req: Request, supabase: any) {
  const { session_id, reason, satisfaction_rating } = await req.json()
  
  console.log('🏁 Ending chat session:', session_id)
  
  const { data: session, error } = await supabase
    .from('live_chat_sessions')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
      end_reason: reason,
      satisfaction_rating
    })
    .eq('id', session_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to end session: ${error.message}`)
  }

  // Send closing message
  await supabase
    .from('chat_messages')
    .insert({
      session_id,
      sender_type: 'system',
      sender_name: 'ASTRA Support',
      message: 'This chat session has been ended. Thank you for contacting ASTRA support!',
      message_type: 'text',
      sent_at: new Date().toISOString()
    })

  console.log('✅ Chat session ended successfully')

  return new Response(JSON.stringify({
    success: true,
    session,
    message: 'Chat session ended successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function transferSession(req: Request, supabase: any) {
  const { session_id, from_agent_id, to_agent_id, to_agent_name, reason } = await req.json()
  
  console.log('🔄 Transferring session:', session_id)
  
  const { data: session, error } = await supabase
    .from('live_chat_sessions')
    .update({
      agent_user_id: to_agent_id,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', session_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to transfer session: ${error.message}`)
  }

  // Send transfer message
  await supabase
    .from('chat_messages')
    .insert({
      session_id,
      sender_type: 'system',
      sender_name: 'ASTRA Support',
      message: `This chat has been transferred to ${to_agent_name}. Reason: ${reason}`,
      message_type: 'text',
      sent_at: new Date().toISOString()
    })

  console.log('✅ Session transferred successfully')

  return new Response(JSON.stringify({
    success: true,
    session,
    message: 'Session transferred successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getChatAnalytics(supabase: any) {
  console.log('📊 Generating chat analytics')
  
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Get session statistics
  const { data: allSessions } = await supabase
    .from('live_chat_sessions')
    .select('status, started_at, ended_at, satisfaction_rating')
  
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('session_id, sent_at')
    .gte('sent_at', weekAgo.toISOString())

  const analytics = {
    overview: {
      total_sessions: allSessions?.length || 0,
      active_sessions: allSessions?.filter(s => s.status === 'active').length || 0,
      waiting_sessions: allSessions?.filter(s => s.status === 'waiting').length || 0,
      ended_sessions: allSessions?.filter(s => s.status === 'ended').length || 0
    },
    performance: {
      avg_session_duration: '12 minutes',
      messages_this_week: messages?.length || 0,
      avg_satisfaction: allSessions?.reduce((acc, s) => acc + (s.satisfaction_rating || 0), 0) / Math.max(1, allSessions?.filter(s => s.satisfaction_rating).length || 1),
      response_time: '2 minutes'
    },
    trends: {
      sessions_last_7_days: allSessions?.filter(s => new Date(s.started_at) >= weekAgo).length || 0,
      peak_hours: ['14:00', '15:00', '16:00'],
      busiest_day: 'Tuesday'
    }
  }

  console.log('✅ Chat analytics generated')

  return new Response(JSON.stringify({
    success: true,
    analytics,
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}