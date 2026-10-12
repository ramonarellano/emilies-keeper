import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function lagSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Kalt fra en serverkomponent, der cookies ikke kan settes.
            // proxy.ts fornyer økten i stedet.
          }
        },
      },
    },
  );
}
