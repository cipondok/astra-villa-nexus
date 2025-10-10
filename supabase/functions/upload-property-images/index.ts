import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const propertyType = formData.get('property_type') as string
    const propertyId = formData.get('property_id') as string || crypto.randomUUID()

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!propertyType) {
      return new Response(
        JSON.stringify({ error: 'Property type is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const uploadResults = []
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file size
      if (file.size > maxFileSize) {
        return new Response(
          JSON.stringify({ error: `File ${file.name} exceeds maximum size of 5MB` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: `File ${file.name} has unsupported type. Only JPEG, PNG, WebP, and GIF are allowed` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Create file path: user_id/property_type/property_id/timestamp_filename
      // Sanitize property type for storage path (remove spaces, special chars)
      const sanitizedPropertyType = propertyType.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}_${i + 1}.${fileExtension}`
      const filePath = `${user.id}/${sanitizedPropertyType}/${propertyId}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (error) {
        console.error('Upload error:', error)
        return new Response(
          JSON.stringify({ error: `Failed to upload ${file.name}: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Get public URL
      const { data: publicUrlData } = supabaseClient.storage
        .from('property-images')
        .getPublicUrl(filePath)

      uploadResults.push({
        fileName: file.name,
        filePath: filePath,
        publicUrl: publicUrlData.publicUrl,
        size: file.size,
        type: file.type,
      })
    }

    // Log upload activity
    console.log(`Successfully uploaded ${uploadResults.length} files for property type: ${propertyType}`)

    return new Response(
      JSON.stringify({
        success: true,
        files: uploadResults,
        propertyId: propertyId,
        propertyType: propertyType,
        message: `Successfully uploaded ${uploadResults.length} image(s)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})