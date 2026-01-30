import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvxmazaihlshodpxohnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eG1hemFpaGxzaG9kcHhvaG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjQ1NTksImV4cCI6MjA3NDg0MDU1OX0.kZ4ow5mcY1TgrwIDoYkPkNx7M-DKtZoDQfoQvJVGBGc';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
