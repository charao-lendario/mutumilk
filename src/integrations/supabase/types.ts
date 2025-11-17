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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analises_ia: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          prompt_enviado: string
          resposta_ia: string
          sugestoes_geradas: Json | null
          tipo_analise: Database["public"]["Enums"]["tipo_analise"]
          vendedor_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          prompt_enviado: string
          resposta_ia: string
          sugestoes_geradas?: Json | null
          tipo_analise: Database["public"]["Enums"]["tipo_analise"]
          vendedor_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          prompt_enviado?: string
          resposta_ia?: string
          sugestoes_geradas?: Json | null
          tipo_analise?: Database["public"]["Enums"]["tipo_analise"]
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_ia_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cnpj: string
          contato: string | null
          created_at: string
          data_cadastro: string
          id: string
          nome: string
          ticket_medio: number | null
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          ultima_compra: string | null
          vendedor_id: string
        }
        Insert: {
          cnpj: string
          contato?: string | null
          created_at?: string
          data_cadastro?: string
          id?: string
          nome: string
          ticket_medio?: number | null
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          ultima_compra?: string | null
          vendedor_id: string
        }
        Update: {
          cnpj?: string
          contato?: string | null
          created_at?: string
          data_cadastro?: string
          id?: string
          nome?: string
          ticket_medio?: number | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          ultima_compra?: string | null
          vendedor_id?: string
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string
          created_at: string
          data_pedido: string
          id: string
          status: Database["public"]["Enums"]["status_pedido"] | null
          valor_total: number
          vendedor_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_pedido?: string
          id?: string
          status?: Database["public"]["Enums"]["status_pedido"] | null
          valor_total: number
          vendedor_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_pedido?: string
          id?: string
          status?: Database["public"]["Enums"]["status_pedido"] | null
          valor_total?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string
          created_at: string
          em_promocao: boolean | null
          id: string
          nome: string
          preco_anterior: number
          preco_atual: number
          unidade: string
        }
        Insert: {
          categoria: string
          created_at?: string
          em_promocao?: boolean | null
          id?: string
          nome: string
          preco_anterior: number
          preco_atual: number
          unidade: string
        }
        Update: {
          categoria?: string
          created_at?: string
          em_promocao?: boolean | null
          id?: string
          nome?: string
          preco_anterior?: number
          preco_atual?: number
          unidade?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "vendedor" | "admin"
      status_pedido: "concluido" | "pendente" | "cancelado"
      tipo_analise: "geral" | "individual"
      tipo_cliente:
        | "supermercado"
        | "mercado"
        | "padaria"
        | "confeitaria"
        | "lanchonete"
        | "restaurante"
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
      app_role: ["vendedor", "admin"],
      status_pedido: ["concluido", "pendente", "cancelado"],
      tipo_analise: ["geral", "individual"],
      tipo_cliente: [
        "supermercado",
        "mercado",
        "padaria",
        "confeitaria",
        "lanchonete",
        "restaurante",
      ],
    },
  },
} as const
