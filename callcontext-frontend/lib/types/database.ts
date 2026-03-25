// Database types for CallContext
// Auto-generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          timezone: string;
          vonage_number: string | null;
          forwarding_to: string | null;
          consent_mode: "auto" | "silent" | "always_disclose";
          custom_greeting: string | null;
          business_hours: Json | null;
          settings: Json;
          subscription_plan: "trial" | "starter" | "pro" | "growth";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          timezone?: string;
          vonage_number?: string | null;
          forwarding_to?: string | null;
          consent_mode?: "auto" | "silent" | "always_disclose";
          custom_greeting?: string | null;
          business_hours?: Json | null;
          settings?: Json;
          subscription_plan?: "trial" | "starter" | "pro" | "growth";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          timezone?: string;
          vonage_number?: string | null;
          forwarding_to?: string | null;
          consent_mode?: "auto" | "silent" | "always_disclose";
          custom_greeting?: string | null;
          business_hours?: Json | null;
          settings?: Json;
          subscription_plan?: "trial" | "starter" | "pro" | "growth";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          shop_id: string;
          phone: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          preferences: Json;
          tags: string[];
          loyalty_tier: "bronze" | "silver" | "gold" | "platinum";
          loyalty_points: number;
          lifetime_value: number;
          total_orders: number;
          communication_preference: "phone" | "sms" | "email";
          first_contact_date: string | null;
          last_contact_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          phone: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          preferences?: Json;
          tags?: string[];
          loyalty_tier?: "bronze" | "silver" | "gold" | "platinum";
          loyalty_points?: number;
          lifetime_value?: number;
          total_orders?: number;
          communication_preference?: "phone" | "sms" | "email";
          first_contact_date?: string | null;
          last_contact_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          phone?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          preferences?: Json;
          tags?: string[];
          loyalty_tier?: "bronze" | "silver" | "gold" | "platinum";
          loyalty_points?: number;
          lifetime_value?: number;
          total_orders?: number;
          communication_preference?: "phone" | "sms" | "email";
          first_contact_date?: string | null;
          last_contact_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calls: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string | null;
          vonage_call_id: string | null;
          direction: "inbound" | "outbound";
          status: "ringing" | "active" | "completed" | "missed" | "voicemail";
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          recording_url: string | null;
          recording_storage_path: string | null;
          transcript: string | null;
          ai_summary: string | null;
          sentiment: "positive" | "neutral" | "negative" | null;
          entities_extracted: Json | null;
          follow_up_needed: boolean;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id?: string | null;
          vonage_call_id?: string | null;
          direction: "inbound" | "outbound";
          status?: "ringing" | "active" | "completed" | "missed" | "voicemail";
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          recording_url?: string | null;
          recording_storage_path?: string | null;
          transcript?: string | null;
          ai_summary?: string | null;
          sentiment?: "positive" | "neutral" | "negative" | null;
          entities_extracted?: Json | null;
          follow_up_needed?: boolean;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string | null;
          vonage_call_id?: string | null;
          direction?: "inbound" | "outbound";
          status?: "ringing" | "active" | "completed" | "missed" | "voicemail";
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          recording_url?: string | null;
          recording_storage_path?: string | null;
          transcript?: string | null;
          ai_summary?: string | null;
          sentiment?: "positive" | "neutral" | "negative" | null;
          entities_extracted?: Json | null;
          follow_up_needed?: boolean;
          tags?: string[];
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          call_id: string | null;
          products: Json;
          delivery_date: string | null;
          delivery_address: string | null;
          occasion: string | null;
          special_instructions: string | null;
          budget_mentioned: number | null;
          total_amount: number | null;
          status: "pending" | "confirmed" | "delivered" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id: string;
          call_id?: string | null;
          products: Json;
          delivery_date?: string | null;
          delivery_address?: string | null;
          occasion?: string | null;
          special_instructions?: string | null;
          budget_mentioned?: number | null;
          total_amount?: number | null;
          status?: "pending" | "confirmed" | "delivered" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string;
          call_id?: string | null;
          products?: Json;
          delivery_date?: string | null;
          delivery_address?: string | null;
          occasion?: string | null;
          special_instructions?: string | null;
          budget_mentioned?: number | null;
          total_amount?: number | null;
          status?: "pending" | "confirmed" | "delivered" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          title: string;
          description: string | null;
          reminder_date: string;
          advance_days: number;
          recurring: boolean;
          recurrence_pattern: "yearly" | "monthly" | "weekly" | null;
          status: "pending" | "sent" | "dismissed" | "snoozed";
          snoozed_until: string | null;
          source: "auto_detected" | "manual";
          call_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id: string;
          title: string;
          description?: string | null;
          reminder_date: string;
          advance_days?: number;
          recurring?: boolean;
          recurrence_pattern?: "yearly" | "monthly" | "weekly" | null;
          status?: "pending" | "sent" | "dismissed" | "snoozed";
          snoozed_until?: string | null;
          source?: "auto_detected" | "manual";
          call_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string;
          title?: string;
          description?: string | null;
          reminder_date?: string;
          advance_days?: number;
          recurring?: boolean;
          recurrence_pattern?: "yearly" | "monthly" | "weekly" | null;
          status?: "pending" | "sent" | "dismissed" | "snoozed";
          snoozed_until?: string | null;
          source?: "auto_detected" | "manual";
          call_id?: string | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          call_id: string | null;
          content: string;
          pinned: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id: string;
          call_id?: string | null;
          content: string;
          pinned?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string;
          call_id?: string | null;
          content?: string;
          pinned?: boolean;
          created_by?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          status: "open" | "in_progress" | "done";
          priority: "low" | "medium" | "high";
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: "open" | "in_progress" | "done";
          priority?: "low" | "medium" | "high";
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: "open" | "in_progress" | "done";
          priority?: "low" | "medium" | "high";
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      loyalty_transactions: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          type: "earn" | "redeem" | "adjust" | "expire";
          points: number;
          description: string | null;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id: string;
          type: "earn" | "redeem" | "adjust" | "expire";
          points: number;
          description?: string | null;
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string;
          type?: "earn" | "redeem" | "adjust" | "expire";
          points?: number;
          description?: string | null;
          order_id?: string | null;
          created_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          type: "sms" | "email";
          segment_filter: Json | null;
          subject: string | null;
          content: string;
          template_id: string | null;
          scheduled_at: string | null;
          sent_at: string | null;
          stats: Json;
          status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          type: "sms" | "email";
          segment_filter?: Json | null;
          subject?: string | null;
          content: string;
          template_id?: string | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          stats?: Json;
          status?: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          type?: "sms" | "email";
          segment_filter?: Json | null;
          subject?: string | null;
          content?: string;
          template_id?: string | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          stats?: Json;
          status?: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
          created_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          shop_id: string;
          provider: string;
          credentials_encrypted: string | null;
          config: Json;
          last_synced_at: string | null;
          status: "active" | "error" | "disconnected";
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          provider: string;
          credentials_encrypted?: string | null;
          config?: Json;
          last_synced_at?: string | null;
          status?: "active" | "error" | "disconnected";
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          provider?: string;
          credentials_encrypted?: string | null;
          config?: Json;
          last_synced_at?: string | null;
          status?: "active" | "error" | "disconnected";
          created_at?: string;
        };
      };
      webhook_endpoints: {
        Row: {
          id: string;
          shop_id: string;
          url: string;
          events: string[];
          secret: string;
          active: boolean;
          last_triggered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          url: string;
          events: string[];
          secret: string;
          active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          url?: string;
          events?: string[];
          secret?: string;
          active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
        };
      };
      webhook_deliveries: {
        Row: {
          id: string;
          webhook_endpoint_id: string;
          event: string;
          payload: Json;
          response_status: number | null;
          response_body: string | null;
          attempts: number;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          webhook_endpoint_id: string;
          event: string;
          payload: Json;
          response_status?: number | null;
          response_body?: string | null;
          attempts?: number;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          webhook_endpoint_id?: string;
          event?: string;
          payload?: Json;
          response_status?: number | null;
          response_body?: string | null;
          attempts?: number;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      segments: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          description: string | null;
          filter: Json;
          is_preset: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          description?: string | null;
          filter: Json;
          is_preset?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          description?: string | null;
          filter?: Json;
          is_preset?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      scheduled_actions: {
        Row: {
          id: string;
          shop_id: string;
          rule_id: string;
          action_type: "send_sms" | "send_email" | "create_task" | "create_reminder" | "update_customer";
          action_config: Json;
          execute_at: string;
          status: "pending" | "completed" | "failed" | "cancelled";
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          shop_id: string;
          rule_id: string;
          action_type: "send_sms" | "send_email" | "create_task" | "create_reminder" | "update_customer";
          action_config: Json;
          execute_at: string;
          status?: "pending" | "completed" | "failed" | "cancelled";
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          shop_id?: string;
          rule_id?: string;
          action_type?: "send_sms" | "send_email" | "create_task" | "create_reminder" | "update_customer";
          action_config?: Json;
          execute_at?: string;
          status?: "pending" | "completed" | "failed" | "cancelled";
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          total_requests: number;
          revoked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          total_requests?: number;
          revoked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          total_requests?: number;
          revoked?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Shop = Database["public"]["Tables"]["shops"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Call = Database["public"]["Tables"]["calls"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type LoyaltyTransaction =
  Database["public"]["Tables"]["loyalty_transactions"]["Row"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type Integration = Database["public"]["Tables"]["integrations"]["Row"];
export type WebhookEndpoint =
  Database["public"]["Tables"]["webhook_endpoints"]["Row"];
export type WebhookDelivery =
  Database["public"]["Tables"]["webhook_deliveries"]["Row"];
export type Segment = Database["public"]["Tables"]["segments"]["Row"];
export type ScheduledAction = Database["public"]["Tables"]["scheduled_actions"]["Row"];
export type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"];
