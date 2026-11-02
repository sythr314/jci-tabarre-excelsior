import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://edufaoftopmprbanowis.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_pnKtvG_ZM2zk8pQKzlZZyA_3zCnOj7Q";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon-key")
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : DEFAULT_SUPABASE_ANON_KEY;

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
