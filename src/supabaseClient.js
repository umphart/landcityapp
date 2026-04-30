import { createClient } from '@supabase/supabase-js';

// Direct values as fallback (remove these in production)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://epjrvxbbppumrprofgbo.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwanJ2eGJicHB1bXJwcm9mZ2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Nzc4NzQsImV4cCI6MjA5MzA1Mzg3NH0.ZZXjP-aBI4cdgR0IHJOVPvQdkI42GNveNurxI40K4tE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);