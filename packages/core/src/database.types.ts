
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "groups": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"position": number,"source_sheet": string | null,"survey_id": string,"team_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"position"?: number,"source_sheet"?: string | null,"survey_id": string,"team_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"position"?: number,"source_sheet"?: string | null,"survey_id"?: string,"team_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "groups_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "groups_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "group_progress"
      referencedColumns: ["team_id"]
    },{
      foreignKeyName: "groups_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "teams"
      referencedColumns: ["id"]
    }
                  ]
                },"photos": {
                  Row: {
                    "created_at": string,"group_id": string,"id": string,"latitude": number | null,"longitude": number | null,"storage_path": string,"taken_at": string,"visit_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"group_id": string,"id"?: string,"latitude"?: number | null,"longitude"?: number | null,"storage_path": string,"taken_at": string,"visit_id": string
                  }
                  Update: {
                    "created_at"?: string,"group_id"?: string,"id"?: string,"latitude"?: number | null,"longitude"?: number | null,"storage_path"?: string,"taken_at"?: string,"visit_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "photos_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "group_progress"
      referencedColumns: ["group_id"]
    },{
      foreignKeyName: "photos_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "groups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "photos_visit_id_fkey"
      columns: ["visit_id"]
isOneToOne: false
      referencedRelation: "visits"
      referencedColumns: ["id"]
    }
                  ]
                },"premises": {
                  Row: {
                    "activity": string | null,"address": string | null,"assigned_to": string | null,"created_at": string,"group_id": string,"id": string,"owner_name": string | null,"phone": string | null,"ruc": string,"sector": string | null,"trade_name": string | null,"value": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "activity"?: string | null,"address"?: string | null,"assigned_to"?: string | null,"created_at"?: string,"group_id": string,"id"?: string,"owner_name"?: string | null,"phone"?: string | null,"ruc": string,"sector"?: string | null,"trade_name"?: string | null,"value"?: string | null
                  }
                  Update: {
                    "activity"?: string | null,"address"?: string | null,"assigned_to"?: string | null,"created_at"?: string,"group_id"?: string,"id"?: string,"owner_name"?: string | null,"phone"?: string | null,"ruc"?: string,"sector"?: string | null,"trade_name"?: string | null,"value"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "premises_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "premises_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "group_progress"
      referencedColumns: ["group_id"]
    },{
      foreignKeyName: "premises_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "groups"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string,"full_name": string,"id": string,"national_id": string | null,"privacy_accepted_at": string | null,"role": Database["public"]['Enums']["user_role"],"team_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"full_name": string,"id": string,"national_id"?: string | null,"privacy_accepted_at"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"team_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"full_name"?: string,"id"?: string,"national_id"?: string | null,"privacy_accepted_at"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"team_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "group_progress"
      referencedColumns: ["team_id"]
    },{
      foreignKeyName: "profiles_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "teams"
      referencedColumns: ["id"]
    }
                  ]
                },"surveys": {
                  Row: {
                    "closed_at": string | null,"created_at": string,"created_by": string,"id": string,"institution": string | null,"name": string,"period": string | null,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "closed_at"?: string | null,"created_at"?: string,"created_by": string,"id"?: string,"institution"?: string | null,"name": string,"period"?: string | null,"status"?: string
                  }
                  Update: {
                    "closed_at"?: string | null,"created_at"?: string,"created_by"?: string,"id"?: string,"institution"?: string | null,"name"?: string,"period"?: string | null,"status"?: string
                  }
                  Relationships: [
                    
                  ]
                },"teams": {
                  Row: {
                    "code": string | null,"created_at": string,"id": string,"invite_code": string,"leader_id": string | null,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code"?: string | null,"created_at"?: string,"id"?: string,"invite_code"?: string,"leader_id"?: string | null,"name": string
                  }
                  Update: {
                    "code"?: string | null,"created_at"?: string,"id"?: string,"invite_code"?: string,"leader_id"?: string | null,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"visits": {
                  Row: {
                    "group_id": string,"id": string,"latitude": number | null,"longitude": number | null,"notes": string | null,"premise_id": string,"registration_number": string | null,"review_comment": string | null,"review_status": Database["public"]['Enums']["review_status"],"reviewed_at": string | null,"reviewed_by": string | null,"status": Database["public"]['Enums']["visit_status"],"updated_at": string,"user_id": string,"visited_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "group_id": string,"id"?: string,"latitude"?: number | null,"longitude"?: number | null,"notes"?: string | null,"premise_id": string,"registration_number"?: string | null,"review_comment"?: string | null,"review_status"?: Database["public"]['Enums']["review_status"],"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status": Database["public"]['Enums']["visit_status"],"updated_at"?: string,"user_id": string,"visited_at"?: string
                  }
                  Update: {
                    "group_id"?: string,"id"?: string,"latitude"?: number | null,"longitude"?: number | null,"notes"?: string | null,"premise_id"?: string,"registration_number"?: string | null,"review_comment"?: string | null,"review_status"?: Database["public"]['Enums']["review_status"],"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["visit_status"],"updated_at"?: string,"user_id"?: string,"visited_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "visits_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "group_progress"
      referencedColumns: ["group_id"]
    },{
      foreignKeyName: "visits_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "groups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visits_premise_id_fkey"
      columns: ["premise_id"]
isOneToOne: true
      referencedRelation: "premises"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visits_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visits_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "group_progress": {
                  Row: {
                    "closed": number | null,"group_id": string,"group_name": string,"leader_id": string | null,"leader_name": string | null,"not_found": number | null,"not_visited": number | null,"position": number,"survey_id": string,"team_code": string | null,"team_id": string,"total_premises": number | null,"visited": number | null,"with_permit": number | null,"without_permit": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "groups_survey_id_fkey"
      columns: ["survey_id"]
isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "auth_group_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"auth_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"auth_team_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"generate_invite_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"import_survey":
{ Args: { "p_groups": Json,"p_institution": string,"p_name": string,"p_period": string }; Returns: string
                           },
"is_coordinator":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            "review_status": "pending"|"approved"|"returned","user_role": "coordinator"|"leader"|"member","visit_status": "operating_with_permit"|"operating_without_permit"|"temporarily_closed"|"not_found"|"not_visited"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "review_status": ["pending", "approved", "returned"],"user_role": ["coordinator", "leader", "member"],"visit_status": ["operating_with_permit", "operating_without_permit", "temporarily_closed", "not_found", "not_visited"]
          }
        }
} as const
