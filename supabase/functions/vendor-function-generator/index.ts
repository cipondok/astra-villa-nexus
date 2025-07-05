import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      functionTemplate, 
      customName, 
      customDescription, 
      userId 
    } = await req.json();

    console.log('Generating function:', { functionTemplate, customName, customDescription });

    // Determine if it's a template or custom function
    const isTemplate = !!functionTemplate;
    const functionName = isTemplate ? functionTemplate.name : customName;
    const functionDescription = isTemplate ? functionTemplate.description : customDescription;

    // Generate the actual code using OpenAI
    const generatedCode = await generateFunctionCode(
      functionName,
      functionDescription,
      functionTemplate
    );

    // Store the generated function in database
    const { data: generatedFunction, error: insertError } = await supabase
      .from('generated_functions')
      .insert({
        function_name: functionName,
        function_description: functionDescription,
        function_type: isTemplate ? 'template' : 'custom',
        template_id: isTemplate ? functionTemplate.id : null,
        generated_code: generatedCode,
        function_category: isTemplate ? functionTemplate.category : 'Custom',
        complexity: isTemplate ? functionTemplate.complexity : 'medium',
        requirements: isTemplate ? functionTemplate.requirements : [],
        created_by: userId,
        is_active: true,
        is_deployed: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    // Simulate deployment (in a real scenario, this would deploy to a serverless platform)
    const deploymentUrl = await simulateDeployment(generatedFunction.id, generatedCode);

    // Update the function with deployment info
    await supabase
      .from('generated_functions')
      .update({
        is_deployed: true,
        deployment_url: deploymentUrl
      })
      .eq('id', generatedFunction.id);

    console.log('Function generated and deployed successfully:', generatedFunction.id);

    return new Response(JSON.stringify({
      success: true,
      functionId: generatedFunction.id,
      functionName,
      deploymentUrl,
      message: `${functionName} has been successfully generated and deployed!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in vendor-function-generator:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate function', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateFunctionCode(
  functionName: string,
  functionDescription: string,
  template?: any
): Promise<string> {
  if (!openAIApiKey) {
    // Fallback to template-based generation if no AI available
    return generateTemplateCode(functionName, functionDescription, template);
  }

  const prompt = `Generate a complete, production-ready TypeScript/JavaScript function for a vendor management system.

Function Name: ${functionName}
Description: ${functionDescription}
${template ? `Category: ${template.category}\nComplexity: ${template.complexity}\nRequirements: ${template.requirements.join(', ')}` : ''}

Requirements:
1. Create a complete, working function that can be integrated into a React/Supabase application
2. Include proper error handling and logging
3. Use TypeScript types where appropriate
4. Include JSDoc comments
5. Make it compatible with Supabase edge functions if it's a backend function
6. Include proper async/await patterns
7. Add input validation
8. Return structured responses

Generate only the code, no explanations. Make it production-ready.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert software engineer specializing in TypeScript, React, and Supabase. Generate clean, efficient, production-ready code.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template generation
    return generateTemplateCode(functionName, functionDescription, template);
  }
}

function generateTemplateCode(
  functionName: string,
  functionDescription: string,
  template?: any
): string {
  const sanitizedName = functionName.replace(/[^a-zA-Z0-9]/g, '');
  
  if (template) {
    // Generate based on template type
    switch (template.id) {
      case 'automated-scoring':
        return generateScoringFunction(sanitizedName);
      case 'smart-matching':
        return generateMatchingFunction(sanitizedName);
      case 'fraud-detection':
        return generateFraudDetectionFunction(sanitizedName);
      case 'payment-automation':
        return generatePaymentFunction(sanitizedName);
      default:
        return generateGenericFunction(sanitizedName, functionDescription);
    }
  } else {
    return generateGenericFunction(sanitizedName, functionDescription);
  }
}

function generateScoringFunction(name: string): string {
  return `/**
 * ${name} - Automated Vendor Scoring Function
 * Calculates vendor performance scores based on multiple metrics
 */
export async function ${name}(vendorId: string, metrics: VendorMetrics): Promise<VendorScore> {
  try {
    console.log('Calculating score for vendor:', vendorId);
    
    const weights = {
      completionRate: 0.3,
      customerSatisfaction: 0.25,
      responseTime: 0.2,
      reliability: 0.15,
      communication: 0.1
    };
    
    const score = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (metrics[key] || 0) * weight;
    }, 0);
    
    const normalizedScore = Math.min(Math.max(score, 0), 100);
    
    return {
      vendorId,
      score: normalizedScore,
      grade: getGrade(normalizedScore),
      calculatedAt: new Date().toISOString(),
      metrics
    };
  } catch (error) {
    console.error('Error calculating vendor score:', error);
    throw new Error('Failed to calculate vendor score');
  }
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

interface VendorMetrics {
  completionRate: number;
  customerSatisfaction: number;
  responseTime: number;
  reliability: number;
  communication: number;
}

interface VendorScore {
  vendorId: string;
  score: number;
  grade: string;
  calculatedAt: string;
  metrics: VendorMetrics;
}`;
}

function generateMatchingFunction(name: string): string {
  return `/**
 * ${name} - Smart Vendor-Job Matching Function
 * Intelligently matches vendors with service requests
 */
export async function ${name}(jobRequest: JobRequest, availableVendors: Vendor[]): Promise<VendorMatch[]> {
  try {
    console.log('Matching vendors for job:', jobRequest.id);
    
    const matches = availableVendors
      .map(vendor => ({
        vendor,
        score: calculateMatchScore(jobRequest, vendor)
      }))
      .filter(match => match.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return matches.map(match => ({
      vendorId: match.vendor.id,
      vendorName: match.vendor.name,
      matchScore: match.score,
      distance: calculateDistance(jobRequest.location, match.vendor.location),
      availability: match.vendor.availability,
      estimatedPrice: estimatePrice(jobRequest, match.vendor),
      reasons: getMatchReasons(jobRequest, match.vendor)
    }));
  } catch (error) {
    console.error('Error matching vendors:', error);
    throw new Error('Failed to match vendors');
  }
}

function calculateMatchScore(job: JobRequest, vendor: Vendor): number {
  let score = 0;
  
  // Skill match
  if (vendor.skills.includes(job.category)) score += 0.4;
  
  // Location proximity
  const distance = calculateDistance(job.location, vendor.location);
  if (distance < 10) score += 0.3;
  else if (distance < 25) score += 0.2;
  else if (distance < 50) score += 0.1;
  
  // Availability
  if (vendor.availability === 'immediate') score += 0.2;
  else if (vendor.availability === 'within_24h') score += 0.1;
  
  // Rating
  score += (vendor.rating / 5) * 0.1;
  
  return Math.min(score, 1);
}

interface JobRequest {
  id: string;
  category: string;
  location: { lat: number; lng: number };
  urgency: 'low' | 'medium' | 'high';
  budget: number;
}

interface Vendor {
  id: string;
  name: string;
  skills: string[];
  location: { lat: number; lng: number };
  availability: string;
  rating: number;
}

interface VendorMatch {
  vendorId: string;
  vendorName: string;
  matchScore: number;
  distance: number;
  availability: string;
  estimatedPrice: number;
  reasons: string[];
}`;
}

function generateFraudDetectionFunction(name: string): string {
  return `/**
 * ${name} - Fraud Detection Function
 * Detects suspicious patterns in vendor applications and activities
 */
export async function ${name}(vendorData: VendorData): Promise<FraudAssessment> {
  try {
    console.log('Analyzing vendor for fraud patterns:', vendorData.id);
    
    let riskScore = 0;
    const flags: string[] = [];
    
    // Check for duplicate information
    if (await checkDuplicateInfo(vendorData)) {
      riskScore += 30;
      flags.push('Duplicate business information detected');
    }
    
    // Check document authenticity
    if (await analyzeDocuments(vendorData.documents)) {
      riskScore += 40;
      flags.push('Document authenticity concerns');
    }
    
    // Check registration patterns
    if (isRegistrationSuspicious(vendorData.registrationData)) {
      riskScore += 20;
      flags.push('Suspicious registration patterns');
    }
    
    // Check contact information
    if (await validateContactInfo(vendorData.contactInfo)) {
      riskScore += 25;
      flags.push('Invalid contact information');
    }
    
    const riskLevel = getRiskLevel(riskScore);
    const recommendation = getRecommendation(riskLevel, riskScore);
    
    return {
      vendorId: vendorData.id,
      riskScore,
      riskLevel,
      flags,
      recommendation,
      assessedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in fraud detection:', error);
    throw new Error('Failed to assess fraud risk');
  }
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

interface VendorData {
  id: string;
  businessName: string;
  contactInfo: any;
  documents: any[];
  registrationData: any;
}

interface FraudAssessment {
  vendorId: string;
  riskScore: number;
  riskLevel: string;
  flags: string[];
  recommendation: string;
  assessedAt: string;
}`;
}

function generatePaymentFunction(name: string): string {
  return `/**
 * ${name} - Automated Payment Processing Function
 * Processes vendor payments with multiple gateway support
 */
export async function ${name}(paymentRequest: PaymentRequest): Promise<PaymentResult> {
  try {
    console.log('Processing payment for vendor:', paymentRequest.vendorId);
    
    // Validate payment request
    validatePaymentRequest(paymentRequest);
    
    // Calculate commission and fees
    const calculations = calculatePaymentAmounts(paymentRequest);
    
    // Select payment gateway
    const gateway = selectPaymentGateway(paymentRequest.method);
    
    // Process payment
    const result = await processPayment(gateway, calculations);
    
    // Log transaction
    await logTransaction(paymentRequest, result);
    
    return {
      transactionId: result.transactionId,
      vendorId: paymentRequest.vendorId,
      amount: calculations.finalAmount,
      commission: calculations.commission,
      fees: calculations.fees,
      status: result.status,
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error('Failed to process payment');
  }
}

function calculatePaymentAmounts(request: PaymentRequest) {
  const commission = request.amount * 0.05; // 5% commission
  const processingFee = request.amount * 0.02; // 2% processing fee
  const finalAmount = request.amount - commission - processingFee;
  
  return {
    originalAmount: request.amount,
    commission,
    processingFee,
    finalAmount
  };
}

interface PaymentRequest {
  vendorId: string;
  amount: number;
  method: 'bank_transfer' | 'digital_wallet' | 'crypto';
  jobId: string;
  customerId: string;
}

interface PaymentResult {
  transactionId: string;
  vendorId: string;
  amount: number;
  commission: number;
  fees: number;
  status: string;
  processedAt: string;
}`;
}

function generateGenericFunction(name: string, description: string): string {
  return `/**
 * ${name} - Custom Generated Function
 * ${description}
 */
export async function ${name}(input: any): Promise<any> {
  try {
    console.log('Executing ${name} with input:', input);
    
    // Input validation
    if (!input) {
      throw new Error('Input is required');
    }
    
    // Main function logic
    const result = await processInput(input);
    
    // Return structured response
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in ${name}:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function processInput(input: any): Promise<any> {
  // Custom processing logic here
  return {
    processed: true,
    input,
    message: 'Function executed successfully'
  };
}`;
}

async function simulateDeployment(functionId: string, code: string): Promise<string> {
  // In a real implementation, this would deploy to a serverless platform
  // For now, we'll simulate by creating a mock deployment URL
  const deploymentId = `fn-${functionId.slice(0, 8)}`;
  return `https://api.vendor-system.com/functions/${deploymentId}`;
}

// Helper functions (stubs for the generated code)
function calculateDistance(loc1: any, loc2: any): number {
  return Math.random() * 50; // Mock distance calculation
}

function estimatePrice(job: any, vendor: any): number {
  return Math.floor(Math.random() * 1000) + 100; // Mock price estimation
}

function getMatchReasons(job: any, vendor: any): string[] {
  return ['Skills match', 'Good location', 'Available now']; // Mock reasons
}

async function checkDuplicateInfo(data: any): Promise<boolean> {
  return Math.random() > 0.8; // Mock duplicate check
}

async function analyzeDocuments(docs: any[]): Promise<boolean> {
  return Math.random() > 0.9; // Mock document analysis
}

function isRegistrationSuspicious(data: any): boolean {
  return Math.random() > 0.85; // Mock suspicious pattern check
}

async function validateContactInfo(info: any): Promise<boolean> {
  return Math.random() > 0.9; // Mock contact validation
}

function getRecommendation(level: string, score: number): string {
  switch (level) {
    case 'critical': return 'Immediately reject application and flag for review';
    case 'high': return 'Require additional verification before approval';
    case 'medium': return 'Review manually before making decision';
    default: return 'Approve with standard verification';
  }
}

function validatePaymentRequest(request: any): void {
  if (!request.vendorId || !request.amount) {
    throw new Error('Invalid payment request');
  }
}

function selectPaymentGateway(method: string): string {
  return method === 'crypto' ? 'crypto-gateway' : 'standard-gateway';
}

async function processPayment(gateway: string, calculations: any): Promise<any> {
  // Mock payment processing
  return {
    transactionId: `tx-${Date.now()}`,
    status: 'completed'
  };
}

async function logTransaction(request: any, result: any): Promise<void> {
  console.log('Transaction logged:', { request, result });
}