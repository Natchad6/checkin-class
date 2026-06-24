import { createClient } from "@supabase/supabase-js"
import { Database } from "../../types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!

export const supabaseService = createClient<Database>(supabaseUrl, supabaseKey)
