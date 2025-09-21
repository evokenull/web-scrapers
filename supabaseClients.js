import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://klnqhwxagfptainnidjn.supabase.co",
  process.env.SUPABASE_KEY
);
