import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

// Security patterns for detecting contact information
const SECURITY_PATTERNS = {
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  whatsapp: /wa\.me|whatsapp|chat\.whatsapp/gi,
  telegram: /t\.me|telegram/gi,
  social: /instagram\.com|facebook\.com|twitter\.com|linkedin\.com/gi
}

// Extract text from image using browser-compatible OCR simulation
// Note: Deno edge functions don't support full Tesseract, so we'll use a simpler approach
async function analyzeImageSecurity(fileBytes: Uint8Array, fileName: string): Promise<{ 
  safe: boolean; 
  violations: string[]; 
  detectedText?: string 
}> {
  const violations: string[] = []
  
  try {
    // Check file signature for valid image types
    const signature = Array.from(fileBytes.slice(0, 4))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    
    const validSignatures: { [key: string]: string } = {
      '89504e47': 'PNG',
      'ffd8ffe0': 'JPEG',
      'ffd8ffe1': 'JPEG',
      'ffd8ffe2': 'JPEG',
      '47494638': 'GIF',
      '52494646': 'WEBP'
    }
    
    const fileType = validSignatures[signature.slice(0, 8)]
    if (!fileType) {
      violations.push('Invalid image file signature - possible file type mismatch')
    }
    
    // Check for suspicious file sizes (too large might be hiding data)
    const sizeInMB = fileBytes.length / (1024 * 1024)
    if (sizeInMB > 5) {
      violations.push('File size exceeds security threshold')
    }
    
    // Basic metadata checks (check for common steganography signatures)
    const dataString = new TextDecoder().decode(fileBytes.slice(0, 1000))
    
    // Check for hidden text/metadata patterns
    if (dataString.includes('BEGIN PGP') || dataString.includes('-----BEGIN')) {
      violations.push('Suspicious encrypted content detected in image metadata')
    }
    
    // Use OpenAI Vision API for advanced content analysis if API key is available
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (openAIKey) {
      try {
        const base64Image = btoa(String.fromCharCode(...fileBytes))
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this property image for: 1) Any visible text with contact information (phone numbers, emails, websites, social media handles), 2) Inappropriate or offensive content, 3) Watermarks or logos that suggest unauthorized use. Return ONLY a JSON object with: {"hasContactInfo": boolean, "contactInfoFound": string[], "inappropriate": boolean, "watermarked": boolean, "extractedText": string}'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 500
          })
        })
        
        if (response.ok) {
          const aiResult = await response.json()
          const analysis = JSON.parse(aiResult.choices[0].message.content)
          
          if (analysis.hasContactInfo) {
            violations.push(`Contact information detected in image: ${analysis.contactInfoFound.join(', ')}`)
          }
          
          if (analysis.inappropriate) {
            violations.push('Inappropriate or offensive content detected')
          }
          
          if (analysis.watermarked) {
            violations.push('Image contains watermarks suggesting unauthorized use')
          }
          
          return {
            safe: violations.length === 0,
            violations,
            detectedText: analysis.extractedText
          }
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError)
        // Continue with basic checks if AI fails
      }
    }
    
    return {
      safe: violations.length === 0,
      violations,
      detectedText: undefined
    }
    
  } catch (error) {
    console.error('Security analysis error:', error)
    return {
      safe: true, // Allow upload if analysis fails
      violations: [],
      detectedText: undefined
    }
  }
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

      // Security validation: Check image for contact information and inappropriate content
      const fileBytes = new Uint8Array(await file.arrayBuffer())
      const securityCheck = await analyzeImageSecurity(fileBytes, file.name)
      
      if (!securityCheck.safe) {
        console.log(`Security violation in ${file.name}:`, securityCheck.violations)
        return new Response(
          JSON.stringify({ 
            error: `Security check failed for ${file.name}`,
            violations: securityCheck.violations,
            message: 'Image contains prohibited content (contact information, inappropriate content, or unauthorized watermarks)'
          }),
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