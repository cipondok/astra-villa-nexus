import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  field: string;
  value: any;
  vendor_type: 'product' | 'service';
  compliance_region: 'UAE' | 'US' | 'EU';
  application_id?: string;
}

interface FraudCheckRequest {
  application_data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'validate-field') {
      return await validateField(req, supabaseClient);
    } else if (action === 'fraud-check') {
      return await performFraudCheck(req, supabaseClient);
    } else if (action === 'batch-validate') {
      return await batchValidate(req, supabaseClient);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function validateField(req: Request, supabase: any) {
  const { field, value, vendor_type, compliance_region, application_id }: ValidationRequest = await req.json();

  // Get validation rules for this field
  const { data: rules, error: rulesError } = await supabase
    .from('validation_rules')
    .select('*')
    .eq('field_name', field)
    .in('vendor_type', [vendor_type, 'both'])
    .eq('compliance_region', compliance_region)
    .eq('is_active', true);

  if (rulesError) {
    throw new Error(`Failed to fetch validation rules: ${rulesError.message}`);
  }

  const results = [];
  
  for (const rule of rules) {
    const result = await applyValidationRule(rule, value, supabase, application_id);
    results.push(result);
    
    // Log validation attempt
    if (application_id) {
      await supabase
        .from('validation_logs')
        .insert({
          application_id,
          field_name: field,
          field_value: value?.toString(),
          validation_rule_id: rule.id,
          validation_result: result.valid ? 'pass' : 'fail',
          error_message: result.error_message
        });
    }
  }

  // Return the first failure or success if all pass
  const failedResult = results.find(r => !r.valid);
  const response = failedResult || { valid: true, message: 'Validation passed' };

  return new Response(
    JSON.stringify(response),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function applyValidationRule(rule: any, value: any, supabase: any, applicationId?: string) {
  const logic = rule.validation_logic;

  switch (rule.validation_type) {
    case 'regex':
      const pattern = new RegExp(logic.pattern);
      if (!pattern.test(value)) {
        return { valid: false, error_message: rule.error_message, severity: rule.severity };
      }
      break;

    case 'range':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { valid: false, error_message: 'Value must be a number', severity: rule.severity };
      }
      if (logic.min && numValue < logic.min) {
        return { valid: false, error_message: rule.error_message, severity: rule.severity };
      }
      if (logic.max && numValue > logic.max) {
        return { valid: false, error_message: rule.error_message, severity: rule.severity };
      }
      break;

    case 'required':
      if (!value || value.toString().trim() === '') {
        return { valid: false, error_message: rule.error_message, severity: rule.severity };
      }
      break;

    case 'custom':
      return await performCustomValidation(logic, value, supabase, applicationId);

    case 'conditional':
      // Implement conditional logic based on other fields
      if (logic.condition === 'category_contains_electrical') {
        // This would check if selected categories include electrical services
        const pattern = new RegExp(logic.pattern);
        if (!pattern.test(value)) {
          return { valid: false, error_message: rule.error_message, severity: rule.severity };
        }
      }
      break;
  }

  return { valid: true };
}

async function performCustomValidation(logic: any, value: any, supabase: any, applicationId?: string) {
  if (logic.check_duplicates && logic.fraud_check) {
    // Check for duplicate bank accounts
    const { data: duplicates } = await supabase
      .from('vendor_applications')
      .select('id, business_name')
      .eq('bank_details->account_number', value)
      .neq('id', applicationId || 'none');

    if (duplicates && duplicates.length > 0) {
      return { 
        valid: false, 
        error_message: 'This bank account is already registered with another vendor',
        severity: 'error',
        fraud_indicator: true
      };
    }
  }

  return { valid: true };
}

async function performFraudCheck(req: Request, supabase: any) {
  const { application_data }: FraudCheckRequest = await req.json();
  
  // Get all active fraud patterns
  const { data: patterns, error } = await supabase
    .from('fraud_patterns')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch fraud patterns: ${error.message}`);
  }

  let totalScore = 0;
  const triggeredPatterns = [];

  for (const pattern of patterns) {
    const isTriggered = await checkFraudPattern(pattern, application_data, supabase);
    if (isTriggered) {
      totalScore += pattern.risk_score;
      triggeredPatterns.push({
        pattern_name: pattern.pattern_name,
        risk_score: pattern.risk_score,
        auto_reject: pattern.auto_reject
      });
    }
  }

  const fraudScore = Math.min(totalScore, 100);
  const shouldAutoReject = triggeredPatterns.some(p => p.auto_reject);

  return new Response(
    JSON.stringify({
      fraud_score: fraudScore,
      triggered_patterns: triggeredPatterns,
      auto_reject: shouldAutoReject,
      risk_level: fraudScore >= 80 ? 'high' : fraudScore >= 50 ? 'medium' : 'low'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkFraudPattern(pattern: any, applicationData: any, supabase: any) {
  const logic = pattern.detection_logic;

  switch (pattern.pattern_type) {
    case 'duplicate_bank':
      if (logic.check_fields?.includes('bank_details.account_number')) {
        const accountNumber = applicationData.bank_details?.account_number;
        if (accountNumber) {
          const { data } = await supabase
            .from('vendor_applications')
            .select('id')
            .eq('bank_details->account_number', accountNumber)
            .neq('id', applicationData.id || 'none');
          
          return data && data.length > 0;
        }
      }
      break;

    case 'rapid_applications':
      if (logic.time_window_hours && logic.max_applications) {
        const timeWindow = new Date(Date.now() - (logic.time_window_hours * 60 * 60 * 1000));
        const { data } = await supabase
          .from('vendor_applications')
          .select('id')
          .gte('created_at', timeWindow.toISOString())
          .eq('contact_info->ip_address', applicationData.contact_info?.ip_address);
        
        return data && data.length >= logic.max_applications;
      }
      break;

    case 'blacklisted_info':
      // This would check against a blacklist table (not implemented in this example)
      const blacklistedFields = logic.check_fields || [];
      for (const field of blacklistedFields) {
        const value = getNestedValue(applicationData, field);
        if (value && await isBlacklisted(value, supabase)) {
          return true;
        }
      }
      break;

    case 'suspicious_address':
      const address = applicationData.business_address;
      if (address) {
        const addressString = `${address.street} ${address.city}`.toLowerCase();
        const suspiciousPatterns = logic.check_patterns || [];
        
        for (const suspPattern of suspiciousPatterns) {
          if (suspPattern === 'po_box_only' && addressString.includes('po box')) {
            return true;
          }
        }
      }
      break;
  }

  return false;
}

async function isBlacklisted(value: string, supabase: any): Promise<boolean> {
  // This would check against a blacklist table
  // For now, return false as blacklist table is not implemented
  return false;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

async function batchValidate(req: Request, supabase: any) {
  const { fields, application_data } = await req.json();
  
  const results = {};
  
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    try {
      const validationResult = await validateField(
        new Request('http://localhost', {
          method: 'POST',
          body: JSON.stringify({
            field: fieldName,
            value: fieldValue,
            vendor_type: application_data.vendor_type,
            compliance_region: application_data.compliance_region,
            application_id: application_data.id
          })
        }),
        supabase
      );
      
      const result = await validationResult.json();
      results[fieldName] = result;
    } catch (error) {
      results[fieldName] = { 
        valid: false, 
        error_message: `Validation error: ${error.message}` 
      };
    }
  }

  return new Response(
    JSON.stringify(results),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}