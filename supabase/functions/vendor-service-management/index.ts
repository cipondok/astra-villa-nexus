import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ServiceData {
  service_name: string
  service_description?: string
  service_category?: string
  category_id?: string
  main_category_id?: string
  subcategory_id?: string
  price_range?: any
  duration_minutes?: number
  duration_value?: number
  duration_unit?: string
  location_type?: string
  service_location_types?: string[]
  requirements?: string
  cancellation_policy?: string
  availability?: any
  service_images?: string[]
  delivery_options?: any
  currency?: string
  is_active?: boolean
  featured?: boolean
}

interface ServiceItem {
  item_name: string
  item_description?: string
  price?: number
  duration_minutes?: number
  unit?: string
  currency?: string
  is_available?: boolean
  display_order?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || user.email === 'mycode103@gmail.com'
    const isVendor = profile?.role === 'vendor'

    if (!isAdmin && !isVendor) {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin or Vendor role required.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const serviceId = url.searchParams.get('serviceId')
    const vendorId = url.searchParams.get('vendorId')

    console.log(`Processing ${req.method} request with action: ${action}`)

    switch (req.method) {
      case 'GET':
        return await handleGetRequest(supabaseClient, action, serviceId, vendorId, user.id, isAdmin)
      
      case 'POST':
        return await handlePostRequest(supabaseClient, req, action, user.id, isAdmin, isVendor)
      
      case 'PUT':
        return await handlePutRequest(supabaseClient, req, action, serviceId, user.id, isAdmin)
      
      case 'DELETE':
        return await handleDeleteRequest(supabaseClient, serviceId, user.id, isAdmin)

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Error in vendor-service-management:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleGetRequest(
  supabaseClient: any, 
  action: string | null, 
  serviceId: string | null, 
  vendorId: string | null, 
  userId: string, 
  isAdmin: boolean
) {
  try {
    switch (action) {
      case 'list':
        // List services - admin sees all, vendors see their own
        let query = supabaseClient
          .from('vendor_services')
          .select(`
            *,
            vendor_business_profiles!inner(
              business_name,
              vendor_id
            ),
            vendor_service_items(*)
          `)
          .order('created_at', { ascending: false })

        if (!isAdmin) {
          query = query.eq('vendor_id', userId)
        }

        if (vendorId && isAdmin) {
          query = query.eq('vendor_id', vendorId)
        }

        const { data: services, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ services }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'details':
        if (!serviceId) {
          return new Response(
            JSON.stringify({ error: 'Service ID required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        let detailsQuery = supabaseClient
          .from('vendor_services')
          .select(`
            *,
            vendor_business_profiles!inner(
              business_name,
              vendor_id,
              business_description,
              business_phone,
              business_email
            ),
            vendor_service_items(*)
          `)
          .eq('id', serviceId)

        if (!isAdmin) {
          detailsQuery = detailsQuery.eq('vendor_id', userId)
        }

        const { data: service, error: serviceError } = await detailsQuery.single()

        if (serviceError) throw serviceError

        return new Response(
          JSON.stringify({ service }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'pending':
        // Admin only - get pending services for approval
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Admin access required' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { data: pendingServices, error: pendingError } = await supabaseClient
          .from('vendor_services')
          .select(`
            *,
            vendor_business_profiles!inner(
              business_name,
              vendor_id
            )
          `)
          .eq('is_active', false)
          .order('created_at', { ascending: false })

        if (pendingError) throw pendingError

        return new Response(
          JSON.stringify({ services: pendingServices }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'categories':
        // Get service categories
        const { data: categories, error: catError } = await supabaseClient
          .from('vendor_main_categories')
          .select(`
            *,
            vendor_subcategories(*)
          `)
          .eq('is_active', true)
          .order('display_order')

        if (catError) throw catError

        return new Response(
          JSON.stringify({ categories }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error in GET request:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handlePostRequest(
  supabaseClient: any, 
  req: Request, 
  action: string | null, 
  userId: string, 
  isAdmin: boolean, 
  isVendor: boolean
) {
  try {
    const body = await req.json()

    switch (action) {
      case 'create':
        if (!isVendor && !isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Vendor or Admin access required' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { serviceData, serviceItems = [] } = body as {
          serviceData: ServiceData
          serviceItems: ServiceItem[]
        }

        // Set vendor_id to current user if vendor, or allow admin to specify
        const finalVendorId = isAdmin && body.vendor_id ? body.vendor_id : userId

        // Get vendor business profile
        const { data: businessProfile } = await supabaseClient
          .from('vendor_business_profiles')
          .select('id')
          .eq('vendor_id', finalVendorId)
          .single()

        // Create the service
        const { data: newService, error: serviceError } = await supabaseClient
          .from('vendor_services')
          .insert({
            vendor_id: finalVendorId,
            business_profile_id: businessProfile?.id,
            ...serviceData,
            is_active: isAdmin ? serviceData.is_active ?? true : false, // Vendors need approval
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (serviceError) throw serviceError

        // Create service items if provided
        if (serviceItems.length > 0) {
          const itemsWithServiceId = serviceItems.map(item => ({
            ...item,
            service_id: newService.id
          }))

          const { error: itemsError } = await supabaseClient
            .from('vendor_service_items')
            .insert(itemsWithServiceId)

          if (itemsError) {
            console.error('Error creating service items:', itemsError)
            // Don't fail the whole operation, just log the error
          }
        }

        console.log('Service created successfully:', newService.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            service: newService,
            message: isAdmin ? 'Service created successfully' : 'Service created and pending approval'
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'approve':
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Admin access required' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { serviceIds = [], approved = true } = body

        const { data: updatedServices, error: approveError } = await supabaseClient
          .from('vendor_services')
          .update({ 
            is_active: approved,
            updated_at: new Date().toISOString()
          })
          .in('id', serviceIds)
          .select()

        if (approveError) throw approveError

        return new Response(
          JSON.stringify({ 
            success: true, 
            services: updatedServices,
            message: `Services ${approved ? 'approved' : 'rejected'} successfully`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error in POST request:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handlePutRequest(
  supabaseClient: any, 
  req: Request, 
  action: string | null, 
  serviceId: string | null, 
  userId: string, 
  isAdmin: boolean
) {
  try {
    if (!serviceId) {
      return new Response(
        JSON.stringify({ error: 'Service ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await req.json()

    switch (action) {
      case 'update':
        const { serviceData, serviceItems = [] } = body as {
          serviceData: ServiceData
          serviceItems: ServiceItem[]
        }

        // Check if user can update this service
        let updateQuery = supabaseClient
          .from('vendor_services')
          .update({
            ...serviceData,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)

        if (!isAdmin) {
          updateQuery = updateQuery.eq('vendor_id', userId)
        }

        const { data: updatedService, error: updateError } = await updateQuery.select().single()

        if (updateError) throw updateError

        // Update service items
        if (serviceItems.length > 0) {
          // Delete existing items
          await supabaseClient
            .from('vendor_service_items')
            .delete()
            .eq('service_id', serviceId)

          // Insert new items
          const itemsWithServiceId = serviceItems.map(item => ({
            ...item,
            service_id: serviceId
          }))

          await supabaseClient
            .from('vendor_service_items')
            .insert(itemsWithServiceId)
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            service: updatedService,
            message: 'Service updated successfully'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'toggle-status':
        const { is_active } = body

        let toggleQuery = supabaseClient
          .from('vendor_services')
          .update({ 
            is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', serviceId)

        if (!isAdmin) {
          toggleQuery = toggleQuery.eq('vendor_id', userId)
        }

        const { data: toggledService, error: toggleError } = await toggleQuery.select().single()

        if (toggleError) throw toggleError

        return new Response(
          JSON.stringify({ 
            success: true, 
            service: toggledService,
            message: `Service ${is_active ? 'activated' : 'deactivated'} successfully`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error in PUT request:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update service', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleDeleteRequest(
  supabaseClient: any, 
  serviceId: string | null, 
  userId: string, 
  isAdmin: boolean
) {
  try {
    if (!serviceId) {
      return new Response(
        JSON.stringify({ error: 'Service ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Delete service items first (foreign key constraint)
    await supabaseClient
      .from('vendor_service_items')
      .delete()
      .eq('service_id', serviceId)

    // Delete the service
    let deleteQuery = supabaseClient
      .from('vendor_services')
      .delete()
      .eq('id', serviceId)

    if (!isAdmin) {
      deleteQuery = deleteQuery.eq('vendor_id', userId)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) throw deleteError

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Service deleted successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in DELETE request:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete service', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}