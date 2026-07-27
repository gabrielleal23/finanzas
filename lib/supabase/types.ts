export type AccountKind = "bank" | "usd_investment" | "metal" | "other_investment";
export type MetalType = "gold" | "silver" | "platinum";
export type OtherAssetType = "stock" | "fund" | "crypto";

export interface AccountAttributes {
  metal_type?: MetalType;
  unit?: "g" | "oz";
  symbol?: string;
  asset_type?: OtherAssetType;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; user_id: string; name: string; created_at: string };
        Insert: { id?: string; user_id: string; name: string; created_at?: string };
        Update: { id?: string; user_id?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          profile_id: string;
          kind: AccountKind;
          name: string;
          currency: string;
          attributes: AccountAttributes;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          kind: AccountKind;
          name: string;
          currency: string;
          attributes?: AccountAttributes;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "accounts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      snapshots: {
        Row: {
          id: string;
          account_id: string;
          month: string;
          quantity: number | null;
          manual_balance: number | null;
          price_used: number | null;
          value_cop: number;
          value_usd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          month: string;
          quantity?: number | null;
          manual_balance?: number | null;
          price_used?: number | null;
          value_cop: number;
          value_usd: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["snapshots"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "snapshots_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          }
        ];
      };
      price_cache: {
        Row: {
          symbol: string;
          price_date: string;
          price_usd: number;
          source: string;
          fetched_at: string;
        };
        Insert: {
          symbol: string;
          price_date: string;
          price_usd: number;
          source: string;
          fetched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["price_cache"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_default_profiles: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type Snapshot = Database["public"]["Tables"]["snapshots"]["Row"];
export type PriceCacheRow = Database["public"]["Tables"]["price_cache"]["Row"];
