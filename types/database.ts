export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          age: number | null;
          created_at: string;
          full_name: string | null;
          id: string;
          location: string | null;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          age?: number | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          location?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Update: {
          age?: number | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          location?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

