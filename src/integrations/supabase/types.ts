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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          description: string | null
          icon_url: string | null
          id: string
          is_milestone: boolean | null
          points_value: number | null
          relationship_id: string
          title: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_milestone?: boolean | null
          points_value?: number | null
          relationship_id: string
          title: string
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_milestone?: boolean | null
          points_value?: number | null
          relationship_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          action_url: string | null
          content: string | null
          expires_at: string | null
          feedback_rating: number | null
          generated_at: string | null
          id: string
          is_acted_upon: boolean | null
          is_personalized: boolean | null
          is_viewed: boolean | null
          priority: number | null
          relationship_id: string
          suggestion_type: string
          target_user_id: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          content?: string | null
          expires_at?: string | null
          feedback_rating?: number | null
          generated_at?: string | null
          id?: string
          is_acted_upon?: boolean | null
          is_personalized?: boolean | null
          is_viewed?: boolean | null
          priority?: number | null
          relationship_id: string
          suggestion_type: string
          target_user_id?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          content?: string | null
          expires_at?: string | null
          feedback_rating?: number | null
          generated_at?: string | null
          id?: string
          is_acted_upon?: boolean | null
          is_personalized?: boolean | null
          is_viewed?: boolean | null
          priority?: number | null
          relationship_id?: string
          suggestion_type?: string
          target_user_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      album_photos: {
        Row: {
          album_id: string
          caption: string | null
          id: string
          image_url: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          taken_at: string | null
          thumbnail_url: string | null
          uploaded_at: string | null
          uploaded_by_user_id: string
        }
        Insert: {
          album_id: string
          caption?: string | null
          id?: string
          image_url: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          taken_at?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string | null
          uploaded_by_user_id: string
        }
        Update: {
          album_id?: string
          caption?: string | null
          id?: string
          image_url?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          taken_at?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string | null
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_photos_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_analytics: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          platform: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          platform?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          platform?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      breakup_archives: {
        Row: {
          access_count: number | null
          access_pin_hash: string | null
          archive_name: string | null
          archive_type: string | null
          cooldown_expires_at: string | null
          created_at: string | null
          encrypted_data: string | null
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          relationship_id: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          access_pin_hash?: string | null
          archive_name?: string | null
          archive_type?: string | null
          cooldown_expires_at?: string | null
          created_at?: string | null
          encrypted_data?: string | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          relationship_id: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          access_pin_hash?: string | null
          archive_name?: string | null
          archive_type?: string | null
          cooldown_expires_at?: string | null
          created_at?: string | null
          encrypted_data?: string | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          relationship_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "breakup_archives_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breakup_archives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_questions: {
        Row: {
          challenge_id: string
          correct_answer: string | null
          created_at: string | null
          id: string
          options: string[] | null
          question_text: string
          question_type: string | null
          sort_order: number | null
        }
        Insert: {
          challenge_id: string
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: string[] | null
          question_text: string
          question_type?: string | null
          sort_order?: number | null
        }
        Update: {
          challenge_id?: string
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: string[] | null
          question_text?: string
          question_type?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_responses: {
        Row: {
          id: string
          points_earned: number | null
          question_id: string
          relationship_challenge_id: string
          responded_at: string | null
          response_rating: number | null
          response_text: string | null
          user_id: string
        }
        Insert: {
          id?: string
          points_earned?: number | null
          question_id: string
          relationship_challenge_id: string
          responded_at?: string | null
          response_rating?: number | null
          response_text?: string | null
          user_id: string
        }
        Update: {
          id?: string
          points_earned?: number | null
          question_id?: string
          relationship_challenge_id?: string
          responded_at?: string | null
          response_rating?: number | null
          response_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "challenge_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_responses_relationship_challenge_id_fkey"
            columns: ["relationship_challenge_id"]
            isOneToOne: false
            referencedRelation: "relationship_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          is_seasonal: boolean | null
          points_reward: number | null
          season: string | null
          title: string
        }
        Insert: {
          challenge_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          is_seasonal?: boolean | null
          points_reward?: number | null
          season?: string | null
          title: string
        }
        Update: {
          challenge_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          is_seasonal?: boolean | null
          points_reward?: number | null
          season?: string | null
          title?: string
        }
        Relationships: []
      }
      closure_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          content: string | null
          created_at: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "closure_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_insights: {
        Row: {
          action_suggestions: string[] | null
          data_points: Json | null
          description: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          relationship_id: string
          severity: string | null
          title: string
        }
        Insert: {
          action_suggestions?: string[] | null
          data_points?: Json | null
          description?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          relationship_id: string
          severity?: string | null
          title: string
        }
        Update: {
          action_suggestions?: string[] | null
          data_points?: Json | null
          description?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          relationship_id?: string
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_insights_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      gift_orders: {
        Row: {
          created_at: string | null
          currency: string | null
          custom_gift_name: string | null
          delivery_address: string | null
          delivery_date: string | null
          id: string
          payment_intent_id: string | null
          personal_message: string | null
          product_id: string | null
          quantity: number | null
          recipient_id: string
          relationship_id: string
          sender_id: string
          status: string | null
          surprise_delivery: boolean | null
          total_amount_cents: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          custom_gift_name?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string
          payment_intent_id?: string | null
          personal_message?: string | null
          product_id?: string | null
          quantity?: number | null
          recipient_id: string
          relationship_id: string
          sender_id: string
          status?: string | null
          surprise_delivery?: boolean | null
          total_amount_cents: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          custom_gift_name?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string
          payment_intent_id?: string | null
          personal_message?: string | null
          product_id?: string | null
          quantity?: number | null
          recipient_id?: string
          relationship_id?: string
          sender_id?: string
          status?: string | null
          surprise_delivery?: boolean | null
          total_amount_cents?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "gift_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_orders_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_orders_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_orders_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_products: {
        Row: {
          category_id: string
          created_at: string | null
          currency: string | null
          delivery_time_days: number | null
          description: string | null
          id: string
          image_urls: string[]
          is_active: boolean | null
          is_digital: boolean | null
          is_experience: boolean | null
          name: string
          price_cents: number
          vendor: string | null
          vendor_product_id: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          id?: string
          image_urls: string[]
          is_active?: boolean | null
          is_digital?: boolean | null
          is_experience?: boolean | null
          name: string
          price_cents: number
          vendor?: string | null
          vendor_product_id?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          currency?: string | null
          delivery_time_days?: number | null
          description?: string | null
          id?: string
          image_urls?: string[]
          is_active?: boolean | null
          is_digital?: boolean | null
          is_experience?: boolean | null
          name?: string
          price_cents?: number
          vendor?: string | null
          vendor_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gift_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_46bfb162: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      location_updates: {
        Row: {
          address: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_check_in: boolean | null
          is_live_location: boolean | null
          latitude: number
          longitude: number
          place_name: string | null
          place_type: string | null
          relationship_id: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_check_in?: boolean | null
          is_live_location?: boolean | null
          latitude: number
          longitude: number
          place_name?: string | null
          place_type?: string | null
          relationship_id?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_check_in?: boolean | null
          is_live_location?: boolean | null
          latitude?: number
          longitude?: number
          place_name?: string | null
          place_type?: string | null
          relationship_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_updates_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      love_letters: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_ai_generated: boolean | null
          is_first_letter: boolean | null
          read_at: string | null
          recipient_id: string
          relationship_id: string
          sender_id: string
          sent_at: string | null
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_first_letter?: boolean | null
          read_at?: string | null
          recipient_id: string
          relationship_id: string
          sender_id: string
          sent_at?: string | null
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          is_first_letter?: boolean | null
          read_at?: string | null
          recipient_id?: string
          relationship_id?: string
          sender_id?: string
          sent_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "love_letters_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "love_letters_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "love_letters_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          deleted_at: string | null
          delivered_at: string | null
          edited_at: string | null
          id: string
          is_encrypted: boolean | null
          is_secret_vault: boolean | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          media_type: string | null
          media_url: string | null
          message_type: string | null
          read_at: string | null
          relationship_id: string
          reply_to_message_id: string | null
          sender_id: string
          sent_at: string | null
          sticker_id: string | null
        }
        Insert: {
          content?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          is_secret_vault?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          relationship_id: string
          reply_to_message_id?: string | null
          sender_id: string
          sent_at?: string | null
          sticker_id?: string | null
        }
        Update: {
          content?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          is_secret_vault?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          relationship_id?: string
          reply_to_message_id?: string | null
          sender_id?: string
          sent_at?: string | null
          sticker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_updates: {
        Row: {
          activity_status: string | null
          created_at: string | null
          date: string | null
          id: string
          is_visible_to_partner: boolean | null
          mood_emoji: string
          mood_scale: number | null
          mood_text: string | null
          relationship_id: string | null
          selfie_url: string | null
          user_id: string
        }
        Insert: {
          activity_status?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          is_visible_to_partner?: boolean | null
          mood_emoji: string
          mood_scale?: number | null
          mood_text?: string | null
          relationship_id?: string | null
          selfie_url?: string | null
          user_id: string
        }
        Update: {
          activity_status?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          is_visible_to_partner?: boolean | null
          mood_emoji?: string
          mood_scale?: number | null
          mood_text?: string | null
          relationship_id?: string | null
          selfie_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_updates_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_email: boolean | null
          is_push: boolean | null
          is_read: boolean | null
          notification_type: string
          priority: string | null
          read_at: string | null
          relationship_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          content?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_email?: boolean | null
          is_push?: boolean | null
          is_read?: boolean | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          relationship_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          content?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_email?: boolean | null
          is_push?: boolean | null
          is_read?: boolean | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          relationship_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      period_tracking: {
        Row: {
          created_at: string | null
          cycle_length: number | null
          cycle_start_date: string
          flow_intensity: string | null
          id: string
          is_predicted: boolean | null
          notes: string | null
          partner_notified: boolean | null
          period_length: number | null
          relationship_id: string | null
          symptoms: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cycle_length?: number | null
          cycle_start_date: string
          flow_intensity?: string | null
          id?: string
          is_predicted?: boolean | null
          notes?: string | null
          partner_notified?: boolean | null
          period_length?: number | null
          relationship_id?: string | null
          symptoms?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cycle_length?: number | null
          cycle_start_date?: string
          flow_intensity?: string | null
          id?: string
          is_predicted?: boolean | null
          notes?: string | null
          partner_notified?: boolean | null
          period_length?: number | null
          relationship_id?: string | null
          symptoms?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "period_tracking_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by_user_id: string
          description: string | null
          id: string
          is_shared: boolean | null
          name: string
          relationship_id: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by_user_id: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          relationship_id: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by_user_id?: string
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          relationship_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_albums_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_albums_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          relationship_id: string
          started_at: string | null
          status: string | null
          total_points_earned: number | null
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          relationship_id: string
          started_at?: string | null
          status?: string | null
          total_points_earned?: number | null
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          relationship_id?: string
          started_at?: string | null
          status?: string | null
          total_points_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_challenges_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_history: {
        Row: {
          created_at: string | null
          duration_days: number | null
          end_reason: string | null
          ended_at: string
          id: string
          is_visible: boolean | null
          partner_username: string | null
          relationship_id: string
          user_id: string
          was_blocked: boolean | null
        }
        Insert: {
          created_at?: string | null
          duration_days?: number | null
          end_reason?: string | null
          ended_at: string
          id?: string
          is_visible?: boolean | null
          partner_username?: string | null
          relationship_id: string
          user_id: string
          was_blocked?: boolean | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number | null
          end_reason?: string | null
          ended_at?: string
          id?: string
          is_visible?: boolean | null
          partner_username?: string | null
          relationship_id?: string
          user_id?: string
          was_blocked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_history_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_reports: {
        Row: {
          end_date: string
          generated_at: string | null
          id: string
          insights: string[] | null
          love_score: number | null
          recommendations: string[] | null
          relationship_id: string
          report_period: string
          start_date: string
          stats: Json
        }
        Insert: {
          end_date: string
          generated_at?: string | null
          id?: string
          insights?: string[] | null
          love_score?: number | null
          recommendations?: string[] | null
          relationship_id: string
          report_period: string
          start_date: string
          stats: Json
        }
        Update: {
          end_date?: string
          generated_at?: string | null
          id?: string
          insights?: string[] | null
          love_score?: number | null
          recommendations?: string[] | null
          relationship_id?: string
          report_period?: string
          start_date?: string
          stats?: Json
        }
        Relationships: [
          {
            foreignKeyName: "relationship_reports_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          created_at: string | null
          end_reason: string | null
          ended_at: string | null
          first_love_letter_id: string | null
          id: string
          invite_code: string | null
          invite_expires_at: string | null
          relationship_type: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          end_reason?: string | null
          ended_at?: string | null
          first_love_letter_id?: string | null
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          relationship_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          end_reason?: string | null
          ended_at?: string | null
          first_love_letter_id?: string | null
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          relationship_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spending_tracker: {
        Row: {
          amount_cents: number
          category: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          id: string
          is_surprise: boolean | null
          receipt_image_url: string | null
          recipient_id: string
          relationship_id: string
          spender_id: string
        }
        Insert: {
          amount_cents: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          id?: string
          is_surprise?: boolean | null
          receipt_image_url?: string | null
          recipient_id: string
          relationship_id: string
          spender_id: string
        }
        Update: {
          amount_cents?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          is_surprise?: boolean | null
          receipt_image_url?: string | null
          recipient_id?: string
          relationship_id?: string
          spender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spending_tracker_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spending_tracker_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spending_tracker_spender_id_fkey"
            columns: ["spender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          broken_at: string | null
          created_at: string | null
          current_count: number | null
          id: string
          is_active: boolean | null
          last_activity_date: string | null
          longest_count: number | null
          relationship_id: string
          started_at: string
          streak_type: string
        }
        Insert: {
          broken_at?: string | null
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          longest_count?: number | null
          relationship_id: string
          started_at: string
          streak_type: string
        }
        Update: {
          broken_at?: string | null
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          longest_count?: number | null
          relationship_id?: string
          started_at?: string
          streak_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          is_auto_generated: boolean | null
          is_milestone: boolean | null
          location_name: string | null
          media_urls: string[] | null
          milestone_type: string | null
          relationship_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          is_auto_generated?: boolean | null
          is_milestone?: boolean | null
          location_name?: string | null
          media_urls?: string[] | null
          milestone_type?: string | null
          relationship_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_auto_generated?: boolean | null
          is_milestone?: boolean | null
          location_name?: string | null
          media_urls?: string[] | null
          milestone_type?: string | null
          relationship_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_auth: {
        Row: {
          biometric_enabled: boolean | null
          created_at: string | null
          failed_login_attempts: number | null
          locked_until: string | null
          password_hash: string | null
          phone_verification_code: string | null
          phone_verified_at: string | null
          security_pin_hash: string | null
          two_factor_enabled: boolean | null
          user_id: string
        }
        Insert: {
          biometric_enabled?: boolean | null
          created_at?: string | null
          failed_login_attempts?: number | null
          locked_until?: string | null
          password_hash?: string | null
          phone_verification_code?: string | null
          phone_verified_at?: string | null
          security_pin_hash?: string | null
          two_factor_enabled?: boolean | null
          user_id: string
        }
        Update: {
          biometric_enabled?: boolean | null
          created_at?: string | null
          failed_login_attempts?: number | null
          locked_until?: string | null
          password_hash?: string | null
          phone_verification_code?: string | null
          phone_verified_at?: string | null
          security_pin_hash?: string | null
          two_factor_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_auth_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          gift_reminders_enabled: boolean | null
          language: string | null
          location_sharing_enabled: boolean | null
          mood_reminders_enabled: boolean | null
          notifications_enabled: boolean | null
          period_tracking_enabled: boolean | null
          show_relationship_history: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gift_reminders_enabled?: boolean | null
          language?: string | null
          location_sharing_enabled?: boolean | null
          mood_reminders_enabled?: boolean | null
          notifications_enabled?: boolean | null
          period_tracking_enabled?: boolean | null
          show_relationship_history?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gift_reminders_enabled?: boolean | null
          language?: string | null
          location_sharing_enabled?: boolean | null
          mood_reminders_enabled?: boolean | null
          notifications_enabled?: boolean | null
          period_tracking_enabled?: boolean | null
          show_relationship_history?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_active_at: string | null
          name: string
          phone_number: string
          profile_image_url: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          timezone: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          name: string
          phone_number: string
          profile_image_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          name?: string
          phone_number?: string
          profile_image_url?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      wellness_data: {
        Row: {
          created_at: string | null
          data_source: string | null
          date: string
          exercise_minutes: number | null
          id: string
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          steps_count: number | null
          stress_level: number | null
          user_id: string
          water_intake_ml: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          data_source?: string | null
          date: string
          exercise_minutes?: number | null
          id?: string
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          steps_count?: number | null
          stress_level?: number | null
          user_id: string
          water_intake_ml?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          data_source?: string | null
          date?: string
          exercise_minutes?: number | null
          id?: string
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          steps_count?: number | null
          stress_level?: number | null
          user_id?: string
          water_intake_ml?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          added_at: string | null
          custom_item_description: string | null
          custom_item_name: string | null
          custom_item_price_cents: number | null
          id: string
          is_hint_sent: boolean | null
          priority: number | null
          product_id: string | null
          relationship_id: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          custom_item_description?: string | null
          custom_item_name?: string | null
          custom_item_price_cents?: number | null
          id?: string
          is_hint_sent?: boolean | null
          priority?: number | null
          product_id?: string | null
          relationship_id?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          custom_item_description?: string | null
          custom_item_name?: string | null
          custom_item_price_cents?: number | null
          id?: string
          is_hint_sent?: boolean | null
          priority?: number | null
          product_id?: string | null
          relationship_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "gift_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
