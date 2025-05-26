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
      endpoint_execution_logs: {
        Row: {
          created_at: string
          duplicates_found: number | null
          endpoint_id: string
          error_message: string | null
          execution_time_ms: number | null
          execution_type: string
          id: string
          providers_fetched: number | null
          providers_saved: number | null
          response_metadata: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          duplicates_found?: number | null
          endpoint_id: string
          error_message?: string | null
          execution_time_ms?: number | null
          execution_type: string
          id?: string
          providers_fetched?: number | null
          providers_saved?: number | null
          response_metadata?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          duplicates_found?: number | null
          endpoint_id?: string
          error_message?: string | null
          execution_time_ms?: number | null
          execution_type?: string
          id?: string
          providers_fetched?: number | null
          providers_saved?: number | null
          response_metadata?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "endpoint_execution_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "provider_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          category: string
          created_at: string | null
          id: string
          provider_id: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          provider_id: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          provider_id?: number
          user_id?: string
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          category: string
          created_at: string | null
          error_details: Json | null
          failed_imports: number
          id: string
          import_status: string | null
          successful_imports: number
          total_providers: number
        }
        Insert: {
          category: string
          created_at?: string | null
          error_details?: Json | null
          failed_imports: number
          id?: string
          import_status?: string | null
          successful_imports: number
          total_providers: number
        }
        Update: {
          category?: string
          created_at?: string | null
          error_details?: Json | null
          failed_imports?: number
          id?: string
          import_status?: string | null
          successful_imports?: number
          total_providers?: number
        }
        Relationships: []
      }
      norwegian_provider_cache: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          ehf_support: boolean | null
          id: string
          industry_code: string | null
          org_number: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          ehf_support?: boolean | null
          id?: string
          industry_code?: string | null
          org_number?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          ehf_support?: boolean | null
          id?: string
          industry_code?: string | null
          org_number?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_api_mappings: {
        Row: {
          api_type: string | null
          api_url: string
          auth_required: boolean | null
          created_at: string | null
          data_mapping: Json | null
          id: string
          provider_name: string
          updated_at: string | null
        }
        Insert: {
          api_type?: string | null
          api_url: string
          auth_required?: boolean | null
          created_at?: string | null
          data_mapping?: Json | null
          id?: string
          provider_name: string
          updated_at?: string | null
        }
        Update: {
          api_type?: string | null
          api_url?: string
          auth_required?: boolean | null
          created_at?: string | null
          data_mapping?: Json | null
          id?: string
          provider_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_duplicates: {
        Row: {
          content_hash: string
          created_at: string
          id: string
          original_source: string | null
          provider_id: number
        }
        Insert: {
          content_hash: string
          created_at?: string
          id?: string
          original_source?: string | null
          provider_id: number
        }
        Update: {
          content_hash?: string
          created_at?: string
          id?: string
          original_source?: string | null
          provider_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_duplicates_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_endpoints: {
        Row: {
          auth_config: Json | null
          auth_required: boolean | null
          category: string
          created_at: string
          endpoint_type: string
          failure_count: number | null
          id: string
          is_active: boolean
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          priority: number
          scraping_config: Json | null
          success_rate: number | null
          total_requests: number | null
          updated_at: string
          url: string
        }
        Insert: {
          auth_config?: Json | null
          auth_required?: boolean | null
          category: string
          created_at?: string
          endpoint_type: string
          failure_count?: number | null
          id?: string
          is_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          name: string
          priority?: number
          scraping_config?: Json | null
          success_rate?: number | null
          total_requests?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          auth_config?: Json | null
          auth_required?: boolean | null
          category?: string
          created_at?: string
          endpoint_type?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean
          last_failure_at?: string | null
          last_success_at?: string | null
          name?: string
          priority?: number
          scraping_config?: Json | null
          success_rate?: number | null
          total_requests?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          category: string
          cons: string[] | null
          created_at: string | null
          description: string
          ehf_invoice_support: boolean | null
          external_url: string
          id: number
          industry_code: string | null
          logo_url: string | null
          name: string
          org_number: string | null
          price: number
          pros: string[] | null
          rating: number
          updated_at: string | null
        }
        Insert: {
          category: string
          cons?: string[] | null
          created_at?: string | null
          description: string
          ehf_invoice_support?: boolean | null
          external_url: string
          id?: number
          industry_code?: string | null
          logo_url?: string | null
          name: string
          org_number?: string | null
          price?: number
          pros?: string[] | null
          rating?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          cons?: string[] | null
          created_at?: string | null
          description?: string
          ehf_invoice_support?: boolean | null
          external_url?: string
          id?: number
          industry_code?: string | null
          logo_url?: string | null
          name?: string
          org_number?: string | null
          price?: number
          pros?: string[] | null
          rating?: number
          updated_at?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
