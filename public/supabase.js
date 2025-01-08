const supabaseUrl = "https://dltvlpsxjoqolgzbuyox.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdHZscHN4am9xb2xnemJ1eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNzg4MzMsImV4cCI6MjA1MTc1NDgzM30.q66uxv0Ei_A8g1Kk_QQkIdjyGecgasMBH83Z_qBD8xI";

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
