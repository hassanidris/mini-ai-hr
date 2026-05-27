import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missingVars: string[] = [];
  if (!url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missingVars.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingVars.join(", ")}`,
    );
  }

  return createBrowserClient(url as string, key as string);
}
