import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  'https://ynkmasiughfrcxwazauh.supabase.co', // ← 여기에 실제 URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlua21hc2l1Z2hmcmN4d2F6YXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDY4MTgsImV4cCI6MjA2MDUyMjgxOH0.XcNVZH7C2H0u1iwbjLDQcQvi6yLFrSWBlnpHsxtsOyw' // ← Supabase 프로젝트의 Service Role Key
);
