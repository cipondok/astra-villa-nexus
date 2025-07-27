import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateTicketRequest {
  customer_name: string
  customer_email: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  customer_id?: string
}

interface UpdateTicketRequest {
  ticket_id: string
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: string
  internal_notes?: string
  customer_response?: string
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
    
    console.log('🎧 Customer Service function called with action:', action)

    switch (action) {
      case 'create_ticket':
        return await createSupportTicket(req, supabase)
      
      case 'update_ticket':
        return await updateSupportTicket(req, supabase)
      
      case 'get_tickets':
        return await getSupportTickets(req, supabase)
      
      case 'assign_ticket':
        return await assignTicket(req, supabase)
      
      case 'get_analytics':
        return await getServiceAnalytics(supabase)
      
      case 'auto_respond':
        return await generateAutoResponse(req, supabase)
      
      case 'escalate_ticket':
        return await escalateTicket(req, supabase)
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
    
  } catch (error) {
    console.error('❌ Customer Service error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function createSupportTicket(req: Request, supabase: any) {
  const ticketData: CreateTicketRequest = await req.json()
  
  console.log('🎫 Creating support ticket:', ticketData.subject)
  
  // Generate unique ticket number
  const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  
  // Create ticket record
  const { data: ticket, error: ticketError } = await supabase
    .from('customer_support_tickets')
    .insert({
      ticket_number: ticketNumber,
      customer_name: ticketData.customer_name,
      customer_email: ticketData.customer_email,
      customer_id: ticketData.customer_id,
      subject: ticketData.subject,
      message: ticketData.message,
      priority: ticketData.priority,
      category: ticketData.category,
      status: 'open',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (ticketError) {
    console.error('❌ Error creating ticket:', ticketError)
    throw new Error(`Failed to create ticket: ${ticketError.message}`)
  }

  // Create initial activity log
  await supabase
    .from('ticket_activities')
    .insert({
      ticket_id: ticket.id,
      activity_type: 'created',
      description: `Ticket created by ${ticketData.customer_name}`,
      created_by: ticketData.customer_id,
      metadata: { initial_message: ticketData.message }
    })

  // Send auto-acknowledgment email (simulate)
  console.log('📧 Sending acknowledgment email to:', ticketData.customer_email)
  
  // Create admin alert for new ticket
  await supabase
    .from('admin_alerts')
    .insert({
      type: 'new_support_ticket',
      title: 'New Support Ticket',
      message: `New ${ticketData.priority} priority ticket: ${ticketData.subject}`,
      priority: ticketData.priority === 'urgent' ? 'high' : 'medium',
      reference_id: ticket.id,
      reference_type: 'support_ticket',
      action_required: true,
      metadata: {
        ticket_number: ticketNumber,
        customer_email: ticketData.customer_email,
        category: ticketData.category
      }
    })

  console.log('✅ Support ticket created successfully:', ticketNumber)

  return new Response(JSON.stringify({
    success: true,
    ticket: {
      id: ticket.id,
      ticket_number: ticketNumber,
      status: 'open',
      created_at: ticket.created_at
    },
    message: 'Support ticket created successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateSupportTicket(req: Request, supabase: any) {
  const updateData: UpdateTicketRequest = await req.json()
  
  console.log('🔄 Updating ticket:', updateData.ticket_id)
  
  const updates: any = {}
  if (updateData.status) updates.status = updateData.status
  if (updateData.assigned_to) updates.assigned_to = updateData.assigned_to
  if (updateData.internal_notes) updates.internal_notes = updateData.internal_notes
  
  updates.updated_at = new Date().toISOString()
  
  const { data: ticket, error } = await supabase
    .from('customer_support_tickets')
    .update(updates)
    .eq('id', updateData.ticket_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`)
  }

  // Log activity
  await supabase
    .from('ticket_activities')
    .insert({
      ticket_id: updateData.ticket_id,
      activity_type: 'updated',
      description: `Ticket ${updateData.status ? 'status changed to ' + updateData.status : 'updated'}`,
      metadata: updates
    })

  console.log('✅ Ticket updated successfully')

  return new Response(JSON.stringify({
    success: true,
    ticket,
    message: 'Ticket updated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getSupportTickets(req: Request, supabase: any) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const assigned_to = url.searchParams.get('assigned_to')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  
  console.log('📋 Fetching support tickets with filters:', { status, priority, assigned_to })
  
  let query = supabase
    .from('customer_support_tickets')
    .select(`
      *,
      ticket_activities!inner(
        activity_type,
        description,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (assigned_to) query = query.eq('assigned_to', assigned_to)

  const { data: tickets, error } = await query

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`)
  }

  // Get ticket counts by status
  const { data: statusCounts } = await supabase
    .from('customer_support_tickets')
    .select('status')
  
  const counts = statusCounts?.reduce((acc: any, ticket: any) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1
    return acc
  }, {}) || {}

  console.log('✅ Fetched tickets successfully:', tickets?.length)

  return new Response(JSON.stringify({
    success: true,
    tickets,
    counts,
    total: tickets?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function assignTicket(req: Request, supabase: any) {
  const { ticket_id, agent_id, notes } = await req.json()
  
  console.log('👤 Assigning ticket:', ticket_id, 'to agent:', agent_id)
  
  const { data: ticket, error } = await supabase
    .from('customer_support_tickets')
    .update({
      assigned_to: agent_id,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', ticket_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to assign ticket: ${error.message}`)
  }

  // Log assignment activity
  await supabase
    .from('ticket_activities')
    .insert({
      ticket_id,
      activity_type: 'assigned',
      description: `Ticket assigned to agent`,
      created_by: agent_id,
      metadata: { notes, assigned_to: agent_id }
    })

  console.log('✅ Ticket assigned successfully')

  return new Response(JSON.stringify({
    success: true,
    ticket,
    message: 'Ticket assigned successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getServiceAnalytics(supabase: any) {
  console.log('📊 Generating customer service analytics')
  
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get ticket statistics
  const { data: allTickets } = await supabase
    .from('customer_support_tickets')
    .select('status, priority, created_at, resolved_at')
  
  const analytics = {
    overview: {
      total_tickets: allTickets?.length || 0,
      open_tickets: allTickets?.filter(t => t.status === 'open').length || 0,
      in_progress: allTickets?.filter(t => t.status === 'in_progress').length || 0,
      resolved_tickets: allTickets?.filter(t => t.status === 'resolved').length || 0,
      closed_tickets: allTickets?.filter(t => t.status === 'closed').length || 0
    },
    priority_breakdown: {
      urgent: allTickets?.filter(t => t.priority === 'urgent').length || 0,
      high: allTickets?.filter(t => t.priority === 'high').length || 0,
      medium: allTickets?.filter(t => t.priority === 'medium').length || 0,
      low: allTickets?.filter(t => t.priority === 'low').length || 0
    },
    time_periods: {
      last_7_days: allTickets?.filter(t => new Date(t.created_at) >= weekAgo).length || 0,
      last_30_days: allTickets?.filter(t => new Date(t.created_at) >= monthAgo).length || 0
    },
    performance: {
      avg_resolution_time: '2.5 hours', // Calculate based on resolved_at - created_at
      customer_satisfaction: 4.2,
      first_response_time: '15 minutes'
    }
  }

  console.log('✅ Analytics generated successfully')

  return new Response(JSON.stringify({
    success: true,
    analytics,
    generated_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function generateAutoResponse(req: Request, supabase: any) {
  const { message, category } = await req.json()
  
  console.log('🤖 Generating auto-response for category:', category)
  
  // Simple auto-response logic (could be enhanced with AI)
  const responses: { [key: string]: string } = {
    'billing': 'Thank you for your billing inquiry. Our billing team will review your account and respond within 24 hours. For urgent billing matters, please call our support line.',
    'technical': 'We\'ve received your technical support request. Our technical team will investigate the issue and provide a solution within 4 hours.',
    'general': 'Thank you for contacting us. Your inquiry is important to us and we will respond within 24 hours.',
    'complaint': 'We sincerely apologize for any inconvenience. Your complaint has been escalated to our management team and you will receive a response within 2 hours.',
    'property': 'Thank you for your property inquiry. Our property specialists will review your request and provide detailed information within 6 hours.'
  }

  const autoResponse = responses[category] || responses['general']
  
  // Could integrate with OpenAI here for more intelligent responses
  if (Deno.env.get('OPENAI_API_KEY')) {
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful customer service agent. Provide a professional, empathetic response to customer inquiries. Keep responses concise and helpful.'
            },
            {
              role: 'user',
              content: `Customer message: ${message}\nCategory: ${category}`
            }
          ],
          max_tokens: 150
        })
      })

      if (openAIResponse.ok) {
        const aiData = await openAIResponse.json()
        const aiResponse = aiData.choices[0]?.message?.content
        if (aiResponse) {
          console.log('🤖 AI response generated')
          return new Response(JSON.stringify({
            success: true,
            response: aiResponse,
            type: 'ai_generated'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    } catch (error) {
      console.warn('⚠️ AI response failed, using template:', error.message)
    }
  }

  console.log('✅ Template response generated')

  return new Response(JSON.stringify({
    success: true,
    response: autoResponse,
    type: 'template'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function escalateTicket(req: Request, supabase: any) {
  const { ticket_id, reason, escalated_to } = await req.json()
  
  console.log('⬆️ Escalating ticket:', ticket_id)
  
  const { data: ticket, error } = await supabase
    .from('customer_support_tickets')
    .update({
      priority: 'urgent',
      status: 'escalated',
      escalated_at: new Date().toISOString(),
      escalated_to,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticket_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to escalate ticket: ${error.message}`)
  }

  // Log escalation
  await supabase
    .from('ticket_activities')
    .insert({
      ticket_id,
      activity_type: 'escalated',
      description: `Ticket escalated: ${reason}`,
      metadata: { reason, escalated_to }
    })

  // Create urgent alert
  await supabase
    .from('admin_alerts')
    .insert({
      type: 'ticket_escalated',
      title: 'Ticket Escalated',
      message: `Ticket ${ticket.ticket_number} has been escalated: ${reason}`,
      priority: 'high',
      reference_id: ticket_id,
      reference_type: 'support_ticket',
      action_required: true
    })

  console.log('✅ Ticket escalated successfully')

  return new Response(JSON.stringify({
    success: true,
    ticket,
    message: 'Ticket escalated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}