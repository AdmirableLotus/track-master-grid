import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uhpptvnpcxulllqwxkhb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocHB0dm5wY3h1bGxscXd4a2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzgwMTksImV4cCI6MjA4OTExNDAxOX0.4KKw4cTEQGWkceKgGwjWkXRoS7OQxRMVmjfD37ChPPM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
