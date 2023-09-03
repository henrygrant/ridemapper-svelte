import type { Database } from "../../../database.types";

export type UserMeta = Database['public']['Tables']['user_meta']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']