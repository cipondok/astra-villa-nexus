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
          locked_by_ip: unknown | null
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
          locked_by_ip?: unknown | null
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
          locked_by_ip?: unknown | null
          unlock_at?: string
          user_id?: string | null
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
      error_logs: {
        Row: {
          created_at: string | null
          error_page: string
          error_type: string
          id: string
          metadata: Json | null
          referrer_url: string | null
          user_agent: string | null
          user_id: string | null
          user_ip: unknown | null
        }
        Insert: {
          created_at?: string | null
          error_page: string
          error_type?: string
          id?: string
          metadata?: Json | null
          referrer_url?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_ip?: unknown | null
        }
        Update: {
          created_at?: string | null
          error_page?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          referrer_url?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_ip?: unknown | null
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
      inquiries: {
        Row: {
          admin_response: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
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
          contact_phone?: string | null
          created_at?: string | null
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
          contact_phone?: string | null
          created_at?: string | null
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
        ]
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
          customer_ip: unknown | null
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
          customer_ip?: unknown | null
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
          customer_ip?: unknown | null
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
          coordinates: unknown | null
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
          coordinates?: unknown | null
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
          coordinates?: unknown | null
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
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          business_address: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          last_seen_at: string | null
          license_number: string | null
          npwp_number: string | null
          phone: string | null
          profile_completion_percentage: number | null
          role: Database["public"]["Enums"]["user_role"]
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
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          last_seen_at?: string | null
          license_number?: string | null
          npwp_number?: string | null
          phone?: string | null
          profile_completion_percentage?: number | null
          role?: Database["public"]["Enums"]["user_role"]
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
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          last_seen_at?: string | null
          license_number?: string | null
          npwp_number?: string | null
          phone?: string | null
          profile_completion_percentage?: number | null
          role?: Database["public"]["Enums"]["user_role"]
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
          id: string
          image_urls: string[] | null
          images: string[] | null
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
          id?: string
          image_urls?: string[] | null
          images?: string[] | null
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
          id?: string
          image_urls?: string[] | null
          images?: string[] | null
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
        }
        Relationships: []
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
        ]
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
        ]
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
        ]
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
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          device_info: Json | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          ip_address: unknown | null
          is_read: boolean | null
          location_data: Json | null
          message: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          is_read?: boolean | null
          location_data?: Json | null
          message: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          is_read?: boolean | null
          location_data?: Json | null
          message?: string
          user_id?: string
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
      user_security_logs: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          location_data: Json | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          location_data?: Json | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          location_data?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          business_address: string | null
          business_description: string | null
          business_email: string | null
          business_finalized_at: string | null
          business_hours: Json | null
          business_name: string
          business_nature_id: string | null
          business_phone: string | null
          business_type: string
          business_website: string | null
          can_change_nature: boolean | null
          certifications: Json | null
          compliance_documents: Json | null
          created_at: string | null
          gallery_images: Json | null
          id: string
          insurance_info: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          ktp_verified: boolean | null
          last_nature_change_at: string | null
          license_number: string | null
          logo_url: string | null
          niu_verified: boolean | null
          npwp_verified: boolean | null
          profile_completion_percentage: number | null
          rating: number | null
          service_areas: Json | null
          siuk_number: string | null
          siuk_verified: boolean | null
          siup_verified: boolean | null
          skk_number: string | null
          skk_verified: boolean | null
          social_media: Json | null
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
          business_address?: string | null
          business_description?: string | null
          business_email?: string | null
          business_finalized_at?: string | null
          business_hours?: Json | null
          business_name: string
          business_nature_id?: string | null
          business_phone?: string | null
          business_type: string
          business_website?: string | null
          can_change_nature?: boolean | null
          certifications?: Json | null
          compliance_documents?: Json | null
          created_at?: string | null
          gallery_images?: Json | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          ktp_verified?: boolean | null
          last_nature_change_at?: string | null
          license_number?: string | null
          logo_url?: string | null
          niu_verified?: boolean | null
          npwp_verified?: boolean | null
          profile_completion_percentage?: number | null
          rating?: number | null
          service_areas?: Json | null
          siuk_number?: string | null
          siuk_verified?: boolean | null
          siup_verified?: boolean | null
          skk_number?: string | null
          skk_verified?: boolean | null
          social_media?: Json | null
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
          business_address?: string | null
          business_description?: string | null
          business_email?: string | null
          business_finalized_at?: string | null
          business_hours?: Json | null
          business_name?: string
          business_nature_id?: string | null
          business_phone?: string | null
          business_type?: string
          business_website?: string | null
          can_change_nature?: boolean | null
          certifications?: Json | null
          compliance_documents?: Json | null
          created_at?: string | null
          gallery_images?: Json | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          ktp_verified?: boolean | null
          last_nature_change_at?: string | null
          license_number?: string | null
          logo_url?: string | null
          niu_verified?: boolean | null
          npwp_verified?: boolean | null
          profile_completion_percentage?: number | null
          rating?: number | null
          service_areas?: Json | null
          siuk_number?: string | null
          siuk_verified?: boolean | null
          siup_verified?: boolean | null
          skk_number?: string | null
          skk_verified?: boolean | null
          social_media?: Json | null
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
          created_at: string | null
          customer_id: string | null
          id: string
          is_verified: boolean | null
          rating: number
          response_date: string | null
          response_text: string | null
          review_text: string | null
          service_id: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_verified?: boolean | null
          rating: number
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          service_id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          response_date?: string | null
          response_text?: string | null
          review_text?: string | null
          service_id?: string | null
          updated_at?: string | null
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
      web_analytics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown | null
          os: string | null
          page_path: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          page_path: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      can_change_business_nature: {
        Args: { vendor_id: string }
        Returns: boolean
      }
      can_create_development_status: {
        Args: { dev_status: string; user_id: string }
        Returns: boolean
      }
      check_account_lockout: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_financial_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_ip_rate_limit: {
        Args: { p_ip_address: unknown }
        Returns: boolean
      }
      check_super_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_super_admin_email: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_account_lockout: {
        Args: {
          p_duration_minutes?: number
          p_email: string
          p_ip_address?: unknown
          p_user_id?: string
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
      format_indonesian_phone: {
        Args: { input_phone: string }
        Returns: string
      }
      generate_error_signature: {
        Args: { error_message: string; table_name?: string }
        Returns: string
      }
      get_available_payout_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_property_booking_stats: {
        Args: { p_property_id: string }
        Returns: Json
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
      get_public_vendor_profiles: {
        Args: Record<PropertyKey, never>
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
          social_media: Json
          total_reviews: number
        }[]
      }
      get_public_vendor_profiles_secure: {
        Args: Record<PropertyKey, never>
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
      get_safe_vendor_profiles: {
        Args: Record<PropertyKey, never>
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
      get_user_financial_summary: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      get_user_security_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_vendor_balance_admin: {
        Args: { p_vendor_id: string }
        Returns: Json
      }
      get_vendor_financial_summary_secure: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authorized_support_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_by_email: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_direct: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_safe: {
        Args: { user_email?: string }
        Returns: boolean
      }
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
        Args: { p_operation: string; p_table_name: string; p_user_id?: string }
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
      mark_security_alerts_read: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      resolve_database_error: {
        Args: {
          p_error_signature: string
          p_fix_applied: string
          p_resolved_by?: string
        }
        Returns: boolean
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
      pricing_model:
        | "hourly"
        | "sqm"
        | "project"
        | "per_item"
        | "daily"
        | "fixed"
      user_role:
        | "general_user"
        | "property_owner"
        | "agent"
        | "vendor"
        | "admin"
        | "customer_service"
      vendor_verification_status:
        | "unverified"
        | "pending_review"
        | "documents_submitted"
        | "under_verification"
        | "verified"
        | "rejected"
        | "suspended"
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
      pricing_model: ["hourly", "sqm", "project", "per_item", "daily", "fixed"],
      user_role: [
        "general_user",
        "property_owner",
        "agent",
        "vendor",
        "admin",
        "customer_service",
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
    },
  },
} as const
