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
      feedback_monitoring: {
        Row: {
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
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          license_number: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          license_number?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
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
          state: string | null
          status: string | null
          three_d_model_url: string | null
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
          state?: string | null
          status?: string | null
          three_d_model_url?: string | null
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
          state?: string | null
          status?: string | null
          three_d_model_url?: string | null
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
      vendor_business_profiles: {
        Row: {
          banner_url: string | null
          business_address: string | null
          business_description: string | null
          business_email: string | null
          business_hours: Json | null
          business_name: string
          business_phone: string | null
          business_type: string
          business_website: string | null
          certifications: Json | null
          created_at: string | null
          gallery_images: Json | null
          id: string
          insurance_info: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          license_number: string | null
          logo_url: string | null
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
          business_hours?: Json | null
          business_name: string
          business_phone?: string | null
          business_type: string
          business_website?: string | null
          certifications?: Json | null
          created_at?: string | null
          gallery_images?: Json | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          logo_url?: string | null
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
          business_hours?: Json | null
          business_name?: string
          business_phone?: string | null
          business_type?: string
          business_website?: string | null
          certifications?: Json | null
          created_at?: string | null
          gallery_images?: Json | null
          id?: string
          insurance_info?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string | null
          logo_url?: string | null
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
            foreignKeyName: "vendor_business_profiles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
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
      vendor_service_items: {
        Row: {
          created_at: string | null
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
          duration_minutes: number | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          location_type: string | null
          price_range: Json | null
          rating: number | null
          requirements: string | null
          service_category: string | null
          service_description: string | null
          service_images: Json | null
          service_name: string
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
          duration_minutes?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          price_range?: Json | null
          rating?: number | null
          requirements?: string | null
          service_category?: string | null
          service_description?: string | null
          service_images?: Json | null
          service_name: string
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
          duration_minutes?: number | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          location_type?: string | null
          price_range?: Json | null
          rating?: number | null
          requirements?: string | null
          service_category?: string | null
          service_description?: string | null
          service_images?: Json | null
          service_name?: string
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
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin: {
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
      user_role: ["general_user", "property_owner", "agent", "vendor", "admin"],
    },
  },
} as const
