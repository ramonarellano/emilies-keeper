import { createClient } from "@supabase/supabase-js";

// Supabase setter gratisprosjekter på pause etter en uke uten bruk.
// Vercel kaller dette endepunktet én gang i døgnet (se vercel.json), så databasen alltid har vært i bruk nylig.
//
// Spørringen bruker den publiserbare nøkkelen uten innlogging. Radnivåsikkerheten gjør at den ikke ser noen rader,
// men den er likevel en ekte spørring mot databasen.
export async function GET(request: Request) {
  // Når CRON_SECRET er satt i Vercel, sender Vercel den med. Da kan ingen andre kalle endepunktet.
  const hemmelighet = process.env.CRON_SECRET;
  if (hemmelighet && request.headers.get("authorization") !== `Bearer ${hemmelighet}`) {
    return Response.json({ ok: false, feil: "Ikke tilgang" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.from("oppgaver").select("id", { head: true, count: "exact" });

  if (error) {
    console.error("hold-vaken: spørringen mot Supabase feilet", error);
    return Response.json({ ok: false, feil: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, tidspunkt: new Date().toISOString() });
}
