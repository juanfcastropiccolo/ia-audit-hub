import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to get the storage URL
export const getSupabaseStorageUrl = (path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
};
