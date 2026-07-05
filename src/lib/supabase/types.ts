export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'churned'

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

export type OrgPlan = 'free' | 'pro' | 'enterprise'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          industry: string | null
          website: string | null
          plan: OrgPlan
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          industry?: string | null
          website?: string | null
          plan?: OrgPlan
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          industry?: string | null
          website?: string | null
          plan?: OrgPlan
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          org_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company: string | null
          position: string | null
          status: ContactStatus
          tags: string[]
          notes: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          status?: ContactStatus
          tags?: string[]
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          status?: ContactStatus
          tags?: string[]
          notes?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          org_id: string
          contact_id: string | null
          title: string
          value: number
          currency: string
          stage: DealStage
          probability: number
          expected_close_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          contact_id?: string | null
          title: string
          value?: number
          currency?: string
          stage?: DealStage
          probability?: number
          expected_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          title?: string
          value?: number
          currency?: string
          stage?: DealStage
          probability?: number
          expected_close_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          org_id: string
          deal_id: string | null
          contact_id: string | null
          user_id: string
          type: ActivityType
          title: string
          description: string | null
          scheduled_at: string | null
          completed_at: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          deal_id?: string | null
          contact_id?: string | null
          user_id: string
          type: ActivityType
          title: string
          description?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          deal_id?: string | null
          contact_id?: string | null
          type?: ActivityType
          title?: string
          description?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          completed?: boolean
          updated_at?: string
        }
      }
      pipelines: {
        Row: {
          id: string
          org_id: string
          name: string
          stages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          stages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          stages?: Json
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          org_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          name?: string
          color?: string
        }
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
  }
}

// Convenience types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type Pipeline = Database['public']['Tables']['pipelines']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']

export interface DealWithContact extends Deal {
  contact?: Contact | null
}

export interface ActivityWithRelations extends Activity {
  contact?: Contact | null
  deal?: Deal | null
}

export interface ContactWithDeals extends Contact {
  deals?: Deal[]
  activities?: Activity[]
}
