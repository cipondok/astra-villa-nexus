import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, userId, propertyId, conversationId: initialConversationId } = await req.json();

    console.log('AI Assistant request:', { message, userId, propertyId });

    // Get user context and conversation history
    const [userContext, conversationHistory] = await Promise.all([
      getUserContext(supabase, userId),
      getConversationHistory(supabase, initialConversationId, userId)
    ]);

    // Get property context if propertyId is provided
    let propertyContext = '';
    if (propertyId) {
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (property) {
        propertyContext = `Current property: ${property.title} - ${property.description}. Location: ${property.location}. Price: ${property.price}. Type: ${property.property_type}.`;
      }
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are Astra Villa's AI Concierge. You help users with:
1. Property inquiries and recommendations
2. Booking vendor services (cleaning, maintenance, etc.)
3. 3D property tour guidance
4. General real estate questions

Current context:
- User preferences: ${JSON.stringify(userContext.preferences)}
- ${propertyContext}
- User type: ${userContext.userType}

Available functions:
- control_3d_tour: Guide users through 3D property tours.
- recommend_properties: Suggest properties based on preferences.
- book_vendor_service: Books vendor services like cleaning or maintenance. It directly creates a booking with a suitable vendor.
- get_property_info: Get detailed property information.

Be helpful, concise, and professional. Always try to guide users toward taking action. When booking a service, confirm the action has been taken.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        functions: [
          {
            name: 'control_3d_tour',
            description: 'Control the 3D property tour viewer',
            parameters: {
              type: 'object',
              properties: {
                action: { type: 'string', enum: ['focus', 'highlight', 'navigate', 'zoom'] },
                target: { type: 'string', description: 'Area to focus on (kitchen, bedroom, bathroom, etc.)' },
                propertyId: { type: 'string' }
              }
            }
          },
          {
            name: 'recommend_properties',
            description: 'Get property recommendations based on user preferences',
            parameters: {
              type: 'object',
              properties: {
                criteria: { type: 'string', description: 'Search criteria or preferences' },
                propertyType: { type: 'string' },
                priceRange: { type: 'string' },
                location: { type: 'string' }
              }
            }
          },
          {
            name: 'book_vendor_service',
            description: 'Books vendor services like cleaning or maintenance. It directly creates a booking with a suitable vendor.',
            parameters: {
              type: 'object',
              properties: {
                serviceType: { type: 'string', description: 'Type of service needed (e.g., "house cleaning", "plumbing repair")' },
                propertyId: { type: 'string', description: 'The ID of the property needing the service, if applicable.' },
                urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'The urgency of the service request.' }
              },
              required: ['serviceType']
            }
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const aiResponse = await response.json();
    let aiMessage = aiResponse.choices[0].message.content;
    let functionCall = null;
    let conversationId = initialConversationId;

    // Handle function calls
    if (aiResponse.choices[0].message.function_call) {
      functionCall = aiResponse.choices[0].message.function_call;
      aiMessage = await handleFunctionCall(supabase, functionCall, userId);
    }

    // Save conversation
    conversationId = await saveConversation(supabase, conversationId, userId, message, aiMessage);

    // Track user interaction for recommendations
    await trackUserInteraction(supabase, userId, {
      type: 'ai_chat',
      message,
      propertyId,
      functionCall: functionCall?.name
    });

    return new Response(JSON.stringify({
      message: aiMessage,
      functionCall,
      conversationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserContext(supabase: any, userId: string) {
  if (!userId) {
    return { preferences: {}, userType: 'guest' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    preferences: extractPreferences(interactions || []),
    userType: profile?.role || 'guest'
  };
}

async function getConversationHistory(supabase: any, conversationId: string, userId: string) {
  if (!conversationId) return [];

  const { data } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(10);

  return data || [];
}

async function saveConversation(supabase: any, conversationId: string, userId: string, userMessage: string, aiMessage: string) {
  const newConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  if (!aiMessage?.trim()) {
    console.log("AI message is empty, not saving to conversation history.");
    return newConversationId;
  }

  await supabase.from('ai_conversations').insert([
    {
      conversation_id: newConversationId,
      user_id: userId,
      role: 'user',
      content: userMessage
    },
    {
      conversation_id: newConversationId,
      user_id: userId,
      role: 'assistant',
      content: aiMessage
    }
  ]);

  return newConversationId;
}

async function trackUserInteraction(supabase: any, userId: string, interaction: any) {
  if (!userId) return;

  await supabase.from('user_interactions').insert([{
    user_id: userId,
    interaction_type: interaction.type,
    interaction_data: interaction,
    created_at: new Date().toISOString()
  }]);
}

async function handleFunctionCall(supabase: any, functionCall: any, userId: string) {
  const { name, arguments: args } = functionCall;
  const parsedArgs = JSON.parse(args);
  
  if (name === 'book_vendor_service' && !userId) {
    return "You need to be logged in to book a service. Please log in or create an account first.";
  }

  switch (name) {
    case 'recommend_properties':
      return await getPropertyRecommendations(supabase, parsedArgs, userId);
    case 'book_vendor_service':
      return await createVendorBooking(supabase, parsedArgs, userId);
    case 'control_3d_tour':
      return `3D Tour: Focusing on ${parsedArgs.target}.`;
    default:
      return 'Function executed successfully.';
  }
}

async function getPropertyRecommendations(supabase: any, criteria: any, userId: string) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'approved')
    .limit(5);

  if (criteria.propertyType) {
    query = query.eq('property_type', criteria.propertyType);
  }

  const { data: properties } = await query;
  
  if (properties && properties.length > 0) {
    return `I found ${properties.length} properties that match your criteria:\n\n${properties.map(p => 
      `• ${p.title} - ${p.location} - $${p.price?.toLocaleString()}`
    ).join('\n')}`;
  }

  return "I couldn't find any properties matching those criteria. Would you like to adjust your search?";
}

async function createVendorBooking(supabase: any, args: any, userId: string) {
  const { serviceType, propertyId, urgency } = args;

  if (!userId) {
    return "I'm sorry, you must be logged in to book a service.";
  }

  // 1. Find a suitable vendor service, picking the highest-rated one.
  const { data: service, error: serviceError } = await supabase
    .from('vendor_services')
    .select(`
      id,
      vendor_id,
      price,
      service_name,
      vendor_business_profiles ( business_name, rating )
    `)
    .ilike('service_name', `%${serviceType}%`)
    .eq('is_active', true)
    .order('vendor_business_profiles(rating)', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (serviceError || !service) {
    console.error('Error finding service:', serviceError);
    return `I'm sorry, I couldn't find any available vendors for "${serviceType}" right now. You can browse available vendors in the vendors section.`;
  }
  
  // 2. Get property address if propertyId is provided.
  let propertyAddress = 'User has not specified a property.';
  if (propertyId) {
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('location')
      .eq('id', propertyId)
      .single();
      
    if (property) {
      propertyAddress = property.location;
    } else {
      console.log(`Could not find property with ID ${propertyId} for booking.`);
    }
  }

  // 3. Create a booking record.
  const bookingData = {
    customer_id: userId,
    vendor_id: service.vendor_id,
    service_id: service.id,
    booking_date: new Date().toISOString().split('T')[0], // Books for today. A real app would ask for a date.
    total_amount: service.price,
    status: 'pending',
    customer_notes: `Booking created via AI Concierge. Urgency: ${urgency || 'medium'}.`,
    location_address: propertyAddress,
  };

  const { error: bookingError } = await supabase
    .from('vendor_bookings')
    .insert(bookingData);

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    return `I found a vendor for "${serviceType}" (${service.vendor_business_profiles.business_name}), but I encountered an error while trying to book it. Please try again later or contact support.`;
  }
  
  const vendorName = service.vendor_business_profiles?.business_name || 'the vendor';
  return `Success! I've booked a "${service.service_name}" service for you with ${vendorName}. They will contact you shortly to confirm the details of your appointment. You can view your bookings in your dashboard.`;
}

function extractPreferences(interactions: any[]) {
  const preferences: any = {
    propertyTypes: [],
    priceRange: null,
    locations: [],
    features: []
  };

  interactions.forEach(interaction => {
    const data = interaction.interaction_data;
    if (data.propertyType) preferences.propertyTypes.push(data.propertyType);
    if (data.location) preferences.locations.push(data.location);
  });

  return preferences;
}
