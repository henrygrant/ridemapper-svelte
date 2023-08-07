import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
export const supabase = createClient(
	process.env.PUBLIC_SUPABASE_URL as string,
	process.env.PUBLIC_SUPABASE_ANON_KEY as string
);
