// Supabase realtime stub. The spec uses Supabase for live order status updates.
// To wire up: $ npm install @supabase/supabase-js
// Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Placeholder. Replace with `createClient(url, anonKey)` once installed.
export const supabase = null;
