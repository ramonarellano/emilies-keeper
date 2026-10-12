import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Fornyer innloggingen ved hver forespørsel, og sender den som ikke er logget inn til /logg-inn.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const innlogget = Boolean(data?.claims);
  const paInnlogging = request.nextUrl.pathname.startsWith("/logg-inn");

  if (!innlogget && !paInnlogging) {
    return NextResponse.redirect(new URL("/logg-inn", request.url));
  }
  if (innlogget && paInnlogging) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  // Alt unntatt filer som må være tilgjengelige uten innlogging (ikoner, manifest, service worker).
  matcher: ["/((?!_next/static|_next/image|icon|apple-icon|manifest.webmanifest|sw.js).*)"],
};
