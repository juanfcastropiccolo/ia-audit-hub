import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://wdhpfvgidwmporwuwtiy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHBmdmdpZHdtcG9yd3V3dGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MDUxMDksImV4cCI6MjA2Mjk4MTEwOX0.aX4j-goFOo_9c9rQ8rd96Hdxv0AKo8RQPqYUDf01TEM';

// Initialize Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Utility function to get the storage URL
export const getSupabaseStorageUrl = (path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
};
