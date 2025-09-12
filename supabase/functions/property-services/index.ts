import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PropertyServiceBooking {
  customer_id: string;
  vendor_id: string;
  service_id: string;
  property_id?: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  service_address: string;
  special_instructions?: string;
}

interface VendorServicePermission {
  vendor_id: string;
  service_type_id: string;
  can_access_property: boolean;
  requires_supervision: boolean;
  insurance_verified: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    console.log(`Property Services API - Action: ${action}, User: ${user.id}`)

    switch (action) {
      case 'create_booking':
        return await createPropertyServiceBooking(req, supabaseClient, user.id)
      
      case 'get_bookings':
        return await getPropertyServiceBookings(req, supabaseClient, user.id)
      
      case 'update_booking_status':
        return await updateBookingStatus(req, supabaseClient, user.id)
      
      case 'get_vendor_permissions':
        return await getVendorPermissions(req, supabaseClient, user.id)
      
      case 'request_service_permission':
        return await requestServicePermission(req, supabaseClient, user.id)
      
      case 'get_property_service_types':
        return await getPropertyServiceTypes(supabaseClient)
      
      case 'calculate_service_price':
        return await calculateServicePrice(req, supabaseClient)
      
      case 'get_related_services':
        return await getRelatedServices(req, supabaseClient)
      
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Property Services API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function createPropertyServiceBooking(req: Request, supabase: any, userId: string) {
  const booking: PropertyServiceBooking = await req.json()
  
  // Validate vendor permissions
  const { data: permissions } = await supabase
    .from('vendor_service_permissions')
    .select('*')
    .eq('vendor_id', booking.vendor_id)
    .eq('background_check_status', 'approved')
    .single()

  if (!permissions) {
    throw new Error('Vendor not authorized for property services')
  }

  // Get service details for pricing
  const { data: service } = await supabase
    .from('vendor_services')
    .select('*, property_service_types(*)')
    .eq('id', booking.service_id)
    .single()

  if (!service) {
    throw new Error('Service not found')
  }

  // Calculate total amount
  let totalAmount = 0
  if (service.property_service_types?.pricing_model === 'hourly') {
    totalAmount = (service.price_range?.hourly || 0) * booking.duration_hours
  } else {
    totalAmount = service.price_range?.fixed || 0
  }

  const { data, error } = await supabase
    .from('property_service_bookings')
    .insert({
      ...booking,
      customer_id: userId,
      total_amount: totalAmount,
      booking_status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (error) throw error

  // Send notification to vendor
  await supabase
    .from('user_notifications')
    .insert({
      user_id: booking.vendor_id,
      title: 'New Property Service Booking',
      message: `You have a new booking request for ${service.service_name}`,
      type: 'booking'
    })

  console.log('Property service booking created:', data.id)

  return new Response(
    JSON.stringify({ success: true, booking: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPropertyServiceBookings(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const role = url.searchParams.get('role') || 'customer'
  
  let query = supabase
    .from('property_service_bookings')
    .select(`
      *,
      vendor_services(service_name, service_description),
      vendor_business_profiles(business_name, business_phone),
      properties(title, location)
    `)

  if (role === 'vendor') {
    query = query.eq('vendor_id', userId)
  } else {
    query = query.eq('customer_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ bookings: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateBookingStatus(req: Request, supabase: any, userId: string) {
  const { booking_id, status, completion_notes, vendor_response } = await req.json()

  // Verify vendor owns this booking
  const { data: booking } = await supabase
    .from('property_service_bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('vendor_id', userId)
    .single()

  if (!booking) {
    throw new Error('Booking not found or unauthorized')
  }

  const updateData: any = { booking_status: status }
  if (completion_notes) updateData.completion_notes = completion_notes
  if (vendor_response) updateData.vendor_response = vendor_response

  const { data, error } = await supabase
    .from('property_service_bookings')
    .update(updateData)
    .eq('id', booking_id)
    .select()
    .single()

  if (error) throw error

  // Notify customer of status change
  await supabase
    .from('user_notifications')
    .insert({
      user_id: booking.customer_id,
      title: 'Booking Status Updated',
      message: `Your property service booking status has been updated to ${status}`,
      type: 'booking_update'
    })

  console.log('Booking status updated:', booking_id, status)

  return new Response(
    JSON.stringify({ success: true, booking: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getVendorPermissions(req: Request, supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('vendor_service_permissions')
    .select(`
      *,
      property_service_types(name, description, icon, requires_property_access)
    `)
    .eq('vendor_id', userId)

  if (error) throw error

  return new Response(
    JSON.stringify({ permissions: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function requestServicePermission(req: Request, supabase: any, userId: string) {
  const permission: VendorServicePermission = await req.json()

  const { data, error } = await supabase
    .from('vendor_service_permissions')
    .insert({
      ...permission,
      vendor_id: userId,
      background_check_status: 'pending'
    })
    .select()
    .single()

  if (error) throw error

  console.log('Service permission requested:', data.id)

  return new Response(
    JSON.stringify({ success: true, permission: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPropertyServiceTypes(supabase: any) {
  const { data, error } = await supabase
    .from('property_service_types')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error

  return new Response(
    JSON.stringify({ service_types: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function calculateServicePrice(req: Request, supabase: any) {
  const { service_id, duration_hours, property_area } = await req.json()

  const { data: service } = await supabase
    .from('vendor_services')
    .select(`
      *,
      property_service_types(pricing_model)
    `)
    .eq('id', service_id)
    .single()

  if (!service) {
    throw new Error('Service not found')
  }

  let totalPrice = 0
  const priceRange = service.price_range || {}

  switch (service.property_service_types?.pricing_model) {
    case 'hourly':
      totalPrice = (priceRange.hourly || 0) * duration_hours
      break
    case 'square_meter':
      totalPrice = (priceRange.per_sqm || 0) * property_area
      break
    default:
      totalPrice = priceRange.fixed || 0
  }

  return new Response(
    JSON.stringify({ 
      total_price: totalPrice,
      pricing_model: service.property_service_types?.pricing_model,
      breakdown: {
        base_rate: priceRange,
        duration: duration_hours,
        area: property_area
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getRelatedServices(req: Request, supabase: any) {
  const url = new URL(req.url)
  const serviceId = url.searchParams.get('service_id')
  const categoryId = url.searchParams.get('category_id')

  let query = supabase
    .from('vendor_services')
    .select(`
      *,
      vendor_business_profiles(business_name, rating, total_reviews)
    `)
    .eq('is_active', true)
    .eq('admin_approval_status', 'approved')

  if (serviceId) {
    // Get services in the same category, excluding the current service
    const { data: currentService } = await supabase
      .from('vendor_services')
      .select('main_category_id')
      .eq('id', serviceId)
      .single()

    if (currentService) {
      query = query
        .eq('main_category_id', currentService.main_category_id)
        .neq('id', serviceId)
    }
  } else if (categoryId) {
    query = query.eq('main_category_id', categoryId)
  }

  const { data, error } = await query
    .order('rating', { ascending: false })
    .limit(6)

  if (error) throw error

  return new Response(
    JSON.stringify({ related_services: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}