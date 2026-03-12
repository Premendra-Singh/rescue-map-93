import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Pin = {
  id: string;
  type: 'need_help' | 'can_help';
  category: 'food' | 'medical' | 'rescue' | 'shelter';
  description: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  resolved: boolean;
};
