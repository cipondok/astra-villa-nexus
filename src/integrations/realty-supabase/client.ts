
import { createClient } from '@supabase/supabase-js';

const REALTY_SUPABASE_URL = "https://cerdnikfqijyqugguryx.supabase.co";
const REALTY_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcmRuaWtmcWlqeXF1Z2d1cnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjMyMDYsImV4cCI6MjA2NTgzOTIwNn0.EvsYd1UY79kVamtNtzxHWsjSDZuFqg7eHL6M5I-qgBs";

// Create a separate client for the Realty project database
export const realtySupabase = createClient(REALTY_SUPABASE_URL, REALTY_SUPABASE_PUBLISHABLE_KEY);
