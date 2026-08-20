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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          businesses_id: string
          country: string
          created_at: string
          currency: string
          language: string
          name: string
          phone: string
          plan: Database["public"]["Enums"]["plan_enum"]
          type: string
          updated_at: string
        }
        Insert: {
          businesses_id: string
          country: string
          created_at?: string
          currency: string
          language: string
          name: string
          phone: string
          plan: Database["public"]["Enums"]["plan_enum"]
          type: string
          updated_at?: string
        }
        Update: {
          businesses_id?: string
          country?: string
          created_at?: string
          currency?: string
          language?: string
          name?: string
          phone?: string
          plan?: Database["public"]["Enums"]["plan_enum"]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          businesses_id: string
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          businesses_id: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          businesses_id?: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_businesses_id_fkey"
            columns: ["businesses_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["businesses_id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string
          businesses_id: string
          created_at: string
          id: string
          identifier: string
          name: string
          refresh_token: string
          type: Database["public"]["Enums"]["integration_type_enum"]
          updated_at: string
        }
        Insert: {
          access_token: string
          businesses_id: string
          created_at?: string
          id?: string
          identifier: string
          name: string
          refresh_token: string
          type: Database["public"]["Enums"]["integration_type_enum"]
          updated_at?: string
        }
        Update: {
          access_token?: string
          businesses_id?: string
          created_at?: string
          id?: string
          identifier?: string
          name?: string
          refresh_token?: string
          type?: Database["public"]["Enums"]["integration_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_businesses_id_fkey"
            columns: ["businesses_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["businesses_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          id: string
          role: Database["public"]["Enums"]["role_enum"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          id?: string
          role: Database["public"]["Enums"]["role_enum"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          id?: string
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          revenue: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          revenue?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          businesses_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          businesses_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          businesses_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_businesses_id_fkey"
            columns: ["businesses_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["businesses_id"]
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
      integration_type_enum: "shopify" | "youcan" | "google_sheets"
      plan_enum: "free" | "basic" | "pro"
      role_enum: "system" | "assistant" | "user"
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
      integration_type_enum: ["shopify", "youcan", "google_sheets"],
      plan_enum: ["free", "basic", "pro"],
      role_enum: ["system", "assistant", "user"],
    },
  },
} as const
