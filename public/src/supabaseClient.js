import { createClient } from "@supabase/supabase-js";

// 🔹 Replace with your Supabase Project URL & API Key
const SUPABASE_URL = "https://ieyefjxdupzywnmqltnw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlleWVmanhkdXB6eXdubXFsdG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTg2ODIsImV4cCI6MjA1NjQ5NDY4Mn0.Bcl4f67ub3t0MCveOq1zlO9-bD5uRbv12mu-ONG0Whc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
