export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_alerts: {
        Row: {
          action_required: boolean
          created_at: string
          id: string
          is_read: boolean
          message: string
          priority: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_required?: boolean
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          priority?: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_required?: boolean
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          priority?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          updated_at?: string
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
      locations: {
        Row: {
          area: string
          city: string
          coordinates: unknown | null
          created_at: string | null
          id: string
          is_active: boolean | null
          postal_code: string | null
          state: string
        }
        Insert: {
          area: string
          city: string
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          postal_code?: string | null
          state: string
        }
        Update: {
          area?: string
          city?: string
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          postal_code?: string | null
          state?: string
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
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_seen_at: string | null
          license_number: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          license_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          license_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          agent_id: string | null
          approval_status: string | null
          area: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          description: string | null
          development_status: string
          id: string
          image_urls: string[] | null
          images: string[] | null
          listing_type: string
          location: string
          owner_id: string
          owner_type: string | null
          price: number | null
          property_features: Json | null
          property_type: string
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
          agent_id?: string | null
          approval_status?: string | null
          area?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          development_status?: string
          id?: string
          image_urls?: string[] | null
          images?: string[] | null
          listing_type: string
          location: string
          owner_id: string
          owner_type?: string | null
          price?: number | null
          property_features?: Json | null
          property_type: string
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
          agent_id?: string | null
          approval_status?: string | null
          area?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          development_status?: string
          id?: string
          image_urls?: string[] | null
          images?: string[] | null
          listing_type?: string
          location?: string
          owner_id?: string
          owner_type?: string | null
          price?: number | null
          property_features?: Json | null
          property_type?: string
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
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          created_at: string
          id: string
          results_count: number | null
          search_filters: Json | null
          search_query: string
          session_id: string
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          session_id: string
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string
          id?: string
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
          created_at: string | null
          gallery_images: Json | null
          id: string
          insurance_info: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          last_nature_change_at: string | null
          license_number: string | null
          logo_url: string | null
          profile_completion_percentage: number | null
          rating: number | null
          service_areas: Json | null
          social_media: Json | null
          tax_id: string | null
          total_reviews: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          banner_url?: string | null
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
          created_at?: string | null
          gallery_images?: Json | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_nature_change_at?: string | null
          license_number?: string | null
          logo_url?: string | null
          profile_completion_percentage?: number | null
          rating?: number | null
          service_areas?: Json | null
          social_media?: Json | null
          tax_id?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          banner_url?: string | null
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
          created_at?: string | null
          gallery_images?: Json | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_nature_change_at?: string | null
          license_number?: string | null
          logo_url?: string | null
          profile_completion_percentage?: number | null
          rating?: number | null
          service_areas?: Json | null
          social_media?: Json | null
          tax_id?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          vendor_id?: string | null
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
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
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
          name?: string
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
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
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
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
          availability: Json | null
          business_profile_id: string | null
          cancellation_policy: string | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          delivery_options: Json | null
          duration_minutes: number | null
          duration_unit: string | null
          duration_value: number | null
          featured: boolean | null
          holiday_schedule_id: string | null
          id: string
          is_active: boolean | null
          location_type: string | null
          main_category_id: string | null
          price_range: Json | null
          rating: number | null
          requirements: string | null
          service_category: string | null
          service_description: string | null
          service_images: Json | null
          service_location_types: string[] | null
          service_name: string
          subcategory_id: string | null
          total_bookings: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          availability?: Json | null
          business_profile_id?: string | null
          cancellation_policy?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_options?: Json | null
          duration_minutes?: number | null
          duration_unit?: string | null
          duration_value?: number | null
          featured?: boolean | null
          holiday_schedule_id?: string | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          main_category_id?: string | null
          price_range?: Json | null
          rating?: number | null
          requirements?: string | null
          service_category?: string | null
          service_description?: string | null
          service_images?: Json | null
          service_location_types?: string[] | null
          service_name: string
          subcategory_id?: string | null
          total_bookings?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          availability?: Json | null
          business_profile_id?: string | null
          cancellation_policy?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_options?: Json | null
          duration_minutes?: number | null
          duration_unit?: string | null
          duration_value?: number | null
          featured?: boolean | null
          holiday_schedule_id?: string | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          main_category_id?: string | null
          price_range?: Json | null
          rating?: number | null
          requirements?: string | null
          service_category?: string | null
          service_description?: string | null
          service_images?: Json | null
          service_location_types?: string[] | null
          service_name?: string
          subcategory_id?: string | null
          total_bookings?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "vendor_business_profiles"
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
      vendor_subcategories: {
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
      aggregate_daily_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      can_change_business_nature: {
        Args: { vendor_id: string }
        Returns: boolean
      }
      check_admin_access: {
        Args: Record<PropertyKey, never>
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
      user_role:
        | "general_user"
        | "property_owner"
        | "agent"
        | "vendor"
        | "admin"
        | "customer_service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      user_role: [
        "general_user",
        "property_owner",
        "agent",
        "vendor",
        "admin",
        "customer_service",
      ],
    },
  },
} as const
