export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_lockouts: {
        Row: {
          created_at: string | null
          email: string
          failed_attempts: number
          id: string
          is_active: boolean | null
          locked_at: string
          locked_by_ip: unknown
          unlock_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          failed_attempts?: number
          id?: string
          is_active?: boolean | null
          locked_at?: string
          locked_by_ip?: unknown
          unlock_at: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          failed_attempts?: number
          id?: string
          is_active?: boolean | null
          locked_at?: string
          locked_by_ip?: unknown
          unlock_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      acquisition_analytics: {
        Row: {
          campaign_id: string | null
          channel: string
          clicks: number | null
          conversions: number | null
          cpa: number | null
          cpc: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          ltv: number | null
          metadata: Json | null
          qualified_leads: number | null
          revenue: number | null
          roi: number | null
          signups: number | null
          source: string | null
          spend: number | null
        }
        Insert: {
          campaign_id?: string | null
          channel: string
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          ltv?: number | null
          metadata?: Json | null
          qualified_leads?: number | null
          revenue?: number | null
          roi?: number | null
          signups?: number | null
          source?: string | null
          spend?: number | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          ltv?: number | null
          metadata?: Json | null
          qualified_leads?: number | null
          revenue?: number | null
          roi?: number | null
          signups?: number | null
          source?: string | null
          spend?: number | null
        }
        Relationships: []
      }
      acquisition_bank_leads: {
        Row: {
          bank_reference_id: string | null
          bank_response_at: string | null
          commission_amount: number | null
          commission_paid: boolean | null
          created_at: string
          down_payment_amount: number | null
          employment_type: string | null
          id: string
          lead_email: string
          lead_name: string
          lead_phone: string | null
          lead_status: string | null
          loan_amount_requested: number | null
          monthly_income: number | null
          notes: string | null
          partnership_id: string
          property_id: string | null
          property_value: number | null
          sent_to_bank_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank_reference_id?: string | null
          bank_response_at?: string | null
          commission_amount?: number | null
          commission_paid?: boolean | null
          created_at?: string
          down_payment_amount?: number | null
          employment_type?: string | null
          id?: string
          lead_email: string
          lead_name: string
          lead_phone?: string | null
          lead_status?: string | null
          loan_amount_requested?: number | null
          monthly_income?: number | null
          notes?: string | null
          partnership_id: string
          property_id?: string | null
          property_value?: number | null
          sent_to_bank_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank_reference_id?: string | null
          bank_response_at?: string | null
          commission_amount?: number | null
          commission_paid?: boolean | null
          created_at?: string
          down_payment_amount?: number | null
          employment_type?: string | null
          id?: string
          lead_email?: string
          lead_name?: string
          lead_phone?: string | null
          lead_status?: string | null
          loan_amount_requested?: number | null
          monthly_income?: number | null
          notes?: string | null
          partnership_id?: string
          property_id?: string | null
          property_value?: number | null
          sent_to_bank_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_bank_leads_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "acquisition_bank_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_bank_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_bank_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_bank_leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisition_bank_partnerships: {
        Row: {
          api_endpoint: string | null
          bank_logo_url: string | null
          bank_name: string
          commission_rate: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          id: string
          integration_type: string | null
          interest_rate_range: string | null
          is_active: boolean | null
          is_featured: boolean | null
          lead_handoff_process: string | null
          max_loan_amount: number | null
          min_loan_amount: number | null
          partnership_tier: string | null
          partnership_type: string
          special_offers: Json | null
          total_commission_earned: number | null
          total_conversions: number | null
          total_leads_sent: number | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          bank_logo_url?: string | null
          bank_name: string
          commission_rate?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          integration_type?: string | null
          interest_rate_range?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          lead_handoff_process?: string | null
          max_loan_amount?: number | null
          min_loan_amount?: number | null
          partnership_tier?: string | null
          partnership_type?: string
          special_offers?: Json | null
          total_commission_earned?: number | null
          total_conversions?: number | null
          total_leads_sent?: number | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          bank_logo_url?: string | null
          bank_name?: string
          commission_rate?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          integration_type?: string | null
          interest_rate_range?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          lead_handoff_process?: string | null
          max_loan_amount?: number | null
          min_loan_amount?: number | null
          partnership_tier?: string | null
          partnership_type?: string
          special_offers?: Json | null
          total_commission_earned?: number | null
          total_conversions?: number | null
          total_leads_sent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      acquisition_corporate_employees: {
        Row: {
          created_at: string
          department: string | null
          employee_email: string
          employee_id_at_company: string | null
          employee_name: string | null
          id: string
          partnership_id: string
          total_inquiries: number | null
          total_transactions: number | null
          total_viewings: number | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_email: string
          employee_id_at_company?: string | null
          employee_name?: string | null
          id?: string
          partnership_id: string
          total_inquiries?: number | null
          total_transactions?: number | null
          total_viewings?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_email?: string
          employee_id_at_company?: string | null
          employee_name?: string | null
          id?: string
          partnership_id?: string
          total_inquiries?: number | null
          total_transactions?: number | null
          total_viewings?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_corporate_employees_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "acquisition_corporate_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_corporate_employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisition_corporate_partnerships: {
        Row: {
          benefits_offered: Json | null
          company_logo_url: string | null
          company_name: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          employee_count: number | null
          exclusive_listings: boolean | null
          hr_contact_email: string | null
          hr_contact_name: string | null
          hr_contact_phone: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          notes: string | null
          partnership_type: string | null
          total_employees_registered: number | null
          total_inquiries: number | null
          total_revenue: number | null
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          benefits_offered?: Json | null
          company_logo_url?: string | null
          company_name: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          employee_count?: number | null
          exclusive_listings?: boolean | null
          hr_contact_email?: string | null
          hr_contact_name?: string | null
          hr_contact_phone?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          notes?: string | null
          partnership_type?: string | null
          total_employees_registered?: number | null
          total_inquiries?: number | null
          total_revenue?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          benefits_offered?: Json | null
          company_logo_url?: string | null
          company_name?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          employee_count?: number | null
          exclusive_listings?: boolean | null
          hr_contact_email?: string | null
          hr_contact_name?: string | null
          hr_contact_phone?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          notes?: string | null
          partnership_type?: string | null
          total_employees_registered?: number | null
          total_inquiries?: number | null
          total_revenue?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      acquisition_influencer_campaigns: {
        Row: {
          actual_spend: number | null
          brief: string | null
          budget: number
          campaign_name: string
          campaign_type: string | null
          clicks: number | null
          content_urls: Json | null
          conversions: number | null
          cpa: number | null
          cpc: number | null
          created_at: string
          deliverables: Json | null
          end_date: string | null
          engagement: number | null
          hashtags: string[] | null
          id: string
          impressions: number | null
          influencer_id: string
          performance_notes: string | null
          property_id: string | null
          reach: number | null
          roi: number | null
          start_date: string | null
          status: string | null
          tracking_code: string | null
          tracking_link: string | null
          updated_at: string
        }
        Insert: {
          actual_spend?: number | null
          brief?: string | null
          budget: number
          campaign_name: string
          campaign_type?: string | null
          clicks?: number | null
          content_urls?: Json | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          deliverables?: Json | null
          end_date?: string | null
          engagement?: number | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          influencer_id: string
          performance_notes?: string | null
          property_id?: string | null
          reach?: number | null
          roi?: number | null
          start_date?: string | null
          status?: string | null
          tracking_code?: string | null
          tracking_link?: string | null
          updated_at?: string
        }
        Update: {
          actual_spend?: number | null
          brief?: string | null
          budget?: number
          campaign_name?: string
          campaign_type?: string | null
          clicks?: number | null
          content_urls?: Json | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string
          deliverables?: Json | null
          end_date?: string | null
          engagement?: number | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          influencer_id?: string
          performance_notes?: string | null
          property_id?: string | null
          reach?: number | null
          roi?: number | null
          start_date?: string | null
          status?: string | null
          tracking_code?: string | null
          tracking_link?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_influencer_campaigns_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "acquisition_influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_influencer_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_influencer_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisition_influencers: {
        Row: {
          agent_contact: string | null
          agent_name: string | null
          audience_demographics: Json | null
          avg_cpc: number | null
          contact_email: string | null
          contact_phone: string | null
          content_style: string | null
          created_at: string
          engagement_rate: number | null
          followers_count: number | null
          handle: string
          id: string
          influencer_name: string
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          niche: string | null
          notes: string | null
          partnership_tier: string | null
          platform: string
          profile_image_url: string | null
          profile_url: string | null
          rate_per_post: number | null
          rate_per_story: number | null
          rate_per_video: number | null
          total_campaigns: number | null
          total_conversions: number | null
          total_engagement: number | null
          total_reach: number | null
          updated_at: string
        }
        Insert: {
          agent_contact?: string | null
          agent_name?: string | null
          audience_demographics?: Json | null
          avg_cpc?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          content_style?: string | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          handle: string
          id?: string
          influencer_name: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          niche?: string | null
          notes?: string | null
          partnership_tier?: string | null
          platform: string
          profile_image_url?: string | null
          profile_url?: string | null
          rate_per_post?: number | null
          rate_per_story?: number | null
          rate_per_video?: number | null
          total_campaigns?: number | null
          total_conversions?: number | null
          total_engagement?: number | null
          total_reach?: number | null
          updated_at?: string
        }
        Update: {
          agent_contact?: string | null
          agent_name?: string | null
          audience_demographics?: Json | null
          avg_cpc?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          content_style?: string | null
          created_at?: string
          engagement_rate?: number | null
          followers_count?: number | null
          handle?: string
          id?: string
          influencer_name?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          niche?: string | null
          notes?: string | null
          partnership_tier?: string | null
          platform?: string
          profile_image_url?: string | null
          profile_url?: string | null
          rate_per_post?: number | null
          rate_per_story?: number | null
          rate_per_video?: number | null
          total_campaigns?: number | null
          total_conversions?: number | null
          total_engagement?: number | null
          total_reach?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      acquisition_referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          qualification_action: string | null
          qualified_at: string | null
          referee_email: string | null
          referee_id: string | null
          referee_reward_amount: number | null
          referee_reward_paid: boolean | null
          referee_reward_type: string | null
          referral_code: string
          referral_link: string | null
          referrer_id: string
          referrer_reward_amount: number | null
          referrer_reward_paid: boolean | null
          referrer_reward_type: string | null
          rewarded_at: string | null
          source_channel: string | null
          status: string | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          qualification_action?: string | null
          qualified_at?: string | null
          referee_email?: string | null
          referee_id?: string | null
          referee_reward_amount?: number | null
          referee_reward_paid?: boolean | null
          referee_reward_type?: string | null
          referral_code: string
          referral_link?: string | null
          referrer_id: string
          referrer_reward_amount?: number | null
          referrer_reward_paid?: boolean | null
          referrer_reward_type?: string | null
          rewarded_at?: string | null
          source_channel?: string | null
          status?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          qualification_action?: string | null
          qualified_at?: string | null
          referee_email?: string | null
          referee_id?: string | null
          referee_reward_amount?: number | null
          referee_reward_paid?: boolean | null
          referee_reward_type?: string | null
          referral_code?: string
          referral_link?: string | null
          referrer_id?: string
          referrer_reward_amount?: number | null
          referrer_reward_paid?: boolean | null
          referrer_reward_type?: string | null
          rewarded_at?: string | null
          source_channel?: string | null
          status?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisition_seo_content: {
        Row: {
          ai_generated: boolean | null
          ai_model: string | null
          author_id: string | null
          avg_time_on_page: number | null
          backlinks_count: number | null
          bounce_rate: number | null
          content: string | null
          content_type: string
          conversions: number | null
          created_at: string
          editor_id: string | null
          external_links: Json | null
          featured_image_url: string | null
          id: string
          internal_links: Json | null
          meta_description: string | null
          meta_title: string | null
          organic_traffic: number | null
          primary_keyword: string
          published_at: string | null
          readability_score: number | null
          schema_markup: Json | null
          secondary_keywords: string[] | null
          seo_score: number | null
          slug: string
          status: string | null
          target_location: string | null
          target_property_type: string | null
          title: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          author_id?: string | null
          avg_time_on_page?: number | null
          backlinks_count?: number | null
          bounce_rate?: number | null
          content?: string | null
          content_type?: string
          conversions?: number | null
          created_at?: string
          editor_id?: string | null
          external_links?: Json | null
          featured_image_url?: string | null
          id?: string
          internal_links?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          organic_traffic?: number | null
          primary_keyword: string
          published_at?: string | null
          readability_score?: number | null
          schema_markup?: Json | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug: string
          status?: string | null
          target_location?: string | null
          target_property_type?: string | null
          title: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          author_id?: string | null
          avg_time_on_page?: number | null
          backlinks_count?: number | null
          bounce_rate?: number | null
          content?: string | null
          content_type?: string
          conversions?: number | null
          created_at?: string
          editor_id?: string | null
          external_links?: Json | null
          featured_image_url?: string | null
          id?: string
          internal_links?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          organic_traffic?: number | null
          primary_keyword?: string
          published_at?: string | null
          readability_score?: number | null
          schema_markup?: Json | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug?: string
          status?: string | null
          target_location?: string | null
          target_property_type?: string | null
          title?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_seo_content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_seo_content_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisition_university_partnerships: {
        Row: {
          approved_properties: string[] | null
          avg_lease_duration_months: number | null
          benefits_offered: Json | null
          campus_location: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          housing_office_contact: string | null
          housing_office_email: string | null
          housing_office_phone: string | null
          id: string
          international_office_contact: string | null
          international_office_email: string | null
          is_active: boolean | null
          notes: string | null
          partnership_type: string | null
          property_requirements: Json | null
          student_population: number | null
          total_placements: number | null
          total_students_registered: number | null
          university_logo_url: string | null
          university_name: string
          updated_at: string
        }
        Insert: {
          approved_properties?: string[] | null
          avg_lease_duration_months?: number | null
          benefits_offered?: Json | null
          campus_location?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          housing_office_contact?: string | null
          housing_office_email?: string | null
          housing_office_phone?: string | null
          id?: string
          international_office_contact?: string | null
          international_office_email?: string | null
          is_active?: boolean | null
          notes?: string | null
          partnership_type?: string | null
          property_requirements?: Json | null
          student_population?: number | null
          total_placements?: number | null
          total_students_registered?: number | null
          university_logo_url?: string | null
          university_name: string
          updated_at?: string
        }
        Update: {
          approved_properties?: string[] | null
          avg_lease_duration_months?: number | null
          benefits_offered?: Json | null
          campus_location?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          housing_office_contact?: string | null
          housing_office_email?: string | null
          housing_office_phone?: string | null
          id?: string
          international_office_contact?: string | null
          international_office_email?: string | null
          is_active?: boolean | null
          notes?: string | null
          partnership_type?: string | null
          property_requirements?: Json | null
          student_population?: number | null
          total_placements?: number | null
          total_students_registered?: number | null
          university_logo_url?: string | null
          university_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      acquisition_university_students: {
        Row: {
          budget_range_max: number | null
          budget_range_min: number | null
          country_of_origin: string | null
          created_at: string
          housing_preferences: Json | null
          id: string
          is_international: boolean | null
          lease_duration_months: number | null
          move_in_date: string | null
          partnership_id: string
          placed_at: string | null
          placement_property_id: string | null
          program: string | null
          roommate_preferences: Json | null
          student_email: string
          student_id: string | null
          student_name: string | null
          total_inquiries: number | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
          year_of_study: number | null
        }
        Insert: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          country_of_origin?: string | null
          created_at?: string
          housing_preferences?: Json | null
          id?: string
          is_international?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          partnership_id: string
          placed_at?: string | null
          placement_property_id?: string | null
          program?: string | null
          roommate_preferences?: Json | null
          student_email: string
          student_id?: string | null
          student_name?: string | null
          total_inquiries?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          year_of_study?: number | null
        }
        Update: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          country_of_origin?: string | null
          created_at?: string
          housing_preferences?: Json | null
          id?: string
          is_international?: boolean | null
          lease_duration_months?: number | null
          move_in_date?: string | null
          partnership_id?: string
          placed_at?: string | null
          placement_property_id?: string | null
          program?: string | null
          roommate_preferences?: Json | null
          student_email?: string
          student_id?: string | null
          student_name?: string | null
          total_inquiries?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_university_students_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "acquisition_university_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_university_students_placement_property_id_fkey"
            columns: ["placement_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_university_students_placement_property_id_fkey"
            columns: ["placement_property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acquisition_university_students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown
          location_data: Json | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          location_data?: Json | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          location_data?: Json | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_alert_rules: {
        Row: {
          alert_template: Json
          conditions: Json | null
          created_at: string | null
          event_type: string
          id: string
          is_active: boolean | null
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          alert_template: Json
          conditions?: Json | null
          created_at?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          alert_template?: Json
          conditions?: Json | null
          created_at?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_alerts: {
        Row: {
          action_required: boolean
          alert_category: string | null
          auto_generated: boolean | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          reference_id: string | null
          reference_type: string | null
          source_id: string | null
          source_table: string | null
          title: string
          type: string
          updated_at: string
          urgency_level: number | null
        }
        Insert: {
          action_required?: boolean
          alert_category?: string | null
          auto_generated?: boolean | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          reference_id?: string | null
          reference_type?: string | null
          source_id?: string | null
          source_table?: string | null
          title: string
          type: string
          updated_at?: string
          urgency_level?: number | null
        }
        Update: {
          action_required?: boolean
          alert_category?: string | null
          auto_generated?: boolean | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          reference_id?: string | null
          reference_type?: string | null
          source_id?: string | null
          source_table?: string | null
          title?: string
          type?: string
          updated_at?: string
          urgency_level?: number | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Database["public"]["Enums"]["admin_permission"][] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Database["public"]["Enums"]["admin_permission"][] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Database["public"]["Enums"]["admin_permission"][] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_vendor_service_controls: {
        Row: {
          admin_action: string
          admin_id: string | null
          admin_notes: string | null
          created_at: string | null
          id: string
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_action: string
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_action?: string
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_vendor_service_controls_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_vendor_service_controls_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          order_amount: number | null
          order_id: string | null
          paid_at: string | null
          referral_id: string | null
          status: string | null
        }
        Insert: {
          affiliate_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string
          id?: string
          order_amount?: number | null
          order_id?: string | null
          paid_at?: string | null
          referral_id?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          order_amount?: number | null
          order_id?: string | null
          paid_at?: string | null
          referral_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "user_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          processed_at: string | null
          processed_by: string | null
          status: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          commission_rate: number
          created_at: string
          id: string
          paid_earnings: number | null
          pending_earnings: number | null
          referral_code: string
          status: Database["public"]["Enums"]["affiliate_status"]
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          paid_earnings?: number | null
          pending_earnings?: number | null
          referral_code?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          commission_rate?: number
          created_at?: string
          id?: string
          paid_earnings?: number | null
          pending_earnings?: number | null
          referral_code?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_leaderboard_rewards: {
        Row: {
          agent_id: string | null
          avg_rating: number | null
          badge_earned: string | null
          campaign_id: string | null
          created_at: string
          id: string
          month_year: string
          rank: number | null
          response_rate: number | null
          review_count: number | null
          reward_amount: number | null
          reward_claimed: boolean | null
          reward_claimed_at: string | null
          reward_tier: string | null
          reward_type: string | null
          total_inquiries: number | null
          total_listings: number | null
          total_points: number | null
          total_revenue: number | null
          total_sales: number | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          avg_rating?: number | null
          badge_earned?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          month_year: string
          rank?: number | null
          response_rate?: number | null
          review_count?: number | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          reward_tier?: string | null
          reward_type?: string | null
          total_inquiries?: number | null
          total_listings?: number | null
          total_points?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          avg_rating?: number | null
          badge_earned?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          month_year?: string
          rank?: number | null
          response_rate?: number | null
          review_count?: number | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          reward_tier?: string | null
          reward_type?: string | null
          total_inquiries?: number | null
          total_listings?: number | null
          total_points?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_leaderboard_rewards_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_leaderboard_rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "viral_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_registration_requests: {
        Row: {
          business_type: string
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          registration_documents: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_type: string
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          license_number?: string | null
          phone?: string | null
          registration_documents?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_type?: string
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          registration_documents?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_bot_settings: {
        Row: {
          bot_name: string
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          model_type: string
          updated_at: string | null
          usage_stats: Json | null
        }
        Insert: {
          bot_name: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_type: string
          updated_at?: string | null
          usage_stats?: Json | null
        }
        Update: {
          bot_name?: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_type?: string
          updated_at?: string | null
          usage_stats?: Json | null
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          ai_response: string | null
          created_at: string | null
          id: string
          message: string
          session_id: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          ai_response?: string | null
          created_at?: string | null
          id?: string
          message: string
          session_id?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          ai_response?: string | null
          created_at?: string | null
          id?: string
          message?: string
          session_id?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          function_call: Json | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          function_call?: Json | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          function_call?: Json | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_message_reactions: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message_content: string
          message_id: string
          metadata: Json | null
          property_id: string | null
          reaction_type: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_content: string
          message_id: string
          metadata?: Json | null
          property_id?: string | null
          reaction_type: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_content?: string
          message_id?: string
          metadata?: Json | null
          property_id?: string | null
          reaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_training_specialists: {
        Row: {
          accuracy_score: number | null
          active_projects: string[] | null
          certification_scores: Json | null
          city: string | null
          completed_projects: number | null
          consistency_score: number | null
          contract_type: Database["public"]["Enums"]["employment_type"] | null
          country: string | null
          created_at: string | null
          current_week_hours: number | null
          email: string
          full_name: string
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          last_quality_review_at: string | null
          per_task_rate: number | null
          phone: string | null
          preferred_task_types: string[] | null
          quality_review_notes: string | null
          specialist_level: string | null
          specializations: string[] | null
          speed_score: number | null
          status: Database["public"]["Enums"]["team_member_status"] | null
          timezone: string | null
          tools_proficiency: string[] | null
          total_earnings: number | null
          total_hours_worked: number | null
          total_labels_created: number | null
          total_tasks_completed: number | null
          training_modules_completed: string[] | null
          updated_at: string | null
          user_id: string | null
          weekly_availability_hours: number | null
        }
        Insert: {
          accuracy_score?: number | null
          active_projects?: string[] | null
          certification_scores?: Json | null
          city?: string | null
          completed_projects?: number | null
          consistency_score?: number | null
          contract_type?: Database["public"]["Enums"]["employment_type"] | null
          country?: string | null
          created_at?: string | null
          current_week_hours?: number | null
          email: string
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          last_quality_review_at?: string | null
          per_task_rate?: number | null
          phone?: string | null
          preferred_task_types?: string[] | null
          quality_review_notes?: string | null
          specialist_level?: string | null
          specializations?: string[] | null
          speed_score?: number | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          timezone?: string | null
          tools_proficiency?: string[] | null
          total_earnings?: number | null
          total_hours_worked?: number | null
          total_labels_created?: number | null
          total_tasks_completed?: number | null
          training_modules_completed?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          weekly_availability_hours?: number | null
        }
        Update: {
          accuracy_score?: number | null
          active_projects?: string[] | null
          certification_scores?: Json | null
          city?: string | null
          completed_projects?: number | null
          consistency_score?: number | null
          contract_type?: Database["public"]["Enums"]["employment_type"] | null
          country?: string | null
          created_at?: string | null
          current_week_hours?: number | null
          email?: string
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          last_quality_review_at?: string | null
          per_task_rate?: number | null
          phone?: string | null
          preferred_task_types?: string[] | null
          quality_review_notes?: string | null
          specialist_level?: string | null
          specializations?: string[] | null
          speed_score?: number | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          timezone?: string | null
          tools_proficiency?: string[] | null
          total_earnings?: number | null
          total_hours_worked?: number | null
          total_labels_created?: number | null
          total_tasks_completed?: number | null
          training_modules_completed?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          weekly_availability_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_specialists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_vendor_suggestions: {
        Row: {
          ai_suggestion: Json
          confidence_score: number | null
          created_at: string | null
          id: string
          status: string | null
          suggestion_type: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          ai_suggestion: Json
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          suggestion_type: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          ai_suggestion?: Json
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          suggestion_type?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_vendor_suggestions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_settings: {
        Row: {
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          tool_name: string
          tracking_id: string
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          tool_name: string
          tracking_id: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          tool_name?: string
          tracking_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_settings: {
        Row: {
          api_endpoint: string | null
          api_key: string | null
          api_name: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key?: string | null
          api_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          api_key?: string | null
          api_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_service_names: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          service_name: string
          sub_category_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          service_name: string
          sub_category_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          service_name?: string
          sub_category_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approved_service_names_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approved_service_names_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approved_service_names_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_ratings: {
        Row: {
          article_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_ratings_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          slug: string
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          slug: string
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      astra_daily_checkins: {
        Row: {
          bonus_multiplier: number | null
          checkin_date: string
          created_at: string
          id: string
          streak_count: number
          tokens_earned: number
          user_id: string
        }
        Insert: {
          bonus_multiplier?: number | null
          checkin_date: string
          created_at?: string
          id?: string
          streak_count?: number
          tokens_earned?: number
          user_id: string
        }
        Update: {
          bonus_multiplier?: number | null
          checkin_date?: string
          created_at?: string
          id?: string
          streak_count?: number
          tokens_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "astra_daily_checkins_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_daily_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astra_exchange_rates: {
        Row: {
          created_at: string
          exchange_rate: number
          from_currency: string
          id: string
          is_active: boolean
          to_currency: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exchange_rate: number
          from_currency: string
          id?: string
          is_active?: boolean
          to_currency: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number
          from_currency?: string
          id?: string
          is_active?: boolean
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      astra_referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string | null
          referred_id: string
          referred_reward: number | null
          referrer_id: string
          referrer_reward: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string | null
          referred_id: string
          referred_reward?: number | null
          referrer_id: string
          referrer_reward?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string | null
          referred_id?: string
          referred_reward?: number | null
          referrer_id?: string
          referrer_reward?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "astra_referrals_referred_fk"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_referrals_referrer_fk"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astra_reward_claims: {
        Row: {
          amount: number
          claim_type: string
          claimed_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          claim_type: string
          claimed_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          claim_type?: string
          claimed_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "astra_reward_claims_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_reward_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astra_reward_config: {
        Row: {
          conditions: Json | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          percentage_rate: number | null
          reward_amount: number
          reward_type: string
          updated_at: string
          user_role: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          percentage_rate?: number | null
          reward_amount?: number
          reward_type: string
          updated_at?: string
          user_role: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          percentage_rate?: number | null
          reward_amount?: number
          reward_type?: string
          updated_at?: string
          user_role?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "astra_reward_config_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astra_token_balances: {
        Row: {
          available_tokens: number
          created_at: string
          id: string
          lifetime_earned: number
          locked_tokens: number
          total_tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_tokens?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          locked_tokens?: number
          total_tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_tokens?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          locked_tokens?: number
          total_tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "astra_token_balances_user_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_token_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astra_token_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          reference_id: string | null
          reference_type: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "astra_token_transactions_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astra_token_transfers: {
        Row: {
          amount: number
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          net_amount: number
          recipient_id: string
          sender_id: string
          status: string
          transfer_fee: number
          transfer_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          net_amount: number
          recipient_id: string
          sender_id: string
          status?: string
          transfer_fee?: number
          transfer_type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          net_amount?: number
          recipient_id?: string
          sender_id?: string
          status?: string
          transfer_fee?: number
          transfer_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "astra_token_transfers_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astra_token_transfers_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_bots: {
        Row: {
          ai_model: string | null
          allowed_actions: string[] | null
          avg_response_time_ms: number | null
          bot_name: string
          bot_type: string
          capabilities: string[] | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          restricted_actions: string[] | null
          successful_interactions: number | null
          system_prompt: string | null
          temperature: number | null
          total_interactions: number | null
          updated_at: string
          user_satisfaction_avg: number | null
        }
        Insert: {
          ai_model?: string | null
          allowed_actions?: string[] | null
          avg_response_time_ms?: number | null
          bot_name: string
          bot_type: string
          capabilities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          restricted_actions?: string[] | null
          successful_interactions?: number | null
          system_prompt?: string | null
          temperature?: number | null
          total_interactions?: number | null
          updated_at?: string
          user_satisfaction_avg?: number | null
        }
        Update: {
          ai_model?: string | null
          allowed_actions?: string[] | null
          avg_response_time_ms?: number | null
          bot_name?: string
          bot_type?: string
          capabilities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          restricted_actions?: string[] | null
          successful_interactions?: number | null
          system_prompt?: string | null
          temperature?: number | null
          total_interactions?: number | null
          updated_at?: string
          user_satisfaction_avg?: number | null
        }
        Relationships: []
      }
      automation_metrics: {
        Row: {
          ai_errors: number | null
          avg_listing_process_time_seconds: number | null
          avg_message_response_time_seconds: number | null
          avg_onboarding_time_minutes: number | null
          avg_report_generation_time_seconds: number | null
          created_at: string
          failed_tasks: number | null
          id: string
          listing_approval_rate: number | null
          listings_processed: number | null
          message_resolution_rate: number | null
          messages_handled: number | null
          metric_date: string
          metric_hour: number | null
          onboarding_completion_rate: number | null
          partner_actions: number | null
          partner_satisfaction_rate: number | null
          reports_generated: number | null
          users_onboarded: number | null
          zapier_errors: number | null
        }
        Insert: {
          ai_errors?: number | null
          avg_listing_process_time_seconds?: number | null
          avg_message_response_time_seconds?: number | null
          avg_onboarding_time_minutes?: number | null
          avg_report_generation_time_seconds?: number | null
          created_at?: string
          failed_tasks?: number | null
          id?: string
          listing_approval_rate?: number | null
          listings_processed?: number | null
          message_resolution_rate?: number | null
          messages_handled?: number | null
          metric_date: string
          metric_hour?: number | null
          onboarding_completion_rate?: number | null
          partner_actions?: number | null
          partner_satisfaction_rate?: number | null
          reports_generated?: number | null
          users_onboarded?: number | null
          zapier_errors?: number | null
        }
        Update: {
          ai_errors?: number | null
          avg_listing_process_time_seconds?: number | null
          avg_message_response_time_seconds?: number | null
          avg_onboarding_time_minutes?: number | null
          avg_report_generation_time_seconds?: number | null
          created_at?: string
          failed_tasks?: number | null
          id?: string
          listing_approval_rate?: number | null
          listings_processed?: number | null
          message_resolution_rate?: number | null
          messages_handled?: number | null
          metric_date?: string
          metric_hour?: number | null
          onboarding_completion_rate?: number | null
          partner_actions?: number | null
          partner_satisfaction_rate?: number | null
          reports_generated?: number | null
          users_onboarded?: number | null
          zapier_errors?: number | null
        }
        Relationships: []
      }
      automation_task_queue: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          max_attempts: number | null
          payload: Json
          priority: number | null
          result: Json | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          task_type: string
          workflow_id: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          max_attempts?: number | null
          payload?: Json
          priority?: number | null
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          task_type: string
          workflow_id?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          max_attempts?: number | null
          payload?: Json
          priority?: number | null
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          task_type?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_task_queue_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          ai_moderation_enabled: boolean | null
          avg_execution_time_ms: number | null
          created_at: string
          created_by: string | null
          custom_bot_id: string | null
          description: string | null
          failed_executions: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          max_concurrent: number | null
          priority: number | null
          retry_attempts: number | null
          successful_executions: number | null
          timeout_seconds: number | null
          total_executions: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          workflow_name: string
          workflow_type: string
          zapier_webhook_url: string | null
        }
        Insert: {
          ai_moderation_enabled?: boolean | null
          avg_execution_time_ms?: number | null
          created_at?: string
          created_by?: string | null
          custom_bot_id?: string | null
          description?: string | null
          failed_executions?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          max_concurrent?: number | null
          priority?: number | null
          retry_attempts?: number | null
          successful_executions?: number | null
          timeout_seconds?: number | null
          total_executions?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
          workflow_name: string
          workflow_type: string
          zapier_webhook_url?: string | null
        }
        Update: {
          ai_moderation_enabled?: boolean | null
          avg_execution_time_ms?: number | null
          created_at?: string
          created_by?: string | null
          custom_bot_id?: string | null
          description?: string | null
          failed_executions?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          max_concurrent?: number | null
          priority?: number | null
          retry_attempts?: number | null
          successful_executions?: number | null
          timeout_seconds?: number | null
          total_executions?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          workflow_name?: string
          workflow_type?: string
          zapier_webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_api_keys: {
        Row: {
          allowed_endpoints: string[] | null
          api_key_hash: string
          api_key_prefix: string
          client_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          ip_whitelist: string[] | null
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          permissions: Json | null
        }
        Insert: {
          allowed_endpoints?: string[] | null
          api_key_hash: string
          api_key_prefix: string
          client_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          permissions?: Json | null
        }
        Update: {
          allowed_endpoints?: string[] | null
          api_key_hash?: string
          api_key_prefix?: string
          client_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_api_keys_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_api_usage: {
        Row: {
          api_key_id: string | null
          client_id: string
          created_at: string | null
          credits_used: number | null
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          request_params: Json | null
          response_status: number | null
          response_time_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          client_id: string
          created_at?: string | null
          credits_used?: number | null
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          request_params?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          client_id?: string
          created_at?: string | null
          credits_used?: number | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          request_params?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "b2b_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_api_usage_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_clients: {
        Row: {
          api_rate_limit: number | null
          client_type: Database["public"]["Enums"]["b2b_client_type"]
          company_address: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          credits_balance: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          lifetime_credits_purchased: number | null
          lifetime_credits_used: number | null
          logo_url: string | null
          metadata: Json | null
          notes: string | null
          tax_id: string | null
          tier: Database["public"]["Enums"]["b2b_tier"] | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          white_label_config: Json | null
          white_label_enabled: boolean | null
        }
        Insert: {
          api_rate_limit?: number | null
          client_type: Database["public"]["Enums"]["b2b_client_type"]
          company_address?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lifetime_credits_purchased?: number | null
          lifetime_credits_used?: number | null
          logo_url?: string | null
          metadata?: Json | null
          notes?: string | null
          tax_id?: string | null
          tier?: Database["public"]["Enums"]["b2b_tier"] | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          white_label_config?: Json | null
          white_label_enabled?: boolean | null
        }
        Update: {
          api_rate_limit?: number | null
          client_type?: Database["public"]["Enums"]["b2b_client_type"]
          company_address?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lifetime_credits_purchased?: number | null
          lifetime_credits_used?: number | null
          logo_url?: string | null
          metadata?: Json | null
          notes?: string | null
          tax_id?: string | null
          tier?: Database["public"]["Enums"]["b2b_tier"] | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          white_label_config?: Json | null
          white_label_enabled?: boolean | null
        }
        Relationships: []
      }
      b2b_credit_packages: {
        Row: {
          bonus_credits: number | null
          created_at: string | null
          credits: number
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price_idr: number
          price_usd: number | null
          updated_at: string | null
          valid_days: number | null
        }
        Insert: {
          bonus_credits?: number | null
          created_at?: string | null
          credits: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price_idr: number
          price_usd?: number | null
          updated_at?: string | null
          valid_days?: number | null
        }
        Update: {
          bonus_credits?: number | null
          created_at?: string | null
          credits?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price_idr?: number
          price_usd?: number | null
          updated_at?: string | null
          valid_days?: number | null
        }
        Relationships: []
      }
      b2b_credit_transactions: {
        Row: {
          balance_after: number
          client_id: string
          created_at: string | null
          created_by: string | null
          credits: number
          description: string | null
          id: string
          payment_id: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          balance_after: number
          client_id: string
          created_at?: string | null
          created_by?: string | null
          credits: number
          description?: string | null
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          balance_after?: number
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          credits?: number
          description?: string | null
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_credit_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_custom_reports: {
        Row: {
          client_id: string
          created_at: string | null
          credits_spent: number
          expires_at: string | null
          generated_at: string | null
          id: string
          parameters: Json
          report_data: Json | null
          report_title: string
          report_type: string
          report_url: string | null
          status: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          credits_spent: number
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          parameters: Json
          report_data?: Json | null
          report_title: string
          report_type: string
          report_url?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          credits_spent?: number
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          parameters?: Json
          report_data?: Json | null
          report_title?: string
          report_type?: string
          report_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_custom_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_data_products: {
        Row: {
          created_at: string | null
          credit_cost: number
          data_schema: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          product_type: string
          sample_data: Json | null
          target_clients:
            | Database["public"]["Enums"]["b2b_client_type"][]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_cost: number
          data_schema?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          product_type: string
          sample_data?: Json | null
          target_clients?:
            | Database["public"]["Enums"]["b2b_client_type"][]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_cost?: number
          data_schema?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          product_type?: string
          sample_data?: Json | null
          target_clients?:
            | Database["public"]["Enums"]["b2b_client_type"][]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      b2b_insight_purchases: {
        Row: {
          client_id: string
          created_at: string | null
          credits_spent: number
          downloaded_at: string | null
          id: string
          insight_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          credits_spent: number
          downloaded_at?: string | null
          id?: string
          insight_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          credits_spent?: number
          downloaded_at?: string | null
          id?: string
          insight_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_insight_purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_insight_purchases_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "b2b_market_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_lead_purchases: {
        Row: {
          client_id: string
          contact_result: string | null
          contacted_at: string | null
          conversion_status: string | null
          created_at: string | null
          credits_spent: number
          id: string
          lead_data: Json
          lead_id: string
          notes: string | null
          purchase_price_idr: number | null
        }
        Insert: {
          client_id: string
          contact_result?: string | null
          contacted_at?: string | null
          conversion_status?: string | null
          created_at?: string | null
          credits_spent: number
          id?: string
          lead_data: Json
          lead_id: string
          notes?: string | null
          purchase_price_idr?: number | null
        }
        Update: {
          client_id?: string
          contact_result?: string | null
          contacted_at?: string | null
          conversion_status?: string | null
          created_at?: string | null
          credits_spent?: number
          id?: string
          lead_data?: Json
          lead_id?: string
          notes?: string | null
          purchase_price_idr?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_lead_purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_lead_purchases_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "b2b_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_leads: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_sold: boolean | null
          is_verified: boolean | null
          lead_budget: number | null
          lead_email: string | null
          lead_intent: string | null
          lead_name: string | null
          lead_phone: string | null
          lead_score: number | null
          lead_source: string
          lead_timeline: string | null
          metadata: Json | null
          price_range_max: number | null
          price_range_min: number | null
          property_id: string | null
          property_location: string | null
          property_type: string | null
          sold_at: string | null
          sold_price: number | null
          sold_to: string | null
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_sold?: boolean | null
          is_verified?: boolean | null
          lead_budget?: number | null
          lead_email?: string | null
          lead_intent?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          lead_score?: number | null
          lead_source: string
          lead_timeline?: string | null
          metadata?: Json | null
          price_range_max?: number | null
          price_range_min?: number | null
          property_id?: string | null
          property_location?: string | null
          property_type?: string | null
          sold_at?: string | null
          sold_price?: number | null
          sold_to?: string | null
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_sold?: boolean | null
          is_verified?: boolean | null
          lead_budget?: number | null
          lead_email?: string | null
          lead_intent?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          lead_score?: number | null
          lead_source?: string
          lead_timeline?: string | null
          metadata?: Json | null
          price_range_max?: number | null
          price_range_min?: number | null
          property_id?: string | null
          property_location?: string | null
          property_type?: string | null
          sold_at?: string | null
          sold_price?: number | null
          sold_to?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_leads_sold_to_fkey"
            columns: ["sold_to"]
            isOneToOne: false
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_market_insights: {
        Row: {
          city: string | null
          created_at: string | null
          credit_cost: number
          data_period_end: string | null
          data_period_start: string | null
          district: string | null
          id: string
          insight_data: Json
          insight_type: string
          is_public: boolean | null
          property_type: string | null
          region: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          credit_cost: number
          data_period_end?: string | null
          data_period_start?: string | null
          district?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          is_public?: boolean | null
          property_type?: string | null
          region: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          credit_cost?: number
          data_period_end?: string | null
          data_period_start?: string | null
          district?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          is_public?: boolean | null
          property_type?: string | null
          region?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      b2b_white_label_configs: {
        Row: {
          client_id: string
          company_name: string | null
          created_at: string | null
          custom_css: string | null
          custom_domain: string | null
          email_templates: Json | null
          favicon_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          report_branding: Json | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          company_name?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          email_templates?: Json | null
          favicon_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          report_branding?: Json | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          company_name?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          email_templates?: Json | null
          favicon_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          report_branding?: Json | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_white_label_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "b2b_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_definitions: {
        Row: {
          badge_key: string
          category: string
          created_at: string | null
          criteria: Json
          description: string
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          xp_reward: number | null
        }
        Insert: {
          badge_key: string
          category: string
          created_at?: string | null
          criteria: Json
          description: string
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          xp_reward?: number | null
        }
        Update: {
          badge_key?: string
          category?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      billing_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string
          blocked_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          ip_address: string
          is_permanent: boolean
          notes: string | null
          reason: string
          updated_at: string
          violation_count: number
        }
        Insert: {
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address: string
          is_permanent?: boolean
          notes?: string | null
          reason: string
          updated_at?: string
          violation_count?: number
        }
        Update: {
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_permanent?: boolean
          notes?: string | null
          reason?: string
          updated_at?: string
          violation_count?: number
        }
        Relationships: []
      }
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          gateway_response: Json | null
          gateway_transaction_id: string | null
          id: string
          payment_gateway: string | null
          payment_method: string
          payment_status: string
          processed_at: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          payment_gateway?: string | null
          payment_method: string
          payment_status?: string
          processed_at?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          payment_gateway?: string | null
          payment_method?: string
          payment_status?: string
          processed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bpjs_verification_logs: {
        Row: {
          api_response: Json | null
          bpjs_number: string
          created_at: string | null
          id: string
          vendor_id: string
          verification_status: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          api_response?: Json | null
          bpjs_number: string
          created_at?: string | null
          id?: string
          vendor_id: string
          verification_status: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          api_response?: Json | null
          bpjs_number?: string
          created_at?: string | null
          id?: string
          vendor_id?: string
          verification_status?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      bpjs_verifications: {
        Row: {
          bpjs_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_valid: boolean | null
          updated_at: string | null
          vendor_id: string
          verification_number: string
          verification_response: Json | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          bpjs_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          updated_at?: string | null
          vendor_id: string
          verification_number: string
          verification_response?: Json | null
          verification_status: string
          verified_at?: string | null
        }
        Update: {
          bpjs_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          updated_at?: string | null
          vendor_id?: string
          verification_number?: string
          verification_response?: Json | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      business_partners: {
        Row: {
          business_name: string
          business_type: string
          campaign_id: string | null
          co_marketing_approved: boolean | null
          commission_rate: number | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          customer_rating: number | null
          featured_on_platform: boolean | null
          id: string
          lead_cost: number | null
          leads_converted: number | null
          leads_received: number | null
          logo_url: string | null
          marketing_materials: Json | null
          partnership_tier: string | null
          revenue_generated: number | null
          review_count: number | null
          service_areas: Json | null
          status: string | null
          updated_at: string | null
          verified_at: string | null
          website_url: string | null
        }
        Insert: {
          business_name: string
          business_type: string
          campaign_id?: string | null
          co_marketing_approved?: boolean | null
          commission_rate?: number | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          customer_rating?: number | null
          featured_on_platform?: boolean | null
          id?: string
          lead_cost?: number | null
          leads_converted?: number | null
          leads_received?: number | null
          logo_url?: string | null
          marketing_materials?: Json | null
          partnership_tier?: string | null
          revenue_generated?: number | null
          review_count?: number | null
          service_areas?: Json | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          website_url?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string
          campaign_id?: string | null
          co_marketing_approved?: boolean | null
          commission_rate?: number | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          customer_rating?: number | null
          featured_on_platform?: boolean | null
          id?: string
          lead_cost?: number | null
          leads_converted?: number | null
          leads_received?: number | null
          logo_url?: string | null
          marketing_materials?: Json | null
          partnership_tier?: string | null
          revenue_generated?: number | null
          review_count?: number | null
          service_areas?: Json | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_partners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "partner_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_demand_data: {
        Row: {
          available_listings: number | null
          avg_search_budget_max: number | null
          avg_search_budget_min: number | null
          avg_time_to_decision_days: number | null
          buyer_demographics: Json | null
          created_at: string
          demand_supply_ratio: number | null
          id: string
          inquiry_count: number | null
          location_area: string | null
          location_city: string
          median_offer_price: number | null
          offer_count: number | null
          popular_features: string[] | null
          price_trend_percentage: number | null
          property_type: string
          search_volume: number | null
          time_period: string
          viewing_requests: number | null
        }
        Insert: {
          available_listings?: number | null
          avg_search_budget_max?: number | null
          avg_search_budget_min?: number | null
          avg_time_to_decision_days?: number | null
          buyer_demographics?: Json | null
          created_at?: string
          demand_supply_ratio?: number | null
          id?: string
          inquiry_count?: number | null
          location_area?: string | null
          location_city: string
          median_offer_price?: number | null
          offer_count?: number | null
          popular_features?: string[] | null
          price_trend_percentage?: number | null
          property_type: string
          search_volume?: number | null
          time_period: string
          viewing_requests?: number | null
        }
        Update: {
          available_listings?: number | null
          avg_search_budget_max?: number | null
          avg_search_budget_min?: number | null
          avg_time_to_decision_days?: number | null
          buyer_demographics?: Json | null
          created_at?: string
          demand_supply_ratio?: number | null
          id?: string
          inquiry_count?: number | null
          location_area?: string | null
          location_city?: string
          median_offer_price?: number | null
          offer_count?: number | null
          popular_features?: string[] | null
          price_trend_percentage?: number | null
          property_type?: string
          search_volume?: number | null
          time_period?: string
          viewing_requests?: number | null
        }
        Relationships: []
      }
      carousel_settings: {
        Row: {
          auto_scroll: boolean | null
          carousel_name: string
          created_at: string | null
          id: string
          interval_ms: number | null
          is_enabled: boolean | null
          loop_mode: string | null
          pause_on_hover: boolean | null
          scroll_direction: string | null
          scroll_speed: number | null
          updated_at: string | null
        }
        Insert: {
          auto_scroll?: boolean | null
          carousel_name: string
          created_at?: string | null
          id?: string
          interval_ms?: number | null
          is_enabled?: boolean | null
          loop_mode?: string | null
          pause_on_hover?: boolean | null
          scroll_direction?: string | null
          scroll_speed?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_scroll?: boolean | null
          carousel_name?: string
          created_at?: string | null
          id?: string
          interval_ms?: number | null
          is_enabled?: boolean | null
          loop_mode?: string | null
          pause_on_hover?: boolean | null
          scroll_direction?: string | null
          scroll_speed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          level: number
          meta: Json
          name: string
          parent_id: string | null
          slug: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id: string
          is_active?: boolean | null
          level: number
          meta?: Json
          name: string
          parent_id?: string | null
          slug: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          level?: number
          meta?: Json
          name?: string
          parent_id?: string | null
          slug?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          edited_at: string | null
          id: string
          is_edited: boolean | null
          message: string
          message_type: string | null
          metadata: Json | null
          sender_id: string | null
          sender_name: string
          sender_type: string
          sent_at: string
          session_id: string
        }
        Insert: {
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message: string
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
          sender_name: string
          sender_type: string
          sent_at?: string
          session_id: string
        }
        Update: {
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message?: string
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
          sent_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_chat_messages_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_preferences: {
        Row: {
          auto_collapse_duration: number | null
          auto_collapse_enabled: boolean | null
          created_at: string
          custom_sounds: Json | null
          id: string
          pinned_actions: Json | null
          position: Json | null
          size: Json | null
          snap_sensitivity: number | null
          sound_mute: boolean | null
          updated_at: string
          user_id: string
          view_mode: string | null
        }
        Insert: {
          auto_collapse_duration?: number | null
          auto_collapse_enabled?: boolean | null
          created_at?: string
          custom_sounds?: Json | null
          id?: string
          pinned_actions?: Json | null
          position?: Json | null
          size?: Json | null
          snap_sensitivity?: number | null
          sound_mute?: boolean | null
          updated_at?: string
          user_id: string
          view_mode?: string | null
        }
        Update: {
          auto_collapse_duration?: number | null
          auto_collapse_enabled?: boolean | null
          created_at?: string
          custom_sounds?: Json | null
          id?: string
          pinned_actions?: Json | null
          position?: Json | null
          size?: Json | null
          snap_sensitivity?: number | null
          sound_mute?: boolean | null
          updated_at?: string
          user_id?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      cloudflare_audit_log: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          setting_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          setting_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          setting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloudflare_audit_log_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "cloudflare_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      cloudflare_settings: {
        Row: {
          account_id: string | null
          always_online: boolean | null
          always_use_https: boolean | null
          analytics_enabled: boolean | null
          api_email: string | null
          api_token: string | null
          auto_minify_css: boolean | null
          auto_minify_enabled: boolean | null
          auto_minify_html: boolean | null
          auto_minify_js: boolean | null
          automatic_https_rewrites: boolean | null
          brotli_enabled: boolean | null
          browser_cache_ttl: number | null
          cache_level: string | null
          cdn_enabled: boolean | null
          challenge_passage: number | null
          created_at: string | null
          ddos_protection: string | null
          development_mode: boolean | null
          early_hints: boolean | null
          edge_cache_ttl: number | null
          http2_enabled: boolean | null
          http3_enabled: boolean | null
          id: string
          image_optimization_quality: number | null
          image_resizing_enabled: boolean | null
          is_active: boolean | null
          mirage: boolean | null
          polish: string | null
          rate_limiting_enabled: boolean | null
          rocket_loader: boolean | null
          ssl_mode: string | null
          tls_version: string | null
          updated_at: string | null
          webp_enabled: boolean | null
          zone_id: string | null
        }
        Insert: {
          account_id?: string | null
          always_online?: boolean | null
          always_use_https?: boolean | null
          analytics_enabled?: boolean | null
          api_email?: string | null
          api_token?: string | null
          auto_minify_css?: boolean | null
          auto_minify_enabled?: boolean | null
          auto_minify_html?: boolean | null
          auto_minify_js?: boolean | null
          automatic_https_rewrites?: boolean | null
          brotli_enabled?: boolean | null
          browser_cache_ttl?: number | null
          cache_level?: string | null
          cdn_enabled?: boolean | null
          challenge_passage?: number | null
          created_at?: string | null
          ddos_protection?: string | null
          development_mode?: boolean | null
          early_hints?: boolean | null
          edge_cache_ttl?: number | null
          http2_enabled?: boolean | null
          http3_enabled?: boolean | null
          id?: string
          image_optimization_quality?: number | null
          image_resizing_enabled?: boolean | null
          is_active?: boolean | null
          mirage?: boolean | null
          polish?: string | null
          rate_limiting_enabled?: boolean | null
          rocket_loader?: boolean | null
          ssl_mode?: string | null
          tls_version?: string | null
          updated_at?: string | null
          webp_enabled?: boolean | null
          zone_id?: string | null
        }
        Update: {
          account_id?: string | null
          always_online?: boolean | null
          always_use_https?: boolean | null
          analytics_enabled?: boolean | null
          api_email?: string | null
          api_token?: string | null
          auto_minify_css?: boolean | null
          auto_minify_enabled?: boolean | null
          auto_minify_html?: boolean | null
          auto_minify_js?: boolean | null
          automatic_https_rewrites?: boolean | null
          brotli_enabled?: boolean | null
          browser_cache_ttl?: number | null
          cache_level?: string | null
          cdn_enabled?: boolean | null
          challenge_passage?: number | null
          created_at?: string | null
          ddos_protection?: string | null
          development_mode?: boolean | null
          early_hints?: boolean | null
          edge_cache_ttl?: number | null
          http2_enabled?: boolean | null
          http3_enabled?: boolean | null
          id?: string
          image_optimization_quality?: number | null
          image_resizing_enabled?: boolean | null
          is_active?: boolean | null
          mirage?: boolean | null
          polish?: string | null
          rate_limiting_enabled?: boolean | null
          rocket_loader?: boolean | null
          ssl_mode?: string | null
          tls_version?: string | null
          updated_at?: string | null
          webp_enabled?: boolean | null
          zone_id?: string | null
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: Json | null
          created_at: string | null
          featured_image: string | null
          id: string
          meta_data: Json | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: Json | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          meta_data?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: Json | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          meta_data?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_contributions: {
        Row: {
          content_id: string | null
          contribution_type: string
          created_at: string | null
          id: string
          points_earned: number
          quality_bonus: number | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          contribution_type: string
          created_at?: string | null
          id?: string
          points_earned: number
          quality_bonus?: number | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          contribution_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number
          quality_bonus?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          city: string
          cover_image_url: string | null
          created_at: string | null
          current_attendees: number | null
          description: string | null
          end_datetime: string | null
          event_type: string
          id: string
          is_featured: boolean | null
          is_free: boolean | null
          is_online: boolean | null
          latitude: number | null
          location_address: string | null
          location_name: string | null
          longitude: number | null
          max_attendees: number | null
          online_link: string | null
          organizer_id: string | null
          registration_deadline: string | null
          slug: string
          start_datetime: string
          state: string | null
          status: string | null
          tags: string[] | null
          ticket_price: number | null
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_datetime?: string | null
          event_type: string
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          is_online?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_attendees?: number | null
          online_link?: string | null
          organizer_id?: string | null
          registration_deadline?: string | null
          slug: string
          start_datetime: string
          state?: string | null
          status?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_datetime?: string | null
          event_type?: string
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          is_online?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_attendees?: number | null
          online_link?: string | null
          organizer_id?: string | null
          registration_deadline?: string | null
          slug?: string
          start_datetime?: string
          state?: string | null
          status?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_leaderboard: {
        Row: {
          answers_count: number | null
          badges_earned: Json | null
          created_at: string | null
          current_rank: number | null
          current_tier: string | null
          events_organized: number | null
          guides_count: number | null
          helpful_votes_received: number | null
          id: string
          last_contribution_at: string | null
          reviews_count: number | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers_count?: number | null
          badges_earned?: Json | null
          created_at?: string | null
          current_rank?: number | null
          current_tier?: string | null
          events_organized?: number | null
          guides_count?: number | null
          helpful_votes_received?: number | null
          id?: string
          last_contribution_at?: string | null
          reviews_count?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers_count?: number | null
          badges_earned?: Json | null
          created_at?: string | null
          current_rank?: number | null
          current_tier?: string | null
          events_organized?: number | null
          guides_count?: number | null
          helpful_votes_received?: number | null
          id?: string
          last_contribution_at?: string | null
          reviews_count?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_moderators: {
        Row: {
          assigned_categories: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string | null
          user_id: string
        }
        Insert: {
          assigned_categories?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          user_id: string
        }
        Update: {
          assigned_categories?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      concierge_packages: {
        Row: {
          add_on_services: Json | null
          commission_percentage: number
          created_at: string
          description: string | null
          display_order: number | null
          estimated_hours: number | null
          featured: boolean | null
          id: string
          included_services: Json
          is_active: boolean | null
          max_property_value: number | null
          min_property_value: number | null
          package_name: string
          package_tier: string
          terms_conditions: string | null
          updated_at: string
        }
        Insert: {
          add_on_services?: Json | null
          commission_percentage?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          featured?: boolean | null
          id?: string
          included_services: Json
          is_active?: boolean | null
          max_property_value?: number | null
          min_property_value?: number | null
          package_name: string
          package_tier: string
          terms_conditions?: string | null
          updated_at?: string
        }
        Update: {
          add_on_services?: Json | null
          commission_percentage?: number
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          featured?: boolean | null
          id?: string
          included_services?: Json
          is_active?: boolean | null
          max_property_value?: number | null
          min_property_value?: number | null
          package_name?: string
          package_tier?: string
          terms_conditions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      concierge_requests: {
        Row: {
          assigned_concierge: string | null
          budget_flexibility: string | null
          commission_amount: number | null
          completed_at: string | null
          confirmed_at: string | null
          consultation_date: string | null
          consultation_notes: string | null
          created_at: string
          feedback: string | null
          id: string
          package_id: string | null
          preferred_contact_method: string | null
          preferred_contact_time: string | null
          property_id: string | null
          property_value: number | null
          proposal_sent_at: string | null
          referral_source: string | null
          request_type: string
          satisfaction_rating: number | null
          services_requested: Json | null
          special_requirements: string | null
          status: string | null
          timeline: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_concierge?: string | null
          budget_flexibility?: string | null
          commission_amount?: number | null
          completed_at?: string | null
          confirmed_at?: string | null
          consultation_date?: string | null
          consultation_notes?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          package_id?: string | null
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          property_id?: string | null
          property_value?: number | null
          proposal_sent_at?: string | null
          referral_source?: string | null
          request_type: string
          satisfaction_rating?: number | null
          services_requested?: Json | null
          special_requirements?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_concierge?: string | null
          budget_flexibility?: string | null
          commission_amount?: number | null
          completed_at?: string | null
          confirmed_at?: string | null
          consultation_date?: string | null
          consultation_notes?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          package_id?: string | null
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          property_id?: string | null
          property_value?: number | null
          proposal_sent_at?: string | null
          referral_source?: string | null
          request_type?: string
          satisfaction_rating?: number | null
          services_requested?: Json | null
          special_requirements?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concierge_requests_assigned_concierge_fkey"
            columns: ["assigned_concierge"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_requests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "concierge_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_tasks: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          attachments: Json | null
          client_visible: boolean | null
          completed_date: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          notes: string | null
          priority: string | null
          request_id: string | null
          scheduled_date: string | null
          service_type: string
          status: string | null
          task_description: string | null
          task_name: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          client_visible?: boolean | null
          completed_date?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          priority?: string | null
          request_id?: string | null
          scheduled_date?: string | null
          service_type: string
          status?: string | null
          task_description?: string | null
          task_name: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          client_visible?: boolean | null
          completed_date?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          priority?: string | null
          request_id?: string | null
          scheduled_date?: string | null
          service_type?: string
          status?: string | null
          task_description?: string | null
          task_name?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concierge_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_tasks_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "concierge_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_team: {
        Row: {
          avatar_url: string | null
          avg_satisfaction_rating: number | null
          bio: string | null
          created_at: string
          current_active_clients: number | null
          email: string
          full_name: string
          id: string
          is_available: boolean | null
          languages: string[] | null
          max_active_clients: number | null
          phone: string | null
          role: string
          specializations: string[] | null
          total_clients_served: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          avg_satisfaction_rating?: number | null
          bio?: string | null
          created_at?: string
          current_active_clients?: number | null
          email: string
          full_name: string
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          max_active_clients?: number | null
          phone?: string | null
          role: string
          specializations?: string[] | null
          total_clients_served?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          avg_satisfaction_rating?: number | null
          bio?: string | null
          created_at?: string
          current_active_clients?: number | null
          email?: string
          full_name?: string
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          max_active_clients?: number | null
          phone?: string | null
          role?: string
          specializations?: string[] | null
          total_clients_served?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concierge_team_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_vendors: {
        Row: {
          avg_rating: number | null
          background_check: boolean | null
          base_rate: number | null
          certifications: string[] | null
          commission_rate: number | null
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          insurance_verified: boolean | null
          is_active: boolean | null
          is_preferred: boolean | null
          notes: string | null
          phone: string | null
          portfolio_url: string | null
          pricing_model: string | null
          service_areas: string[] | null
          total_jobs: number | null
          updated_at: string
          vendor_name: string
          vendor_type: string
          website_url: string | null
        }
        Insert: {
          avg_rating?: number | null
          background_check?: boolean | null
          base_rate?: number | null
          certifications?: string[] | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          insurance_verified?: boolean | null
          is_active?: boolean | null
          is_preferred?: boolean | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          pricing_model?: string | null
          service_areas?: string[] | null
          total_jobs?: number | null
          updated_at?: string
          vendor_name: string
          vendor_type: string
          website_url?: string | null
        }
        Update: {
          avg_rating?: number | null
          background_check?: boolean | null
          base_rate?: number | null
          certifications?: string[] | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          insurance_verified?: boolean | null
          is_active?: boolean | null
          is_preferred?: boolean | null
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          pricing_model?: string | null
          service_areas?: string[] | null
          total_jobs?: number | null
          updated_at?: string
          vendor_name?: string
          vendor_type?: string
          website_url?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          action_taken: string | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          moderator_id: string | null
          moderator_notes: string | null
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      core_team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          city: string | null
          country: string | null
          created_at: string | null
          department: Database["public"]["Enums"]["team_department"]
          email: string
          emergency_contact: Json | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          equipment_assigned: Json | null
          equity_percentage: number | null
          full_name: string
          github_username: string | null
          hire_date: string
          id: string
          is_team_lead: boolean | null
          job_title: string
          languages: string[] | null
          linkedin_url: string | null
          performance_score: number | null
          phone: string | null
          reports_to: string | null
          salary_range: string | null
          skills: string[] | null
          slack_id: string | null
          status: Database["public"]["Enums"]["team_member_status"] | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          working_hours: Json | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          department: Database["public"]["Enums"]["team_department"]
          email: string
          emergency_contact?: Json | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          equipment_assigned?: Json | null
          equity_percentage?: number | null
          full_name: string
          github_username?: string | null
          hire_date?: string
          id?: string
          is_team_lead?: boolean | null
          job_title: string
          languages?: string[] | null
          linkedin_url?: string | null
          performance_score?: number | null
          phone?: string | null
          reports_to?: string | null
          salary_range?: string | null
          skills?: string[] | null
          slack_id?: string | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          working_hours?: Json | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["team_department"]
          email?: string
          emergency_contact?: Json | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          equipment_assigned?: Json | null
          equity_percentage?: number | null
          full_name?: string
          github_username?: string | null
          hire_date?: string
          id?: string
          is_team_lead?: boolean | null
          job_title?: string
          languages?: string[] | null
          linkedin_url?: string | null
          performance_score?: number | null
          phone?: string | null
          reports_to?: string | null
          salary_range?: string | null
          skills?: string[] | null
          slack_id?: string | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "core_team_members_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "core_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "core_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      country_blocks: {
        Row: {
          blocked_at: string
          blocked_by: string | null
          country_code: string
          country_name: string
          created_at: string
          id: string
          is_active: boolean | null
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          blocked_by?: string | null
          country_code: string
          country_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          blocked_by?: string | null
          country_code?: string
          country_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      cs_automation_rules: {
        Row: {
          actions: Json
          created_at: string
          created_by: string | null
          execution_count: number | null
          id: string
          is_active: boolean
          rule_name: string
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          created_by?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          rule_name: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          created_by?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          rule_name?: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      cs_email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          subject: string
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          subject: string
          template_name: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          subject?: string
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cs_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          helpful_votes: number | null
          id: string
          is_published: boolean
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          helpful_votes?: number | null
          id?: string
          is_published?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          helpful_votes?: number | null
          id?: string
          is_published?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      cs_user_settings: {
        Row: {
          auto_assign_tickets: boolean
          created_at: string
          display_name: string
          email_notifications: boolean
          id: string
          status_message: string
          updated_at: string
          user_id: string
          working_hours: string
        }
        Insert: {
          auto_assign_tickets?: boolean
          created_at?: string
          display_name?: string
          email_notifications?: boolean
          id?: string
          status_message?: string
          updated_at?: string
          user_id: string
          working_hours?: string
        }
        Update: {
          auto_assign_tickets?: boolean
          created_at?: string
          display_name?: string
          email_notifications?: boolean
          id?: string
          status_message?: string
          updated_at?: string
          user_id?: string
          working_hours?: string
        }
        Relationships: []
      }
      customer_complaints: {
        Row: {
          assigned_to: string | null
          complaint_type: string
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          complaint_type: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          complaint_type?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_service_tickets: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          category: string | null
          created_at: string | null
          customer_id: string | null
          description: string
          id: string
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_service_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_service_tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_service_tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_response: string | null
          escalated_at: string | null
          escalated_to: string | null
          id: string
          internal_notes: string | null
          message: string
          metadata: Json | null
          priority: string
          resolved_at: string | null
          satisfaction_rating: number | null
          status: string
          subject: string
          tags: Json | null
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_response?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          internal_notes?: string | null
          message: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          status?: string
          subject: string
          tags?: Json | null
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_response?: string | null
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          internal_notes?: string | null
          message?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          status?: string
          subject?: string
          tags?: Json | null
          ticket_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          created_at: string
          date: string
          id: string
          new_users: number | null
          returning_users: number | null
          total_page_views: number | null
          total_searches: number | null
          total_visitors: number | null
          unique_visitors: number | null
          updated_at: string
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string
          date: string
          id?: string
          new_users?: number | null
          returning_users?: number | null
          total_page_views?: number | null
          total_searches?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          new_users?: number | null
          returning_users?: number | null
          total_page_views?: number | null
          total_searches?: number | null
          total_visitors?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      data_exchange_api_logs: {
        Row: {
          client_id: string | null
          created_at: string
          credits_used: number | null
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          request_params: Json | null
          response_status: number | null
          response_time_ms: number | null
          subscription_id: string | null
          user_agent: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          credits_used?: number | null
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          request_params?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          subscription_id?: string | null
          user_agent?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          credits_used?: number | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          request_params?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          subscription_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_exchange_api_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_exchange_api_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "research_data_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      data_licensing_agreements: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          data_categories: string[]
          end_date: string | null
          id: string
          license_fee: number
          license_type: string
          licensee_id: string | null
          organization_country: string | null
          organization_name: string
          payment_frequency: string | null
          restrictions: Json | null
          revenue_share_percentage: number | null
          signed_at: string | null
          signed_document_url: string | null
          start_date: string | null
          status: string | null
          territory: string[] | null
          updated_at: string
          usage_rights: Json | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          data_categories: string[]
          end_date?: string | null
          id?: string
          license_fee: number
          license_type: string
          licensee_id?: string | null
          organization_country?: string | null
          organization_name: string
          payment_frequency?: string | null
          restrictions?: Json | null
          revenue_share_percentage?: number | null
          signed_at?: string | null
          signed_document_url?: string | null
          start_date?: string | null
          status?: string | null
          territory?: string[] | null
          updated_at?: string
          usage_rights?: Json | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          data_categories?: string[]
          end_date?: string | null
          id?: string
          license_fee?: number
          license_type?: string
          licensee_id?: string | null
          organization_country?: string | null
          organization_name?: string
          payment_frequency?: string | null
          restrictions?: Json | null
          revenue_share_percentage?: number | null
          signed_at?: string | null
          signed_document_url?: string | null
          start_date?: string | null
          status?: string | null
          territory?: string[] | null
          updated_at?: string
          usage_rights?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "data_licensing_agreements_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_licensing_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_licensing_agreements_licensee_id_fkey"
            columns: ["licensee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      database_error_tracking: {
        Row: {
          created_at: string | null
          error_message: string
          error_severity: string
          error_signature: string
          error_type: string
          first_seen_at: string | null
          fix_applied: string | null
          id: string
          is_resolved: boolean | null
          last_seen_at: string | null
          metadata: Json | null
          occurrence_count: number | null
          resolved_at: string | null
          resolved_by: string | null
          suggested_fix: string | null
          table_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_severity?: string
          error_signature: string
          error_type: string
          first_seen_at?: string | null
          fix_applied?: string | null
          id?: string
          is_resolved?: boolean | null
          last_seen_at?: string | null
          metadata?: Json | null
          occurrence_count?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          suggested_fix?: string | null
          table_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_severity?: string
          error_signature?: string
          error_type?: string
          first_seen_at?: string | null
          fix_applied?: string | null
          id?: string
          is_resolved?: boolean | null
          last_seen_at?: string | null
          metadata?: Json | null
          occurrence_count?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          suggested_fix?: string | null
          table_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "database_error_tracking_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requirements: {
        Row: {
          accepted_formats: string[] | null
          category_filter: Json | null
          compliance_region: string
          description: string | null
          document_name: string
          document_type: string
          id: string
          is_required: boolean | null
          max_file_size_mb: number | null
          template_url: string | null
          validation_requirements: Json | null
          vendor_type: string
        }
        Insert: {
          accepted_formats?: string[] | null
          category_filter?: Json | null
          compliance_region: string
          description?: string | null
          document_name: string
          document_type: string
          id?: string
          is_required?: boolean | null
          max_file_size_mb?: number | null
          template_url?: string | null
          validation_requirements?: Json | null
          vendor_type: string
        }
        Update: {
          accepted_formats?: string[] | null
          category_filter?: Json | null
          compliance_region?: string
          description?: string | null
          document_name?: string
          document_type?: string
          id?: string
          is_required?: boolean | null
          max_file_size_mb?: number | null
          template_url?: string | null
          validation_requirements?: Json | null
          vendor_type?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_key: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_key?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          subject: string
          template_key: string
          template_name: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject: string
          template_key: string
          template_name: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject?: string
          template_key?: string
          template_name?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component_name: string | null
          created_at: string | null
          error_message: string | null
          error_page: string
          error_stack: string | null
          error_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          referrer_url: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip: unknown
        }
        Insert: {
          component_name?: string | null
          created_at?: string | null
          error_message?: string | null
          error_page: string
          error_stack?: string | null
          error_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip?: unknown
        }
        Update: {
          component_name?: string | null
          created_at?: string | null
          error_message?: string | null
          error_page?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip?: unknown
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          registration_type: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          registration_type?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          registration_type?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_cities: {
        Row: {
          city_name: string
          competitors: Json | null
          created_at: string
          current_agents: number | null
          current_listings: number | null
          current_monthly_transactions: number | null
          id: string
          launch_date: string | null
          localization_status: Json | null
          marketing_budget: number | null
          marketing_spent: number | null
          notes: string | null
          phase_id: string
          population: number | null
          property_market_size: number | null
          province: string
          status: string | null
          target_agents: number | null
          target_listings: number | null
          target_monthly_transactions: number | null
          updated_at: string
        }
        Insert: {
          city_name: string
          competitors?: Json | null
          created_at?: string
          current_agents?: number | null
          current_listings?: number | null
          current_monthly_transactions?: number | null
          id?: string
          launch_date?: string | null
          localization_status?: Json | null
          marketing_budget?: number | null
          marketing_spent?: number | null
          notes?: string | null
          phase_id: string
          population?: number | null
          property_market_size?: number | null
          province: string
          status?: string | null
          target_agents?: number | null
          target_listings?: number | null
          target_monthly_transactions?: number | null
          updated_at?: string
        }
        Update: {
          city_name?: string
          competitors?: Json | null
          created_at?: string
          current_agents?: number | null
          current_listings?: number | null
          current_monthly_transactions?: number | null
          id?: string
          launch_date?: string | null
          localization_status?: Json | null
          marketing_budget?: number | null
          marketing_spent?: number | null
          notes?: string | null
          phase_id?: string
          population?: number | null
          property_market_size?: number | null
          province?: string
          status?: string | null
          target_agents?: number | null
          target_listings?: number | null
          target_monthly_transactions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expansion_cities_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "expansion_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_competitors: {
        Row: {
          city_id: string
          competitor_name: string
          created_at: string
          estimated_listings: number | null
          id: string
          market_share: number | null
          notes: string | null
          pricing_model: string | null
          strengths: Json | null
          threat_level: string | null
          updated_at: string
          weaknesses: Json | null
          website_url: string | null
        }
        Insert: {
          city_id: string
          competitor_name: string
          created_at?: string
          estimated_listings?: number | null
          id?: string
          market_share?: number | null
          notes?: string | null
          pricing_model?: string | null
          strengths?: Json | null
          threat_level?: string | null
          updated_at?: string
          weaknesses?: Json | null
          website_url?: string | null
        }
        Update: {
          city_id?: string
          competitor_name?: string
          created_at?: string
          estimated_listings?: number | null
          id?: string
          market_share?: number | null
          notes?: string | null
          pricing_model?: string | null
          strengths?: Json | null
          threat_level?: string | null
          updated_at?: string
          weaknesses?: Json | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expansion_competitors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "expansion_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_marketing_campaigns: {
        Row: {
          actual_leads: number | null
          actual_reach: number | null
          budget: number
          campaign_name: string
          campaign_type: string | null
          channel: string | null
          city_id: string
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          roi_percentage: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          target_leads: number | null
          target_reach: number | null
          updated_at: string
        }
        Insert: {
          actual_leads?: number | null
          actual_reach?: number | null
          budget: number
          campaign_name: string
          campaign_type?: string | null
          channel?: string | null
          city_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          roi_percentage?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_leads?: number | null
          target_reach?: number | null
          updated_at?: string
        }
        Update: {
          actual_leads?: number | null
          actual_reach?: number | null
          budget?: number
          campaign_name?: string
          campaign_type?: string | null
          channel?: string | null
          city_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          roi_percentage?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_leads?: number | null
          target_reach?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expansion_marketing_campaigns_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "expansion_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_milestones: {
        Row: {
          assigned_to: string | null
          city_id: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          id: string
          milestone_name: string
          phase_id: string | null
          priority: string | null
          status: string | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          city_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          milestone_name: string
          phase_id?: string | null
          priority?: string | null
          status?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          city_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          milestone_name?: string
          phase_id?: string | null
          priority?: string | null
          status?: string | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expansion_milestones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "expansion_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expansion_milestones_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "expansion_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_phases: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          kpis: Json | null
          phase_name: string
          phase_number: number
          spent_budget: number | null
          start_date: string | null
          status: string | null
          target_market_share: number | null
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpis?: Json | null
          phase_name: string
          phase_number: number
          spent_budget?: number | null
          start_date?: string | null
          status?: string | null
          target_market_share?: number | null
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpis?: Json | null
          phase_name?: string
          phase_number?: number
          spent_budget?: number | null
          start_date?: string | null
          status?: string | null
          target_market_share?: number | null
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_ads: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          property_id: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          property_id?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          property_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_ads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_ads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_monitoring: {
        Row: {
          admin_response: string | null
          content: string
          created_at: string | null
          feedback_type: string
          id: string
          priority: string | null
          rating: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          content: string
          created_at?: string | null
          feedback_type: string
          id?: string
          priority?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          content?: string
          created_at?: string | null
          feedback_type?: string
          id?: string
          priority?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_monitoring_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      filter_analytics: {
        Row: {
          avg_price_max: number | null
          avg_price_min: number | null
          conversion_count: number | null
          created_at: string
          date: string
          id: string
          listing_type: string | null
          location: string | null
          property_type: string | null
          search_count: number | null
          updated_at: string
        }
        Insert: {
          avg_price_max?: number | null
          avg_price_min?: number | null
          conversion_count?: number | null
          created_at?: string
          date: string
          id?: string
          listing_type?: string | null
          location?: string | null
          property_type?: string | null
          search_count?: number | null
          updated_at?: string
        }
        Update: {
          avg_price_max?: number | null
          avg_price_min?: number | null
          conversion_count?: number | null
          created_at?: string
          date?: string
          id?: string
          listing_type?: string | null
          location?: string | null
          property_type?: string | null
          search_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      filter_sequences: {
        Row: {
          created_at: string
          current_filter_id: string | null
          id: string
          previous_filter_id: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_filter_id?: string | null
          id?: string
          previous_filter_id?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_filter_id?: string | null
          id?: string
          previous_filter_id?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      filter_usage: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          id: string
          last_used_at: string
          listing_type: string | null
          location: string | null
          price_max: number | null
          price_min: number | null
          property_types: string[] | null
          search_query: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          last_used_at?: string
          listing_type?: string | null
          location?: string | null
          price_max?: number | null
          price_min?: number | null
          property_types?: string[] | null
          search_query?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          last_used_at?: string
          listing_type?: string | null
          location?: string | null
          price_max?: number | null
          price_min?: number | null
          property_types?: string[] | null
          search_query?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_data_audit_log: {
        Row: {
          accessed_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          operation: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          operation: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          operation?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      first_time_user_bonuses: {
        Row: {
          bonus_amount: number
          bonus_code: string | null
          bonus_type: string | null
          campaign_id: string | null
          claimed: boolean | null
          claimed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          signup_campaign: string | null
          signup_source: string | null
          transaction_id: string | null
          used: boolean | null
          used_at: string | null
          used_for: string | null
          user_id: string | null
        }
        Insert: {
          bonus_amount?: number
          bonus_code?: string | null
          bonus_type?: string | null
          campaign_id?: string | null
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          signup_campaign?: string | null
          signup_source?: string | null
          transaction_id?: string | null
          used?: boolean | null
          used_at?: string | null
          used_for?: string | null
          user_id?: string | null
        }
        Update: {
          bonus_amount?: number
          bonus_code?: string | null
          bonus_type?: string | null
          campaign_id?: string | null
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          signup_campaign?: string | null
          signup_source?: string | null
          transaction_id?: string | null
          used?: boolean | null
          used_at?: string | null
          used_for?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "first_time_user_bonuses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "viral_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "first_time_user_bonuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foreign_investment_inquiries: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          inquiry_type: string
          message: string
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          inquiry_type: string
          message: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          inquiry_type?: string
          message?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      foreign_investment_orders: {
        Row: {
          created_at: string | null
          id: string
          investment_amount: number
          investment_timeline: string | null
          location_preference: string | null
          notes: string | null
          property_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_amount: number
          investment_timeline?: string | null
          location_preference?: string | null
          notes?: string | null
          property_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_amount?: number
          investment_timeline?: string | null
          location_preference?: string | null
          notes?: string | null
          property_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fraud_patterns: {
        Row: {
          auto_reject: boolean | null
          created_at: string | null
          detection_logic: Json
          id: string
          is_active: boolean | null
          pattern_name: string
          pattern_type: string
          risk_score: number
        }
        Insert: {
          auto_reject?: boolean | null
          created_at?: string | null
          detection_logic: Json
          id?: string
          is_active?: boolean | null
          pattern_name: string
          pattern_type: string
          risk_score: number
        }
        Update: {
          auto_reject?: boolean | null
          created_at?: string | null
          detection_logic?: Json
          id?: string
          is_active?: boolean | null
          pattern_name?: string
          pattern_type?: string
          risk_score?: number
        }
        Relationships: []
      }
      function_execution_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          executed_by: string | null
          execution_result: string | null
          execution_time_ms: number | null
          function_id: string | null
          id: string
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          execution_result?: string | null
          execution_time_ms?: number | null
          function_id?: string | null
          id?: string
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          execution_result?: string | null
          execution_time_ms?: number | null
          function_id?: string | null
          id?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "function_execution_logs_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "function_execution_logs_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "generated_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_functions: {
        Row: {
          complexity: string | null
          created_at: string | null
          created_by: string | null
          deployment_url: string | null
          function_category: string | null
          function_description: string | null
          function_name: string
          function_type: string
          generated_code: string
          id: string
          is_active: boolean | null
          is_deployed: boolean | null
          requirements: Json | null
          template_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          complexity?: string | null
          created_at?: string | null
          created_by?: string | null
          deployment_url?: string | null
          function_category?: string | null
          function_description?: string | null
          function_name: string
          function_type: string
          generated_code: string
          id?: string
          is_active?: boolean | null
          is_deployed?: boolean | null
          requirements?: Json | null
          template_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          complexity?: string | null
          created_at?: string | null
          created_by?: string | null
          deployment_url?: string | null
          function_category?: string | null
          function_description?: string | null
          function_name?: string
          function_type?: string
          generated_code?: string
          id?: string
          is_active?: boolean | null
          is_deployed?: boolean | null
          requirements?: Json | null
          template_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_functions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_deal_participants: {
        Row: {
          confirmed_at: string | null
          deal_id: string
          id: string
          joined_at: string | null
          quantity: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          deal_id: string
          id?: string
          joined_at?: string | null
          quantity?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          deal_id?: string
          id?: string
          joined_at?: string | null
          quantity?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_deal_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "group_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      group_deals: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          current_participants: number | null
          description: string | null
          discount_percentage: number | null
          end_date: string
          group_price: number | null
          id: string
          is_featured: boolean | null
          max_participants: number | null
          min_participants: number
          original_price: number | null
          provider_id: string | null
          provider_name: string | null
          slug: string
          start_date: string
          status: string | null
          target_cities: string[] | null
          target_neighborhoods: string[] | null
          terms_conditions: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          current_participants?: number | null
          description?: string | null
          discount_percentage?: number | null
          end_date: string
          group_price?: number | null
          id?: string
          is_featured?: boolean | null
          max_participants?: number | null
          min_participants: number
          original_price?: number | null
          provider_id?: string | null
          provider_name?: string | null
          slug: string
          start_date: string
          status?: string | null
          target_cities?: string[] | null
          target_neighborhoods?: string[] | null
          terms_conditions?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          current_participants?: number | null
          description?: string | null
          discount_percentage?: number | null
          end_date?: string
          group_price?: number | null
          id?: string
          is_featured?: boolean | null
          max_participants?: number | null
          min_participants?: number
          original_price?: number | null
          provider_id?: string | null
          provider_name?: string | null
          slug?: string
          start_date?: string
          status?: string | null
          target_cities?: string[] | null
          target_neighborhoods?: string[] | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_deals_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "local_service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_slider_settings: {
        Row: {
          animation_duration: number | null
          animation_type: string | null
          auto_play: boolean | null
          auto_play_delay: number | null
          button_text_en: string | null
          button_text_id: string | null
          created_at: string | null
          created_by: string | null
          desktop_height: number | null
          id: string
          image_desktop: string | null
          image_mobile: string | null
          image_tablet: string | null
          image_url: string
          is_active: boolean | null
          link_url: string | null
          mobile_height: number | null
          show_navigation: boolean | null
          show_on_desktop: boolean | null
          show_on_mobile: boolean | null
          show_on_tablet: boolean | null
          show_pagination: boolean | null
          slide_order: number
          subtitle_en: string | null
          subtitle_id: string | null
          tablet_height: number | null
          title_en: string | null
          title_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          animation_duration?: number | null
          animation_type?: string | null
          auto_play?: boolean | null
          auto_play_delay?: number | null
          button_text_en?: string | null
          button_text_id?: string | null
          created_at?: string | null
          created_by?: string | null
          desktop_height?: number | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          image_tablet?: string | null
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          mobile_height?: number | null
          show_navigation?: boolean | null
          show_on_desktop?: boolean | null
          show_on_mobile?: boolean | null
          show_on_tablet?: boolean | null
          show_pagination?: boolean | null
          slide_order: number
          subtitle_en?: string | null
          subtitle_id?: string | null
          tablet_height?: number | null
          title_en?: string | null
          title_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          animation_duration?: number | null
          animation_type?: string | null
          auto_play?: boolean | null
          auto_play_delay?: number | null
          button_text_en?: string | null
          button_text_id?: string | null
          created_at?: string | null
          created_by?: string | null
          desktop_height?: number | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          image_tablet?: string | null
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          mobile_height?: number | null
          show_navigation?: boolean | null
          show_on_desktop?: boolean | null
          show_on_mobile?: boolean | null
          show_on_tablet?: boolean | null
          show_pagination?: boolean | null
          slide_order?: number
          subtitle_en?: string | null
          subtitle_id?: string | null
          tablet_height?: number | null
          title_en?: string | null
          title_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      in_app_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          property_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          property_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          property_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      indonesian_business_categories: {
        Row: {
          category_code: string
          created_at: string | null
          description_en: string | null
          description_id: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          level: number
          name_en: string
          name_id: string
          parent_id: string | null
          required_licenses: Json | null
          vendor_type: string
        }
        Insert: {
          category_code: string
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level: number
          name_en: string
          name_id: string
          parent_id?: string | null
          required_licenses?: Json | null
          vendor_type: string
        }
        Update: {
          category_code?: string
          created_at?: string | null
          description_en?: string | null
          description_id?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          name_en?: string
          name_id?: string
          parent_id?: string | null
          required_licenses?: Json | null
          vendor_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "indonesian_business_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "indonesian_business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      indonesian_license_types: {
        Row: {
          created_at: string | null
          government_api_endpoint: string | null
          id: string
          is_active: boolean | null
          issuing_authority: string
          issuing_authority_id: string
          license_code: string
          license_name: string
          license_name_id: string
          renewal_required: boolean | null
          required_for_categories: Json | null
          validation_regex: string
          validity_period_months: number | null
          vendor_type: string
        }
        Insert: {
          created_at?: string | null
          government_api_endpoint?: string | null
          id?: string
          is_active?: boolean | null
          issuing_authority: string
          issuing_authority_id: string
          license_code: string
          license_name: string
          license_name_id: string
          renewal_required?: boolean | null
          required_for_categories?: Json | null
          validation_regex: string
          validity_period_months?: number | null
          vendor_type: string
        }
        Update: {
          created_at?: string | null
          government_api_endpoint?: string | null
          id?: string
          is_active?: boolean | null
          issuing_authority?: string
          issuing_authority_id?: string
          license_code?: string
          license_name?: string
          license_name_id?: string
          renewal_required?: boolean | null
          required_for_categories?: Json | null
          validation_regex?: string
          validity_period_months?: number | null
          vendor_type?: string
        }
        Relationships: []
      }
      indonesian_locations: {
        Row: {
          city_code: string | null
          city_name: string | null
          city_type: string | null
          created_at: string | null
          district_code: string | null
          district_name: string | null
          id: string
          is_active: boolean | null
          postal_code: string | null
          province_code: string
          province_name: string
          subdistrict_code: string | null
          subdistrict_name: string | null
        }
        Insert: {
          city_code?: string | null
          city_name?: string | null
          city_type?: string | null
          created_at?: string | null
          district_code?: string | null
          district_name?: string | null
          id?: string
          is_active?: boolean | null
          postal_code?: string | null
          province_code: string
          province_name: string
          subdistrict_code?: string | null
          subdistrict_name?: string | null
        }
        Update: {
          city_code?: string | null
          city_name?: string | null
          city_type?: string | null
          created_at?: string | null
          district_code?: string | null
          district_name?: string | null
          id?: string
          is_active?: boolean | null
          postal_code?: string | null
          province_code?: string
          province_name?: string
          subdistrict_code?: string | null
          subdistrict_name?: string | null
        }
        Relationships: []
      }
      indonesian_rejection_codes: {
        Row: {
          auto_resubmit_allowed: boolean | null
          category: string
          code: string
          created_at: string | null
          description_en: string
          description_id: string
          estimated_fix_time_hours: number | null
          is_active: boolean | null
          reason_en: string
          reason_id: string
          requires_document_upload: boolean | null
          resolution_steps_en: Json | null
          resolution_steps_id: Json | null
        }
        Insert: {
          auto_resubmit_allowed?: boolean | null
          category: string
          code: string
          created_at?: string | null
          description_en: string
          description_id: string
          estimated_fix_time_hours?: number | null
          is_active?: boolean | null
          reason_en: string
          reason_id: string
          requires_document_upload?: boolean | null
          resolution_steps_en?: Json | null
          resolution_steps_id?: Json | null
        }
        Update: {
          auto_resubmit_allowed?: boolean | null
          category?: string
          code?: string
          created_at?: string | null
          description_en?: string
          description_id?: string
          estimated_fix_time_hours?: number | null
          is_active?: boolean | null
          reason_en?: string
          reason_id?: string
          requires_document_upload?: boolean | null
          resolution_steps_en?: Json | null
          resolution_steps_id?: Json | null
        }
        Relationships: []
      }
      indonesian_validation_rules: {
        Row: {
          compliance_region: string | null
          created_at: string | null
          error_message_en: string
          error_message_id: string
          field_name: string
          field_name_id: string
          id: string
          is_active: boolean | null
          severity: string | null
          validation_logic: Json
          validation_type: string
          vendor_type: string
        }
        Insert: {
          compliance_region?: string | null
          created_at?: string | null
          error_message_en: string
          error_message_id: string
          field_name: string
          field_name_id: string
          id?: string
          is_active?: boolean | null
          severity?: string | null
          validation_logic: Json
          validation_type: string
          vendor_type: string
        }
        Update: {
          compliance_region?: string | null
          created_at?: string | null
          error_message_en?: string
          error_message_id?: string
          field_name?: string
          field_name_id?: string
          id?: string
          is_active?: boolean | null
          severity?: string | null
          validation_logic?: Json
          validation_type?: string
          vendor_type?: string
        }
        Relationships: []
      }
      innovation_experiment_events: {
        Row: {
          created_at: string | null
          event_type: string
          event_value: number | null
          experiment_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
          variant_name: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          event_value?: number | null
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          variant_name: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          event_value?: number | null
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_experiment_events_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "innovation_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_experiment_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_experiments: {
        Row: {
          confidence_level: number | null
          control_variant: Json
          created_at: string | null
          created_by: string | null
          current_sample_size: number | null
          description: string | null
          end_date: string | null
          feature_flag_id: string | null
          hypothesis: string | null
          id: string
          name: string
          primary_metric: string
          results: Json | null
          secondary_metrics: string[] | null
          start_date: string | null
          statistical_significance: number | null
          status: string
          target_sample_size: number | null
          test_variants: Json
          updated_at: string | null
          winner_variant: string | null
        }
        Insert: {
          confidence_level?: number | null
          control_variant?: Json
          created_at?: string | null
          created_by?: string | null
          current_sample_size?: number | null
          description?: string | null
          end_date?: string | null
          feature_flag_id?: string | null
          hypothesis?: string | null
          id?: string
          name: string
          primary_metric: string
          results?: Json | null
          secondary_metrics?: string[] | null
          start_date?: string | null
          statistical_significance?: number | null
          status?: string
          target_sample_size?: number | null
          test_variants?: Json
          updated_at?: string | null
          winner_variant?: string | null
        }
        Update: {
          confidence_level?: number | null
          control_variant?: Json
          created_at?: string | null
          created_by?: string | null
          current_sample_size?: number | null
          description?: string | null
          end_date?: string | null
          feature_flag_id?: string | null
          hypothesis?: string | null
          id?: string
          name?: string
          primary_metric?: string
          results?: Json | null
          secondary_metrics?: string[] | null
          start_date?: string | null
          statistical_significance?: number | null
          status?: string
          target_sample_size?: number | null
          test_variants?: Json
          updated_at?: string | null
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_experiments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_experiments_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "innovation_feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_feature_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          flag_key: string
          flag_type: string
          id: string
          is_enabled: boolean | null
          name: string
          percentage_rollout: number | null
          targeting_rules: Json | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flag_key: string
          flag_type?: string
          id?: string
          is_enabled?: boolean | null
          name: string
          percentage_rollout?: number | null
          targeting_rules?: Json | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flag_key?: string
          flag_type?: string
          id?: string
          is_enabled?: boolean | null
          name?: string
          percentage_rollout?: number | null
          targeting_rules?: Json | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_feature_flags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_feature_metrics: {
        Row: {
          active_users: number | null
          adoption_rate: number | null
          avg_session_duration: number | null
          conversion_rate: number | null
          date: string
          feature_flag_id: string | null
          id: string
          retention_day1: number | null
          retention_day30: number | null
          retention_day7: number | null
          revenue_impact: number | null
          total_users: number | null
        }
        Insert: {
          active_users?: number | null
          adoption_rate?: number | null
          avg_session_duration?: number | null
          conversion_rate?: number | null
          date?: string
          feature_flag_id?: string | null
          id?: string
          retention_day1?: number | null
          retention_day30?: number | null
          retention_day7?: number | null
          revenue_impact?: number | null
          total_users?: number | null
        }
        Update: {
          active_users?: number | null
          adoption_rate?: number | null
          avg_session_duration?: number | null
          conversion_rate?: number | null
          date?: string
          feature_flag_id?: string | null
          id?: string
          retention_day1?: number | null
          retention_day30?: number | null
          retention_day7?: number | null
          revenue_impact?: number | null
          total_users?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_feature_metrics_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "innovation_feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_user_assignments: {
        Row: {
          assigned_at: string | null
          device_id: string | null
          experiment_id: string | null
          id: string
          session_id: string | null
          user_id: string | null
          variant_name: string
        }
        Insert: {
          assigned_at?: string | null
          device_id?: string | null
          experiment_id?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          variant_name: string
        }
        Update: {
          assigned_at?: string | null
          device_id?: string | null
          experiment_id?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_user_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "innovation_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_user_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_user_feedback: {
        Row: {
          created_at: string | null
          description: string | null
          experiment_id: string | null
          feature_flag_id: string | null
          feedback_type: string
          id: string
          priority: string | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          screenshot_urls: string[] | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          experiment_id?: string | null
          feature_flag_id?: string | null
          feedback_type: string
          id?: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          screenshot_urls?: string[] | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          experiment_id?: string | null
          feature_flag_id?: string | null
          feedback_type?: string
          id?: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          screenshot_urls?: string[] | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_user_feedback_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "innovation_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_user_feedback_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "innovation_feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_user_feedback_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_response: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          department: string | null
          id: string
          inquiry_type: string
          message: string
          property_id: string | null
          responded_at: string | null
          responded_by: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          inquiry_type: string
          message: string
          property_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          inquiry_type?: string
          message?: string
          property_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_deal_access: {
        Row: {
          access_type: string | null
          created_at: string
          deal_id: string | null
          expressed_interest: boolean | null
          id: string
          interest_amount: number | null
          investor_id: string | null
          nda_document_url: string | null
          nda_signed_at: string | null
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          created_at?: string
          deal_id?: string | null
          expressed_interest?: boolean | null
          id?: string
          interest_amount?: number | null
          investor_id?: string | null
          nda_document_url?: string | null
          nda_signed_at?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          created_at?: string
          deal_id?: string | null
          expressed_interest?: boolean | null
          id?: string
          interest_amount?: number | null
          investor_id?: string | null
          nda_document_url?: string | null
          nda_signed_at?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_deal_access_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "off_market_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deal_access_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          country_of_residence: string | null
          created_at: string
          eligibility_score: number | null
          has_completed_eligibility_check: boolean | null
          id: string
          investment_budget_max: number | null
          investment_budget_min: number | null
          investment_timeline: string | null
          investor_type: string
          nationality: string | null
          notes: string | null
          preferred_locations: string[] | null
          preferred_property_types: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country_of_residence?: string | null
          created_at?: string
          eligibility_score?: number | null
          has_completed_eligibility_check?: boolean | null
          id?: string
          investment_budget_max?: number | null
          investment_budget_min?: number | null
          investment_timeline?: string | null
          investor_type: string
          nationality?: string | null
          notes?: string | null
          preferred_locations?: string[] | null
          preferred_property_types?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country_of_residence?: string | null
          created_at?: string
          eligibility_score?: number | null
          has_completed_eligibility_check?: boolean | null
          id?: string
          investment_budget_max?: number | null
          investment_budget_min?: number | null
          investment_timeline?: string | null
          investor_type?: string
          nationality?: string | null
          notes?: string | null
          preferred_locations?: string[] | null
          preferred_property_types?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          booking_id: string
          created_at: string
          due_date: string
          id: string
          invoice_data: Json
          invoice_number: string
          issue_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          due_date: string
          id?: string
          invoice_data: Json
          invoice_number: string
          issue_date: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_data?: Json
          invoice_number?: string
          issue_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "rental_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_blocks: {
        Row: {
          block_count: number | null
          blocked_at: string
          blocked_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          ip_address: unknown
          is_permanent: boolean | null
          reason: string | null
        }
        Insert: {
          block_count?: number | null
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address: unknown
          is_permanent?: boolean | null
          reason?: string | null
        }
        Update: {
          block_count?: number | null
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_permanent?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      keyword_rank_history: {
        Row: {
          clicks: number | null
          created_at: string
          ctr: number | null
          id: string
          impressions: number | null
          keyword: string
          keyword_id: string | null
          position: number | null
          recorded_at: string
          search_volume: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          keyword: string
          keyword_id?: string | null
          position?: number | null
          recorded_at?: string
          search_volume?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          keyword?: string
          keyword_id?: string | null
          position?: number | null
          recorded_at?: string
          search_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_rank_history_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "seo_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string
          document_expiry: string | null
          document_image_url: string | null
          document_number: string | null
          document_type: string | null
          expires_at: string | null
          extracted_data: Json | null
          face_match_passed: boolean | null
          face_match_score: number | null
          id: string
          liveness_passed: boolean | null
          liveness_score: number | null
          provider: string | null
          provider_reference_id: string | null
          provider_response: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_image_url: string | null
          status: string
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string
          document_expiry?: string | null
          document_image_url?: string | null
          document_number?: string | null
          document_type?: string | null
          expires_at?: string | null
          extracted_data?: Json | null
          face_match_passed?: boolean | null
          face_match_score?: number | null
          id?: string
          liveness_passed?: boolean | null
          liveness_score?: number | null
          provider?: string | null
          provider_reference_id?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          created_at?: string
          document_expiry?: string | null
          document_image_url?: string | null
          document_number?: string | null
          document_type?: string | null
          expires_at?: string | null
          extracted_data?: Json | null
          face_match_passed?: boolean | null
          face_match_score?: number | null
          id?: string
          liveness_passed?: boolean | null
          liveness_score?: number | null
          provider?: string | null
          provider_reference_id?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      leaderboard_snapshots: {
        Row: {
          area: string | null
          category: string
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          period_type: string
          rankings: Json
        }
        Insert: {
          area?: string | null
          category: string
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          period_type: string
          rankings: Json
        }
        Update: {
          area?: string | null
          category?: string
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          rankings?: Json
        }
        Relationships: []
      }
      learned_preferences: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          decay_factor: number | null
          id: string
          last_reinforced_at: string | null
          pattern_key: string
          pattern_type: string
          pattern_value: Json
          sample_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          decay_factor?: number | null
          id?: string
          last_reinforced_at?: string | null
          pattern_key: string
          pattern_type: string
          pattern_value: Json
          sample_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          decay_factor?: number | null
          id?: string
          last_reinforced_at?: string | null
          pattern_key?: string
          pattern_type?: string
          pattern_value?: Json
          sample_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      listing_automation_config: {
        Row: {
          ai_description_enhancement: boolean | null
          ai_duplicate_detection: boolean | null
          ai_photo_scoring: boolean | null
          ai_price_suggestion: boolean | null
          auto_approve_threshold: number | null
          auto_approved: number | null
          auto_syndicate: boolean | null
          auto_validate: boolean | null
          created_at: string
          id: string
          manual_review: number | null
          manual_review_threshold: number | null
          property_type: string
          rejected: number | null
          required_fields: string[] | null
          required_images: number | null
          syndication_delay_hours: number | null
          syndication_networks: string[] | null
          total_processed: number | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          ai_description_enhancement?: boolean | null
          ai_duplicate_detection?: boolean | null
          ai_photo_scoring?: boolean | null
          ai_price_suggestion?: boolean | null
          auto_approve_threshold?: number | null
          auto_approved?: number | null
          auto_syndicate?: boolean | null
          auto_validate?: boolean | null
          created_at?: string
          id?: string
          manual_review?: number | null
          manual_review_threshold?: number | null
          property_type: string
          rejected?: number | null
          required_fields?: string[] | null
          required_images?: number | null
          syndication_delay_hours?: number | null
          syndication_networks?: string[] | null
          total_processed?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          ai_description_enhancement?: boolean | null
          ai_duplicate_detection?: boolean | null
          ai_photo_scoring?: boolean | null
          ai_price_suggestion?: boolean | null
          auto_approve_threshold?: number | null
          auto_approved?: number | null
          auto_syndicate?: boolean | null
          auto_validate?: boolean | null
          created_at?: string
          id?: string
          manual_review?: number | null
          manual_review_threshold?: number | null
          property_type?: string
          rejected?: number | null
          required_fields?: string[] | null
          required_images?: number | null
          syndication_delay_hours?: number | null
          syndication_networks?: string[] | null
          total_processed?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      listing_competition_entries: {
        Row: {
          admin_notes: string | null
          campaign_id: string | null
          created_at: string
          description_score: number | null
          disqualified: boolean | null
          disqualified_reason: string | null
          engagement_score: number | null
          id: string
          listing_quality_score: number | null
          photo_count: number | null
          prize_amount: number | null
          prize_claimed: boolean | null
          prize_claimed_at: string | null
          property_id: string | null
          rank: number | null
          total_inquiries: number | null
          total_score: number | null
          total_views: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          campaign_id?: string | null
          created_at?: string
          description_score?: number | null
          disqualified?: boolean | null
          disqualified_reason?: string | null
          engagement_score?: number | null
          id?: string
          listing_quality_score?: number | null
          photo_count?: number | null
          prize_amount?: number | null
          prize_claimed?: boolean | null
          prize_claimed_at?: string | null
          property_id?: string | null
          rank?: number | null
          total_inquiries?: number | null
          total_score?: number | null
          total_views?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          campaign_id?: string | null
          created_at?: string
          description_score?: number | null
          disqualified?: boolean | null
          disqualified_reason?: string | null
          engagement_score?: number | null
          id?: string
          listing_quality_score?: number | null
          photo_count?: number | null
          prize_amount?: number | null
          prize_claimed?: boolean | null
          prize_claimed_at?: string | null
          property_id?: string | null
          rank?: number | null
          total_inquiries?: number | null
          total_score?: number | null
          total_views?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_competition_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "viral_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_competition_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_competition_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_competition_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_syndication_networks: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          commission_rate: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          listing_fee: number | null
          logo_url: string | null
          network_name: string
          network_type: string
          supported_property_types: string[] | null
          supported_regions: string[] | null
          sync_frequency_hours: number | null
          total_leads_received: number | null
          total_listings_shared: number | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          listing_fee?: number | null
          logo_url?: string | null
          network_name: string
          network_type: string
          supported_property_types?: string[] | null
          supported_regions?: string[] | null
          sync_frequency_hours?: number | null
          total_leads_received?: number | null
          total_listings_shared?: number | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          listing_fee?: number | null
          logo_url?: string | null
          network_name?: string
          network_type?: string
          supported_property_types?: string[] | null
          supported_regions?: string[] | null
          sync_frequency_hours?: number | null
          total_leads_received?: number | null
          total_listings_shared?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          metadata: Json | null
          sender_type: string
          sender_user_id: string | null
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          sender_type: string
          sender_user_id?: string | null
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          sender_type?: string
          sender_user_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_participants: {
        Row: {
          id: string
          is_online: boolean
          joined_at: string
          last_seen_at: string
          left_at: string | null
          participant_type: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          is_online?: boolean
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          participant_type: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          is_online?: boolean
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          participant_type?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_sessions: {
        Row: {
          agent_user_id: string | null
          created_at: string
          customer_email: string | null
          customer_ip: unknown
          customer_name: string
          customer_user_id: string | null
          ended_at: string | null
          id: string
          last_activity_at: string
          priority: string | null
          referrer_url: string | null
          started_at: string
          status: string
          subject: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          agent_user_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_ip?: unknown
          customer_name?: string
          customer_user_id?: string | null
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          priority?: string | null
          referrer_url?: string | null
          started_at?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          agent_user_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_ip?: unknown
          customer_name?: string
          customer_user_id?: string | null
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          priority?: string | null
          referrer_url?: string | null
          started_at?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      load_test_results: {
        Row: {
          average_response_time: number
          concurrency: number
          created_at: string | null
          created_by: string | null
          error_rate: number
          errors: Json | null
          failed_requests: number
          id: string
          max_response_time: number
          min_response_time: number
          p50_response_time: number
          p95_response_time: number
          p99_response_time: number
          requests_per_second: number
          successful_requests: number
          target_url: string | null
          test_duration: number
          test_type: string
          total_requests: number
        }
        Insert: {
          average_response_time: number
          concurrency: number
          created_at?: string | null
          created_by?: string | null
          error_rate: number
          errors?: Json | null
          failed_requests: number
          id?: string
          max_response_time: number
          min_response_time: number
          p50_response_time: number
          p95_response_time: number
          p99_response_time: number
          requests_per_second: number
          successful_requests: number
          target_url?: string | null
          test_duration: number
          test_type: string
          total_requests: number
        }
        Update: {
          average_response_time?: number
          concurrency?: number
          created_at?: string | null
          created_by?: string | null
          error_rate?: number
          errors?: Json | null
          failed_requests?: number
          id?: string
          max_response_time?: number
          min_response_time?: number
          p50_response_time?: number
          p95_response_time?: number
          p99_response_time?: number
          requests_per_second?: number
          successful_requests?: number
          target_url?: string | null
          test_duration?: number
          test_type?: string
          total_requests?: number
        }
        Relationships: []
      }
      local_experts: {
        Row: {
          avatar_url: string | null
          avg_deal_value: number | null
          bio: string | null
          certifications: string[] | null
          city: string
          commission_rate: number | null
          commission_tier: string | null
          conversion_rate: number | null
          created_at: string | null
          districts: string[] | null
          email: string
          expert_type: string | null
          expertise_areas: string[] | null
          full_name: string
          id: string
          languages: string[] | null
          leads_converted: number | null
          leads_generated: number | null
          paid_commission: number | null
          pending_commission: number | null
          phone: string | null
          properties_toured: number | null
          rating: number | null
          response_time_hours: number | null
          review_count: number | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["team_member_status"] | null
          total_commission_earned: number | null
          total_deals_closed: number | null
          updated_at: string | null
          user_id: string | null
          verification_documents: Json | null
          verified_at: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          avg_deal_value?: number | null
          bio?: string | null
          certifications?: string[] | null
          city: string
          commission_rate?: number | null
          commission_tier?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          districts?: string[] | null
          email: string
          expert_type?: string | null
          expertise_areas?: string[] | null
          full_name: string
          id?: string
          languages?: string[] | null
          leads_converted?: number | null
          leads_generated?: number | null
          paid_commission?: number | null
          pending_commission?: number | null
          phone?: string | null
          properties_toured?: number | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          total_commission_earned?: number | null
          total_deals_closed?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
          verified_at?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          avg_deal_value?: number | null
          bio?: string | null
          certifications?: string[] | null
          city?: string
          commission_rate?: number | null
          commission_tier?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          districts?: string[] | null
          email?: string
          expert_type?: string | null
          expertise_areas?: string[] | null
          full_name?: string
          id?: string
          languages?: string[] | null
          leads_converted?: number | null
          leads_generated?: number | null
          paid_commission?: number | null
          pending_commission?: number | null
          phone?: string | null
          properties_toured?: number | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          total_commission_earned?: number | null
          total_deals_closed?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
          verified_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "local_experts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      local_service_providers: {
        Row: {
          address: string | null
          business_name: string
          category: string
          certifications: string[] | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          operating_hours: Json | null
          owner_id: string | null
          price_range: string | null
          rating_avg: number | null
          review_count: number | null
          service_areas: string[] | null
          services_offered: Json | null
          slug: string
          state: string | null
          status: string | null
          subcategory: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category: string
          certifications?: string[] | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          operating_hours?: Json | null
          owner_id?: string | null
          price_range?: string | null
          rating_avg?: number | null
          review_count?: number | null
          service_areas?: string[] | null
          services_offered?: Json | null
          slug: string
          state?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          certifications?: string[] | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          operating_hours?: Json | null
          owner_id?: string | null
          price_range?: string | null
          rating_avg?: number | null
          review_count?: number | null
          service_areas?: string[] | null
          services_offered?: Json | null
          slug?: string
          state?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      location_admin_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          area_km2: number | null
          area_name: string
          city_code: string
          city_name: string
          city_type: string
          coordinates: unknown
          created_at: string | null
          district_code: string | null
          district_name: string | null
          id: string
          is_active: boolean | null
          is_capital: boolean | null
          population: number | null
          postal_code: string | null
          province_code: string
          province_name: string
          subdistrict_code: string | null
          subdistrict_name: string | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          area_name: string
          city_code: string
          city_name: string
          city_type?: string
          coordinates?: unknown
          created_at?: string | null
          district_code?: string | null
          district_name?: string | null
          id?: string
          is_active?: boolean | null
          is_capital?: boolean | null
          population?: number | null
          postal_code?: string | null
          province_code: string
          province_name: string
          subdistrict_code?: string | null
          subdistrict_name?: string | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          area_name?: string
          city_code?: string
          city_name?: string
          city_type?: string
          coordinates?: unknown
          created_at?: string | null
          district_code?: string | null
          district_name?: string | null
          id?: string
          is_active?: boolean | null
          is_capital?: boolean | null
          population?: number | null
          postal_code?: string | null
          province_code?: string
          province_name?: string
          subdistrict_code?: string | null
          subdistrict_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          blocked: boolean | null
          created_at: string | null
          device_fingerprint: string | null
          email: string | null
          geolocation: Json | null
          id: string
          ip_address: unknown
          risk_score: number | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt_time?: string
          blocked?: boolean | null
          created_at?: string | null
          device_fingerprint?: string | null
          email?: string | null
          geolocation?: Json | null
          id?: string
          ip_address: unknown
          risk_score?: number | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_time?: string
          blocked?: boolean | null
          created_at?: string | null
          device_fingerprint?: string | null
          email?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown
          risk_score?: number | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      market_trend_factors: {
        Row: {
          avg_days_on_market: number | null
          created_at: string | null
          demand_score: number | null
          id: string
          location: string
          period_end: string
          period_start: string
          price_trend: number | null
          property_type: string | null
          seasonality_factor: number | null
        }
        Insert: {
          avg_days_on_market?: number | null
          created_at?: string | null
          demand_score?: number | null
          id?: string
          location: string
          period_end: string
          period_start: string
          price_trend?: number | null
          property_type?: string | null
          seasonality_factor?: number | null
        }
        Update: {
          avg_days_on_market?: number | null
          created_at?: string | null
          demand_score?: number | null
          id?: string
          location?: string
          period_end?: string
          period_start?: string
          price_trend?: number | null
          property_type?: string | null
          seasonality_factor?: number | null
        }
        Relationships: []
      }
      market_trends: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          property_type: string | null
          trend_type: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          property_type?: string | null
          trend_type: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          property_type?: string | null
          trend_type?: string
          value?: string
        }
        Relationships: []
      }
      media_analytics: {
        Row: {
          channel: string
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
        }
        Insert: {
          channel: string
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
        }
        Update: {
          channel?: string
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      media_event_registrations: {
        Row: {
          check_in_status: string | null
          checked_in_at: string | null
          company: string | null
          created_at: string
          dietary_requirements: string | null
          email: string
          event_id: string
          full_name: string
          id: string
          job_title: string | null
          payment_reference: string | null
          payment_status: string | null
          phone: string | null
          questions: Json | null
          registration_source: string | null
          ticket_price: number | null
          ticket_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          check_in_status?: string | null
          checked_in_at?: string | null
          company?: string | null
          created_at?: string
          dietary_requirements?: string | null
          email: string
          event_id: string
          full_name: string
          id?: string
          job_title?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          questions?: Json | null
          registration_source?: string | null
          ticket_price?: number | null
          ticket_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          check_in_status?: string | null
          checked_in_at?: string | null
          company?: string | null
          created_at?: string
          dietary_requirements?: string | null
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          job_title?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          questions?: Json | null
          registration_source?: string | null
          ticket_price?: number | null
          ticket_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "media_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_events: {
        Row: {
          agenda: Json | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          current_attendees: number | null
          description: string | null
          end_datetime: string
          event_type: string
          format: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          max_attendees: number | null
          registration_open: boolean | null
          slug: string
          speakers: Json | null
          sponsors: Json | null
          start_datetime: string
          ticket_tiers: Json | null
          timezone: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_city: string | null
          venue_name: string | null
          virtual_link: string | null
          virtual_platform: string | null
        }
        Insert: {
          agenda?: Json | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_datetime: string
          event_type?: string
          format?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          max_attendees?: number | null
          registration_open?: boolean | null
          slug: string
          speakers?: Json | null
          sponsors?: Json | null
          start_datetime: string
          ticket_tiers?: Json | null
          timezone?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_city?: string | null
          venue_name?: string | null
          virtual_link?: string | null
          virtual_platform?: string | null
        }
        Update: {
          agenda?: Json | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_datetime?: string
          event_type?: string
          format?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          max_attendees?: number | null
          registration_open?: boolean | null
          slug?: string
          speakers?: Json | null
          sponsors?: Json | null
          start_datetime?: string
          ticket_tiers?: Json | null
          timezone?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_city?: string | null
          venue_name?: string | null
          virtual_link?: string | null
          virtual_platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_newsletter_campaigns: {
        Row: {
          campaign_type: string | null
          content_html: string | null
          content_json: Json | null
          created_at: string
          created_by: string | null
          id: string
          preview_text: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          target_tier: string | null
          total_bounced: number | null
          total_clicked: number | null
          total_delivered: number | null
          total_opened: number | null
          total_recipients: number | null
          total_unsubscribed: number | null
          updated_at: string
        }
        Insert: {
          campaign_type?: string | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          preview_text?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          target_tier?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
        }
        Update: {
          campaign_type?: string | null
          content_html?: string | null
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          preview_text?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          target_tier?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_unsubscribed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_newsletter_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_email_opened_at: string | null
          last_email_sent_at: string | null
          preferences: Json | null
          referral_code: string | null
          source: string | null
          subscriber_tier: string | null
          total_emails_opened: number | null
          total_emails_sent: number | null
          total_links_clicked: number | null
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_email_opened_at?: string | null
          last_email_sent_at?: string | null
          preferences?: Json | null
          referral_code?: string | null
          source?: string | null
          subscriber_tier?: string | null
          total_emails_opened?: number | null
          total_emails_sent?: number | null
          total_links_clicked?: number | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_email_opened_at?: string | null
          last_email_sent_at?: string | null
          preferences?: Json | null
          referral_code?: string | null
          source?: string | null
          subscriber_tier?: string | null
          total_emails_opened?: number | null
          total_emails_sent?: number | null
          total_links_clicked?: number | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_newsletter_subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_podcast_episodes: {
        Row: {
          apple_podcasts_url: string | null
          audio_url: string | null
          created_at: string
          description: string | null
          downloads_count: number | null
          duration_seconds: number | null
          episode_number: number
          guest_company: string | null
          guest_name: string | null
          guest_photo_url: string | null
          guest_title: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          listens_count: number | null
          published_at: string | null
          season: number | null
          show_notes: string | null
          spotify_url: string | null
          title: string
          topics: string[] | null
          transcript: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          apple_podcasts_url?: string | null
          audio_url?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          duration_seconds?: number | null
          episode_number: number
          guest_company?: string | null
          guest_name?: string | null
          guest_photo_url?: string | null
          guest_title?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          listens_count?: number | null
          published_at?: string | null
          season?: number | null
          show_notes?: string | null
          spotify_url?: string | null
          title: string
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          apple_podcasts_url?: string | null
          audio_url?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          duration_seconds?: number | null
          episode_number?: number
          guest_company?: string | null
          guest_name?: string | null
          guest_photo_url?: string | null
          guest_title?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          listens_count?: number | null
          published_at?: string | null
          season?: number | null
          show_notes?: string | null
          spotify_url?: string | null
          title?: string
          topics?: string[] | null
          transcript?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      media_research_reports: {
        Row: {
          access_tier: string | null
          author_id: string | null
          cover_image_url: string | null
          created_at: string
          data_visualization: Json | null
          downloads_count: number | null
          executive_summary: string | null
          full_content: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          key_findings: Json | null
          locations: string[] | null
          methodology: string | null
          pdf_url: string | null
          price_idr: number | null
          property_types: string[] | null
          published_at: string | null
          report_type: string
          slug: string
          time_period: string | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          access_tier?: string | null
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          data_visualization?: Json | null
          downloads_count?: number | null
          executive_summary?: string | null
          full_content?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          key_findings?: Json | null
          locations?: string[] | null
          methodology?: string | null
          pdf_url?: string | null
          price_idr?: number | null
          property_types?: string[] | null
          published_at?: string | null
          report_type?: string
          slug: string
          time_period?: string | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          access_tier?: string | null
          author_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          data_visualization?: Json | null
          downloads_count?: number | null
          executive_summary?: string | null
          full_content?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          key_findings?: Json | null
          locations?: string[] | null
          methodology?: string | null
          pdf_url?: string | null
          price_idr?: number | null
          property_types?: string[] | null
          published_at?: string | null
          report_type?: string
          slug?: string
          time_period?: string | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_research_reports_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_sponsorships: {
        Row: {
          amount_idr: number
          amount_paid: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_url: string | null
          created_at: string
          deliverables: Json | null
          deliverables_completed: Json | null
          end_date: string
          id: string
          is_active: boolean | null
          notes: string | null
          package_details: Json | null
          payment_status: string | null
          sponsor_logo_url: string | null
          sponsor_name: string
          sponsor_website: string | null
          sponsorship_tier: string | null
          sponsorship_type: string
          start_date: string
          updated_at: string
        }
        Insert: {
          amount_idr: number
          amount_paid?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_url?: string | null
          created_at?: string
          deliverables?: Json | null
          deliverables_completed?: Json | null
          end_date: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          package_details?: Json | null
          payment_status?: string | null
          sponsor_logo_url?: string | null
          sponsor_name: string
          sponsor_website?: string | null
          sponsorship_tier?: string | null
          sponsorship_type?: string
          start_date: string
          updated_at?: string
        }
        Update: {
          amount_idr?: number
          amount_paid?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_url?: string | null
          created_at?: string
          deliverables?: Json | null
          deliverables_completed?: Json | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          package_details?: Json | null
          payment_status?: string | null
          sponsor_logo_url?: string | null
          sponsor_name?: string
          sponsor_website?: string | null
          sponsorship_tier?: string | null
          sponsorship_type?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_targets: {
        Row: {
          best_pitch_time: string | null
          created_at: string
          domain_authority: number | null
          id: string
          key_contacts: Json | null
          monthly_visitors: number | null
          notes: string | null
          past_coverage_count: number | null
          pitch_angle: string | null
          priority_score: number | null
          publication_name: string
          publication_type: string
          status: string | null
          target_topics: string[] | null
          tier: string | null
          updated_at: string
        }
        Insert: {
          best_pitch_time?: string | null
          created_at?: string
          domain_authority?: number | null
          id?: string
          key_contacts?: Json | null
          monthly_visitors?: number | null
          notes?: string | null
          past_coverage_count?: number | null
          pitch_angle?: string | null
          priority_score?: number | null
          publication_name: string
          publication_type: string
          status?: string | null
          target_topics?: string[] | null
          tier?: string | null
          updated_at?: string
        }
        Update: {
          best_pitch_time?: string | null
          created_at?: string
          domain_authority?: number | null
          id?: string
          key_contacts?: Json | null
          monthly_visitors?: number | null
          notes?: string | null
          past_coverage_count?: number | null
          pitch_angle?: string | null
          priority_score?: number | null
          publication_name?: string
          publication_type?: string
          status?: string | null
          target_topics?: string[] | null
          tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media_videos: {
        Row: {
          comments_count: number | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          likes_count: number | null
          property_id: string | null
          published_at: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_type: string
          views_count: number | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          property_id?: string | null
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_type?: string
          views_count?: number | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          property_id?: string | null
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_type?: string
          views_count?: number | null
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_videos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_videos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      message_automation_config: {
        Row: {
          ai_auto_translation: boolean | null
          ai_escalation_enabled: boolean | null
          ai_intent_detection: boolean | null
          ai_language_detection: boolean | null
          ai_sentiment_analysis: boolean | null
          ai_spam_detection: boolean | null
          auto_responded: number | null
          auto_response_delay_seconds: number | null
          auto_response_enabled: boolean | null
          avg_response_time_seconds: number | null
          channel_type: string
          created_at: string
          escalated: number | null
          escalation_keywords: string[] | null
          id: string
          priority_keywords: string[] | null
          response_templates: Json | null
          routing_rules: Json | null
          spam_blocked: number | null
          total_messages: number | null
          updated_at: string
        }
        Insert: {
          ai_auto_translation?: boolean | null
          ai_escalation_enabled?: boolean | null
          ai_intent_detection?: boolean | null
          ai_language_detection?: boolean | null
          ai_sentiment_analysis?: boolean | null
          ai_spam_detection?: boolean | null
          auto_responded?: number | null
          auto_response_delay_seconds?: number | null
          auto_response_enabled?: boolean | null
          avg_response_time_seconds?: number | null
          channel_type: string
          created_at?: string
          escalated?: number | null
          escalation_keywords?: string[] | null
          id?: string
          priority_keywords?: string[] | null
          response_templates?: Json | null
          routing_rules?: Json | null
          spam_blocked?: number | null
          total_messages?: number | null
          updated_at?: string
        }
        Update: {
          ai_auto_translation?: boolean | null
          ai_escalation_enabled?: boolean | null
          ai_intent_detection?: boolean | null
          ai_language_detection?: boolean | null
          ai_sentiment_analysis?: boolean | null
          ai_spam_detection?: boolean | null
          auto_responded?: number | null
          auto_response_delay_seconds?: number | null
          auto_response_enabled?: boolean | null
          avg_response_time_seconds?: number | null
          channel_type?: string
          created_at?: string
          escalated?: number | null
          escalation_keywords?: string[] | null
          id?: string
          priority_keywords?: string[] | null
          response_templates?: Json | null
          routing_rules?: Json | null
          spam_blocked?: number | null
          total_messages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_verified_at: string | null
          method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_verified_at?: string | null
          method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_verified_at?: string | null
          method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mobile_ar_sessions: {
        Row: {
          ar_framework: string | null
          created_at: string | null
          device_model: string | null
          furniture_items_placed: number | null
          id: string
          property_id: string | null
          screenshots_taken: number | null
          session_duration: number | null
          shared_to_social: boolean | null
          user_id: string | null
        }
        Insert: {
          ar_framework?: string | null
          created_at?: string | null
          device_model?: string | null
          furniture_items_placed?: number | null
          id?: string
          property_id?: string | null
          screenshots_taken?: number | null
          session_duration?: number | null
          shared_to_social?: boolean | null
          user_id?: string | null
        }
        Update: {
          ar_framework?: string | null
          created_at?: string | null
          device_model?: string | null
          furniture_items_placed?: number | null
          id?: string
          property_id?: string | null
          screenshots_taken?: number | null
          session_duration?: number | null
          shared_to_social?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_ar_sessions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_ar_sessions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_ar_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_auction_bids: {
        Row: {
          auction_id: string | null
          bid_amount: number
          bid_status: string | null
          bidder_id: string | null
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: unknown
          is_auto_bid: boolean | null
          max_auto_bid: number | null
        }
        Insert: {
          auction_id?: string | null
          bid_amount: number
          bid_status?: string | null
          bidder_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_auto_bid?: boolean | null
          max_auto_bid?: number | null
        }
        Update: {
          auction_id?: string | null
          bid_amount?: number
          bid_status?: string | null
          bidder_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_auto_bid?: boolean | null
          max_auto_bid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "mobile_live_auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_auction_bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_auction_watchers: {
        Row: {
          auction_id: string | null
          created_at: string | null
          id: string
          notify_ending: boolean | null
          notify_outbid: boolean | null
          notify_start: boolean | null
          user_id: string | null
        }
        Insert: {
          auction_id?: string | null
          created_at?: string | null
          id?: string
          notify_ending?: boolean | null
          notify_outbid?: boolean | null
          notify_start?: boolean | null
          user_id?: string | null
        }
        Update: {
          auction_id?: string | null
          created_at?: string | null
          id?: string
          notify_ending?: boolean | null
          notify_outbid?: boolean | null
          notify_start?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_auction_watchers_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "mobile_live_auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_auction_watchers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_pinned: boolean | null
          media_urls: string[] | null
          message_type: string | null
          neighborhood_id: string | null
          property_id: string | null
          reactions: Json | null
          read_by: string[] | null
          reply_to_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          media_urls?: string[] | null
          message_type?: string | null
          neighborhood_id?: string | null
          property_id?: string | null
          reactions?: Json | null
          read_by?: string[] | null
          reply_to_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          media_urls?: string[] | null
          message_type?: string | null
          neighborhood_id?: string | null
          property_id?: string | null
          reactions?: Json | null
          read_by?: string[] | null
          reply_to_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_chat_messages_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "mobile_neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_chat_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_chat_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "mobile_chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_iap_products: {
        Row: {
          app_store_id: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          play_store_id: string | null
          price_idr: number
          price_tier: string
          product_id: string
          product_type: string
        }
        Insert: {
          app_store_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          play_store_id?: string | null
          price_idr: number
          price_tier: string
          product_id: string
          product_type: string
        }
        Update: {
          app_store_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          play_store_id?: string | null
          price_idr?: number
          price_tier?: string
          product_id?: string
          product_type?: string
        }
        Relationships: []
      }
      mobile_iap_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          product_id: string | null
          receipt_data: string | null
          status: string | null
          store: string
          transaction_id: string | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          product_id?: string | null
          receipt_data?: string | null
          status?: string | null
          store: string
          transaction_id?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          product_id?: string | null
          receipt_data?: string | null
          status?: string | null
          store?: string
          transaction_id?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_iap_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mobile_iap_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_iap_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_journey_milestones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          journey_id: string | null
          metadata: Json | null
          milestone_date: string | null
          milestone_type: string
          property_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          journey_id?: string | null
          metadata?: Json | null
          milestone_date?: string | null
          milestone_type: string
          property_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          journey_id?: string | null
          metadata?: Json | null
          milestone_date?: string | null
          milestone_type?: string
          property_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_journey_milestones_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "mobile_property_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_journey_milestones_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_journey_milestones_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_live_auctions: {
        Row: {
          auction_type: string | null
          created_at: string | null
          created_by: string | null
          current_bid: number | null
          description: string | null
          end_time: string
          extension_time: number | null
          id: string
          minimum_increment: number | null
          property_id: string | null
          reserve_price: number | null
          start_time: string
          starting_price: number
          status: string | null
          title: string
          total_bids: number | null
          unique_bidders: number | null
          updated_at: string | null
          winning_bid_id: string | null
        }
        Insert: {
          auction_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_bid?: number | null
          description?: string | null
          end_time: string
          extension_time?: number | null
          id?: string
          minimum_increment?: number | null
          property_id?: string | null
          reserve_price?: number | null
          start_time: string
          starting_price: number
          status?: string | null
          title: string
          total_bids?: number | null
          unique_bidders?: number | null
          updated_at?: string | null
          winning_bid_id?: string | null
        }
        Update: {
          auction_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_bid?: number | null
          description?: string | null
          end_time?: string
          extension_time?: number | null
          id?: string
          minimum_increment?: number | null
          property_id?: string | null
          reserve_price?: number | null
          start_time?: string
          starting_price?: number
          status?: string | null
          title?: string
          total_bids?: number | null
          unique_bidders?: number | null
          updated_at?: string | null
          winning_bid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_live_auctions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_live_auctions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_live_auctions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_neighborhood_members: {
        Row: {
          id: string
          joined_at: string | null
          last_active_at: string | null
          muted_until: string | null
          neighborhood_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          muted_until?: string | null
          neighborhood_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          muted_until?: string | null
          neighborhood_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_neighborhood_members_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "mobile_neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobile_neighborhood_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_neighborhoods: {
        Row: {
          bounds: Json | null
          city: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          district: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          slug: string
        }
        Insert: {
          bounds?: Json | null
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          slug: string
        }
        Update: {
          bounds?: Json | null
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      mobile_offline_sync_queue: {
        Row: {
          action_type: string
          created_at: string | null
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          max_retries: number | null
          payload: Json
          priority: number | null
          processed_at: string | null
          retry_count: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          payload: Json
          priority?: number | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          payload?: Json
          priority?: number | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_offline_sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_property_journeys: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string | null
          id: string
          name: string | null
          notes: string | null
          preferred_locations: string[] | null
          property_types: string[] | null
          status: string | null
          target_purchase_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          preferred_locations?: string[] | null
          property_types?: string[] | null
          status?: string | null
          target_purchase_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          preferred_locations?: string[] | null
          property_types?: string[] | null
          status?: string | null
          target_purchase_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_property_journeys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_banks: {
        Row: {
          admin_fee: number | null
          appraisal_fee: number | null
          bank_code: string
          bank_name: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          insurance_required: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          max_loan_amount: number | null
          max_loan_term_years: number | null
          min_down_payment_percent: number | null
          min_loan_amount: number | null
          notary_fee_percent: number | null
          processing_fee_percent: number | null
          requirements: Json | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          admin_fee?: number | null
          appraisal_fee?: number | null
          bank_code: string
          bank_name: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          insurance_required?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          max_loan_amount?: number | null
          max_loan_term_years?: number | null
          min_down_payment_percent?: number | null
          min_loan_amount?: number | null
          notary_fee_percent?: number | null
          processing_fee_percent?: number | null
          requirements?: Json | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          admin_fee?: number | null
          appraisal_fee?: number | null
          bank_code?: string
          bank_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          insurance_required?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          max_loan_amount?: number | null
          max_loan_term_years?: number | null
          min_down_payment_percent?: number | null
          min_loan_amount?: number | null
          notary_fee_percent?: number | null
          processing_fee_percent?: number | null
          requirements?: Json | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      mortgage_inquiries: {
        Row: {
          admin_notes: string | null
          bank_id: string
          bank_notes: string | null
          contacted_at: string | null
          created_at: string
          email: string
          employment_type: string | null
          full_name: string
          id: string
          loan_amount_requested: number | null
          loan_term_requested: number | null
          monthly_income: number | null
          phone: string
          processed_at: string | null
          property_id: string | null
          simulation_id: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          bank_id: string
          bank_notes?: string | null
          contacted_at?: string | null
          created_at?: string
          email: string
          employment_type?: string | null
          full_name: string
          id?: string
          loan_amount_requested?: number | null
          loan_term_requested?: number | null
          monthly_income?: number | null
          phone: string
          processed_at?: string | null
          property_id?: string | null
          simulation_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          bank_id?: string
          bank_notes?: string | null
          contacted_at?: string | null
          created_at?: string
          email?: string
          employment_type?: string | null
          full_name?: string
          id?: string
          loan_amount_requested?: number | null
          loan_term_requested?: number | null
          monthly_income?: number | null
          phone?: string
          processed_at?: string | null
          property_id?: string | null
          simulation_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_inquiries_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "mortgage_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_inquiries_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "mortgage_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_preapproval_requests: {
        Row: {
          bank_partner_id: string | null
          created_at: string
          date_of_birth: string | null
          down_payment_amount: number | null
          email: string
          employer_name: string | null
          employment_duration_months: number | null
          employment_status: string | null
          existing_debts: number | null
          full_name: string
          id: string
          monthly_income: number | null
          notes: string | null
          phone: string | null
          preapproval_amount: number | null
          preapproval_rate: number | null
          preapproval_valid_until: string | null
          preferred_term_years: number | null
          property_id: string | null
          requested_loan_amount: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_platform: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank_partner_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          down_payment_amount?: number | null
          email: string
          employer_name?: string | null
          employment_duration_months?: number | null
          employment_status?: string | null
          existing_debts?: number | null
          full_name: string
          id?: string
          monthly_income?: number | null
          notes?: string | null
          phone?: string | null
          preapproval_amount?: number | null
          preapproval_rate?: number | null
          preapproval_valid_until?: string | null
          preferred_term_years?: number | null
          property_id?: string | null
          requested_loan_amount?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_platform?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank_partner_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          down_payment_amount?: number | null
          email?: string
          employer_name?: string | null
          employment_duration_months?: number | null
          employment_status?: string | null
          existing_debts?: number | null
          full_name?: string
          id?: string
          monthly_income?: number | null
          notes?: string | null
          phone?: string | null
          preapproval_amount?: number | null
          preapproval_rate?: number | null
          preapproval_valid_until?: string | null
          preferred_term_years?: number | null
          property_id?: string | null
          requested_loan_amount?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_platform?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_preapproval_requests_bank_partner_id_fkey"
            columns: ["bank_partner_id"]
            isOneToOne: false
            referencedRelation: "acquisition_bank_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_preapproval_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_preapproval_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_preapproval_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_preapproval_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_rates: {
        Row: {
          bank_id: string
          conditions: string | null
          created_at: string
          id: string
          interest_rate_year1: number
          interest_rate_year2: number | null
          interest_rate_year3_plus: number | null
          is_active: boolean | null
          max_loan_amount: number | null
          max_term_years: number | null
          min_loan_amount: number | null
          min_term_years: number | null
          promo_end_date: string | null
          rate_name: string
          rate_type: string
          updated_at: string
        }
        Insert: {
          bank_id: string
          conditions?: string | null
          created_at?: string
          id?: string
          interest_rate_year1: number
          interest_rate_year2?: number | null
          interest_rate_year3_plus?: number | null
          is_active?: boolean | null
          max_loan_amount?: number | null
          max_term_years?: number | null
          min_loan_amount?: number | null
          min_term_years?: number | null
          promo_end_date?: string | null
          rate_name: string
          rate_type: string
          updated_at?: string
        }
        Update: {
          bank_id?: string
          conditions?: string | null
          created_at?: string
          id?: string
          interest_rate_year1?: number
          interest_rate_year2?: number | null
          interest_rate_year3_plus?: number | null
          is_active?: boolean | null
          max_loan_amount?: number | null
          max_term_years?: number | null
          min_loan_amount?: number | null
          min_term_years?: number | null
          promo_end_date?: string | null
          rate_name?: string
          rate_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_rates_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "mortgage_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_simulations: {
        Row: {
          affordability_ratio: number | null
          comparison_data: Json | null
          created_at: string
          down_payment: number
          down_payment_percent: number
          id: string
          interest_rate: number
          loan_amount: number
          loan_term_years: number
          monthly_income: number | null
          monthly_payment: number
          property_id: string | null
          property_price: number
          selected_bank_id: string | null
          selected_rate_id: string | null
          session_id: string | null
          total_interest: number
          total_payment: number
          user_id: string | null
        }
        Insert: {
          affordability_ratio?: number | null
          comparison_data?: Json | null
          created_at?: string
          down_payment: number
          down_payment_percent: number
          id?: string
          interest_rate: number
          loan_amount: number
          loan_term_years: number
          monthly_income?: number | null
          monthly_payment: number
          property_id?: string | null
          property_price: number
          selected_bank_id?: string | null
          selected_rate_id?: string | null
          session_id?: string | null
          total_interest: number
          total_payment: number
          user_id?: string | null
        }
        Update: {
          affordability_ratio?: number | null
          comparison_data?: Json | null
          created_at?: string
          down_payment?: number
          down_payment_percent?: number
          id?: string
          interest_rate?: number
          loan_amount?: number
          loan_term_years?: number
          monthly_income?: number | null
          monthly_payment?: number
          property_id?: string | null
          property_price?: number
          selected_bank_id?: string | null
          selected_rate_id?: string | null
          session_id?: string | null
          total_interest?: number
          total_payment?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_simulations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_simulations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_simulations_selected_bank_id_fkey"
            columns: ["selected_bank_id"]
            isOneToOne: false
            referencedRelation: "mortgage_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mortgage_simulations_selected_rate_id_fkey"
            columns: ["selected_rate_id"]
            isOneToOne: false
            referencedRelation: "mortgage_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_guides: {
        Row: {
          author_id: string | null
          city: string
          content: Json | null
          cover_image_url: string | null
          created_at: string | null
          highlights: Json | null
          id: string
          is_featured: boolean | null
          like_count: number | null
          neighborhood_name: string
          published_at: string | null
          ratings: Json | null
          slug: string
          state: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          city: string
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          neighborhood_name: string
          published_at?: string | null
          ratings?: Json | null
          slug: string
          state?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          city?: string
          content?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          highlights?: Json | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          neighborhood_name?: string
          published_at?: string | null
          ratings?: Json | null
          slug?: string
          state?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          notification_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          notification_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          notification_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          icon: string | null
          id: string
          image: string | null
          is_read: boolean
          is_sent: boolean
          metadata: Json | null
          notification_type: string
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          icon?: string | null
          id?: string
          image?: string | null
          is_read?: boolean
          is_sent?: boolean
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          image?: string | null
          is_read?: boolean
          is_sent?: boolean
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          booking_updates: boolean
          consent_ip: unknown
          created_at: string
          email_enabled: boolean
          gdpr_consent_at: string | null
          id: string
          messages: boolean
          new_listings: boolean
          price_changes: boolean
          promotions: boolean
          push_enabled: boolean
          quiet_end_time: string | null
          quiet_hours_enabled: boolean
          quiet_start_time: string | null
          sms_enabled: boolean
          system_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_updates?: boolean
          consent_ip?: unknown
          created_at?: string
          email_enabled?: boolean
          gdpr_consent_at?: string | null
          id?: string
          messages?: boolean
          new_listings?: boolean
          price_changes?: boolean
          promotions?: boolean
          push_enabled?: boolean
          quiet_end_time?: string | null
          quiet_hours_enabled?: boolean
          quiet_start_time?: string | null
          sms_enabled?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_updates?: boolean
          consent_ip?: unknown
          created_at?: string
          email_enabled?: boolean
          gdpr_consent_at?: string | null
          id?: string
          messages?: boolean
          new_listings?: boolean
          price_changes?: boolean
          promotions?: boolean
          push_enabled?: boolean
          quiet_end_time?: string | null
          quiet_hours_enabled?: boolean
          quiet_start_time?: string | null
          sms_enabled?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      off_market_deals: {
        Row: {
          asking_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          deal_type: string
          discount_percentage: number | null
          estimated_value: number | null
          exclusivity_days: number | null
          expires_at: string | null
          express_interest_count: number | null
          id: string
          location_area: string | null
          location_city: string
          minimum_investor_tier: string | null
          nda_required: boolean | null
          property_id: string | null
          property_type: string
          seller_id: string | null
          size_sqm: number | null
          status: string | null
          updated_at: string
          urgency_level: string | null
          views_count: number | null
        }
        Insert: {
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          deal_type: string
          discount_percentage?: number | null
          estimated_value?: number | null
          exclusivity_days?: number | null
          expires_at?: string | null
          express_interest_count?: number | null
          id?: string
          location_area?: string | null
          location_city: string
          minimum_investor_tier?: string | null
          nda_required?: boolean | null
          property_id?: string | null
          property_type: string
          seller_id?: string | null
          size_sqm?: number | null
          status?: string | null
          updated_at?: string
          urgency_level?: string | null
          views_count?: number | null
        }
        Update: {
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          deal_type?: string
          discount_percentage?: number | null
          estimated_value?: number | null
          exclusivity_days?: number | null
          expires_at?: string | null
          express_interest_count?: number | null
          id?: string
          location_area?: string | null
          location_city?: string
          minimum_investor_tier?: string | null
          nda_required?: boolean | null
          property_id?: string | null
          property_type?: string
          seller_id?: string | null
          size_sqm?: number | null
          status?: string | null
          updated_at?: string
          urgency_level?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "off_market_deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "off_market_deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "off_market_deals_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      office_locations: {
        Row: {
          address_en: string
          address_id: string
          business_hours_en: string | null
          business_hours_id: string | null
          created_at: string | null
          display_order: number | null
          email: string | null
          id: string
          is_active: boolean
          is_main_office: boolean
          name_en: string
          name_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address_en: string
          address_id: string
          business_hours_en?: string | null
          business_hours_id?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_main_office?: boolean
          name_en: string
          name_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address_en?: string
          address_id?: string
          business_hours_en?: string | null
          business_hours_id?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_main_office?: boolean
          name_en?: string
          name_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_automation_config: {
        Row: {
          ai_personalization_enabled: boolean | null
          ai_recommendation_model: string | null
          auto_assign_rewards: boolean | null
          avg_time_to_complete_hours: number | null
          completion_rate: number | null
          created_at: string
          follow_up_sequence: Json | null
          id: string
          onboarding_steps: Json | null
          persona_type: string
          reminder_intervals: number[] | null
          required_verifications: string[] | null
          reward_tokens: number | null
          total_onboarded: number | null
          updated_at: string
          welcome_email_template_id: string | null
          welcome_sms_template_id: string | null
          welcome_whatsapp_template_id: string | null
        }
        Insert: {
          ai_personalization_enabled?: boolean | null
          ai_recommendation_model?: string | null
          auto_assign_rewards?: boolean | null
          avg_time_to_complete_hours?: number | null
          completion_rate?: number | null
          created_at?: string
          follow_up_sequence?: Json | null
          id?: string
          onboarding_steps?: Json | null
          persona_type: string
          reminder_intervals?: number[] | null
          required_verifications?: string[] | null
          reward_tokens?: number | null
          total_onboarded?: number | null
          updated_at?: string
          welcome_email_template_id?: string | null
          welcome_sms_template_id?: string | null
          welcome_whatsapp_template_id?: string | null
        }
        Update: {
          ai_personalization_enabled?: boolean | null
          ai_recommendation_model?: string | null
          auto_assign_rewards?: boolean | null
          avg_time_to_complete_hours?: number | null
          completion_rate?: number | null
          created_at?: string
          follow_up_sequence?: Json | null
          id?: string
          onboarding_steps?: Json | null
          persona_type?: string
          reminder_intervals?: number[] | null
          required_verifications?: string[] | null
          reward_tokens?: number | null
          total_onboarded?: number | null
          updated_at?: string
          welcome_email_template_id?: string | null
          welcome_sms_template_id?: string | null
          welcome_whatsapp_template_id?: string | null
        }
        Relationships: []
      }
      order_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          metadata: Json | null
          order_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_activity_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "user_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string | null
          document_url: string
          id: string
          order_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string | null
          document_url: string
          id?: string
          order_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string | null
          document_url?: string
          id?: string
          order_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "user_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          order_data: Json | null
          order_number: string
          order_type: string
          property_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          order_data?: Json | null
          order_number: string
          order_type: string
          property_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          order_data?: Json | null
          order_number?: string
          order_type?: string
          property_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_used: boolean | null
          max_attempts: number | null
          purpose: string
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_used?: boolean | null
          max_attempts?: number | null
          purpose: string
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_used?: boolean | null
          max_attempts?: number | null
          purpose?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          partner_id: string
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          partner_id: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          partner_id?: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_activity_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_api_keys: {
        Row: {
          allowed_endpoints: string[] | null
          api_key: string
          created_at: string
          created_by: string | null
          custom_limits: Json | null
          expires_at: string | null
          id: string
          is_active: boolean
          is_whitelisted: boolean
          last_used_at: string | null
          partner_email: string
          partner_name: string
          rate_limit_multiplier: number
          total_requests: number
          updated_at: string
        }
        Insert: {
          allowed_endpoints?: string[] | null
          api_key: string
          created_at?: string
          created_by?: string | null
          custom_limits?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_whitelisted?: boolean
          last_used_at?: string | null
          partner_email: string
          partner_name: string
          rate_limit_multiplier?: number
          total_requests?: number
          updated_at?: string
        }
        Update: {
          allowed_endpoints?: string[] | null
          api_key?: string
          created_at?: string
          created_by?: string | null
          custom_limits?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_whitelisted?: boolean
          last_used_at?: string | null
          partner_email?: string
          partner_name?: string
          rate_limit_multiplier?: number
          total_requests?: number
          updated_at?: string
        }
        Relationships: []
      }
      partner_automation_config: {
        Row: {
          active_partners: number | null
          auto_commission_calculation: boolean | null
          auto_payout_enabled: boolean | null
          auto_performance_reports: boolean | null
          auto_renewal_reminder: boolean | null
          auto_welcome: boolean | null
          created_at: string
          id: string
          kpi_thresholds: Json | null
          minimum_payout_amount: number | null
          partner_type: string
          payout_schedule: string | null
          performance_report_frequency: string | null
          regular_update_frequency: string | null
          renewal_reminder_days: number[] | null
          total_commissions_paid: number | null
          total_partners: number | null
          update_template_id: string | null
          updated_at: string
          welcome_template_id: string | null
        }
        Insert: {
          active_partners?: number | null
          auto_commission_calculation?: boolean | null
          auto_payout_enabled?: boolean | null
          auto_performance_reports?: boolean | null
          auto_renewal_reminder?: boolean | null
          auto_welcome?: boolean | null
          created_at?: string
          id?: string
          kpi_thresholds?: Json | null
          minimum_payout_amount?: number | null
          partner_type: string
          payout_schedule?: string | null
          performance_report_frequency?: string | null
          regular_update_frequency?: string | null
          renewal_reminder_days?: number[] | null
          total_commissions_paid?: number | null
          total_partners?: number | null
          update_template_id?: string | null
          updated_at?: string
          welcome_template_id?: string | null
        }
        Update: {
          active_partners?: number | null
          auto_commission_calculation?: boolean | null
          auto_payout_enabled?: boolean | null
          auto_performance_reports?: boolean | null
          auto_renewal_reminder?: boolean | null
          auto_welcome?: boolean | null
          created_at?: string
          id?: string
          kpi_thresholds?: Json | null
          minimum_payout_amount?: number | null
          partner_type?: string
          payout_schedule?: string | null
          performance_report_frequency?: string | null
          regular_update_frequency?: string | null
          renewal_reminder_days?: number[] | null
          total_commissions_paid?: number | null
          total_partners?: number | null
          update_template_id?: string | null
          updated_at?: string
          welcome_template_id?: string | null
        }
        Relationships: []
      }
      partner_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          marketing_budget: number | null
          name: string
          partner_incentive_budget: number | null
          signed_partners: number | null
          slug: string
          start_date: string
          target_partner_types: Json | null
          target_partners: number | null
          total_leads_generated: number | null
          total_revenue_generated: number | null
          updated_at: string | null
          value_proposition: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          marketing_budget?: number | null
          name: string
          partner_incentive_budget?: number | null
          signed_partners?: number | null
          slug: string
          start_date: string
          target_partner_types?: Json | null
          target_partners?: number | null
          total_leads_generated?: number | null
          total_revenue_generated?: number | null
          updated_at?: string | null
          value_proposition?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          marketing_budget?: number | null
          name?: string
          partner_incentive_budget?: number | null
          signed_partners?: number | null
          slug?: string
          start_date?: string
          target_partner_types?: Json | null
          target_partners?: number | null
          total_leads_generated?: number | null
          total_revenue_generated?: number | null
          updated_at?: string | null
          value_proposition?: Json | null
        }
        Relationships: []
      }
      partner_leads: {
        Row: {
          budget_range: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          conversion_value: number | null
          created_at: string | null
          id: string
          lead_source: string | null
          lead_type: string
          notes: string | null
          partner_id: string | null
          partner_response_time: number | null
          preferred_contact_method: string | null
          property_id: string | null
          service_needed: string | null
          status: string | null
          timeline: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          conversion_value?: number | null
          created_at?: string | null
          id?: string
          lead_source?: string | null
          lead_type: string
          notes?: string | null
          partner_id?: string | null
          partner_response_time?: number | null
          preferred_contact_method?: string | null
          property_id?: string | null
          service_needed?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          conversion_value?: number | null
          created_at?: string | null
          id?: string
          lead_source?: string | null
          lead_type?: string
          notes?: string | null
          partner_id?: string | null
          partner_response_time?: number | null
          preferred_contact_method?: string | null
          property_id?: string | null
          service_needed?: string | null
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "business_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_packages: {
        Row: {
          created_at: string
          current_redemptions: number | null
          description: string | null
          discount_percentage: number | null
          discounted_price: number
          id: string
          included_services: Json | null
          is_active: boolean | null
          max_redemptions: number | null
          metadata: Json | null
          original_price: number
          package_name: string
          partner_id: string
          terms_conditions: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          current_redemptions?: number | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price: number
          id?: string
          included_services?: Json | null
          is_active?: boolean | null
          max_redemptions?: number | null
          metadata?: Json | null
          original_price: number
          package_name: string
          partner_id: string
          terms_conditions?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          current_redemptions?: number | null
          description?: string | null
          discount_percentage?: number | null
          discounted_price?: number
          id?: string
          included_services?: Json | null
          is_active?: boolean | null
          max_redemptions?: number | null
          metadata?: Json | null
          original_price?: number
          package_name?: string
          partner_id?: string
          terms_conditions?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_packages_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          account_name: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          notes: string | null
          partner_id: string
          payment_method: string | null
          payment_reference: string | null
          period_end: string | null
          period_start: string | null
          processed_at: string | null
          processed_by: string | null
          referrals_count: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          partner_id: string
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string | null
          period_start?: string | null
          processed_at?: string | null
          processed_by?: string | null
          referrals_count?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          partner_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string | null
          period_start?: string | null
          processed_at?: string | null
          processed_by?: string | null
          referrals_count?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_referrals: {
        Row: {
          commission_amount: number | null
          commission_paid: boolean | null
          converted_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          partner_id: string
          property_id: string | null
          qualified_at: string | null
          referral_code: string
          service_type: string | null
          source_url: string | null
          status: string | null
          transaction_value: number | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_paid?: boolean | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          property_id?: string | null
          qualified_at?: string | null
          referral_code?: string
          service_type?: string | null
          source_url?: string | null
          status?: string | null
          transaction_value?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_paid?: boolean | null
          converted_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          property_id?: string | null
          qualified_at?: string | null
          referral_code?: string
          service_type?: string | null
          source_url?: string | null
          status?: string | null
          transaction_value?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          commission_rate: number | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contract_signed_at: string | null
          created_at: string
          description: string | null
          id: string
          lifetime_paid: number | null
          logo_url: string | null
          metadata: Json | null
          notes: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          pending_payout: number | null
          referral_fee: number | null
          revenue_share_rate: number | null
          status: Database["public"]["Enums"]["partner_status"] | null
          successful_conversions: number | null
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          commission_rate?: number | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contract_signed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lifetime_paid?: number | null
          logo_url?: string | null
          metadata?: Json | null
          notes?: string | null
          partner_type: Database["public"]["Enums"]["partner_type"]
          pending_payout?: number | null
          referral_fee?: number | null
          revenue_share_rate?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          successful_conversions?: number | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          commission_rate?: number | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contract_signed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lifetime_paid?: number | null
          logo_url?: string | null
          metadata?: Json | null
          notes?: string | null
          partner_type?: Database["public"]["Enums"]["partner_type"]
          pending_payout?: number | null
          referral_fee?: number | null
          revenue_share_rate?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          successful_conversions?: number | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      partnership_managers: {
        Row: {
          active_partnerships: number | null
          avatar_url: string | null
          avg_deal_size: number | null
          base_salary: number | null
          bio: string | null
          bonus_eligible: boolean | null
          certifications: string[] | null
          commission_rate: number | null
          created_at: string | null
          department: string | null
          email: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          full_name: string
          id: string
          industries_covered: string[] | null
          languages: string[] | null
          linkedin_url: string | null
          manager_level: string | null
          meetings_this_month: number | null
          nps_score: number | null
          partner_retention_rate: number | null
          partnerships_closed_this_quarter: number | null
          phone: string | null
          pipeline_value: number | null
          proposals_accepted: number | null
          proposals_sent: number | null
          regions_covered: string[] | null
          response_time_hours: number | null
          revenue_generated: number | null
          status: Database["public"]["Enums"]["team_member_status"] | null
          target_revenue: number | null
          timezone: string | null
          total_commission_earned: number | null
          total_partnerships_managed: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active_partnerships?: number | null
          avatar_url?: string | null
          avg_deal_size?: number | null
          base_salary?: number | null
          bio?: string | null
          bonus_eligible?: boolean | null
          certifications?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          department?: string | null
          email: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          full_name: string
          id?: string
          industries_covered?: string[] | null
          languages?: string[] | null
          linkedin_url?: string | null
          manager_level?: string | null
          meetings_this_month?: number | null
          nps_score?: number | null
          partner_retention_rate?: number | null
          partnerships_closed_this_quarter?: number | null
          phone?: string | null
          pipeline_value?: number | null
          proposals_accepted?: number | null
          proposals_sent?: number | null
          regions_covered?: string[] | null
          response_time_hours?: number | null
          revenue_generated?: number | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          target_revenue?: number | null
          timezone?: string | null
          total_commission_earned?: number | null
          total_partnerships_managed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active_partnerships?: number | null
          avatar_url?: string | null
          avg_deal_size?: number | null
          base_salary?: number | null
          bio?: string | null
          bonus_eligible?: boolean | null
          certifications?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          department?: string | null
          email?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          full_name?: string
          id?: string
          industries_covered?: string[] | null
          languages?: string[] | null
          linkedin_url?: string | null
          manager_level?: string | null
          meetings_this_month?: number | null
          nps_score?: number | null
          partner_retention_rate?: number | null
          partnerships_closed_this_quarter?: number | null
          phone?: string | null
          pipeline_value?: number | null
          proposals_accepted?: number | null
          proposals_sent?: number | null
          regions_covered?: string[] | null
          response_time_hours?: number | null
          revenue_generated?: number | null
          status?: Database["public"]["Enums"]["team_member_status"] | null
          target_revenue?: number | null
          timezone?: string | null
          total_commission_earned?: number | null
          total_partnerships_managed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_managers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_disputes: {
        Row: {
          admin_notes: string | null
          against_user: string | null
          amount: number
          created_at: string
          dispute_reason: string
          dispute_reference: string
          dispute_type: string
          evidence: Json | null
          id: string
          raised_by: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          against_user?: string | null
          amount: number
          created_at?: string
          dispute_reason: string
          dispute_reference: string
          dispute_type: string
          evidence?: Json | null
          id?: string
          raised_by: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          against_user?: string | null
          amount?: number
          created_at?: string
          dispute_reason?: string
          dispute_reference?: string
          dispute_type?: string
          evidence?: Json | null
          id?: string
          raised_by?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          payment_method: string
          response_data: Json | null
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          payment_method: string
          response_data?: Json | null
          status: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          response_data?: Json | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "rental_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_refunds: {
        Row: {
          created_at: string | null
          gateway_response: Json | null
          id: string
          order_id: string
          processed_by: string | null
          reason: string | null
          refund_amount: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          order_id: string
          processed_by?: string | null
          reason?: string | null
          refund_amount: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string
          processed_by?: string | null
          reason?: string | null
          refund_amount?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          gateway_response: Json | null
          id: string
          order_id: string
          payment_gateway: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          gateway_response?: Json | null
          id?: string
          order_id: string
          payment_gateway?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string
          payment_gateway?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_webhook_logs: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          order_id: string | null
          payload: Json | null
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          processed?: boolean | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payout_details: Json | null
          payout_method: string
          processed_at: string | null
          processed_by: string | null
          reference_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payout_details?: Json | null
          payout_method: string
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payout_details?: Json | null
          payout_method?: string
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_settings: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_code: string | null
          bank_name: string | null
          created_at: string | null
          digital_wallet_account: string | null
          digital_wallet_type: string | null
          id: string
          is_active: boolean | null
          minimum_payout_amount: number | null
          npwp_number: string | null
          payout_schedule: string | null
          preferred_payout_method: string
          tax_withholding_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          digital_wallet_account?: string | null
          digital_wallet_type?: string | null
          id?: string
          is_active?: boolean | null
          minimum_payout_amount?: number | null
          npwp_number?: string | null
          payout_schedule?: string | null
          preferred_payout_method?: string
          tax_withholding_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          digital_wallet_account?: string | null
          digital_wallet_type?: string | null
          id?: string
          is_active?: boolean | null
          minimum_payout_amount?: number | null
          npwp_number?: string | null
          payout_schedule?: string | null
          preferred_payout_method?: string
          tax_withholding_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_transactions: {
        Row: {
          amount: number
          base_amount: number | null
          booking_id: string | null
          booking_type: string
          commission_rate: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          payout_request_id: string | null
          status: string | null
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          base_amount?: number | null
          booking_id?: string | null
          booking_type: string
          commission_rate?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payout_request_id?: string | null
          status?: string | null
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number | null
          booking_id?: string | null
          booking_type?: string
          commission_rate?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payout_request_id?: string | null
          status?: string | null
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_transactions_payout_request_id_fkey"
            columns: ["payout_request_id"]
            isOneToOne: false
            referencedRelation: "payout_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_contest_entries: {
        Row: {
          admin_score: number | null
          approved: boolean | null
          campaign_id: string | null
          category: string | null
          created_at: string
          featured: boolean | null
          id: string
          is_winner: boolean | null
          photo_description: string | null
          photo_title: string | null
          photo_url: string
          prize_amount: number | null
          prize_claimed: boolean | null
          prize_claimed_at: string | null
          property_id: string | null
          rank: number | null
          rejected: boolean | null
          rejection_reason: string | null
          share_count: number | null
          total_score: number | null
          updated_at: string
          user_id: string | null
          view_count: number | null
          vote_count: number | null
          winner_position: number | null
        }
        Insert: {
          admin_score?: number | null
          approved?: boolean | null
          campaign_id?: string | null
          category?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          is_winner?: boolean | null
          photo_description?: string | null
          photo_title?: string | null
          photo_url: string
          prize_amount?: number | null
          prize_claimed?: boolean | null
          prize_claimed_at?: string | null
          property_id?: string | null
          rank?: number | null
          rejected?: boolean | null
          rejection_reason?: string | null
          share_count?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
          vote_count?: number | null
          winner_position?: number | null
        }
        Update: {
          admin_score?: number | null
          approved?: boolean | null
          campaign_id?: string | null
          category?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          is_winner?: boolean | null
          photo_description?: string | null
          photo_title?: string | null
          photo_url?: string
          prize_amount?: number | null
          prize_claimed?: boolean | null
          prize_claimed_at?: string | null
          property_id?: string | null
          rank?: number | null
          rejected?: boolean | null
          rejection_reason?: string | null
          share_count?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
          vote_count?: number | null
          winner_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_contest_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "viral_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_contest_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_contest_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_contest_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_contest_votes: {
        Row: {
          created_at: string
          entry_id: string | null
          id: string
          ip_address: unknown
          user_id: string | null
          vote_type: string | null
        }
        Insert: {
          created_at?: string
          entry_id?: string | null
          id?: string
          ip_address?: unknown
          user_id?: string | null
          vote_type?: string | null
        }
        Update: {
          created_at?: string
          entry_id?: string | null
          id?: string
          ip_address?: unknown
          user_id?: string | null
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_contest_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "photo_contest_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_contest_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_commission_settings: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          is_active: boolean | null
          max_commission: number | null
          min_commission: number | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_commission?: number | null
          min_commission?: number | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_commission?: number | null
          min_commission?: number | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_appearances: {
        Row: {
          air_date: string | null
          call_to_action: string | null
          created_at: string
          downloads: number | null
          duration_minutes: number | null
          episode_title: string | null
          episode_url: string | null
          host_email: string | null
          host_name: string | null
          id: string
          key_talking_points: string[] | null
          landing_page_url: string | null
          leads_generated: number | null
          listener_estimate: number | null
          notes: string | null
          podcast_name: string
          podcast_url: string | null
          promo_code: string | null
          rating: number | null
          recording_date: string | null
          status: string | null
          topics_discussed: string[] | null
          updated_at: string
        }
        Insert: {
          air_date?: string | null
          call_to_action?: string | null
          created_at?: string
          downloads?: number | null
          duration_minutes?: number | null
          episode_title?: string | null
          episode_url?: string | null
          host_email?: string | null
          host_name?: string | null
          id?: string
          key_talking_points?: string[] | null
          landing_page_url?: string | null
          leads_generated?: number | null
          listener_estimate?: number | null
          notes?: string | null
          podcast_name: string
          podcast_url?: string | null
          promo_code?: string | null
          rating?: number | null
          recording_date?: string | null
          status?: string | null
          topics_discussed?: string[] | null
          updated_at?: string
        }
        Update: {
          air_date?: string | null
          call_to_action?: string | null
          created_at?: string
          downloads?: number | null
          duration_minutes?: number | null
          episode_title?: string | null
          episode_url?: string | null
          host_email?: string | null
          host_name?: string | null
          id?: string
          key_talking_points?: string[] | null
          landing_page_url?: string | null
          leads_generated?: number | null
          listener_estimate?: number | null
          notes?: string | null
          podcast_name?: string
          podcast_url?: string | null
          promo_code?: string | null
          rating?: number | null
          recording_date?: string | null
          status?: string | null
          topics_discussed?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      portal_tier_requirements: {
        Row: {
          auto_upgrade: boolean | null
          created_at: string
          custom_requirements: Json | null
          id: string
          min_account_age_days: number | null
          min_listings: number | null
          min_properties: number | null
          min_rating: number | null
          min_transactions: number | null
          requires_subscription: boolean | null
          requires_verification: boolean | null
          tier_name: string
          updated_at: string
        }
        Insert: {
          auto_upgrade?: boolean | null
          created_at?: string
          custom_requirements?: Json | null
          id?: string
          min_account_age_days?: number | null
          min_listings?: number | null
          min_properties?: number | null
          min_rating?: number | null
          min_transactions?: number | null
          requires_subscription?: boolean | null
          requires_verification?: boolean | null
          tier_name: string
          updated_at?: string
        }
        Update: {
          auto_upgrade?: boolean | null
          created_at?: string
          custom_requirements?: Json | null
          id?: string
          min_account_age_days?: number | null
          min_listings?: number | null
          min_properties?: number | null
          min_rating?: number | null
          min_transactions?: number | null
          requires_subscription?: boolean | null
          requires_verification?: boolean | null
          tier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      portal_verification_settings: {
        Row: {
          auto_approve: boolean
          auto_approve_conditions: Json | null
          created_at: string
          documents_required: string[] | null
          expiry_days: number | null
          id: string
          is_enabled: boolean
          is_required: boolean
          role_type: string
          step_description: string | null
          step_key: string
          step_label: string
          step_order: number
          tier_requirement: string | null
          updated_at: string
        }
        Insert: {
          auto_approve?: boolean
          auto_approve_conditions?: Json | null
          created_at?: string
          documents_required?: string[] | null
          expiry_days?: number | null
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          role_type: string
          step_description?: string | null
          step_key: string
          step_label: string
          step_order?: number
          tier_requirement?: string | null
          updated_at?: string
        }
        Update: {
          auto_approve?: boolean
          auto_approve_conditions?: Json | null
          created_at?: string
          documents_required?: string[] | null
          expiry_days?: number | null
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          role_type?: string
          step_description?: string | null
          step_key?: string
          step_label?: string
          step_order?: number
          tier_requirement?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pr_agencies: {
        Row: {
          agency_name: string
          agency_type: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          id: string
          is_active: boolean | null
          kpis: Json | null
          monthly_retainer: number | null
          notes: string | null
          performance_rating: number | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          services_included: string[] | null
          total_impressions: number | null
          total_placements: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          agency_name: string
          agency_type?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          kpis?: Json | null
          monthly_retainer?: number | null
          notes?: string | null
          performance_rating?: number | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          services_included?: string[] | null
          total_impressions?: number | null
          total_placements?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          agency_name?: string
          agency_type?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          kpis?: Json | null
          monthly_retainer?: number | null
          notes?: string | null
          performance_rating?: number | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          services_included?: string[] | null
          total_impressions?: number | null
          total_placements?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      pr_outreach: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_title: string | null
          coverage_id: string | null
          created_at: string
          deadline: string | null
          follow_up_count: number | null
          id: string
          last_follow_up: string | null
          next_follow_up: string | null
          notes: string | null
          outlet_name: string
          outlet_type: string | null
          pitch_content: string | null
          pitch_date: string
          pitch_subject: string
          priority: string | null
          response_date: string | null
          source: string
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          coverage_id?: string | null
          created_at?: string
          deadline?: string | null
          follow_up_count?: number | null
          id?: string
          last_follow_up?: string | null
          next_follow_up?: string | null
          notes?: string | null
          outlet_name: string
          outlet_type?: string | null
          pitch_content?: string | null
          pitch_date?: string
          pitch_subject: string
          priority?: string | null
          response_date?: string | null
          source: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          coverage_id?: string | null
          created_at?: string
          deadline?: string | null
          follow_up_count?: number | null
          id?: string
          last_follow_up?: string | null
          next_follow_up?: string | null
          notes?: string | null
          outlet_name?: string
          outlet_type?: string | null
          pitch_content?: string | null
          pitch_date?: string
          pitch_subject?: string
          priority?: string | null
          response_date?: string | null
          source?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pr_outreach_coverage_id_fkey"
            columns: ["coverage_id"]
            isOneToOne: false
            referencedRelation: "press_coverage"
            referencedColumns: ["id"]
          },
        ]
      }
      press_coverage: {
        Row: {
          article_title: string
          article_url: string | null
          coverage_type: string | null
          created_at: string
          featured: boolean | null
          id: string
          journalist_email: string | null
          journalist_linkedin: string | null
          journalist_name: string | null
          key_quotes: string[] | null
          lead_conversions: number | null
          media_value_estimate: number | null
          notes: string | null
          pdf_url: string | null
          publication_date: string | null
          publication_name: string
          publication_type: string
          reach_estimate: number | null
          referral_traffic: number | null
          screenshot_url: string | null
          sentiment: string | null
          social_shares: number | null
          status: string | null
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          article_title: string
          article_url?: string | null
          coverage_type?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          journalist_email?: string | null
          journalist_linkedin?: string | null
          journalist_name?: string | null
          key_quotes?: string[] | null
          lead_conversions?: number | null
          media_value_estimate?: number | null
          notes?: string | null
          pdf_url?: string | null
          publication_date?: string | null
          publication_name: string
          publication_type: string
          reach_estimate?: number | null
          referral_traffic?: number | null
          screenshot_url?: string | null
          sentiment?: string | null
          social_shares?: number | null
          status?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          article_title?: string
          article_url?: string | null
          coverage_type?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          journalist_email?: string | null
          journalist_linkedin?: string | null
          journalist_name?: string | null
          key_quotes?: string[] | null
          lead_conversions?: number | null
          media_value_estimate?: number | null
          notes?: string | null
          pdf_url?: string | null
          publication_date?: string | null
          publication_name?: string
          publication_type?: string
          reach_estimate?: number | null
          referral_traffic?: number | null
          screenshot_url?: string | null
          sentiment?: string | null
          social_shares?: number | null
          status?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          business_address: string | null
          company_name: string | null
          company_registration_number: string | null
          company_verified: boolean | null
          company_verified_at: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          last_profile_change_at: string | null
          last_seen_at: string | null
          license_number: string | null
          npwp_number: string | null
          phone: string | null
          profile_change_count: number | null
          profile_change_history: Json | null
          profile_completion_percentage: number | null
          profile_locked_until: string | null
          specializations: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string | null
          user_level_id: string | null
          verification_status: string | null
          years_experience: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          company_verified?: boolean | null
          company_verified_at?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          last_profile_change_at?: string | null
          last_seen_at?: string | null
          license_number?: string | null
          npwp_number?: string | null
          phone?: string | null
          profile_change_count?: number | null
          profile_change_history?: Json | null
          profile_completion_percentage?: number | null
          profile_locked_until?: string | null
          specializations?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          user_level_id?: string | null
          verification_status?: string | null
          years_experience?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_address?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          company_verified?: boolean | null
          company_verified_at?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          last_profile_change_at?: string | null
          last_seen_at?: string | null
          license_number?: string | null
          npwp_number?: string | null
          phone?: string | null
          profile_change_count?: number | null
          profile_change_history?: Json | null
          profile_completion_percentage?: number | null
          profile_locked_until?: string | null
          specializations?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          user_level_id?: string | null
          verification_status?: string | null
          years_experience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_level_id_fkey"
            columns: ["user_level_id"]
            isOneToOne: false
            referencedRelation: "user_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          advance_booking_days: number | null
          agent_id: string | null
          approval_status: string | null
          area: string | null
          area_sqm: number | null
          available_from: string | null
          available_until: string | null
          bathrooms: number | null
          bedrooms: number | null
          booking_type: string | null
          city: string | null
          created_at: string | null
          description: string | null
          development_status: string
          discount_percentage: number | null
          id: string
          image_urls: string[] | null
          images: string[] | null
          investor_highlight: boolean | null
          is_featured: boolean | null
          listing_type: string
          location: string
          minimum_rental_days: number | null
          online_booking_enabled: boolean | null
          owner_id: string
          owner_type: string | null
          price: number | null
          property_features: Json | null
          property_type: string
          rental_periods: string[] | null
          rental_terms: Json | null
          seo_description: string | null
          seo_title: string | null
          state: string | null
          status: string | null
          three_d_model_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          virtual_tour_url: string | null
          wna_eligible: boolean | null
        }
        Insert: {
          advance_booking_days?: number | null
          agent_id?: string | null
          approval_status?: string | null
          area?: string | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          booking_type?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          development_status?: string
          discount_percentage?: number | null
          id?: string
          image_urls?: string[] | null
          images?: string[] | null
          investor_highlight?: boolean | null
          is_featured?: boolean | null
          listing_type: string
          location: string
          minimum_rental_days?: number | null
          online_booking_enabled?: boolean | null
          owner_id: string
          owner_type?: string | null
          price?: number | null
          property_features?: Json | null
          property_type: string
          rental_periods?: string[] | null
          rental_terms?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          state?: string | null
          status?: string | null
          three_d_model_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          virtual_tour_url?: string | null
          wna_eligible?: boolean | null
        }
        Update: {
          advance_booking_days?: number | null
          agent_id?: string | null
          approval_status?: string | null
          area?: string | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          booking_type?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          development_status?: string
          discount_percentage?: number | null
          id?: string
          image_urls?: string[] | null
          images?: string[] | null
          investor_highlight?: boolean | null
          is_featured?: boolean | null
          listing_type?: string
          location?: string
          minimum_rental_days?: number | null
          online_booking_enabled?: boolean | null
          owner_id?: string
          owner_type?: string | null
          price?: number | null
          property_features?: Json | null
          property_type?: string
          rental_periods?: string[] | null
          rental_terms?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          state?: string | null
          status?: string | null
          three_d_model_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          virtual_tour_url?: string | null
          wna_eligible?: boolean | null
        }
        Relationships: []
      }
      property_answers: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_accepted: boolean | null
          is_owner_response: boolean | null
          is_resident_response: boolean | null
          question_id: string
          status: string | null
          updated_at: string | null
          upvote_count: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          is_owner_response?: boolean | null
          is_resident_response?: boolean | null
          question_id: string
          status?: string | null
          updated_at?: string | null
          upvote_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          is_owner_response?: boolean | null
          is_resident_response?: boolean | null
          question_id?: string
          status?: string | null
          updated_at?: string | null
          upvote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "property_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      property_bookings: {
        Row: {
          booking_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          confirmed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          owner_id: string | null
          property_id: string
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_type: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          property_id: string
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          property_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          meta_data: Json | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          meta_data?: Json | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          meta_data?: Json | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      property_category_access: {
        Row: {
          access_level: string
          can_approve: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          category_id: string | null
          created_at: string | null
          department_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          access_level: string
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          category_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          category_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_category_access_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_category_access_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "user_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      property_facilities: {
        Row: {
          additional_cost: number | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_available: boolean | null
          name: string
          property_id: string | null
        }
        Insert: {
          additional_cost?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          property_id?: string | null
        }
        Update: {
          additional_cost?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_facilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_facilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_filter_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          default_value: Json | null
          display_order: number | null
          filter_category: string
          filter_name: string
          filter_options: Json | null
          filter_type: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          listing_type: string
          max_value: number | null
          min_value: number | null
          step_value: number | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_value?: Json | null
          display_order?: number | null
          filter_category: string
          filter_name: string
          filter_options?: Json | null
          filter_type: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          listing_type: string
          max_value?: number | null
          min_value?: number | null
          step_value?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_value?: Json | null
          display_order?: number | null
          filter_category?: string
          filter_name?: string
          filter_options?: Json | null
          filter_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          listing_type?: string
          max_value?: number | null
          min_value?: number | null
          step_value?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          property_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          property_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owner_requests: {
        Row: {
          additional_notes: string | null
          area: string | null
          business_area: string | null
          business_city: string | null
          business_gps_coordinates: string | null
          business_name: string | null
          business_province: string | null
          business_registration_number: string | null
          business_street_address: string | null
          city: string
          created_at: string | null
          full_name: string
          gps_coordinates: string | null
          id: string
          owner_type: string
          phone: string | null
          property_count: string | null
          property_types: string[] | null
          province: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media: Json | null
          status: string
          street_address: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          area?: string | null
          business_area?: string | null
          business_city?: string | null
          business_gps_coordinates?: string | null
          business_name?: string | null
          business_province?: string | null
          business_registration_number?: string | null
          business_street_address?: string | null
          city: string
          created_at?: string | null
          full_name: string
          gps_coordinates?: string | null
          id?: string
          owner_type: string
          phone?: string | null
          property_count?: string | null
          property_types?: string[] | null
          province: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: Json | null
          status?: string
          street_address?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          area?: string | null
          business_area?: string | null
          business_city?: string | null
          business_gps_coordinates?: string | null
          business_name?: string | null
          business_province?: string | null
          business_registration_number?: string | null
          business_street_address?: string | null
          city?: string
          created_at?: string | null
          full_name?: string
          gps_coordinates?: string | null
          id?: string
          owner_type?: string
          phone?: string | null
          property_count?: string | null
          property_types?: string[] | null
          province?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: Json | null
          status?: string
          street_address?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      property_questions: {
        Row: {
          answer_count: number | null
          author_id: string | null
          category: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_pinned: boolean | null
          is_resolved: boolean | null
          property_id: string
          question: string
          status: string | null
          updated_at: string | null
          upvote_count: number | null
          view_count: number | null
        }
        Insert: {
          answer_count?: number | null
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          property_id: string
          question: string
          status?: string | null
          updated_at?: string | null
          upvote_count?: number | null
          view_count?: number | null
        }
        Update: {
          answer_count?: number | null
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          property_id?: string
          question?: string
          status?: string | null
          updated_at?: string | null
          upvote_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      property_rating_aggregates: {
        Row: {
          average_rating: number | null
          last_updated: string
          property_id: string
          rating_distribution: Json | null
          total_ratings: number | null
        }
        Insert: {
          average_rating?: number | null
          last_updated?: string
          property_id: string
          rating_distribution?: Json | null
          total_ratings?: number | null
        }
        Update: {
          average_rating?: number | null
          last_updated?: string
          property_id?: string
          rating_distribution?: Json | null
          total_ratings?: number | null
        }
        Relationships: []
      }
      property_ratings: {
        Row: {
          created_at: string
          helpful_votes: number | null
          id: string
          is_anonymous: boolean | null
          is_verified_buyer: boolean | null
          property_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_verified_buyer?: boolean | null
          property_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_verified_buyer?: boolean | null
          property_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_rental_items: {
        Row: {
          condition_status: string | null
          created_at: string | null
          id: string
          is_included: boolean | null
          item_description: string | null
          item_name: string
          property_id: string | null
          quantity: number | null
          replacement_cost: number | null
        }
        Insert: {
          condition_status?: string | null
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          item_description?: string | null
          item_name: string
          property_id?: string | null
          quantity?: number | null
          replacement_cost?: number | null
        }
        Update: {
          condition_status?: string | null
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          item_description?: string | null
          item_name?: string
          property_id?: string | null
          quantity?: number | null
          replacement_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_rental_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_rental_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_rental_terms: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_mandatory: boolean | null
          order_index: number | null
          property_id: string | null
          term_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_mandatory?: boolean | null
          order_index?: number | null
          property_id?: string | null
          term_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_mandatory?: boolean | null
          order_index?: number | null
          property_id?: string | null
          term_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_rental_terms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_rental_terms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reviews: {
        Row: {
          admin_approved: boolean | null
          booking_id: string | null
          cons: string[] | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          is_verified_visit: boolean | null
          owner_responded_at: string | null
          owner_response: string | null
          property_id: string
          pros: string[] | null
          rating: number
          report_count: number | null
          review_text: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_approved?: boolean | null
          booking_id?: string | null
          cons?: string[] | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          is_verified_visit?: boolean | null
          owner_responded_at?: string | null
          owner_response?: string | null
          property_id: string
          pros?: string[] | null
          rating: number
          report_count?: number | null
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_approved?: boolean | null
          booking_id?: string | null
          cons?: string[] | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          is_verified_visit?: boolean | null
          owner_responded_at?: string | null
          owner_response?: string | null
          property_id?: string
          pros?: string[] | null
          rating?: number
          report_count?: number | null
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "property_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_revival_log: {
        Row: {
          created_at: string
          id: string
          market_trend_id: string
          property_id: string
          revival_details: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          market_trend_id: string
          property_id: string
          revival_details?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          market_trend_id?: string
          property_id?: string
          revival_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "property_revival_log_market_trend_id_fkey"
            columns: ["market_trend_id"]
            isOneToOne: false
            referencedRelation: "market_trends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_revival_log_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_revival_log_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_seo_analysis: {
        Row: {
          ai_model_used: string | null
          analysis_version: number | null
          created_at: string
          custom_description: string | null
          custom_hashtags: string[] | null
          custom_keywords: string[] | null
          custom_title: string | null
          description_score: number | null
          hashtag_score: number | null
          id: string
          keyword_score: number | null
          last_analyzed_at: string | null
          location_score: number | null
          missing_keywords: string[] | null
          property_id: string | null
          ranking_difficulty: string | null
          seo_description: string | null
          seo_hashtags: string[] | null
          seo_keywords: string[] | null
          seo_rating: string | null
          seo_score: number | null
          seo_title: string | null
          suggested_keywords: string[] | null
          title_score: number | null
          updated_at: string
        }
        Insert: {
          ai_model_used?: string | null
          analysis_version?: number | null
          created_at?: string
          custom_description?: string | null
          custom_hashtags?: string[] | null
          custom_keywords?: string[] | null
          custom_title?: string | null
          description_score?: number | null
          hashtag_score?: number | null
          id?: string
          keyword_score?: number | null
          last_analyzed_at?: string | null
          location_score?: number | null
          missing_keywords?: string[] | null
          property_id?: string | null
          ranking_difficulty?: string | null
          seo_description?: string | null
          seo_hashtags?: string[] | null
          seo_keywords?: string[] | null
          seo_rating?: string | null
          seo_score?: number | null
          seo_title?: string | null
          suggested_keywords?: string[] | null
          title_score?: number | null
          updated_at?: string
        }
        Update: {
          ai_model_used?: string | null
          analysis_version?: number | null
          created_at?: string
          custom_description?: string | null
          custom_hashtags?: string[] | null
          custom_keywords?: string[] | null
          custom_title?: string | null
          description_score?: number | null
          hashtag_score?: number | null
          id?: string
          keyword_score?: number | null
          last_analyzed_at?: string | null
          location_score?: number | null
          missing_keywords?: string[] | null
          property_id?: string | null
          ranking_difficulty?: string | null
          seo_description?: string | null
          seo_hashtags?: string[] | null
          seo_keywords?: string[] | null
          seo_rating?: string | null
          seo_score?: number | null
          seo_title?: string | null
          suggested_keywords?: string[] | null
          title_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_seo_analysis_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_seo_analysis_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_service_bookings: {
        Row: {
          booking_date: string
          booking_status: string | null
          booking_time: string
          completion_notes: string | null
          created_at: string | null
          customer_id: string | null
          customer_rating: number | null
          customer_review: string | null
          duration_hours: number | null
          id: string
          payment_status: string | null
          property_id: string | null
          service_address: string
          service_id: string | null
          special_instructions: string | null
          total_amount: number
          updated_at: string | null
          vendor_id: string
          vendor_response: string | null
        }
        Insert: {
          booking_date: string
          booking_status?: string | null
          booking_time: string
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_rating?: number | null
          customer_review?: string | null
          duration_hours?: number | null
          id?: string
          payment_status?: string | null
          property_id?: string | null
          service_address: string
          service_id?: string | null
          special_instructions?: string | null
          total_amount: number
          updated_at?: string | null
          vendor_id: string
          vendor_response?: string | null
        }
        Update: {
          booking_date?: string
          booking_status?: string | null
          booking_time?: string
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_rating?: number | null
          customer_review?: string | null
          duration_hours?: number | null
          id?: string
          payment_status?: string | null
          property_id?: string | null
          service_address?: string
          service_id?: string | null
          special_instructions?: string | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string
          vendor_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_service_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_service_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["id"]
          },
        ]
      }
      property_service_types: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          pricing_model: string | null
          requires_property_access: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pricing_model?: string | null
          requires_property_access?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pricing_model?: string | null
          requires_property_access?: boolean | null
        }
        Relationships: []
      }
      property_services: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_range_max: number | null
          price_range_min: number | null
          requirements: Json | null
          service_type: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_range_max?: number | null
          price_range_min?: number | null
          requirements?: Json | null
          service_type: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_range_max?: number | null
          price_range_min?: number | null
          requirements?: Json | null
          service_type?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      property_survey_bookings: {
        Row: {
          admin_notes: string | null
          agent_name: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          message: string | null
          preferred_date: string
          preferred_time: string
          property_id: string | null
          property_location: string | null
          property_title: string
          status: string
          survey_type: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          agent_name?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          message?: string | null
          preferred_date: string
          preferred_time: string
          property_id?: string | null
          property_location?: string | null
          property_title: string
          status?: string
          survey_type?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          agent_name?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          message?: string | null
          preferred_date?: string
          preferred_time?: string
          property_id?: string | null
          property_location?: string | null
          property_title?: string
          status?: string
          survey_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_valuations: {
        Row: {
          comparable_properties: Json | null
          confidence_score: number | null
          created_at: string
          currency: string
          estimated_value: number
          id: string
          market_trend: string | null
          price_range_high: number | null
          price_range_low: number | null
          property_id: string | null
          requested_by: string | null
          updated_at: string
          valid_until: string | null
          valuation_factors: Json | null
          valuation_method: string
        }
        Insert: {
          comparable_properties?: Json | null
          confidence_score?: number | null
          created_at?: string
          currency?: string
          estimated_value: number
          id?: string
          market_trend?: string | null
          price_range_high?: number | null
          price_range_low?: number | null
          property_id?: string | null
          requested_by?: string | null
          updated_at?: string
          valid_until?: string | null
          valuation_factors?: Json | null
          valuation_method?: string
        }
        Update: {
          comparable_properties?: Json | null
          confidence_score?: number | null
          created_at?: string
          currency?: string
          estimated_value?: number
          id?: string
          market_trend?: string | null
          price_range_high?: number | null
          price_range_low?: number | null
          property_id?: string | null
          requested_by?: string | null
          updated_at?: string
          valid_until?: string | null
          valuation_factors?: Json | null
          valuation_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_watermark_settings: {
        Row: {
          applies_to_all: boolean | null
          created_at: string | null
          id: string
          image_opacity: number | null
          image_scale: number | null
          is_enabled: boolean | null
          offset_x: number | null
          offset_y: number | null
          position_x: string | null
          position_y: string | null
          property_id: string | null
          text_color: string | null
          text_content: string | null
          text_font: string | null
          text_opacity: number | null
          text_size: number | null
          updated_at: string | null
          watermark_image_url: string | null
          watermark_type: string | null
        }
        Insert: {
          applies_to_all?: boolean | null
          created_at?: string | null
          id?: string
          image_opacity?: number | null
          image_scale?: number | null
          is_enabled?: boolean | null
          offset_x?: number | null
          offset_y?: number | null
          position_x?: string | null
          position_y?: string | null
          property_id?: string | null
          text_color?: string | null
          text_content?: string | null
          text_font?: string | null
          text_opacity?: number | null
          text_size?: number | null
          updated_at?: string | null
          watermark_image_url?: string | null
          watermark_type?: string | null
        }
        Update: {
          applies_to_all?: boolean | null
          created_at?: string | null
          id?: string
          image_opacity?: number | null
          image_scale?: number | null
          is_enabled?: boolean | null
          offset_x?: number | null
          offset_y?: number | null
          position_x?: string | null
          position_y?: string | null
          property_id?: string | null
          text_color?: string | null
          text_content?: string | null
          text_font?: string | null
          text_opacity?: number | null
          text_size?: number | null
          updated_at?: string | null
          watermark_image_url?: string | null
          watermark_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_watermark_settings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_watermark_settings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string | null
          browser: string | null
          created_at: string
          device_name: string | null
          device_type: string | null
          endpoint: string | null
          id: string
          is_active: boolean
          p256dh_key: string | null
          search_id: string | null
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key?: string | null
          browser?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean
          p256dh_key?: string | null
          search_id?: string | null
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string | null
          browser?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean
          p256dh_key?: string | null
          search_id?: string | null
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_analytics: {
        Row: {
          avg_requests_per_ip: number | null
          blocked_requests: number
          created_at: string
          endpoint_pattern: string
          hour_bucket: string
          id: string
          top_ips: Json | null
          total_requests: number
          unique_ips: number
          unique_users: number
        }
        Insert: {
          avg_requests_per_ip?: number | null
          blocked_requests?: number
          created_at?: string
          endpoint_pattern: string
          hour_bucket: string
          id?: string
          top_ips?: Json | null
          total_requests?: number
          unique_ips?: number
          unique_users?: number
        }
        Update: {
          avg_requests_per_ip?: number | null
          blocked_requests?: number
          created_at?: string
          endpoint_pattern?: string
          hour_bucket?: string
          id?: string
          top_ips?: Json | null
          total_requests?: number
          unique_ips?: number
          unique_users?: number
        }
        Relationships: []
      }
      rate_limit_config: {
        Row: {
          applies_to: string
          burst_limit: number | null
          created_at: string
          endpoint_name: string
          endpoint_pattern: string
          id: string
          is_active: boolean
          requests_per_window: number
          updated_at: string
          window_seconds: number
        }
        Insert: {
          applies_to?: string
          burst_limit?: number | null
          created_at?: string
          endpoint_name: string
          endpoint_pattern: string
          id?: string
          is_active?: boolean
          requests_per_window?: number
          updated_at?: string
          window_seconds?: number
        }
        Update: {
          applies_to?: string
          burst_limit?: number | null
          created_at?: string
          endpoint_name?: string
          endpoint_pattern?: string
          id?: string
          is_active?: boolean
          requests_per_window?: number
          updated_at?: string
          window_seconds?: number
        }
        Relationships: []
      }
      rate_limit_entries: {
        Row: {
          created_at: string
          endpoint_pattern: string
          id: string
          identifier: string
          identifier_type: string
          request_count: number
          updated_at: string
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint_pattern: string
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number
          updated_at?: string
          window_end: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint_pattern?: string
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number
          updated_at?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      rate_limit_violations: {
        Row: {
          created_at: string
          endpoint_pattern: string
          first_violation_at: string
          id: string
          identifier: string
          identifier_type: string
          last_violation_at: string
          metadata: Json | null
          request_path: string | null
          user_agent: string | null
          violation_count: number
        }
        Insert: {
          created_at?: string
          endpoint_pattern: string
          first_violation_at?: string
          id?: string
          identifier: string
          identifier_type: string
          last_violation_at?: string
          metadata?: Json | null
          request_path?: string | null
          user_agent?: string | null
          violation_count?: number
        }
        Update: {
          created_at?: string
          endpoint_pattern?: string
          first_violation_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          last_violation_at?: string
          metadata?: Json | null
          request_path?: string | null
          user_agent?: string | null
          violation_count?: number
        }
        Relationships: []
      }
      recommendation_history: {
        Row: {
          created_at: string | null
          discovery_reasons: Json | null
          discovery_score: number | null
          feedback_at: string | null
          id: string
          match_reasons: Json
          overall_score: number
          position_shown: number | null
          preference_score: number | null
          property_id: string
          recommendation_context: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discovery_reasons?: Json | null
          discovery_score?: number | null
          feedback_at?: string | null
          id?: string
          match_reasons: Json
          overall_score: number
          position_shown?: number | null
          preference_score?: number | null
          property_id: string
          recommendation_context?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discovery_reasons?: Json | null
          discovery_score?: number | null
          feedback_at?: string | null
          id?: string
          match_reasons?: Json
          overall_score?: number
          position_shown?: number | null
          preference_score?: number | null
          property_id?: string
          recommendation_context?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_campaigns: {
        Row: {
          actual_conversions: number | null
          actual_referrals: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          referee_reward_amount: number
          referee_reward_type: string
          referrer_reward_amount: number
          referrer_reward_type: string
          share_channels: Json | null
          share_message_template: string | null
          slug: string
          spent_budget: number | null
          start_date: string
          target_conversions: number | null
          target_referrals: number | null
          tier_bonuses: Json | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          actual_conversions?: number | null
          actual_referrals?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          referee_reward_amount?: number
          referee_reward_type?: string
          referrer_reward_amount?: number
          referrer_reward_type?: string
          share_channels?: Json | null
          share_message_template?: string | null
          slug: string
          spent_budget?: number | null
          start_date: string
          target_conversions?: number | null
          target_referrals?: number | null
          tier_bonuses?: Json | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_conversions?: number | null
          actual_referrals?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          referee_reward_amount?: number
          referee_reward_type?: string
          referrer_reward_amount?: number
          referrer_reward_type?: string
          share_channels?: Json | null
          share_message_template?: string | null
          slug?: string
          spent_budget?: number | null
          start_date?: string
          target_conversions?: number | null
          target_referrals?: number | null
          tier_bonuses?: Json | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_milestone_campaigns: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          milestone_reached_at: string | null
          referral_codes: string[] | null
          referrals_completed: number | null
          referrals_required: number
          reward_claimed: boolean | null
          reward_claimed_at: string | null
          reward_months_free: number | null
          subscription_extended_until: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          milestone_reached_at?: string | null
          referral_codes?: string[] | null
          referrals_completed?: number | null
          referrals_required?: number
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          reward_months_free?: number | null
          subscription_extended_until?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          milestone_reached_at?: string | null
          referral_codes?: string[] | null
          referrals_completed?: number | null
          referrals_required?: number
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          reward_months_free?: number | null
          subscription_extended_until?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_milestone_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "viral_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_milestone_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tracking: {
        Row: {
          bonus_applied: number | null
          campaign_id: string | null
          click_count: number | null
          converted_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          landing_page: string | null
          referee_id: string | null
          referee_reward_amount: number | null
          referral_code: string
          referrer_id: string
          referrer_reward_amount: number | null
          rewarded_at: string | null
          share_channel: string | null
          signed_up_at: string | null
          status: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          bonus_applied?: number | null
          campaign_id?: string | null
          click_count?: number | null
          converted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          landing_page?: string | null
          referee_id?: string | null
          referee_reward_amount?: number | null
          referral_code: string
          referrer_id: string
          referrer_reward_amount?: number | null
          rewarded_at?: string | null
          share_channel?: string | null
          signed_up_at?: string | null
          status?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          bonus_applied?: number | null
          campaign_id?: string | null
          click_count?: number | null
          converted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          landing_page?: string | null
          referee_id?: string | null
          referee_reward_amount?: number | null
          referral_code?: string
          referrer_id?: string
          referrer_reward_amount?: number | null
          rewarded_at?: string | null
          share_channel?: string | null
          signed_up_at?: string | null
          status?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "referral_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_id: string
          converted_at: string | null
          created_at: string
          id: string
          qualified_at: string | null
          referral_code: string
          referred_user_id: string
          status: string | null
        }
        Insert: {
          affiliate_id: string
          converted_at?: string | null
          created_at?: string
          id?: string
          qualified_at?: string | null
          referral_code: string
          referred_user_id: string
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          converted_at?: string | null
          created_at?: string
          id?: string
          qualified_at?: string | null
          referral_code?: string
          referred_user_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      rejection_codes: {
        Row: {
          auto_resubmit_allowed: boolean | null
          category: string
          code: string
          description: string
          estimated_fix_time_hours: number | null
          is_active: boolean | null
          requires_admin_review: boolean | null
          resolution_steps: Json
        }
        Insert: {
          auto_resubmit_allowed?: boolean | null
          category: string
          code: string
          description: string
          estimated_fix_time_hours?: number | null
          is_active?: boolean | null
          requires_admin_review?: boolean | null
          resolution_steps?: Json
        }
        Update: {
          auto_resubmit_allowed?: boolean | null
          category?: string
          code?: string
          description?: string
          estimated_fix_time_hours?: number | null
          is_active?: boolean | null
          requires_admin_review?: boolean | null
          resolution_steps?: Json
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          additional_fees: Json | null
          agent_id: string | null
          base_price: number
          booking_status: string | null
          booking_type: string | null
          check_in_date: string
          check_out_date: string
          contact_details: Json | null
          contact_method: string | null
          created_at: string | null
          customer_id: string | null
          deposit_amount: number | null
          deposit_status: string | null
          id: string
          payment_status: string | null
          property_id: string | null
          special_requests: string | null
          terms_accepted: boolean | null
          total_amount: number
          total_days: number
          updated_at: string | null
        }
        Insert: {
          additional_fees?: Json | null
          agent_id?: string | null
          base_price: number
          booking_status?: string | null
          booking_type?: string | null
          check_in_date: string
          check_out_date: string
          contact_details?: Json | null
          contact_method?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          deposit_status?: string | null
          id?: string
          payment_status?: string | null
          property_id?: string | null
          special_requests?: string | null
          terms_accepted?: boolean | null
          total_amount: number
          total_days: number
          updated_at?: string | null
        }
        Update: {
          additional_fees?: Json | null
          agent_id?: string | null
          base_price?: number
          booking_status?: string | null
          booking_type?: string | null
          check_in_date?: string
          check_out_date?: string
          contact_details?: Json | null
          contact_method?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          deposit_status?: string | null
          id?: string
          payment_status?: string | null
          property_id?: string | null
          special_requests?: string | null
          terms_accepted?: boolean | null
          total_amount?: number
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      report_automation_config: {
        Row: {
          ai_insights_enabled: boolean | null
          ai_predictions_enabled: boolean | null
          ai_recommendations_enabled: boolean | null
          auto_distribute: boolean | null
          available_property_types: string[] | null
          available_regions: string[] | null
          avg_generation_time_seconds: number | null
          created_at: string
          default_parameters: Json | null
          description: string | null
          distribution_channels: string[] | null
          id: string
          is_scheduled: boolean | null
          report_name: string
          report_type: string
          schedule_cron: string | null
          subscriber_tiers: string[] | null
          timezone: string | null
          total_downloads: number | null
          total_generated: number | null
          updated_at: string
        }
        Insert: {
          ai_insights_enabled?: boolean | null
          ai_predictions_enabled?: boolean | null
          ai_recommendations_enabled?: boolean | null
          auto_distribute?: boolean | null
          available_property_types?: string[] | null
          available_regions?: string[] | null
          avg_generation_time_seconds?: number | null
          created_at?: string
          default_parameters?: Json | null
          description?: string | null
          distribution_channels?: string[] | null
          id?: string
          is_scheduled?: boolean | null
          report_name: string
          report_type: string
          schedule_cron?: string | null
          subscriber_tiers?: string[] | null
          timezone?: string | null
          total_downloads?: number | null
          total_generated?: number | null
          updated_at?: string
        }
        Update: {
          ai_insights_enabled?: boolean | null
          ai_predictions_enabled?: boolean | null
          ai_recommendations_enabled?: boolean | null
          auto_distribute?: boolean | null
          available_property_types?: string[] | null
          available_regions?: string[] | null
          avg_generation_time_seconds?: number | null
          created_at?: string
          default_parameters?: Json | null
          description?: string | null
          distribution_channels?: string[] | null
          id?: string
          is_scheduled?: boolean | null
          report_name?: string
          report_type?: string
          schedule_cron?: string | null
          subscriber_tiers?: string[] | null
          timezone?: string | null
          total_downloads?: number | null
          total_generated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      research_data_packages: {
        Row: {
          allowed_use_cases: string[] | null
          anonymization_level: string | null
          api_credits_included: number | null
          created_at: string
          data_scope: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          license_type: string | null
          package_name: string
          package_type: string
          price_monthly: number | null
          price_one_time: number | null
          price_yearly: number | null
          records_count: number | null
          requires_approval: boolean | null
          restricted_use_cases: string[] | null
          sample_data: Json | null
          update_frequency: string | null
          updated_at: string
        }
        Insert: {
          allowed_use_cases?: string[] | null
          anonymization_level?: string | null
          api_credits_included?: number | null
          created_at?: string
          data_scope?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_type?: string | null
          package_name: string
          package_type: string
          price_monthly?: number | null
          price_one_time?: number | null
          price_yearly?: number | null
          records_count?: number | null
          requires_approval?: boolean | null
          restricted_use_cases?: string[] | null
          sample_data?: Json | null
          update_frequency?: string | null
          updated_at?: string
        }
        Update: {
          allowed_use_cases?: string[] | null
          anonymization_level?: string | null
          api_credits_included?: number | null
          created_at?: string
          data_scope?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          license_type?: string | null
          package_name?: string
          package_type?: string
          price_monthly?: number | null
          price_one_time?: number | null
          price_yearly?: number | null
          records_count?: number | null
          requires_approval?: boolean | null
          restricted_use_cases?: string[] | null
          sample_data?: Json | null
          update_frequency?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      research_data_subscriptions: {
        Row: {
          api_credits_limit: number | null
          api_credits_used: number | null
          approved_at: string | null
          approved_by: string | null
          auto_renew: boolean | null
          created_at: string
          end_date: string | null
          id: string
          last_download_at: string | null
          organization_name: string | null
          organization_type: string | null
          package_id: string | null
          rejection_reason: string | null
          start_date: string | null
          status: string | null
          subscriber_id: string | null
          subscription_type: string | null
          total_downloads: number | null
          updated_at: string
          use_case_description: string | null
        }
        Insert: {
          api_credits_limit?: number | null
          api_credits_used?: number | null
          approved_at?: string | null
          approved_by?: string | null
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          last_download_at?: string | null
          organization_name?: string | null
          organization_type?: string | null
          package_id?: string | null
          rejection_reason?: string | null
          start_date?: string | null
          status?: string | null
          subscriber_id?: string | null
          subscription_type?: string | null
          total_downloads?: number | null
          updated_at?: string
          use_case_description?: string | null
        }
        Update: {
          api_credits_limit?: number | null
          api_credits_used?: number | null
          approved_at?: string | null
          approved_by?: string | null
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          last_download_at?: string | null
          organization_name?: string | null
          organization_type?: string | null
          package_id?: string | null
          rejection_reason?: string | null
          start_date?: string | null
          status?: string | null
          subscriber_id?: string | null
          subscription_type?: string | null
          total_downloads?: number | null
          updated_at?: string
          use_case_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_data_subscriptions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_data_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "research_data_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_data_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_connections: {
        Row: {
          avg_response_time_hours: number | null
          bio: string | null
          created_at: string | null
          id: string
          is_available_for_questions: boolean | null
          is_current_resident: boolean | null
          is_verified: boolean | null
          property_id: string
          residence_end_date: string | null
          residence_start_date: string | null
          resident_id: string
          response_rate: number | null
          topics_willing_to_discuss: string[] | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time_hours?: number | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_available_for_questions?: boolean | null
          is_current_resident?: boolean | null
          is_verified?: boolean | null
          property_id: string
          residence_end_date?: string | null
          residence_start_date?: string | null
          resident_id: string
          response_rate?: number | null
          topics_willing_to_discuss?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time_hours?: number | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_available_for_questions?: boolean | null
          is_current_resident?: boolean | null
          is_verified?: boolean | null
          property_id?: string
          residence_end_date?: string | null
          residence_start_date?: string | null
          resident_id?: string
          response_rate?: number | null
          topics_willing_to_discuss?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resident_inquiries: {
        Row: {
          created_at: string | null
          id: string
          inquirer_id: string | null
          is_anonymous: boolean | null
          message: string
          property_id: string
          resident_id: string | null
          responded_at: string | null
          response: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquirer_id?: string | null
          is_anonymous?: boolean | null
          message: string
          property_id: string
          resident_id?: string | null
          responded_at?: string | null
          response?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquirer_id?: string | null
          is_anonymous?: boolean | null
          message?: string
          property_id?: string
          resident_id?: string | null
          responded_at?: string | null
          response?: string | null
          status?: string | null
        }
        Relationships: []
      }
      resubmission_history: {
        Row: {
          admin_notes: string | null
          application_id: string
          changes_made: Json | null
          id: string
          new_status: string
          previous_status: string
          rejection_codes: string[] | null
          resubmitted_at: string | null
          resubmitted_by: string
        }
        Insert: {
          admin_notes?: string | null
          application_id: string
          changes_made?: Json | null
          id?: string
          new_status: string
          previous_status: string
          rejection_codes?: string[] | null
          resubmitted_at?: string | null
          resubmitted_by: string
        }
        Update: {
          admin_notes?: string | null
          application_id?: string
          changes_made?: Json | null
          id?: string
          new_status?: string
          previous_status?: string
          rejection_codes?: string[] | null
          resubmitted_at?: string | null
          resubmitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "resubmission_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vendor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reported_by: string
          review_id: string
          review_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reported_by: string
          review_id: string
          review_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reported_by?: string
          review_id?: string
          review_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          review_type: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          review_type: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          review_type?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          cache_hit: boolean | null
          clicked_result_id: string | null
          created_at: string
          id: string
          response_time_ms: number | null
          results_count: number | null
          search_filters: Json | null
          search_query: string
          session_id: string
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          cache_hit?: boolean | null
          clicked_result_id?: string | null
          created_at?: string
          id?: string
          response_time_ms?: number | null
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          session_id: string
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          cache_hit?: boolean | null
          clicked_result_id?: string | null
          created_at?: string
          id?: string
          response_time_ms?: number | null
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          session_id?: string
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      search_filters: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          filter_name: string
          filter_options: Json | null
          filter_type: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          filter_name: string
          filter_options?: Json | null
          filter_type: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          filter_name?: string
          filter_options?: Json | null
          filter_type?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      search_notifications: {
        Row: {
          created_at: string
          filter_type: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          property_id: string | null
          search_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_type?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type: string
          property_id?: string | null
          search_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_type?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          property_id?: string | null
          search_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          ip_address: unknown
          is_read: boolean | null
          is_resolved: boolean | null
          location_data: Json | null
          metadata: Json | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          ip_address?: unknown
          is_read?: boolean | null
          is_resolved?: boolean | null
          location_data?: Json | null
          metadata?: Json | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          ip_address?: unknown
          is_read?: boolean | null
          is_resolved?: boolean | null
          location_data?: Json | null
          metadata?: Json | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_competitor_keywords: {
        Row: {
          competitor_domain: string
          competitor_name: string | null
          created_at: string
          gap: number | null
          id: string
          is_opportunity: boolean | null
          keyword: string
          last_checked_at: string | null
          notes: string | null
          opportunity_score: number | null
          our_position: number | null
          search_volume: number | null
          their_position: number | null
          updated_at: string
        }
        Insert: {
          competitor_domain: string
          competitor_name?: string | null
          created_at?: string
          gap?: number | null
          id?: string
          is_opportunity?: boolean | null
          keyword: string
          last_checked_at?: string | null
          notes?: string | null
          opportunity_score?: number | null
          our_position?: number | null
          search_volume?: number | null
          their_position?: number | null
          updated_at?: string
        }
        Update: {
          competitor_domain?: string
          competitor_name?: string | null
          created_at?: string
          gap?: number | null
          id?: string
          is_opportunity?: boolean | null
          keyword?: string
          last_checked_at?: string | null
          notes?: string | null
          opportunity_score?: number | null
          our_position?: number | null
          search_volume?: number | null
          their_position?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_internal_searches: {
        Row: {
          clicked_result_id: string | null
          clicked_result_type: string | null
          created_at: string
          id: string
          ip_address: unknown
          location_filter: string | null
          property_type_filter: string | null
          results_count: number | null
          search_filters: Json | null
          search_query: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          clicked_result_type?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          location_filter?: string | null
          property_type_filter?: string | null
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          clicked_result_type?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          location_filter?: string | null
          property_type_filter?: string | null
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_internal_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          competitor_positions: Json | null
          created_at: string
          current_position: number | null
          difficulty_score: number | null
          id: string
          is_tracked: boolean | null
          keyword: string
          landing_page_id: string | null
          last_checked_at: string | null
          monthly_trend: Json | null
          position_change: number | null
          previous_position: number | null
          search_volume: number | null
          target_url: string | null
          updated_at: string
        }
        Insert: {
          competitor_positions?: Json | null
          created_at?: string
          current_position?: number | null
          difficulty_score?: number | null
          id?: string
          is_tracked?: boolean | null
          keyword: string
          landing_page_id?: string | null
          last_checked_at?: string | null
          monthly_trend?: Json | null
          position_change?: number | null
          previous_position?: number | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          competitor_positions?: Json | null
          created_at?: string
          current_position?: number | null
          difficulty_score?: number | null
          id?: string
          is_tracked?: boolean | null
          keyword?: string
          landing_page_id?: string | null
          last_checked_at?: string | null
          monthly_trend?: Json | null
          position_change?: number | null
          previous_position?: number | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "seo_landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_landing_pages: {
        Row: {
          ai_model_used: string | null
          avg_price: number | null
          category: string | null
          clicks_count: number | null
          closing_content: string | null
          conversions_count: number | null
          created_at: string
          h1_heading: string | null
          id: string
          internal_links: Json | null
          intro_content: string | null
          is_ai_generated: boolean | null
          is_published: boolean | null
          last_ai_update: string | null
          main_content: string | null
          meta_description: string | null
          meta_title: string | null
          page_type: string
          price_range_max: number | null
          price_range_min: number | null
          primary_keyword: string | null
          property_count: number | null
          property_type: string | null
          secondary_keywords: string[] | null
          seo_score: number | null
          slug: string
          state_id: string | null
          state_name: string
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          ai_model_used?: string | null
          avg_price?: number | null
          category?: string | null
          clicks_count?: number | null
          closing_content?: string | null
          conversions_count?: number | null
          created_at?: string
          h1_heading?: string | null
          id?: string
          internal_links?: Json | null
          intro_content?: string | null
          is_ai_generated?: boolean | null
          is_published?: boolean | null
          last_ai_update?: string | null
          main_content?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_type: string
          price_range_max?: number | null
          price_range_min?: number | null
          primary_keyword?: string | null
          property_count?: number | null
          property_type?: string | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug: string
          state_id?: string | null
          state_name: string
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          ai_model_used?: string | null
          avg_price?: number | null
          category?: string | null
          clicks_count?: number | null
          closing_content?: string | null
          conversions_count?: number | null
          created_at?: string
          h1_heading?: string | null
          id?: string
          internal_links?: Json | null
          intro_content?: string | null
          is_ai_generated?: boolean | null
          is_published?: boolean | null
          last_ai_update?: string | null
          main_content?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_type?: string
          price_range_max?: number | null
          price_range_min?: number | null
          primary_keyword?: string | null
          property_count?: number | null
          property_type?: string | null
          secondary_keywords?: string[] | null
          seo_score?: number | null
          slug?: string
          state_id?: string | null
          state_name?: string
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      seo_publish_queue: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          landing_page_id: string | null
          priority: number | null
          processed_at: string | null
          scheduled_for: string | null
          status: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          landing_page_id?: string | null
          priority?: number | null
          processed_at?: string | null
          scheduled_for?: string | null
          status?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          landing_page_id?: string | null
          priority?: number | null
          processed_at?: string | null
          scheduled_for?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_publish_queue_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "seo_landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_trend_data: {
        Row: {
          category: string | null
          competition_level: string | null
          created_at: string
          id: string
          keyword: string
          language: string | null
          last_updated: string | null
          location_relevance: string | null
          property_type_relevance: string | null
          ranking_frequency: number | null
          search_volume: number | null
          source: string | null
          trend_direction: string | null
          trend_score: number | null
        }
        Insert: {
          category?: string | null
          competition_level?: string | null
          created_at?: string
          id?: string
          keyword: string
          language?: string | null
          last_updated?: string | null
          location_relevance?: string | null
          property_type_relevance?: string | null
          ranking_frequency?: number | null
          search_volume?: number | null
          source?: string | null
          trend_direction?: string | null
          trend_score?: number | null
        }
        Update: {
          category?: string | null
          competition_level?: string | null
          created_at?: string
          id?: string
          keyword?: string
          language?: string | null
          last_updated?: string | null
          location_relevance?: string | null
          property_type_relevance?: string | null
          ranking_frequency?: number | null
          search_volume?: number | null
          source?: string | null
          trend_direction?: string | null
          trend_score?: number | null
        }
        Relationships: []
      }
      service_area_mappings: {
        Row: {
          area_type: string
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          pricing_multiplier: number | null
          size_ranges: Json | null
          special_requirements: Json | null
        }
        Insert: {
          area_type: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pricing_multiplier?: number | null
          size_ranges?: Json | null
          special_requirements?: Json | null
        }
        Update: {
          area_type?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pricing_multiplier?: number | null
          size_ranges?: Json | null
          special_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "service_area_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
      service_name_requests: {
        Row: {
          admin_notes: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          requested_by: string
          requested_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          requested_by: string
          requested_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          requested_by?: string
          requested_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_name_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_name_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_name_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing_rules: {
        Row: {
          base_multiplier: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_price: number | null
          property_type: string
          service_category: string
          updated_at: string | null
        }
        Insert: {
          base_multiplier?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_price?: number | null
          property_type: string
          service_category: string
          updated_at?: string | null
        }
        Update: {
          base_multiplier?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_price?: number | null
          property_type?: string
          service_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_provider_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          photos: string[] | null
          provider_id: string
          rating: number
          reviewer_id: string | null
          service_used: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          photos?: string[] | null
          provider_id: string
          rating: number
          reviewer_id?: string | null
          service_used?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          photos?: string[] | null
          provider_id?: string
          rating?: number
          reviewer_id?: string | null
          service_used?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "local_service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      share_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          referrer: string | null
          share_id: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          referrer?: string | null
          share_id: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          referrer?: string | null
          share_id?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_analytics_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "shared_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_searches: {
        Row: {
          access_count: number
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          owner_id: string
          search_id: string
          updated_at: string
        }
        Insert: {
          access_count?: number
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          owner_id: string
          search_id: string
          updated_at?: string
        }
        Update: {
          access_count?: number
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          owner_id?: string
          search_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_commerce_campaigns: {
        Row: {
          budget: number | null
          campaign_name: string
          campaign_type: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          performance_metrics: Json | null
          platform_id: string | null
          properties: string[] | null
          spent: number | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_name: string
          campaign_type: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          performance_metrics?: Json | null
          platform_id?: string | null
          properties?: string[] | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_name?: string
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          performance_metrics?: Json | null
          platform_id?: string | null
          properties?: string[] | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_commerce_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_commerce_campaigns_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_commerce_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      social_commerce_listings: {
        Row: {
          call_to_action: string | null
          caption: string | null
          clicks: number | null
          created_at: string
          expires_at: string | null
          external_listing_id: string | null
          featured_media: Json | null
          hashtags: string[] | null
          id: string
          impressions: number | null
          inquiries: number | null
          listing_url: string | null
          platform_id: string | null
          property_id: string | null
          published_at: string | null
          saves: number | null
          shares: number | null
          shop_now_enabled: boolean | null
          status: string | null
          updated_at: string
        }
        Insert: {
          call_to_action?: string | null
          caption?: string | null
          clicks?: number | null
          created_at?: string
          expires_at?: string | null
          external_listing_id?: string | null
          featured_media?: Json | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          inquiries?: number | null
          listing_url?: string | null
          platform_id?: string | null
          property_id?: string | null
          published_at?: string | null
          saves?: number | null
          shares?: number | null
          shop_now_enabled?: boolean | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          call_to_action?: string | null
          caption?: string | null
          clicks?: number | null
          created_at?: string
          expires_at?: string | null
          external_listing_id?: string | null
          featured_media?: Json | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          inquiries?: number | null
          listing_url?: string | null
          platform_id?: string | null
          property_id?: string | null
          published_at?: string | null
          saves?: number | null
          shares?: number | null
          shop_now_enabled?: boolean | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_commerce_listings_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_commerce_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_commerce_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_commerce_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      social_commerce_platforms: {
        Row: {
          api_credentials: Json | null
          created_at: string
          display_name: string
          id: string
          is_enabled: boolean | null
          last_sync_at: string | null
          platform_name: string
          settings: Json | null
          sync_status: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_impressions: number | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_credentials?: Json | null
          created_at?: string
          display_name: string
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          platform_name: string
          settings?: Json | null
          sync_status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_credentials?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          platform_name?: string
          settings?: Json | null
          sync_status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_impressions?: number | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      social_media_settings: {
        Row: {
          account_name: string | null
          api_credentials: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          posting_settings: Json | null
          profile_url: string | null
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          api_credentials?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          posting_settings?: Json | null
          profile_url?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          api_credentials?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          posting_settings?: Json | null
          profile_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_invoices: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          metadata: Json | null
          paid_at: string | null
          payment_order_id: string | null
          status: string
          subscription_id: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          metadata?: Json | null
          paid_at?: string | null
          payment_order_id?: string | null
          status?: string
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          metadata?: Json | null
          paid_at?: string | null
          payment_order_id?: string | null
          status?: string
          subscription_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          listing_limit: number | null
          name: string
          price_annual: number | null
          price_monthly: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          listing_limit?: number | null
          name: string
          price_annual?: number | null
          price_monthly?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          listing_limit?: number | null
          name?: string
          price_annual?: number | null
          price_monthly?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          description: string
          id: string
          metadata: Json | null
          priority: string | null
          related_order_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_order_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_order_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "user_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      syndicated_listings: {
        Row: {
          agent_id: string | null
          clicks: number | null
          created_at: string
          expires_at: string | null
          external_listing_id: string | null
          external_url: string | null
          id: string
          impressions: number | null
          inquiries: number | null
          network_id: string | null
          property_id: string | null
          published_at: string | null
          rejection_reason: string | null
          status: string | null
          syndication_type: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          clicks?: number | null
          created_at?: string
          expires_at?: string | null
          external_listing_id?: string | null
          external_url?: string | null
          id?: string
          impressions?: number | null
          inquiries?: number | null
          network_id?: string | null
          property_id?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          syndication_type?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          clicks?: number | null
          created_at?: string
          expires_at?: string | null
          external_listing_id?: string | null
          external_url?: string | null
          id?: string
          impressions?: number | null
          inquiries?: number | null
          network_id?: string | null
          property_id?: string | null
          published_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          syndication_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syndicated_listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndicated_listings_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "listing_syndication_networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndicated_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syndicated_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_error_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          error_type: string
          id: string
          is_resolved: boolean | null
          request_headers: Json | null
          request_method: string | null
          request_url: string | null
          severity: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          error_type: string
          id?: string
          is_resolved?: boolean | null
          request_headers?: Json | null
          request_method?: string | null
          request_url?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          error_type?: string
          id?: string
          is_resolved?: boolean | null
          request_headers?: Json | null
          request_method?: string | null
          request_url?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_metrics: {
        Row: {
          component: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string | null
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
        }
        Insert: {
          component: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Update: {
          component?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Relationships: []
      }
      system_reports: {
        Row: {
          action_taken: string | null
          admin_notes: string | null
          created_at: string | null
          description: string | null
          evidence_urls: Json | null
          id: string
          reason: string
          report_type: string
          reported_by: string | null
          resolved_at: string | null
          reviewed_by: string | null
          status: string | null
          target_id: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: Json | null
          id?: string
          reason: string
          report_type: string
          reported_by?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: Json | null
          id?: string
          reason?: string
          report_type?: string
          reported_by?: string | null
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      system_updates: {
        Row: {
          affects_systems: string[] | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_id: string | null
          downtime_expected: boolean | null
          downtime_minutes: number | null
          id: string
          priority: string | null
          release_notes: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["update_status"] | null
          title: string
          title_id: string | null
          update_type: string
          updated_at: string | null
          version: string
        }
        Insert: {
          affects_systems?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_id?: string | null
          downtime_expected?: boolean | null
          downtime_minutes?: number | null
          id?: string
          priority?: string | null
          release_notes?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["update_status"] | null
          title: string
          title_id?: string | null
          update_type: string
          updated_at?: string | null
          version: string
        }
        Update: {
          affects_systems?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_id?: string | null
          downtime_expected?: boolean | null
          downtime_minutes?: number | null
          id?: string
          priority?: string | null
          release_notes?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["update_status"] | null
          title?: string
          title_id?: string | null
          update_type?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          applicable_to: string[] | null
          created_at: string | null
          description: string | null
          description_id: string | null
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number | null
          rate: number
          tax_code: string
          tax_name: string
          tax_name_id: string
          updated_at: string | null
        }
        Insert: {
          applicable_to?: string[] | null
          created_at?: string | null
          description?: string | null
          description_id?: string | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          rate: number
          tax_code: string
          tax_name: string
          tax_name_id: string
          updated_at?: string | null
        }
        Update: {
          applicable_to?: string[] | null
          created_at?: string | null
          description?: string | null
          description_id?: string | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          rate?: number
          tax_code?: string
          tax_name?: string
          tax_name_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_commission_payouts: {
        Row: {
          created_at: string | null
          deals_count: number | null
          deals_details: Json | null
          deductions: number | null
          gross_commission: number
          id: string
          member_id: string
          net_commission: number
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payout_period_end: string
          payout_period_start: string
          processed_by: string | null
          status: string | null
          team_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deals_count?: number | null
          deals_details?: Json | null
          deductions?: number | null
          gross_commission: number
          id?: string
          member_id: string
          net_commission: number
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payout_period_end: string
          payout_period_start: string
          processed_by?: string | null
          status?: string | null
          team_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deals_count?: number | null
          deals_details?: Json | null
          deductions?: number | null
          gross_commission?: number
          id?: string
          member_id?: string
          net_commission?: number
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payout_period_end?: string
          payout_period_start?: string
          processed_by?: string | null
          status?: string | null
          team_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_commission_payouts_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_hiring_pipeline: {
        Row: {
          applicants_count: number | null
          closes_at: string | null
          commission_structure: string | null
          created_at: string | null
          department: Database["public"]["Enums"]["team_department"] | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          hiring_manager_id: string | null
          id: string
          interviews_scheduled: number | null
          job_description: string | null
          job_title: string
          location: string | null
          nice_to_have: string[] | null
          offers_sent: number | null
          position_type: string
          positions_filled: number | null
          posted_at: string | null
          requirements: string[] | null
          salary_range: string | null
          status: string | null
          total_positions: number | null
          updated_at: string | null
        }
        Insert: {
          applicants_count?: number | null
          closes_at?: string | null
          commission_structure?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["team_department"] | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hiring_manager_id?: string | null
          id?: string
          interviews_scheduled?: number | null
          job_description?: string | null
          job_title: string
          location?: string | null
          nice_to_have?: string[] | null
          offers_sent?: number | null
          position_type: string
          positions_filled?: number | null
          posted_at?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          total_positions?: number | null
          updated_at?: string | null
        }
        Update: {
          applicants_count?: number | null
          closes_at?: string | null
          commission_structure?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["team_department"] | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hiring_manager_id?: string | null
          id?: string
          interviews_scheduled?: number | null
          job_description?: string | null
          job_title?: string
          location?: string | null
          nice_to_have?: string[] | null
          offers_sent?: number | null
          position_type?: string
          positions_filled?: number | null
          posted_at?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          total_positions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_performance_reviews: {
        Row: {
          action_items: Json | null
          areas_for_improvement: string[] | null
          created_at: string | null
          goals_achieved: string[] | null
          goals_missed: string[] | null
          id: string
          member_comments: string | null
          member_id: string
          next_period_goals: string[] | null
          overall_score: number
          review_period_end: string
          review_period_start: string
          reviewer_comments: string | null
          reviewer_id: string | null
          scores_breakdown: Json | null
          status: string | null
          strengths: string[] | null
          team_type: string
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          areas_for_improvement?: string[] | null
          created_at?: string | null
          goals_achieved?: string[] | null
          goals_missed?: string[] | null
          id?: string
          member_comments?: string | null
          member_id: string
          next_period_goals?: string[] | null
          overall_score: number
          review_period_end: string
          review_period_start: string
          reviewer_comments?: string | null
          reviewer_id?: string | null
          scores_breakdown?: Json | null
          status?: string | null
          strengths?: string[] | null
          team_type: string
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          areas_for_improvement?: string[] | null
          created_at?: string | null
          goals_achieved?: string[] | null
          goals_missed?: string[] | null
          id?: string
          member_comments?: string | null
          member_id?: string
          next_period_goals?: string[] | null
          overall_score?: number
          review_period_end?: string
          review_period_start?: string
          reviewer_comments?: string | null
          reviewer_id?: string | null
          scores_breakdown?: Json | null
          status?: string | null
          strengths?: string[] | null
          team_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          metadata: Json | null
          ticket_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
          ticket_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ticket_activities_ticket_id"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "customer_support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          hotspots_clicked: string[] | null
          id: string
          ip_address: unknown
          is_vr_session: boolean | null
          scenes_visited: string[] | null
          session_id: string
          started_at: string
          tour_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          hotspots_clicked?: string[] | null
          id?: string
          ip_address?: unknown
          is_vr_session?: boolean | null
          scenes_visited?: string[] | null
          session_id: string
          started_at?: string
          tour_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          hotspots_clicked?: string[] | null
          id?: string
          ip_address?: unknown
          is_vr_session?: boolean | null
          scenes_visited?: string[] | null
          session_id?: string
          started_at?: string
          tour_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_analytics_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "video_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_hotspots: {
        Row: {
          created_at: string
          description: string | null
          hotspot_type: string
          icon: string | null
          id: string
          link_url: string | null
          media_url: string | null
          position: Json
          scene_id: string
          style: Json | null
          target_scene_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotspot_type: string
          icon?: string | null
          id?: string
          link_url?: string | null
          media_url?: string | null
          position?: Json
          scene_id: string
          style?: Json | null
          target_scene_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hotspot_type?: string
          icon?: string | null
          id?: string
          link_url?: string | null
          media_url?: string | null
          position?: Json
          scene_id?: string
          style?: Json | null
          target_scene_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_hotspots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "tour_scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_hotspots_target_scene_id_fkey"
            columns: ["target_scene_id"]
            isOneToOne: false
            referencedRelation: "tour_scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_scenes: {
        Row: {
          created_at: string
          id: string
          image_url: string
          initial_view: Json | null
          is_entry_point: boolean | null
          scene_order: number | null
          thumbnail_url: string | null
          title: string
          tour_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          initial_view?: Json | null
          is_entry_point?: boolean | null
          scene_order?: number | null
          thumbnail_url?: string | null
          title: string
          tour_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          initial_view?: Json | null
          is_entry_point?: boolean | null
          scene_order?: number | null
          thumbnail_url?: string | null
          title?: string
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_scenes_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "video_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          message_id: string | null
          metadata: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          title_id: string | null
          transaction_id: string | null
        }
        Insert: {
          alert_type: string
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          message_id?: string | null
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
          title_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          message_id?: string | null
          metadata?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          title_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_alerts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "unified_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_audit_log: {
        Row: {
          action: string
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_status: string | null
          previous_status: string | null
          transaction_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          transaction_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          transaction_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_audit_log_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "unified_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_commissions: {
        Row: {
          buyer_id: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          gross_amount: number
          hold_until: string | null
          id: string
          metadata: Json | null
          net_amount: number
          payout_id: string | null
          released_at: string | null
          seller_id: string
          status: string
          tax_amount: number | null
          transaction_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          commission_amount: number
          commission_rate: number
          created_at?: string
          gross_amount: number
          hold_until?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          payout_id?: string | null
          released_at?: string | null
          seller_id: string
          status?: string
          tax_amount?: number | null
          transaction_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          gross_amount?: number
          hold_until?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          payout_id?: string | null
          released_at?: string | null
          seller_id?: string
          status?: string
          tax_amount?: number | null
          transaction_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      trending_topics: {
        Row: {
          category: string | null
          created_at: string | null
          date_tracked: string | null
          id: string
          related_keywords: string[] | null
          topic: string
          trend_score: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date_tracked?: string | null
          id?: string
          related_keywords?: string[] | null
          topic: string
          trend_score?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date_tracked?: string | null
          id?: string
          related_keywords?: string[] | null
          topic?: string
          trend_score?: number | null
        }
        Relationships: []
      }
      ugc_challenges: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          judging_criteria: Json | null
          judging_method: string | null
          marketing_budget: number | null
          participation_rules: Json | null
          prize_budget: number | null
          prizes: Json | null
          slug: string
          status: string | null
          submission_end: string
          submission_start: string
          theme: string
          title: string
          total_submissions: number | null
          total_views: number | null
          total_votes: number | null
          updated_at: string | null
          voting_end: string | null
          voting_start: string | null
          winners_announced: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          judging_criteria?: Json | null
          judging_method?: string | null
          marketing_budget?: number | null
          participation_rules?: Json | null
          prize_budget?: number | null
          prizes?: Json | null
          slug: string
          status?: string | null
          submission_end: string
          submission_start: string
          theme: string
          title: string
          total_submissions?: number | null
          total_views?: number | null
          total_votes?: number | null
          updated_at?: string | null
          voting_end?: string | null
          voting_start?: string | null
          winners_announced?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          judging_criteria?: Json | null
          judging_method?: string | null
          marketing_budget?: number | null
          participation_rules?: Json | null
          prize_budget?: number | null
          prizes?: Json | null
          slug?: string
          status?: string | null
          submission_end?: string
          submission_start?: string
          theme?: string
          title?: string
          total_submissions?: number | null
          total_views?: number | null
          total_votes?: number | null
          updated_at?: string | null
          voting_end?: string | null
          voting_start?: string | null
          winners_announced?: string | null
        }
        Relationships: []
      }
      ugc_submissions: {
        Row: {
          approved_at: string | null
          challenge_id: string | null
          comment_count: number | null
          created_at: string | null
          description: string
          final_score: number | null
          id: string
          judge_scores: Json | null
          location: string | null
          media_urls: Json
          moderation_notes: string | null
          property_id: string | null
          rank: number | null
          share_count: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
          vote_count: number | null
        }
        Insert: {
          approved_at?: string | null
          challenge_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          description: string
          final_score?: number | null
          id?: string
          judge_scores?: Json | null
          location?: string | null
          media_urls?: Json
          moderation_notes?: string | null
          property_id?: string | null
          rank?: number | null
          share_count?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          vote_count?: number | null
        }
        Update: {
          approved_at?: string | null
          challenge_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          description?: string
          final_score?: number | null
          id?: string
          judge_scores?: Json | null
          location?: string | null
          media_urls?: Json
          moderation_notes?: string | null
          property_id?: string | null
          rank?: number | null
          share_count?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ugc_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ugc_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      ugc_votes: {
        Row: {
          created_at: string | null
          id: string
          submission_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          submission_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          submission_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ugc_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "ugc_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_transactions: {
        Row: {
          base_amount: number
          booking_id: string | null
          buyer_id: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          payment_gateway: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          property_id: string | null
          seller_id: string | null
          service_charges: number | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          subtotal: number
          tax_breakdown: Json | null
          total_amount: number
          total_tax: number | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          vendor_service_id: string | null
        }
        Insert: {
          base_amount: number
          booking_id?: string | null
          buyer_id?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          property_id?: string | null
          seller_id?: string | null
          service_charges?: number | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subtotal: number
          tax_breakdown?: Json | null
          total_amount: number
          total_tax?: number | null
          transaction_number: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          vendor_service_id?: string | null
        }
        Update: {
          base_amount?: number
          booking_id?: string | null
          buyer_id?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          property_id?: string | null
          seller_id?: string | null
          service_charges?: number | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subtotal?: number
          tax_breakdown?: Json | null
          total_amount?: number
          total_tax?: number | null
          transaction_number?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          vendor_service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean | null
          last_verified_at: string | null
          method: string
          phone_number: string | null
          phone_verified: boolean | null
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          last_verified_at?: string | null
          method?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          last_verified_at?: string | null
          method?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_data: Json
          achievement_type: string
          created_at: string | null
          id: string
          is_shared: boolean | null
          share_image_url: string | null
          share_text: string | null
          shared_at: string | null
          user_id: string
        }
        Insert: {
          achievement_data: Json
          achievement_type: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          share_image_url?: string | null
          share_text?: string | null
          shared_at?: string | null
          user_id: string
        }
        Update: {
          achievement_data?: Json
          achievement_type?: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          share_image_url?: string | null
          share_text?: string | null
          shared_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          device_info: Json | null
          id: string
          ip_address: unknown
          location_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          location_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          location_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          is_displayed: boolean | null
          is_new: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          is_displayed?: boolean | null
          is_new?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          is_displayed?: boolean | null
          is_new?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_signals: {
        Row: {
          comparison_properties: string[] | null
          created_at: string | null
          device_type: string | null
          id: string
          photos_viewed: number | null
          property_id: string | null
          property_snapshot: Json | null
          referrer: string | null
          scroll_depth: number | null
          sections_expanded: string[] | null
          session_id: string | null
          signal_strength: number | null
          signal_type: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          comparison_properties?: string[] | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          photos_viewed?: number | null
          property_id?: string | null
          property_snapshot?: Json | null
          referrer?: string | null
          scroll_depth?: number | null
          sections_expanded?: string[] | null
          session_id?: string | null
          signal_strength?: number | null
          signal_type: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          comparison_properties?: string[] | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          photos_viewed?: number | null
          property_id?: string | null
          property_snapshot?: Json | null
          referrer?: string | null
          scroll_depth?: number | null
          sections_expanded?: string[] | null
          session_id?: string | null
          signal_strength?: number | null
          signal_type?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_departments: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: string[] | null
          property_category_access: string[] | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: string[] | null
          property_category_access?: string[] | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: string[] | null
          property_category_access?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_device_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          location_data: Json | null
          login_time: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          login_time?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          login_time?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          first_seen_at: string | null
          id: string
          ip_address: unknown
          is_trusted: boolean | null
          last_used_at: string | null
          location_data: Json | null
          os_name: string | null
          os_version: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: unknown
          is_trusted?: boolean | null
          last_used_at?: string | null
          location_data?: Json | null
          os_name?: string | null
          os_version?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          first_seen_at?: string | null
          id?: string
          ip_address?: unknown
          is_trusted?: boolean | null
          last_used_at?: string | null
          location_data?: Json | null
          os_name?: string | null
          os_version?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          actual_behavior: string | null
          assigned_to: string | null
          browser_info: Json | null
          created_at: string | null
          description: string
          expected_behavior: string | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id: string
          metadata: Json | null
          page_url: string | null
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          screenshot_urls: string[] | null
          severity: string | null
          status: string | null
          steps_to_reproduce: string | null
          title: string
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          actual_behavior?: string | null
          assigned_to?: string | null
          browser_info?: Json | null
          created_at?: string | null
          description: string
          expected_behavior?: string | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id?: string
          metadata?: Json | null
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          screenshot_urls?: string[] | null
          severity?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          actual_behavior?: string | null
          assigned_to?: string | null
          browser_info?: Json | null
          created_at?: string | null
          description?: string
          expected_behavior?: string | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          metadata?: Json | null
          page_url?: string | null
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          screenshot_urls?: string[] | null
          severity?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_filter_preferences: {
        Row: {
          created_at: string
          filter_name: string
          id: string
          is_default: boolean | null
          listing_type: string
          saved_value: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filter_name: string
          id?: string
          is_default?: boolean | null
          listing_type: string
          saved_value: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filter_name?: string
          id?: string
          is_default?: boolean | null
          listing_type?: string
          saved_value?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_gamification_stats: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          id: string
          inquiries_received: number | null
          inquiries_sent: number | null
          last_login_date: string | null
          longest_streak: number | null
          properties_listed: number | null
          properties_saved: number | null
          properties_shared: number | null
          referrals_completed: number | null
          reviews_written: number | null
          total_logins: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          user_type: string | null
          viewings_booked: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          id?: string
          inquiries_received?: number | null
          inquiries_sent?: number | null
          last_login_date?: string | null
          longest_streak?: number | null
          properties_listed?: number | null
          properties_saved?: number | null
          properties_shared?: number | null
          referrals_completed?: number | null
          reviews_written?: number | null
          total_logins?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
          viewings_booked?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          id?: string
          inquiries_received?: number | null
          inquiries_sent?: number | null
          last_login_date?: string | null
          longest_streak?: number | null
          properties_listed?: number | null
          properties_saved?: number | null
          properties_shared?: number | null
          referrals_completed?: number | null
          reviews_written?: number | null
          total_logins?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
          viewings_booked?: number | null
        }
        Relationships: []
      }
      user_ideas: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_data: Json
          interaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_data?: Json
          interaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_data?: Json
          interaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          can_feature_listings: boolean | null
          created_at: string | null
          description: string | null
          id: string
          max_listings: number | null
          max_properties: number | null
          name: string
          priority_support: boolean | null
          privileges: Json | null
          updated_at: string | null
        }
        Insert: {
          can_feature_listings?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_listings?: number | null
          max_properties?: number | null
          name: string
          priority_support?: boolean | null
          privileges?: Json | null
          updated_at?: string | null
        }
        Update: {
          can_feature_listings?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_listings?: number | null
          max_properties?: number | null
          name?: string
          priority_support?: boolean | null
          privileges?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_login_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: unknown
          is_read: boolean | null
          location_data: Json | null
          message: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_read?: boolean | null
          location_data?: Json | null
          message: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_read?: boolean | null
          location_data?: Json | null
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_orders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          priority: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["order_status"]
          title: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          order_type: Database["public"]["Enums"]["order_type"]
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          title: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          priority?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          title?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preference_profiles: {
        Row: {
          created_at: string | null
          deal_breakers: string[] | null
          discovery_openness: number | null
          features_weight: number | null
          id: string
          location_weight: number | null
          max_bedrooms: number | null
          max_budget: number | null
          max_land_size: number | null
          min_bathrooms: number | null
          min_bedrooms: number | null
          min_budget: number | null
          min_land_size: number | null
          must_have_features: string[] | null
          preferred_discovery_types: string[] | null
          preferred_locations: string[] | null
          preferred_property_types: string[] | null
          price_weight: number | null
          size_weight: number | null
          type_weight: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_breakers?: string[] | null
          discovery_openness?: number | null
          features_weight?: number | null
          id?: string
          location_weight?: number | null
          max_bedrooms?: number | null
          max_budget?: number | null
          max_land_size?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          min_budget?: number | null
          min_land_size?: number | null
          must_have_features?: string[] | null
          preferred_discovery_types?: string[] | null
          preferred_locations?: string[] | null
          preferred_property_types?: string[] | null
          price_weight?: number | null
          size_weight?: number | null
          type_weight?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_breakers?: string[] | null
          discovery_openness?: number | null
          features_weight?: number | null
          id?: string
          location_weight?: number | null
          max_bedrooms?: number | null
          max_budget?: number | null
          max_land_size?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          min_budget?: number | null
          min_land_size?: number | null
          must_have_features?: string[] | null
          preferred_discovery_types?: string[] | null
          preferred_locations?: string[] | null
          preferred_property_types?: string[] | null
          price_weight?: number | null
          size_weight?: number | null
          type_weight?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          compact_view: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          show_avatars: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compact_view?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          show_avatars?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compact_view?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          show_avatars?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_role_audit: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          name: string
          query: string | null
          timestamp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          name: string
          query?: string | null
          timestamp: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string
          query?: string | null
          timestamp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_security_logs: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: unknown
          is_flagged: boolean | null
          location_data: Json | null
          risk_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          is_flagged?: boolean | null
          location_data?: Json | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          is_flagged?: boolean | null
          location_data?: Json | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_session_tracking: {
        Row: {
          device_info: Json | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          login_time: string | null
          logout_time: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          login_time?: string | null
          logout_time?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          login_time?: string | null
          logout_time?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_name: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_current: boolean | null
          last_activity_at: string
          location_data: Json | null
          os: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_current?: boolean | null
          last_activity_at?: string
          location_data?: Json | null
          os?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_current?: boolean | null
          last_activity_at?: string
          location_data?: Json | null
          os?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status_symbols: {
        Row: {
          created_at: string | null
          flair_badges: string[] | null
          id: string
          profile_frame: string | null
          show_level: boolean | null
          show_xp: boolean | null
          title_override: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flair_badges?: string[] | null
          id?: string
          profile_frame?: string | null
          show_level?: boolean | null
          show_xp?: boolean | null
          title_override?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flair_badges?: string[] | null
          id?: string
          profile_frame?: string | null
          show_level?: boolean | null
          show_xp?: boolean | null
          title_override?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          plan_id: string | null
          starts_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: string | null
          starts_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: string | null
          starts_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verification: {
        Row: {
          created_at: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          id: string
          identity_verified: boolean | null
          identity_verified_at: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id?: string
          identity_verified?: boolean | null
          identity_verified_at?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id?: string
          identity_verified?: boolean | null
          identity_verified_at?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      user_verifications: {
        Row: {
          badge_tier: Database["public"]["Enums"]["badge_tier"] | null
          bank_details_added: boolean | null
          bank_details_verified: boolean | null
          basic_completed_at: string | null
          created_at: string | null
          current_level:
            | Database["public"]["Enums"]["verification_level"]
            | null
          email_verified: boolean | null
          enhanced_completed_at: string | null
          id: string
          id_document_uploaded: boolean | null
          id_document_verified: boolean | null
          license_number: string | null
          license_verified: boolean | null
          phone_verified: boolean | null
          premium_completed_at: string | null
          professional_completed_at: string | null
          references_count: number | null
          references_verified: number | null
          social_media_linked: Json | null
          trust_score: number | null
          updated_at: string | null
          user_id: string
          video_verification_completed: boolean | null
          video_verification_url: string | null
        }
        Insert: {
          badge_tier?: Database["public"]["Enums"]["badge_tier"] | null
          bank_details_added?: boolean | null
          bank_details_verified?: boolean | null
          basic_completed_at?: string | null
          created_at?: string | null
          current_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          email_verified?: boolean | null
          enhanced_completed_at?: string | null
          id?: string
          id_document_uploaded?: boolean | null
          id_document_verified?: boolean | null
          license_number?: string | null
          license_verified?: boolean | null
          phone_verified?: boolean | null
          premium_completed_at?: string | null
          professional_completed_at?: string | null
          references_count?: number | null
          references_verified?: number | null
          social_media_linked?: Json | null
          trust_score?: number | null
          updated_at?: string | null
          user_id: string
          video_verification_completed?: boolean | null
          video_verification_url?: string | null
        }
        Update: {
          badge_tier?: Database["public"]["Enums"]["badge_tier"] | null
          bank_details_added?: boolean | null
          bank_details_verified?: boolean | null
          basic_completed_at?: string | null
          created_at?: string | null
          current_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          email_verified?: boolean | null
          enhanced_completed_at?: string | null
          id?: string
          id_document_uploaded?: boolean | null
          id_document_verified?: boolean | null
          license_number?: string | null
          license_verified?: boolean | null
          phone_verified?: boolean | null
          premium_completed_at?: string | null
          professional_completed_at?: string | null
          references_count?: number | null
          references_verified?: number | null
          social_media_linked?: Json | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string
          video_verification_completed?: boolean | null
          video_verification_url?: string | null
        }
        Relationships: []
      }
      validation_logs: {
        Row: {
          application_id: string
          error_message: string | null
          field_name: string
          field_value: string | null
          id: string
          validated_at: string | null
          validation_result: string
          validation_rule_id: string | null
        }
        Insert: {
          application_id: string
          error_message?: string | null
          field_name: string
          field_value?: string | null
          id?: string
          validated_at?: string | null
          validation_result: string
          validation_rule_id?: string | null
        }
        Update: {
          application_id?: string
          error_message?: string | null
          field_name?: string
          field_value?: string | null
          id?: string
          validated_at?: string | null
          validation_result?: string
          validation_rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vendor_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_logs_validation_rule_id_fkey"
            columns: ["validation_rule_id"]
            isOneToOne: false
            referencedRelation: "validation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_rules: {
        Row: {
          category_filter: Json | null
          compliance_region: string | null
          created_at: string | null
          error_message: string
          field_name: string
          id: string
          is_active: boolean | null
          severity: string | null
          trigger_event: string | null
          updated_at: string | null
          validation_logic: Json
          validation_type: string
          vendor_type: string
        }
        Insert: {
          category_filter?: Json | null
          compliance_region?: string | null
          created_at?: string | null
          error_message: string
          field_name: string
          id?: string
          is_active?: boolean | null
          severity?: string | null
          trigger_event?: string | null
          updated_at?: string | null
          validation_logic: Json
          validation_type: string
          vendor_type: string
        }
        Update: {
          category_filter?: Json | null
          compliance_region?: string | null
          created_at?: string | null
          error_message?: string
          field_name?: string
          id?: string
          is_active?: boolean | null
          severity?: string | null
          trigger_event?: string | null
          updated_at?: string | null
          validation_logic?: Json
          validation_type?: string
          vendor_type?: string
        }
        Relationships: []
      }
      vendor_access_permissions: {
        Row: {
          conditions: Json | null
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_granted: boolean | null
          permission_type: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_type: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_type?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: []
      }
      vendor_ai_alerts: {
        Row: {
          action_required: boolean | null
          ai_recommendation: string | null
          alert_message: string
          alert_type: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          vendor_id: string | null
        }
        Insert: {
          action_required?: boolean | null
          ai_recommendation?: string | null
          alert_message: string
          alert_type: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          vendor_id?: string | null
        }
        Update: {
          action_required?: boolean | null
          ai_recommendation?: string | null
          alert_message?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ai_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_ai_alerts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ai_matching: {
        Row: {
          availability_score: number | null
          created_at: string | null
          experience_score: number | null
          explanation: string | null
          id: string
          matching_score: number | null
          proximity_score: number | null
          rating_score: number | null
          recommendation_rank: number | null
          request_id: string
          specialization_match: number | null
          vendor_id: string | null
        }
        Insert: {
          availability_score?: number | null
          created_at?: string | null
          experience_score?: number | null
          explanation?: string | null
          id?: string
          matching_score?: number | null
          proximity_score?: number | null
          rating_score?: number | null
          recommendation_rank?: number | null
          request_id: string
          specialization_match?: number | null
          vendor_id?: string | null
        }
        Update: {
          availability_score?: number | null
          created_at?: string | null
          experience_score?: number | null
          explanation?: string | null
          id?: string
          matching_score?: number | null
          proximity_score?: number | null
          rating_score?: number | null
          recommendation_rank?: number | null
          request_id?: string
          specialization_match?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ai_matching_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_ai_verification: {
        Row: {
          ai_confidence_score: number | null
          biometric_verification: Json | null
          created_at: string | null
          document_verification: Json | null
          financial_health_score: number | null
          id: string
          trust_score: number | null
          updated_at: string | null
          vendor_id: string | null
          verification_notes: string | null
          verification_status: string | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          biometric_verification?: Json | null
          created_at?: string | null
          document_verification?: Json | null
          financial_health_score?: number | null
          id?: string
          trust_score?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          biometric_verification?: Json | null
          created_at?: string | null
          document_verification?: Json | null
          financial_health_score?: number | null
          id?: string
          trust_score?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ai_verification_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          akta_notaris: string | null
          application_status: string | null
          approval_notes: string | null
          bank_details: Json | null
          bpjs_kesehatan: boolean | null
          bpjs_kesehatan_verified: boolean | null
          bpjs_ketenagakerjaan: boolean | null
          bpjs_ketenagakerjaan_verified: boolean | null
          business_address: Json
          business_documents: Json | null
          business_name: string
          business_registration_number: string | null
          business_type: string
          category_hierarchy_selections: Json | null
          category_selections: Json | null
          compliance_region: string | null
          contact_info: Json
          created_at: string | null
          fraud_score: number | null
          id: string
          license_info: Json | null
          multi_service_bundle: Json | null
          nomor_iujk: string | null
          nomor_npwp: string | null
          nomor_skt: string | null
          product_catalog: Json | null
          property_type: string | null
          rejection_details: Json | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_areas: Json | null
          service_areas_detailed: Json | null
          siup_number: string | null
          submitted_at: string | null
          tax_id: string | null
          tdp_number: string | null
          umkm_status: boolean | null
          updated_at: string | null
          user_id: string
          vendor_type: string
        }
        Insert: {
          akta_notaris?: string | null
          application_status?: string | null
          approval_notes?: string | null
          bank_details?: Json | null
          bpjs_kesehatan?: boolean | null
          bpjs_kesehatan_verified?: boolean | null
          bpjs_ketenagakerjaan?: boolean | null
          bpjs_ketenagakerjaan_verified?: boolean | null
          business_address?: Json
          business_documents?: Json | null
          business_name: string
          business_registration_number?: string | null
          business_type: string
          category_hierarchy_selections?: Json | null
          category_selections?: Json | null
          compliance_region?: string | null
          contact_info?: Json
          created_at?: string | null
          fraud_score?: number | null
          id?: string
          license_info?: Json | null
          multi_service_bundle?: Json | null
          nomor_iujk?: string | null
          nomor_npwp?: string | null
          nomor_skt?: string | null
          product_catalog?: Json | null
          property_type?: string | null
          rejection_details?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: Json | null
          service_areas_detailed?: Json | null
          siup_number?: string | null
          submitted_at?: string | null
          tax_id?: string | null
          tdp_number?: string | null
          umkm_status?: boolean | null
          updated_at?: string | null
          user_id: string
          vendor_type: string
        }
        Update: {
          akta_notaris?: string | null
          application_status?: string | null
          approval_notes?: string | null
          bank_details?: Json | null
          bpjs_kesehatan?: boolean | null
          bpjs_kesehatan_verified?: boolean | null
          bpjs_ketenagakerjaan?: boolean | null
          bpjs_ketenagakerjaan_verified?: boolean | null
          business_address?: Json
          business_documents?: Json | null
          business_name?: string
          business_registration_number?: string | null
          business_type?: string
          category_hierarchy_selections?: Json | null
          category_selections?: Json | null
          compliance_region?: string | null
          contact_info?: Json
          created_at?: string | null
          fraud_score?: number | null
          id?: string
          license_info?: Json | null
          multi_service_bundle?: Json | null
          nomor_iujk?: string | null
          nomor_npwp?: string | null
          nomor_skt?: string | null
          product_catalog?: Json | null
          property_type?: string | null
          rejection_details?: Json | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: Json | null
          service_areas_detailed?: Json | null
          siup_number?: string | null
          submitted_at?: string | null
          tax_id?: string | null
          tdp_number?: string | null
          umkm_status?: boolean | null
          updated_at?: string | null
          user_id?: string
          vendor_type?: string
        }
        Relationships: []
      }
      vendor_astra_balances: {
        Row: {
          available_balance: number
          created_at: string
          id: string
          last_transaction_at: string | null
          pending_balance: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          id?: string
          last_transaction_at?: string | null
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_astra_balances_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bookings: {
        Row: {
          booking_date: string
          booking_time: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          customer_id: string | null
          customer_notes: string | null
          duration_minutes: number | null
          id: string
          location_address: string | null
          payment_status: string | null
          service_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          vendor_id: string | null
          vendor_notes: string | null
        }
        Insert: {
          booking_date: string
          booking_time?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          duration_minutes?: number | null
          id?: string
          location_address?: string | null
          payment_status?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_notes?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          duration_minutes?: number | null
          id?: string
          location_address?: string | null
          payment_status?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_business_nature_categories: {
        Row: {
          allowed_duration_units: string[] | null
          change_restriction_days: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          allowed_duration_units?: string[] | null
          change_restriction_days?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          allowed_duration_units?: string[] | null
          change_restriction_days?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_business_profiles: {
        Row: {
          banner_url: string | null
          bpjs_kesehatan_status: string | null
          bpjs_kesehatan_verified: boolean | null
          bpjs_ketenagakerjaan_status: string | null
          bpjs_ketenagakerjaan_verified: boolean | null
          bpjs_verification_complete: boolean | null
          bpjs_verification_date: string | null
          bpjs_verification_method: string | null
          building_name: string | null
          business_address: string | null
          business_area: string | null
          business_city: string | null
          business_description: string | null
          business_email: string | null
          business_finalized_at: string | null
          business_hours: Json | null
          business_name: string
          business_nature_id: string | null
          business_phone: string | null
          business_state: string | null
          business_type: string
          business_type_location: string | null
          business_website: string | null
          can_change_main_category: boolean | null
          can_change_nature: boolean | null
          category_change_reason: string | null
          certifications: Json | null
          compliance_documents: Json | null
          created_at: string | null
          floor_unit: string | null
          gallery_images: Json | null
          gps_address: string | null
          gps_coordinates: string | null
          id: string
          insurance_info: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          ktp_verified: boolean | null
          landmark: string | null
          last_nature_change_at: string | null
          license_number: string | null
          logo_url: string | null
          main_category_locked: boolean | null
          main_category_locked_at: string | null
          main_category_locked_by: string | null
          main_service_category_id: string | null
          niu_verified: boolean | null
          npwp_verified: boolean | null
          postal_code: string | null
          profile_completion_percentage: number | null
          rating: number | null
          service_areas: Json | null
          siuk_number: string | null
          siuk_verified: boolean | null
          siup_verified: boolean | null
          skk_number: string | null
          skk_verified: boolean | null
          social_media: Json | null
          street_address: string | null
          tarif_harian_max: number | null
          tarif_harian_min: number | null
          tax_id: string | null
          total_reviews: number | null
          updated_at: string | null
          vendor_id: string | null
          verification_completed_at: string | null
        }
        Insert: {
          banner_url?: string | null
          bpjs_kesehatan_status?: string | null
          bpjs_kesehatan_verified?: boolean | null
          bpjs_ketenagakerjaan_status?: string | null
          bpjs_ketenagakerjaan_verified?: boolean | null
          bpjs_verification_complete?: boolean | null
          bpjs_verification_date?: string | null
          bpjs_verification_method?: string | null
          building_name?: string | null
          business_address?: string | null
          business_area?: string | null
          business_city?: string | null
          business_description?: string | null
          business_email?: string | null
          business_finalized_at?: string | null
          business_hours?: Json | null
          business_name: string
          business_nature_id?: string | null
          business_phone?: string | null
          business_state?: string | null
          business_type: string
          business_type_location?: string | null
          business_website?: string | null
          can_change_main_category?: boolean | null
          can_change_nature?: boolean | null
          category_change_reason?: string | null
          certifications?: Json | null
          compliance_documents?: Json | null
          created_at?: string | null
          floor_unit?: string | null
          gallery_images?: Json | null
          gps_address?: string | null
          gps_coordinates?: string | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          ktp_verified?: boolean | null
          landmark?: string | null
          last_nature_change_at?: string | null
          license_number?: string | null
          logo_url?: string | null
          main_category_locked?: boolean | null
          main_category_locked_at?: string | null
          main_category_locked_by?: string | null
          main_service_category_id?: string | null
          niu_verified?: boolean | null
          npwp_verified?: boolean | null
          postal_code?: string | null
          profile_completion_percentage?: number | null
          rating?: number | null
          service_areas?: Json | null
          siuk_number?: string | null
          siuk_verified?: boolean | null
          siup_verified?: boolean | null
          skk_number?: string | null
          skk_verified?: boolean | null
          social_media?: Json | null
          street_address?: string | null
          tarif_harian_max?: number | null
          tarif_harian_min?: number | null
          tax_id?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_completed_at?: string | null
        }
        Update: {
          banner_url?: string | null
          bpjs_kesehatan_status?: string | null
          bpjs_kesehatan_verified?: boolean | null
          bpjs_ketenagakerjaan_status?: string | null
          bpjs_ketenagakerjaan_verified?: boolean | null
          bpjs_verification_complete?: boolean | null
          bpjs_verification_date?: string | null
          bpjs_verification_method?: string | null
          building_name?: string | null
          business_address?: string | null
          business_area?: string | null
          business_city?: string | null
          business_description?: string | null
          business_email?: string | null
          business_finalized_at?: string | null
          business_hours?: Json | null
          business_name?: string
          business_nature_id?: string | null
          business_phone?: string | null
          business_state?: string | null
          business_type?: string
          business_type_location?: string | null
          business_website?: string | null
          can_change_main_category?: boolean | null
          can_change_nature?: boolean | null
          category_change_reason?: string | null
          certifications?: Json | null
          compliance_documents?: Json | null
          created_at?: string | null
          floor_unit?: string | null
          gallery_images?: Json | null
          gps_address?: string | null
          gps_coordinates?: string | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          ktp_verified?: boolean | null
          landmark?: string | null
          last_nature_change_at?: string | null
          license_number?: string | null
          logo_url?: string | null
          main_category_locked?: boolean | null
          main_category_locked_at?: string | null
          main_category_locked_by?: string | null
          main_service_category_id?: string | null
          niu_verified?: boolean | null
          npwp_verified?: boolean | null
          postal_code?: string | null
          profile_completion_percentage?: number | null
          rating?: number | null
          service_areas?: Json | null
          siuk_number?: string | null
          siuk_verified?: boolean | null
          siup_verified?: boolean | null
          skk_number?: string | null
          skk_verified?: boolean | null
          social_media?: Json | null
          street_address?: string | null
          tarif_harian_max?: number | null
          tarif_harian_min?: number | null
          tax_id?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_business_profiles_business_nature_id_fkey"
            columns: ["business_nature_id"]
            isOneToOne: false
            referencedRelation: "vendor_business_nature_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_business_profiles_main_service_category_id_fkey"
            columns: ["main_service_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_main_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_business_profiles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories_hierarchy: {
        Row: {
          base_price_range: Json | null
          category_code: string
          commission_rate: number | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          level: number
          name_en: string
          name_id: string
          parent_id: string | null
          pricing_model: Database["public"]["Enums"]["pricing_model"] | null
          requirements: Json | null
          service_area_types: Json | null
          updated_at: string | null
          vendor_type: string
        }
        Insert: {
          base_price_range?: Json | null
          category_code: string
          commission_rate?: number | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level: number
          name_en: string
          name_id: string
          parent_id?: string | null
          pricing_model?: Database["public"]["Enums"]["pricing_model"] | null
          requirements?: Json | null
          service_area_types?: Json | null
          updated_at?: string | null
          vendor_type: string
        }
        Update: {
          base_price_range?: Json | null
          category_code?: string
          commission_rate?: number | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          name_en?: string
          name_id?: string
          parent_id?: string | null
          pricing_model?: Database["public"]["Enums"]["pricing_model"] | null
          requirements?: Json | null
          service_area_types?: Json | null
          updated_at?: string | null
          vendor_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_categories_hierarchy_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_change_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          current_data: Json | null
          id: string
          reason: string
          request_type: string
          requested_data: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          current_data?: Json | null
          id?: string
          reason: string
          request_type: string
          requested_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          current_data?: Json | null
          id?: string
          reason?: string
          request_type?: string
          requested_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_change_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_compliance: {
        Row: {
          compliance_type: string
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          last_checked: string | null
          notes: string | null
          requirement_name: string
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          compliance_type: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          last_checked?: string | null
          notes?: string | null
          requirement_name: string
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          compliance_type?: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          last_checked?: string | null
          notes?: string | null
          requirement_name?: string
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_compliance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_customers: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_type: string | null
          id: string
          last_order_date: string | null
          notes: string | null
          relationship_status: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_type?: string | null
          id?: string
          last_order_date?: string | null
          notes?: string | null
          relationship_status?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_type?: string | null
          id?: string
          last_order_date?: string | null
          notes?: string | null
          relationship_status?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_customers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_document_verifications: {
        Row: {
          created_at: string
          document_number: string
          document_type: string
          expires_at: string | null
          id: string
          updated_at: string
          vendor_id: string
          verification_details: Json | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_number: string
          document_type: string
          expires_at?: string | null
          id?: string
          updated_at?: string
          vendor_id: string
          verification_details?: Json | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_number?: string
          document_type?: string
          expires_at?: string | null
          id?: string
          updated_at?: string
          vendor_id?: string
          verification_details?: Json | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_document_verifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_document_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_feedback: {
        Row: {
          booking_id: string | null
          created_at: string | null
          customer_id: string | null
          feedback_type: string
          id: string
          message: string
          priority: string | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          feedback_type: string
          id?: string
          message: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          feedback_type?: string
          id?: string
          message?: string
          priority?: string | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_feedback_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_feedback_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_feedback_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_fraud_detection: {
        Row: {
          action_taken: string | null
          created_at: string | null
          detection_details: Json | null
          detection_type: string
          fraud_probability: number | null
          id: string
          model_version: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          vendor_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          detection_details?: Json | null
          detection_type: string
          fraud_probability?: number | null
          id?: string
          model_version?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          vendor_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          detection_details?: Json | null
          detection_type?: string
          fraud_probability?: number | null
          id?: string
          model_version?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_fraud_detection_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_fraud_detection_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_holidays: {
        Row: {
          affected_service_ids: string[] | null
          affects_all_services: boolean | null
          created_at: string | null
          end_date: string
          holiday_name: string
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          recurrence_pattern: string | null
          start_date: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          affected_service_ids?: string[] | null
          affects_all_services?: boolean | null
          created_at?: string | null
          end_date: string
          holiday_name: string
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          start_date: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          affected_service_ids?: string[] | null
          affects_all_services?: boolean | null
          created_at?: string | null
          end_date?: string
          holiday_name?: string
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          start_date?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_holidays_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invoices: {
        Row: {
          booking_id: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_kyc_status: {
        Row: {
          access_level: string | null
          compliance_score: number | null
          created_at: string | null
          documents_required: Json | null
          documents_submitted: Json | null
          documents_verified: Json | null
          id: string
          kyc_status:
            | Database["public"]["Enums"]["vendor_verification_status"]
            | null
          next_review_date: string | null
          payment_verified: boolean | null
          risk_assessment: Json | null
          updated_at: string | null
          vendor_id: string | null
          verification_level: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          access_level?: string | null
          compliance_score?: number | null
          created_at?: string | null
          documents_required?: Json | null
          documents_submitted?: Json | null
          documents_verified?: Json | null
          id?: string
          kyc_status?:
            | Database["public"]["Enums"]["vendor_verification_status"]
            | null
          next_review_date?: string | null
          payment_verified?: boolean | null
          risk_assessment?: Json | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          access_level?: string | null
          compliance_score?: number | null
          created_at?: string | null
          documents_required?: Json | null
          documents_submitted?: Json | null
          documents_verified?: Json | null
          id?: string
          kyc_status?:
            | Database["public"]["Enums"]["vendor_verification_status"]
            | null
          next_review_date?: string | null
          payment_verified?: boolean | null
          risk_assessment?: Json | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_level?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      vendor_kyc_verification: {
        Row: {
          created_at: string | null
          email_verified_at: string | null
          face_verification_url: string | null
          face_verified_at: string | null
          id: string
          ktp_image_url: string | null
          ktp_number: string | null
          ktp_verified_at: string | null
          mobile_number: string | null
          mobile_verified_at: string | null
          notes: string | null
          overall_status: string | null
          updated_at: string | null
          vendor_id: string | null
          verified_by: string | null
          whatsapp_number: string | null
          whatsapp_verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_verified_at?: string | null
          face_verification_url?: string | null
          face_verified_at?: string | null
          id?: string
          ktp_image_url?: string | null
          ktp_number?: string | null
          ktp_verified_at?: string | null
          mobile_number?: string | null
          mobile_verified_at?: string | null
          notes?: string | null
          overall_status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verified_by?: string | null
          whatsapp_number?: string | null
          whatsapp_verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_verified_at?: string | null
          face_verification_url?: string | null
          face_verified_at?: string | null
          id?: string
          ktp_image_url?: string | null
          ktp_number?: string | null
          ktp_verified_at?: string | null
          mobile_number?: string | null
          mobile_verified_at?: string | null
          notes?: string | null
          overall_status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
          verified_by?: string | null
          whatsapp_number?: string | null
          whatsapp_verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_kyc_verification_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_kyc_verification_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_main_categories: {
        Row: {
          created_at: string | null
          description: string | null
          discount_eligible: boolean | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_eligible?: boolean | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_eligible?: boolean | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_membership_levels: {
        Row: {
          benefits: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          level_name: string
          level_number: number
          min_completed_bookings: number | null
          min_rating: number | null
          requirements: Json | null
          tasks_required: number | null
          time_requirement_days: number | null
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level_name: string
          level_number: number
          min_completed_bookings?: number | null
          min_rating?: number | null
          requirements?: Json | null
          tasks_required?: number | null
          time_requirement_days?: number | null
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level_name?: string
          level_number?: number
          min_completed_bookings?: number | null
          min_rating?: number | null
          requirements?: Json | null
          tasks_required?: number | null
          time_requirement_days?: number | null
        }
        Relationships: []
      }
      vendor_membership_progress: {
        Row: {
          completed_tasks: number | null
          created_at: string | null
          current_level_id: string | null
          id: string
          level_achieved_at: string | null
          level_started_at: string | null
          next_level_id: string | null
          progress_percentage: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          completed_tasks?: number | null
          created_at?: string | null
          current_level_id?: string | null
          id?: string
          level_achieved_at?: string | null
          level_started_at?: string | null
          next_level_id?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          completed_tasks?: number | null
          created_at?: string | null
          current_level_id?: string | null
          id?: string
          level_achieved_at?: string | null
          level_started_at?: string | null
          next_level_id?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_membership_progress_current_level_id_fkey"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "vendor_membership_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_membership_progress_next_level_id_fkey"
            columns: ["next_level_id"]
            isOneToOne: false
            referencedRelation: "vendor_membership_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_membership_progress_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payout_settings: {
        Row: {
          account_holder_name: string
          account_number: string
          auto_payout_enabled: boolean | null
          bank_code: string | null
          bank_name: string
          created_at: string
          id: string
          is_verified: boolean | null
          minimum_payout: number | null
          payout_schedule: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          auto_payout_enabled?: boolean | null
          bank_code?: string | null
          bank_name: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          minimum_payout?: number | null
          payout_schedule?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          auto_payout_enabled?: boolean | null
          bank_code?: string | null
          bank_name?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          minimum_payout?: number | null
          payout_schedule?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      vendor_payouts: {
        Row: {
          account_holder_name: string
          account_number: string
          amount: number
          bank_name: string
          commission_ids: string[] | null
          completed_at: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          fee: number | null
          gateway_response: Json | null
          id: string
          metadata: Json | null
          net_amount: number
          payout_reference: string
          processed_at: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          account_holder_name: string
          account_number: string
          amount: number
          bank_name: string
          commission_ids?: string[] | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          fee?: number | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          net_amount: number
          payout_reference: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          amount?: number
          bank_name?: string
          commission_ids?: string[] | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          fee?: number | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          payout_reference?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_performance_analytics: {
        Row: {
          ai_insights: Json | null
          alerts_generated: Json | null
          booking_count: number | null
          completion_rate: number | null
          created_at: string | null
          customer_satisfaction: number | null
          id: string
          metric_date: string
          performance_score: number | null
          rating_trend: number | null
          response_time_avg: number | null
          revenue_generated: number | null
          vendor_id: string | null
        }
        Insert: {
          ai_insights?: Json | null
          alerts_generated?: Json | null
          booking_count?: number | null
          completion_rate?: number | null
          created_at?: string | null
          customer_satisfaction?: number | null
          id?: string
          metric_date: string
          performance_score?: number | null
          rating_trend?: number | null
          response_time_avg?: number | null
          revenue_generated?: number | null
          vendor_id?: string | null
        }
        Update: {
          ai_insights?: Json | null
          alerts_generated?: Json | null
          booking_count?: number | null
          completion_rate?: number | null
          created_at?: string | null
          customer_satisfaction?: number | null
          id?: string
          metric_date?: string
          performance_score?: number | null
          rating_trend?: number | null
          response_time_avg?: number | null
          revenue_generated?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_performance_analytics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_project_progress: {
        Row: {
          booking_id: string | null
          created_at: string | null
          current_stage: string | null
          customer_id: string | null
          estimated_completion: string | null
          id: string
          milestones: Json | null
          next_action: string | null
          notes: string | null
          progress_percentage: number | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          current_stage?: string | null
          customer_id?: string | null
          estimated_completion?: string | null
          id?: string
          milestones?: Json | null
          next_action?: string | null
          notes?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          current_stage?: string | null
          customer_id?: string | null
          estimated_completion?: string | null
          id?: string
          milestones?: Json | null
          next_action?: string | null
          notes?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_project_progress_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_project_progress_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_project_progress_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_property_listings: {
        Row: {
          amenities: string[] | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_furnished: boolean | null
          location: string
          price: number
          price_type: string | null
          property_type: string
          title: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_furnished?: boolean | null
          location: string
          price?: number
          price_type?: string | null
          property_type: string
          title: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_furnished?: boolean | null
          location?: string
          price?: number
          price_type?: string | null
          property_type?: string
          title?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_property_listings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_requests: {
        Row: {
          business_name: string
          business_type: string
          created_at: string | null
          id: string
          license_documents: Json | null
          review_notes: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_documents: Json | null
        }
        Insert: {
          business_name: string
          business_type: string
          created_at?: string | null
          id?: string
          license_documents?: Json | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
        }
        Update: {
          business_name?: string
          business_type?: string
          created_at?: string | null
          id?: string
          license_documents?: Json | null
          review_notes?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_reviews: {
        Row: {
          admin_approved: boolean | null
          communication_rating: number | null
          created_at: string | null
          customer_id: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          is_verified: boolean | null
          professionalism_rating: number | null
          rating: number
          report_count: number | null
          response_date: string | null
          response_text: string | null
          review_text: string | null
          service_id: string | null
          title: string | null
          updated_at: string | null
          value_rating: number | null
          vendor_id: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          communication_rating?: number | null
          created_at?: string | null
          customer_id?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          professionalism_rating?: number | null
          rating: number
          report_count?: number | null
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          service_id?: string | null
          title?: string | null
          updated_at?: string | null
          value_rating?: number | null
          vendor_id?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          communication_rating?: number | null
          created_at?: string | null
          customer_id?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          professionalism_rating?: number | null
          rating?: number
          report_count?: number | null
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          service_id?: string | null
          title?: string | null
          updated_at?: string | null
          value_rating?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_service_categories: {
        Row: {
          approved_service_name_id: string | null
          created_at: string | null
          description: string | null
          discount_eligible: boolean | null
          display_order: number | null
          icon: string | null
          id: string
          implementation_type: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          approved_service_name_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_eligible?: boolean | null
          display_order?: number | null
          icon?: string | null
          id?: string
          implementation_type?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          approved_service_name_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_eligible?: boolean | null
          display_order?: number | null
          icon?: string | null
          id?: string
          implementation_type?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_categories_approved_service_name_id_fkey"
            columns: ["approved_service_name_id"]
            isOneToOne: false
            referencedRelation: "approved_service_names"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_service_categories_ai: {
        Row: {
          ai_keywords: Json | null
          category_name: string
          classification_confidence: number | null
          created_at: string | null
          id: string
          is_hybrid: boolean | null
          nlp_tags: Json | null
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_keywords?: Json | null
          category_name: string
          classification_confidence?: number | null
          created_at?: string | null
          id?: string
          is_hybrid?: boolean | null
          nlp_tags?: Json | null
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_keywords?: Json | null
          category_name?: string
          classification_confidence?: number | null
          created_at?: string | null
          id?: string
          is_hybrid?: boolean | null
          nlp_tags?: Json | null
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_categories_ai_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_service_categories_ai"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_service_items: {
        Row: {
          created_at: string | null
          currency: string | null
          display_order: number | null
          duration_minutes: number | null
          id: string
          is_available: boolean | null
          item_description: string | null
          item_name: string
          price: number | null
          service_id: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          item_description?: string | null
          item_name: string
          price?: number | null
          service_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          item_description?: string | null
          item_name?: string
          price?: number | null
          service_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_service_permissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          background_check_status: string | null
          can_access_property: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          insurance_verified: boolean | null
          requires_supervision: boolean | null
          service_type_id: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          background_check_status?: string | null
          can_access_property?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insurance_verified?: boolean | null
          requires_supervision?: boolean | null
          service_type_id?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          background_check_status?: string | null
          can_access_property?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insurance_verified?: boolean | null
          requires_supervision?: boolean | null
          service_type_id?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_permissions_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "property_service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_services: {
        Row: {
          admin_approval_notes: string | null
          admin_approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          approved_service_name_id: string | null
          availability: Json | null
          business_profile_id: string | null
          cancellation_policy: string | null
          category_hierarchy_id: string | null
          category_id: string | null
          category_ref: string | null
          created_at: string | null
          currency: string | null
          delivery_options: Json | null
          discount_description: string | null
          discount_end_date: string | null
          discount_percentage: number | null
          discount_start_date: string | null
          duration_minutes: number | null
          duration_unit: string | null
          duration_value: number | null
          featured: boolean | null
          geofencing_areas: Json | null
          holiday_schedule_id: string | null
          id: string
          is_active: boolean | null
          is_discount_active: boolean | null
          location_type: string | null
          main_category_id: string | null
          price_range: Json | null
          pricing_rules: Json | null
          rating: number | null
          requirements: string | null
          service_capacity: Json | null
          service_category: string | null
          service_description: string | null
          service_images: Json | null
          service_location_area: string | null
          service_location_city: string | null
          service_location_state: string | null
          service_location_types: string[] | null
          service_name: string
          sub_category_id: string | null
          subcategory_id: string | null
          total_bookings: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          admin_approval_notes?: string | null
          admin_approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_service_name_id?: string | null
          availability?: Json | null
          business_profile_id?: string | null
          cancellation_policy?: string | null
          category_hierarchy_id?: string | null
          category_id?: string | null
          category_ref?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_options?: Json | null
          discount_description?: string | null
          discount_end_date?: string | null
          discount_percentage?: number | null
          discount_start_date?: string | null
          duration_minutes?: number | null
          duration_unit?: string | null
          duration_value?: number | null
          featured?: boolean | null
          geofencing_areas?: Json | null
          holiday_schedule_id?: string | null
          id?: string
          is_active?: boolean | null
          is_discount_active?: boolean | null
          location_type?: string | null
          main_category_id?: string | null
          price_range?: Json | null
          pricing_rules?: Json | null
          rating?: number | null
          requirements?: string | null
          service_capacity?: Json | null
          service_category?: string | null
          service_description?: string | null
          service_images?: Json | null
          service_location_area?: string | null
          service_location_city?: string | null
          service_location_state?: string | null
          service_location_types?: string[] | null
          service_name: string
          sub_category_id?: string | null
          subcategory_id?: string | null
          total_bookings?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          admin_approval_notes?: string | null
          admin_approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_service_name_id?: string | null
          availability?: Json | null
          business_profile_id?: string | null
          cancellation_policy?: string | null
          category_hierarchy_id?: string | null
          category_id?: string | null
          category_ref?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_options?: Json | null
          discount_description?: string | null
          discount_end_date?: string | null
          discount_percentage?: number | null
          discount_start_date?: string | null
          duration_minutes?: number | null
          duration_unit?: string | null
          duration_value?: number | null
          featured?: boolean | null
          geofencing_areas?: Json | null
          holiday_schedule_id?: string | null
          id?: string
          is_active?: boolean | null
          is_discount_active?: boolean | null
          location_type?: string | null
          main_category_id?: string | null
          price_range?: Json | null
          pricing_rules?: Json | null
          rating?: number | null
          requirements?: string | null
          service_capacity?: Json | null
          service_category?: string | null
          service_description?: string | null
          service_images?: Json | null
          service_location_area?: string | null
          service_location_city?: string | null
          service_location_state?: string | null
          service_location_types?: string[] | null
          service_name?: string
          sub_category_id?: string | null
          subcategory_id?: string | null
          total_bookings?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_approved_service_name_id_fkey"
            columns: ["approved_service_name_id"]
            isOneToOne: false
            referencedRelation: "approved_service_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "vendor_business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_category_hierarchy_id_fkey"
            columns: ["category_hierarchy_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_category_ref_fkey"
            columns: ["category_ref"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_holiday_schedule_id_fkey"
            columns: ["holiday_schedule_id"]
            isOneToOne: false
            referencedRelation: "vendor_holidays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_main_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_sub_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "vendor_subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_settings: {
        Row: {
          business_settings: Json | null
          created_at: string | null
          id: string
          notification_settings: Json | null
          payment_settings: Json | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          business_settings?: Json | null
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          payment_settings?: Json | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          business_settings?: Json | null
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          payment_settings?: Json | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_settings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_sub_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          main_category_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_sub_categories_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_main_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_subcategories: {
        Row: {
          created_at: string | null
          description: string | null
          discount_eligible: boolean | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          main_category_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_eligible?: boolean | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_eligible?: boolean | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          main_category_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_subcategories_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "vendor_main_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_support_tickets: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          subject: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_support_tickets_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_support_tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_verification_documents: {
        Row: {
          created_at: string | null
          document_number: string | null
          document_type: Database["public"]["Enums"]["indonesian_document_type"]
          document_url: string | null
          expiry_date: string | null
          id: string
          metadata: Json | null
          rejection_reason: string | null
          updated_at: string | null
          uploaded_at: string | null
          vendor_id: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_number?: string | null
          document_type: Database["public"]["Enums"]["indonesian_document_type"]
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          vendor_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["indonesian_document_type"]
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          vendor_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verification_references: {
        Row: {
          created_at: string | null
          id: string
          reference_email: string
          reference_name: string
          reference_phone: string | null
          relationship: string
          status: string | null
          user_id: string
          verification_code: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reference_email: string
          reference_name: string
          reference_phone?: string | null
          relationship: string
          status?: string | null
          user_id: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reference_email?: string
          reference_name?: string
          reference_phone?: string | null
          relationship?: string
          status?: string | null
          user_id?: string
          verification_code?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      video_call_participants: {
        Row: {
          connection_quality: string | null
          created_at: string | null
          device_info: Json | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          connection_quality?: string | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          connection_quality?: string | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_call_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "video_verification_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      video_fraud_detection_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          details: Json | null
          detection_type: string
          flagged_by: string | null
          id: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string
          severity: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          details?: Json | null
          detection_type: string
          flagged_by?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id: string
          severity: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          details?: Json | null
          detection_type?: string
          flagged_by?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_fraud_detection_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "video_verification_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      video_session_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: string
          document_url: string
          file_size: number | null
          id: string
          mime_type: string | null
          ocr_data: Json | null
          session_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type: string
          document_url: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          ocr_data?: Json | null
          session_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: string
          document_url?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          ocr_data?: Json | null
          session_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_session_documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "video_verification_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      video_tours: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          is_vr_enabled: boolean | null
          property_id: string
          settings: Json | null
          thumbnail_url: string | null
          title: string
          tour_type: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          is_vr_enabled?: boolean | null
          property_id: string
          settings?: Json | null
          thumbnail_url?: string | null
          title: string
          tour_type?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          is_vr_enabled?: boolean | null
          property_id?: string
          settings?: Json | null
          thumbnail_url?: string | null
          title?: string
          tour_type?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_tours_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_tours_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      video_verification_reviews: {
        Row: {
          badge_tier_awarded: string | null
          created_at: string | null
          decision: string
          document_authenticity_score: number | null
          fraud_detected: boolean | null
          fraud_indicators: Json | null
          id: string
          identity_match_score: number | null
          liveness_score: number | null
          overall_confidence: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string
          session_id: string
          trust_score_awarded: number | null
        }
        Insert: {
          badge_tier_awarded?: string | null
          created_at?: string | null
          decision: string
          document_authenticity_score?: number | null
          fraud_detected?: boolean | null
          fraud_indicators?: Json | null
          id?: string
          identity_match_score?: number | null
          liveness_score?: number | null
          overall_confidence?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id: string
          session_id: string
          trust_score_awarded?: number | null
        }
        Update: {
          badge_tier_awarded?: string | null
          created_at?: string | null
          decision?: string
          document_authenticity_score?: number | null
          fraud_detected?: boolean | null
          fraud_indicators?: Json | null
          id?: string
          identity_match_score?: number | null
          liveness_score?: number | null
          overall_confidence?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string
          session_id?: string
          trust_score_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_verification_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "video_verification_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      video_verification_sessions: {
        Row: {
          agent_id: string | null
          calendly_event_id: string | null
          calendly_event_uri: string | null
          consent_given: boolean | null
          created_at: string | null
          ended_at: string | null
          fraud_flags: Json | null
          id: string
          meeting_url: string | null
          metadata: Json | null
          notes: string | null
          recording_consent: boolean | null
          recording_encrypted: boolean | null
          recording_url: string | null
          room_id: string | null
          scheduled_at: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          verification_type: string
        }
        Insert: {
          agent_id?: string | null
          calendly_event_id?: string | null
          calendly_event_uri?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          ended_at?: string | null
          fraud_flags?: Json | null
          id?: string
          meeting_url?: string | null
          metadata?: Json | null
          notes?: string | null
          recording_consent?: boolean | null
          recording_encrypted?: boolean | null
          recording_url?: string | null
          room_id?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          verification_type?: string
        }
        Update: {
          agent_id?: string | null
          calendly_event_id?: string | null
          calendly_event_uri?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          ended_at?: string | null
          fraud_flags?: Json | null
          id?: string
          meeting_url?: string | null
          metadata?: Json | null
          notes?: string | null
          recording_consent?: boolean | null
          recording_encrypted?: boolean | null
          recording_url?: string | null
          room_id?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      viral_campaign_analytics: {
        Row: {
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          cost_per_acquisition: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          metadata: Json | null
          new_participants: number | null
          referrals_generated: number | null
          revenue_generated: number | null
          rewards_distributed: number | null
          roi: number | null
          shares: number | null
          total_participants: number | null
          viral_coefficient: number | null
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cost_per_acquisition?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          metadata?: Json | null
          new_participants?: number | null
          referrals_generated?: number | null
          revenue_generated?: number | null
          rewards_distributed?: number | null
          roi?: number | null
          shares?: number | null
          total_participants?: number | null
          viral_coefficient?: number | null
        }
        Update: {
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cost_per_acquisition?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          metadata?: Json | null
          new_participants?: number | null
          referrals_generated?: number | null
          revenue_generated?: number | null
          rewards_distributed?: number | null
          roi?: number | null
          shares?: number | null
          total_participants?: number | null
          viral_coefficient?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "viral_campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "viral_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      viral_campaigns: {
        Row: {
          budget: number | null
          campaign_name: string
          campaign_type: string
          created_at: string
          current_progress: number | null
          description: string | null
          eligibility_criteria: Json | null
          end_date: string | null
          featured_image_url: string | null
          goal_target: number | null
          id: string
          is_active: boolean | null
          reward_description: string | null
          reward_type: string | null
          reward_value: number | null
          rules: Json | null
          spent_budget: number | null
          start_date: string
          terms_and_conditions: string | null
          total_participants: number | null
          total_rewards_distributed: number | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_name: string
          campaign_type: string
          created_at?: string
          current_progress?: number | null
          description?: string | null
          eligibility_criteria?: Json | null
          end_date?: string | null
          featured_image_url?: string | null
          goal_target?: number | null
          id?: string
          is_active?: boolean | null
          reward_description?: string | null
          reward_type?: string | null
          reward_value?: number | null
          rules?: Json | null
          spent_budget?: number | null
          start_date?: string
          terms_and_conditions?: string | null
          total_participants?: number | null
          total_rewards_distributed?: number | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_name?: string
          campaign_type?: string
          created_at?: string
          current_progress?: number | null
          description?: string | null
          eligibility_criteria?: Json | null
          end_date?: string | null
          featured_image_url?: string | null
          goal_target?: number | null
          id?: string
          is_active?: boolean | null
          reward_description?: string | null
          reward_type?: string | null
          reward_value?: number | null
          rules?: Json | null
          spent_budget?: number | null
          start_date?: string
          terms_and_conditions?: string | null
          total_participants?: number | null
          total_rewards_distributed?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      virtual_tour_bookings: {
        Row: {
          agent_notes: string | null
          assigned_agent_id: string | null
          booking_type: string | null
          confirmation_sent: boolean | null
          created_at: string
          duration_minutes: number | null
          follow_up_sent: boolean | null
          guest_email: string
          guest_feedback: string | null
          guest_name: string
          guest_phone: string | null
          guest_rating: number | null
          id: string
          meeting_link: string | null
          meeting_provider: string | null
          property_id: string | null
          reminder_sent: boolean | null
          scheduled_date: string
          scheduled_time: string
          source_platform: string | null
          status: string | null
          timezone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          booking_type?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          follow_up_sent?: boolean | null
          guest_email: string
          guest_feedback?: string | null
          guest_name: string
          guest_phone?: string | null
          guest_rating?: number | null
          id?: string
          meeting_link?: string | null
          meeting_provider?: string | null
          property_id?: string | null
          reminder_sent?: boolean | null
          scheduled_date: string
          scheduled_time: string
          source_platform?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          booking_type?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          follow_up_sent?: boolean | null
          guest_email?: string
          guest_feedback?: string | null
          guest_name?: string
          guest_phone?: string | null
          guest_rating?: number | null
          id?: string
          meeting_link?: string | null
          meeting_provider?: string | null
          property_id?: string | null
          reminder_sent?: boolean | null
          scheduled_date?: string
          scheduled_time?: string
          source_platform?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "virtual_tour_bookings_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tour_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tour_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tour_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      web_analytics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          exit_page: string | null
          id: string
          ip_address: unknown
          is_bounce: boolean | null
          os: string | null
          page_path: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
          visit_duration: number | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          exit_page?: string | null
          id?: string
          ip_address?: unknown
          is_bounce?: boolean | null
          os?: string | null
          page_path: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
          visit_duration?: number | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          exit_page?: string | null
          id?: string
          ip_address?: unknown
          is_bounce?: boolean | null
          os?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
          visit_duration?: number | null
          visitor_id?: string
        }
        Relationships: []
      }
      whatsapp_automation_flows: {
        Row: {
          created_at: string
          flow_name: string
          id: string
          is_active: boolean | null
          message_templates: Json
          response_delay_seconds: number | null
          total_completed: number | null
          total_triggered: number | null
          trigger_keywords: string[] | null
          trigger_type: string
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          created_at?: string
          flow_name: string
          id?: string
          is_active?: boolean | null
          message_templates?: Json
          response_delay_seconds?: number | null
          total_completed?: number | null
          total_triggered?: number | null
          trigger_keywords?: string[] | null
          trigger_type: string
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          created_at?: string
          flow_name?: string
          id?: string
          is_active?: boolean | null
          message_templates?: Json
          response_delay_seconds?: number | null
          total_completed?: number | null
          total_triggered?: number | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      whitelisted_ips: {
        Row: {
          added_by: string | null
          created_at: string
          description: string | null
          id: string
          ip_address: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
      zapier_webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          is_success: boolean | null
          request_payload: Json
          response_body: string | null
          response_status: number | null
          webhook_url: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          is_success?: boolean | null
          request_payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_url: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          is_success?: boolean | null
          request_payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_url?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zapier_webhook_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_reaction_analytics: {
        Row: {
          date: string | null
          reaction_count: number | null
          reaction_type: string | null
          unique_conversations: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      bpjs_verifications_safe: {
        Row: {
          bpjs_type: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          is_valid: boolean | null
          updated_at: string | null
          vendor_id: string | null
          verification_status: string | null
          verification_summary: Json | null
          verified_at: string | null
        }
        Insert: {
          bpjs_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_valid?: boolean | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_status?: string | null
          verification_summary?: never
          verified_at?: string | null
        }
        Update: {
          bpjs_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_valid?: boolean | null
          updated_at?: string | null
          vendor_id?: string | null
          verification_status?: string | null
          verification_summary?: never
          verified_at?: string | null
        }
        Relationships: []
      }
      public_properties: {
        Row: {
          advance_booking_days: number | null
          area: string | null
          area_sqm: number | null
          available_from: string | null
          available_until: string | null
          bathrooms: number | null
          bedrooms: number | null
          booking_type: string | null
          city: string | null
          created_at: string | null
          description: string | null
          development_status: string | null
          id: string | null
          image_urls: string[] | null
          images: string[] | null
          listing_type: string | null
          location: string | null
          minimum_rental_days: number | null
          online_booking_enabled: boolean | null
          price: number | null
          property_features: Json | null
          property_type: string | null
          rental_periods: string[] | null
          rental_terms: Json | null
          seo_description: string | null
          seo_title: string | null
          state: string | null
          status: string | null
          three_d_model_url: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          virtual_tour_url: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          area?: string | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          booking_type?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          development_status?: string | null
          id?: string | null
          image_urls?: string[] | null
          images?: string[] | null
          listing_type?: string | null
          location?: string | null
          minimum_rental_days?: number | null
          online_booking_enabled?: boolean | null
          price?: number | null
          property_features?: Json | null
          property_type?: string | null
          rental_periods?: string[] | null
          rental_terms?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          state?: string | null
          status?: string | null
          three_d_model_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          area?: string | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          booking_type?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          development_status?: string | null
          id?: string | null
          image_urls?: string[] | null
          images?: string[] | null
          listing_type?: string | null
          location?: string | null
          minimum_rental_days?: number | null
          online_booking_enabled?: boolean | null
          price?: number | null
          property_features?: Json | null
          property_type?: string | null
          rental_periods?: string[] | null
          rental_terms?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          state?: string | null
          status?: string | null
          three_d_model_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Relationships: []
      }
      transaction_summary: {
        Row: {
          cancelled: number | null
          completed: number | null
          date: string | null
          pending: number | null
          total_base_amount: number | null
          total_revenue: number | null
          total_service_charges: number | null
          total_tax_collected: number | null
          total_transactions: number | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_customer_response_secure: {
        Args: { p_customer_response: string; p_ticket_id: string }
        Returns: boolean
      }
      aggregate_daily_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      aggregate_filter_analytics: { Args: never; Returns: undefined }
      award_badge: {
        Args: { p_badge_key: string; p_user_id: string }
        Returns: Json
      }
      award_xp: {
        Args: {
          p_action_type: string
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
          p_user_id: string
          p_xp_amount: number
        }
        Returns: Json
      }
      calculate_level_from_xp: { Args: { p_xp: number }; Returns: number }
      can_access_financial_reward_config_strict: {
        Args: { operation?: string }
        Returns: boolean
      }
      can_access_profile_strict: {
        Args: { operation?: string; profile_user_id: string }
        Returns: boolean
      }
      can_access_rejection_codes_strict: {
        Args: { operation?: string }
        Returns: boolean
      }
      can_access_survey_booking_details: {
        Args: {
          booking_row: Database["public"]["Tables"]["property_survey_bookings"]["Row"]
        }
        Returns: boolean
      }
      can_access_vendor_business_profile: {
        Args: { operation?: string; profile_vendor_id: string }
        Returns: boolean
      }
      can_access_vendor_categories_strict: { Args: never; Returns: boolean }
      can_change_business_nature: {
        Args: { vendor_id: string }
        Returns: boolean
      }
      can_create_development_status: {
        Args: { dev_status: string; user_id: string }
        Returns: boolean
      }
      can_edit_profile: { Args: { user_id: string }; Returns: Json }
      check_account_lockout: { Args: { p_email: string }; Returns: boolean }
      check_admin_access: { Args: never; Returns: boolean }
      check_financial_admin_access: { Args: never; Returns: boolean }
      check_ip_rate_limit: { Args: { p_ip_address: unknown }; Returns: boolean }
      check_is_admin: { Args: never; Returns: boolean }
      check_super_admin_access: { Args: never; Returns: boolean }
      check_super_admin_email: { Args: never; Returns: boolean }
      check_user_reward_eligibility: {
        Args: { reward_type_param: string; user_id_param: string }
        Returns: {
          is_eligible: boolean
          reward_type: string
          user_role: string
          valid_from: string
          valid_until: string
        }[]
      }
      clean_expired_otp_codes: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_old_bpjs_responses: { Args: never; Returns: undefined }
      cleanup_rate_limit_entries: { Args: never; Returns: undefined }
      create_account_lockout: {
        Args: {
          p_duration_minutes?: number
          p_email: string
          p_ip_address?: unknown
          p_user_id?: string
        }
        Returns: string
      }
      create_bpjs_verification_log_secure: {
        Args: {
          p_api_response?: Json
          p_bpjs_number: string
          p_vendor_id: string
          p_verification_status: string
          p_verification_type: string
        }
        Returns: string
      }
      create_login_alert: {
        Args: {
          p_alert_type: string
          p_device_info?: Json
          p_ip_address?: unknown
          p_location_data?: Json
          p_message?: string
          p_user_id: string
        }
        Returns: string
      }
      create_secure_survey_booking: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_message?: string
          p_preferred_date: string
          p_preferred_time: string
          p_property_id: string
          p_survey_type?: string
        }
        Returns: string
      }
      create_support_ticket_secure: {
        Args: {
          p_category?: string
          p_customer_email: string
          p_customer_name: string
          p_message: string
          p_priority?: string
          p_subject: string
        }
        Returns: string
      }
      create_survey_booking: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_message?: string
          p_preferred_date: string
          p_preferred_time: string
          p_property_id: string
          p_property_title?: string
          p_survey_type?: string
        }
        Returns: string
      }
      decrypt_api_key: {
        Args: { encrypted_key: string; key_name: string }
        Returns: string
      }
      decrypt_healthcare_data: {
        Args: { data_type: string; encrypted_data: string }
        Returns: string
      }
      delete_property_admin_property: {
        Args: { p_property_id: string }
        Returns: undefined
      }
      delete_user_admin: { Args: { p_user_id: string }; Returns: undefined }
      encrypt_api_key: {
        Args: { api_key: string; key_name: string }
        Returns: string
      }
      encrypt_healthcare_data: {
        Args: { data_type: string; healthcare_data: string }
        Returns: string
      }
      format_indonesian_phone: {
        Args: { input_phone: string }
        Returns: string
      }
      generate_error_signature: {
        Args: { error_message: string; table_name?: string }
        Returns: string
      }
      generate_otp: { Args: never; Returns: string }
      generate_transaction_number: { Args: never; Returns: string }
      get_admin_profile_stats: {
        Args: never
        Returns: {
          active_today: number
          admins: number
          agents: number
          customer_service: number
          general_users: number
          pending: number
          property_owners: number
          suspended: number
          total: number
          vendors: number
        }[]
      }
      get_admin_profiles: {
        Args: { p_limit?: number; p_offset?: number; p_role?: string }
        Returns: {
          company_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_suspended: boolean
          last_seen_at: string
          role: Database["public"]["Enums"]["user_role"]
          suspension_reason: string
          verification_status: string
        }[]
      }
      get_all_survey_bookings_admin: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          message: string
          preferred_date: string
          preferred_time: string
          property_id: string
          property_title: string
          status: string
          survey_type: string
          total_count: number
        }[]
      }
      get_available_payout_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_bpjs_verification_summary: {
        Args: { p_vendor_id: string }
        Returns: {
          bpjs_kesehatan_status: string
          bpjs_ketenagakerjaan_status: string
          is_fully_verified: boolean
          last_verification_attempt: string
          vendor_id: string
          verification_date: string
        }[]
      }
      get_customer_own_survey_bookings: {
        Args: never
        Returns: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          message: string
          preferred_date: string
          preferred_time: string
          property_id: string
          property_title: string
          status: string
          survey_type: string
        }[]
      }
      get_distinct_cities: {
        Args: { p_province_code?: string }
        Returns: {
          city_code: string
          city_name: string
          city_type: string
          province_name: string
        }[]
      }
      get_distinct_districts: {
        Args: { p_city_code?: string; p_province_code?: string }
        Returns: {
          city_name: string
          district_code: string
          district_name: string
          province_name: string
        }[]
      }
      get_distinct_provinces: {
        Args: never
        Returns: {
          province_code: string
          province_name: string
        }[]
      }
      get_distinct_subdistricts: {
        Args: {
          p_city_code?: string
          p_district_code?: string
          p_province_code?: string
        }
        Returns: {
          city_name: string
          district_name: string
          subdistrict_code: string
          subdistrict_name: string
        }[]
      }
      get_full_rejection_data: {
        Args: { rejection_code?: string }
        Returns: {
          auto_resubmit_allowed: boolean
          category: string
          code: string
          description_en: string
          description_id: string
          estimated_fix_time_hours: number
          reason_en: string
          reason_id: string
          requires_document_upload: boolean
          resolution_steps_en: Json
          resolution_steps_id: Json
        }[]
      }
      get_full_reward_configuration: {
        Args: { reward_type_param?: string }
        Returns: {
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          percentage_rate: number
          reward_amount: number
          reward_type: string
          updated_at: string
          user_role: string
          valid_from: string
          valid_until: string
        }[]
      }
      get_location_stats: { Args: never; Returns: Json }
      get_masked_api_settings: {
        Args: never
        Returns: {
          api_endpoint: string
          api_key_masked: string
          api_name: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          updated_at: string
        }[]
      }
      get_my_property_booking_count: { Args: never; Returns: number }
      get_own_vendor_profile_secure: {
        Args: never
        Returns: {
          banner_url: string
          bpjs_kesehatan_status: string
          bpjs_ketenagakerjaan_status: string
          bpjs_verification_complete: boolean
          business_address: string
          business_description: string
          business_email: string
          business_finalized_at: string
          business_hours: Json
          business_name: string
          business_nature_id: string
          business_phone: string
          business_type: string
          business_website: string
          can_change_nature: boolean
          certifications: Json
          compliance_documents: Json
          created_at: string
          gallery_images: Json
          id: string
          insurance_info: Json
          is_active: boolean
          is_verified: boolean
          license_number: string
          logo_url: string
          profile_completion_percentage: number
          rating: number
          service_areas: Json
          social_media: Json
          tarif_harian_max: number
          tarif_harian_min: number
          tax_id: string
          total_reviews: number
          updated_at: string
          vendor_id: string
        }[]
      }
      get_platform_stats: {
        Args: never
        Returns: {
          active_sessions: number
          total_bookings: number
          total_properties: number
          total_users: number
          total_vendors: number
        }[]
      }
      get_profiles_with_roles: {
        Args: never
        Returns: {
          availability_status: string
          avatar_url: string
          bio: string
          business_address: string
          company_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_suspended: boolean
          last_seen_at: string
          license_number: string
          npwp_number: string
          phone: string
          profile_completion_percentage: number
          role: Database["public"]["Enums"]["user_role"]
          specializations: string
          suspended_at: string
          suspended_by: string
          suspension_reason: string
          updated_at: string
          user_level_id: string
          verification_status: string
          years_experience: string
        }[]
      }
      get_property_booking_stats: {
        Args: { p_property_id: string }
        Returns: Json
      }
      get_property_counts_by_province: {
        Args: never
        Returns: {
          count: number
          property_type: string
          province: string
        }[]
      }
      get_property_details_secure: {
        Args: { p_property_id: string }
        Returns: {
          access_level: string
          agent_contact_info: Json
          area: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          can_view_contact_info: boolean
          city: string
          created_at: string
          description: string
          development_status: string
          id: string
          image_urls: string[]
          images: string[]
          listing_type: string
          location: string
          minimum_rental_days: number
          owner_contact_info: Json
          price: number
          property_features: Json
          property_type: string
          rental_periods: string[]
          state: string
          status: string
          three_d_model_url: string
          title: string
          updated_at: string
          virtual_tour_url: string
        }[]
      }
      get_property_statistics_secure: { Args: never; Returns: Json }
      get_property_survey_bookings_for_owner: {
        Args: { p_property_id: string }
        Returns: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          message: string
          preferred_date: string
          preferred_time: string
          property_id: string
          property_title: string
          status: string
          survey_type: string
        }[]
      }
      get_property_views_by_location: {
        Args: { days_back?: number }
        Returns: {
          city: string
          country: string
          page_path: string
          view_count: number
        }[]
      }
      get_public_category_names: {
        Args: never
        Returns: {
          category_description: string
          category_name: string
          id: string
          is_active: boolean
        }[]
      }
      get_public_profile_minimal: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          company_name: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          verification_status: string
        }[]
      }
      get_public_properties_secure: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          area: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          description: string
          id: string
          image_urls: string[]
          images: string[]
          listing_type: string
          location: string
          price: number
          property_type: string
          state: string
          status: string
          title: string
          total_count: number
        }[]
      }
      get_public_property_listings: {
        Args: {
          p_city?: string
          p_limit?: number
          p_listing_type?: string
          p_max_price?: number
          p_min_price?: number
          p_offset?: number
          p_property_type?: string
          p_search?: string
        }
        Returns: {
          area: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          description: string
          id: string
          image_urls: string[]
          images: string[]
          listing_type: string
          location: string
          price: number
          property_type: string
          state: string
          status: string
          title: string
          total_count: number
        }[]
      }
      get_public_property_listings_secure: {
        Args: {
          p_city?: string
          p_limit?: number
          p_listing_type?: string
          p_max_price?: number
          p_min_price?: number
          p_offset?: number
          p_property_type?: string
          p_require_auth?: boolean
          p_search?: string
        }
        Returns: {
          area: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          can_view_contact_info: boolean
          can_view_owner_info: boolean
          city: string
          created_at: string
          description: string
          development_status: string
          id: string
          image_urls: string[]
          images: string[]
          listing_type: string
          location: string
          price: number
          property_type: string
          state: string
          status: string
          thumbnail_url: string
          title: string
          total_count: number
          virtual_tour_url: string
        }[]
      }
      get_public_reward_tiers: {
        Args: never
        Returns: {
          required_points: number
          tier_description: string
          tier_name: string
        }[]
      }
      get_public_vendor_directory: {
        Args: never
        Returns: {
          banner_url: string
          business_description: string
          business_name: string
          business_type: string
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string
          rating: number
          service_areas: Json
          social_media: Json
          total_reviews: number
        }[]
      }
      get_public_vendor_profiles: {
        Args: never
        Returns: {
          business_description: string
          business_name: string
          business_type: string
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string
          rating: number
          service_areas: Json
          total_reviews: number
        }[]
      }
      get_public_vendor_profiles_safe: {
        Args: never
        Returns: {
          banner_url: string
          business_description: string
          business_name: string
          business_type: string
          created_at: string
          gallery_images: Json
          id: string
          is_active: boolean
          logo_url: string
          rating: number
          service_areas: Json
          social_media: Json
          total_reviews: number
        }[]
      }
      get_public_vendor_profiles_secure: {
        Args: never
        Returns: {
          banner_url: string
          business_description: string
          business_name: string
          business_type: string
          gallery_images: Json
          id: string
          is_active: boolean
          logo_url: string
          rating: number
          service_areas: Json
          social_media: Json
          total_reviews: number
        }[]
      }
      get_safe_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          company_name: string
          full_name: string
          id: string
          is_public_profile: boolean
          role: Database["public"]["Enums"]["user_role"]
          verification_status: string
        }[]
      }
      get_safe_rejection_context: {
        Args: { rejection_code: string }
        Returns: {
          category: string
          code: string
          estimated_fix_hours: number
          is_auto_resubmit_allowed: boolean
          reason_en: string
          reason_id: string
        }[]
      }
      get_safe_vendor_categories: {
        Args: never
        Returns: {
          category_code: string
          display_order: number
          icon: string
          id: string
          is_active: boolean
          level: number
          name_en: string
          name_id: string
          parent_id: string
          vendor_type: string
        }[]
      }
      get_safe_vendor_profiles: {
        Args: never
        Returns: {
          business_description: string
          business_name: string
          business_type: string
          id: string
          is_active: boolean
          logo_url: string
          rating: number
          service_areas: Json
          total_reviews: number
        }[]
      }
      get_sanitized_booking_contact: {
        Args: { p_booking_id: string; p_requester_id: string }
        Returns: Json
      }
      get_search_keyword_analytics: {
        Args: { days_back?: number }
        Returns: {
          avg_results: number
          last_searched: string
          search_count: number
          search_query: string
        }[]
      }
      get_survey_booking_stats_secure: {
        Args: { p_property_id?: string }
        Returns: Json
      }
      get_survey_bookings_secure: {
        Args: { p_limit?: number; p_offset?: number; p_property_id?: string }
        Returns: {
          admin_notes: string
          agent_name: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          has_full_access: boolean
          id: string
          message: string
          preferred_date: string
          preferred_time: string
          property_id: string
          property_location: string
          property_title: string
          status: string
          survey_type: string
          updated_at: string
        }[]
      }
      get_total_user_count: { Args: never; Returns: number }
      get_user_financial_summary: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      get_user_kyc_level: { Args: { p_user_id: string }; Returns: string }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_security_status: { Args: never; Returns: Json }
      get_vendor_balance_admin: { Args: { p_vendor_id: string }; Returns: Json }
      get_vendor_bpjs_summary: {
        Args: { p_vendor_id?: string }
        Returns: {
          bpjs_type: string
          expires_at: string
          id: string
          is_valid: boolean
          masked_number: string
          verification_status: string
          verified_at: string
        }[]
      }
      get_vendor_contact_for_inquiry: {
        Args: { vendor_profile_id: string }
        Returns: {
          business_email: string
          business_phone: string
          business_website: string
        }[]
      }
      get_vendor_contact_info: {
        Args: { vendor_profile_id: string }
        Returns: {
          business_address: string
          business_email: string
          business_phone: string
        }[]
      }
      get_vendor_financial_summary_secure: { Args: never; Returns: Json }
      get_vendor_pricing_data: {
        Args: { category_id: string }
        Returns: {
          base_price_range: Json
          commission_rate: number
          id: string
          pricing_model: string
        }[]
      }
      get_vendor_profile_summary: {
        Args: { p_vendor_id: string }
        Returns: {
          business_description: string
          business_name: string
          business_type: string
          id: string
          is_verified: boolean
          logo_url: string
          rating: number
          total_reviews: number
        }[]
      }
      get_vendor_public_directory: {
        Args: never
        Returns: {
          banner_url: string
          business_description: string
          business_hours: Json
          business_name: string
          business_type: string
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string
          rating: number
          service_areas: Json
          total_reviews: number
        }[]
      }
      get_vendor_sensitive_contact_info: {
        Args: { vendor_profile_id: string }
        Returns: {
          business_address: string
          business_email: string
          business_phone: string
          license_number: string
          tax_id: string
        }[]
      }
      get_vendor_verification_summary: {
        Args: { p_vendor_id: string }
        Returns: {
          document_count: number
          kyc_level: string
          kyc_status: string
          overall_score: number
          pending_documents: number
          rejected_documents: number
          verified_documents: number
        }[]
      }
      get_visitor_location_analytics: {
        Args: { days_back?: number }
        Returns: {
          avg_duration: number
          city: string
          country: string
          page_views: number
          visitor_count: number
        }[]
      }
      has_editor_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_user_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      insert_api_setting_secure: {
        Args: {
          p_api_endpoint?: string
          p_api_key: string
          p_api_name: string
          p_description?: string
          p_is_active?: boolean
        }
        Returns: string
      }
      is_admin_secure: { Args: { _user_id: string }; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_authorized_support_user: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_ip_blocked: { Args: { check_ip: string }; Returns: boolean }
      is_ip_whitelisted: { Args: { check_ip: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_super_admin_by_email: { Args: never; Returns: boolean }
      is_super_admin_direct: { Args: never; Returns: boolean }
      is_super_admin_safe: { Args: { user_email?: string }; Returns: boolean }
      is_super_admin_user: { Args: { check_user_id: string }; Returns: boolean }
      is_valid_indonesian_phone: {
        Args: { phone_number: string }
        Returns: boolean
      }
      log_database_error: {
        Args: {
          p_error_message: string
          p_error_severity?: string
          p_error_type: string
          p_metadata?: Json
          p_suggested_fix?: string
          p_table_name?: string
        }
        Returns: string
      }
      log_financial_access: {
        Args: { operation: string; table_name: string; user_id?: string }
        Returns: string
      }
      log_financial_data_access: {
        Args: { p_metadata?: Json; p_operation: string; p_table_name: string }
        Returns: undefined
      }
      log_health_data_access: {
        Args: {
          p_accessed_user_id: string
          p_action: string
          p_data_type: string
        }
        Returns: undefined
      }
      log_identity_verification_access: {
        Args: {
          operation: string
          record_id: string
          table_name: string
          user_id?: string
          vendor_id: string
        }
        Returns: string
      }
      log_page_error: {
        Args: {
          p_error_page?: string
          p_error_type?: string
          p_metadata?: Json
          p_referrer_url?: string
          p_user_agent?: string
          p_user_ip?: unknown
        }
        Returns: string
      }
      log_rejection_code_usage: {
        Args: {
          application_id?: string
          rejection_code: string
          usage_context: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_device_fingerprint?: string
          p_event_type: string
          p_ip_address?: unknown
          p_location_data?: Json
          p_risk_score?: number
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      log_vendor_profile_access: {
        Args: {
          p_accessor_id?: string
          p_operation: string
          p_vendor_id: string
        }
        Returns: string
      }
      mark_security_alerts_read: { Args: never; Returns: boolean }
      mask_bpjs_number: { Args: { bpjs_number: string }; Returns: string }
      mask_bpjs_number_secure: {
        Args: { bpjs_number: string }
        Returns: string
      }
      mask_document_number: { Args: { doc_number: string }; Returns: string }
      mask_financial_reward_data: {
        Args: { amount: number; data_type: string }
        Returns: string
      }
      mask_sensitive_profile_data: {
        Args: { data_type: string; data_value: string }
        Returns: string
      }
      process_daily_login: { Args: { p_user_id: string }; Returns: Json }
      record_profile_change: {
        Args: { changed_fields: string[]; user_id: string }
        Returns: Json
      }
      reset_admin_password: { Args: { new_password: string }; Returns: string }
      resolve_database_error: {
        Args: {
          p_error_signature: string
          p_fix_applied: string
          p_resolved_by?: string
        }
        Returns: boolean
      }
      search_properties_advanced: {
        Args: {
          p_amenities?: string[]
          p_building_age?: string
          p_certifications?: string[]
          p_city?: string
          p_development_status?: string
          p_features?: string[]
          p_floor_level?: string
          p_furnishing?: string
          p_has_3d?: boolean
          p_has_virtual_tour?: boolean
          p_limit?: number
          p_listing_type?: string
          p_location?: string
          p_max_area?: number
          p_max_bathrooms?: number
          p_max_bedrooms?: number
          p_max_price?: number
          p_min_area?: number
          p_min_bathrooms?: number
          p_min_bedrooms?: number
          p_min_price?: number
          p_offset?: number
          p_parking?: string
          p_property_type?: string
          p_search_text?: string
          p_sort_by?: string
          p_state?: string
        }
        Returns: {
          area: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          certificate_type: string
          city: string
          created_at: string
          description: string
          development_status: string
          district: string
          id: string
          image_urls: string[]
          images: string[]
          listing_type: string
          location: string
          minimum_rental_days: number
          orientation: string
          owner_type: string
          price: number
          property_condition: string
          property_features: Json
          property_type: string
          rental_period: string
          state: string
          status: string
          subdistrict: string
          three_d_model_url: string
          thumbnail_url: string
          title: string
          total_count: number
          updated_at: string
          virtual_tour_url: string
        }[]
      }
      search_properties_optimized: {
        Args: {
          p_city?: string
          p_limit?: number
          p_listing_type?: string
          p_max_area?: number
          p_max_bathrooms?: number
          p_max_bedrooms?: number
          p_max_price?: number
          p_min_area?: number
          p_min_bathrooms?: number
          p_min_bedrooms?: number
          p_min_price?: number
          p_offset?: number
          p_property_type?: string
          p_search_text?: string
        }
        Returns: {
          area: string
          area_sqm: number
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          description: string
          id: string
          image_urls: string[]
          images: string[]
          listing_type: string
          location: string
          price: number
          property_type: string
          state: string
          status: string
          title: string
          total_count: number
        }[]
      }
      search_vendor_profiles: {
        Args: { search_term?: string }
        Returns: {
          business_description: string
          business_name: string
          business_type: string
          id: string
          is_active: boolean
          is_verified: boolean
          rating: number
          total_reviews: number
        }[]
      }
      search_vendors_secure: {
        Args: {
          p_business_type?: string
          p_limit?: number
          p_offset?: number
          p_search_text?: string
          p_service_area?: string
        }
        Returns: {
          business_description: string
          business_name: string
          business_type: string
          id: string
          logo_url: string
          rating: number
          service_areas: Json
          total_reviews: number
        }[]
      }
      unlock_vendor_main_category: {
        Args: { p_reason?: string; p_vendor_id: string }
        Returns: boolean
      }
      update_verification_status: {
        Args: {
          p_document_id: string
          p_rejection_reason?: string
          p_status: string
        }
        Returns: boolean
      }
      validate_field_safe: {
        Args: {
          p_field_name: string
          p_field_value: string
          p_vendor_type?: string
        }
        Returns: Json
      }
    }
    Enums: {
      admin_permission:
        | "user_management"
        | "property_management"
        | "content_management"
        | "system_settings"
        | "billing_management"
        | "vendor_authorization"
        | "security_monitoring"
        | "order_tracking"
        | "ai_bot_management"
      affiliate_status: "pending" | "active" | "suspended" | "inactive"
      b2b_client_type: "agency" | "investor" | "developer" | "bank" | "other"
      b2b_tier: "starter" | "professional" | "enterprise"
      badge_tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
      employment_type:
        | "full_time"
        | "part_time"
        | "contractor"
        | "commission_based"
        | "intern"
      feedback_type:
        | "bug_report"
        | "feature_request"
        | "general_feedback"
        | "complaint"
      indonesian_document_type:
        | "ktp"
        | "npwp"
        | "siup"
        | "skdp"
        | "skt"
        | "iujk"
        | "bpjs_ketenagakerjaan"
        | "bpjs_kesehatan"
        | "akta_notaris"
        | "tdp"
        | "domisili_usaha"
        | "izin_gangguan"
      order_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "in_progress"
        | "completed"
        | "cancelled"
      order_type:
        | "property_investment"
        | "consultation_request"
        | "service_booking"
      partner_status: "pending" | "active" | "suspended" | "terminated"
      partner_type:
        | "mortgage_broker"
        | "home_inspector"
        | "moving_company"
        | "insurance_provider"
        | "interior_designer"
        | "smart_home_installer"
      pricing_model:
        | "hourly"
        | "sqm"
        | "project"
        | "per_item"
        | "daily"
        | "fixed"
      team_department:
        | "technology"
        | "product"
        | "marketing"
        | "operations"
        | "customer_success"
      team_member_status:
        | "active"
        | "inactive"
        | "onboarding"
        | "offboarding"
        | "on_leave"
      ticket_category:
        | "general_inquiry"
        | "order_issue"
        | "payment_issue"
        | "technical_support"
        | "account_issue"
        | "complaint"
        | "suggestion"
        | "other"
      ticket_status:
        | "open"
        | "in_progress"
        | "awaiting_response"
        | "resolved"
        | "closed"
      transaction_status:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
        | "disputed"
      transaction_type: "property_sale" | "property_rental" | "vendor_service"
      update_status: "planned" | "in_progress" | "completed" | "cancelled"
      user_role:
        | "general_user"
        | "property_owner"
        | "agent"
        | "vendor"
        | "admin"
        | "customer_service"
        | "super_admin"
        | "editor"
        | "investor"
      vendor_verification_status:
        | "unverified"
        | "pending_review"
        | "documents_submitted"
        | "under_verification"
        | "verified"
        | "rejected"
        | "suspended"
      verification_level: "basic" | "enhanced" | "professional" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_permission: [
        "user_management",
        "property_management",
        "content_management",
        "system_settings",
        "billing_management",
        "vendor_authorization",
        "security_monitoring",
        "order_tracking",
        "ai_bot_management",
      ],
      affiliate_status: ["pending", "active", "suspended", "inactive"],
      b2b_client_type: ["agency", "investor", "developer", "bank", "other"],
      b2b_tier: ["starter", "professional", "enterprise"],
      badge_tier: ["bronze", "silver", "gold", "platinum", "diamond"],
      employment_type: [
        "full_time",
        "part_time",
        "contractor",
        "commission_based",
        "intern",
      ],
      feedback_type: [
        "bug_report",
        "feature_request",
        "general_feedback",
        "complaint",
      ],
      indonesian_document_type: [
        "ktp",
        "npwp",
        "siup",
        "skdp",
        "skt",
        "iujk",
        "bpjs_ketenagakerjaan",
        "bpjs_kesehatan",
        "akta_notaris",
        "tdp",
        "domisili_usaha",
        "izin_gangguan",
      ],
      order_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
      order_type: [
        "property_investment",
        "consultation_request",
        "service_booking",
      ],
      partner_status: ["pending", "active", "suspended", "terminated"],
      partner_type: [
        "mortgage_broker",
        "home_inspector",
        "moving_company",
        "insurance_provider",
        "interior_designer",
        "smart_home_installer",
      ],
      pricing_model: ["hourly", "sqm", "project", "per_item", "daily", "fixed"],
      team_department: [
        "technology",
        "product",
        "marketing",
        "operations",
        "customer_success",
      ],
      team_member_status: [
        "active",
        "inactive",
        "onboarding",
        "offboarding",
        "on_leave",
      ],
      ticket_category: [
        "general_inquiry",
        "order_issue",
        "payment_issue",
        "technical_support",
        "account_issue",
        "complaint",
        "suggestion",
        "other",
      ],
      ticket_status: [
        "open",
        "in_progress",
        "awaiting_response",
        "resolved",
        "closed",
      ],
      transaction_status: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "refunded",
        "disputed",
      ],
      transaction_type: ["property_sale", "property_rental", "vendor_service"],
      update_status: ["planned", "in_progress", "completed", "cancelled"],
      user_role: [
        "general_user",
        "property_owner",
        "agent",
        "vendor",
        "admin",
        "customer_service",
        "super_admin",
        "editor",
        "investor",
      ],
      vendor_verification_status: [
        "unverified",
        "pending_review",
        "documents_submitted",
        "under_verification",
        "verified",
        "rejected",
        "suspended",
      ],
      verification_level: ["basic", "enhanced", "professional", "premium"],
    },
  },
} as const
