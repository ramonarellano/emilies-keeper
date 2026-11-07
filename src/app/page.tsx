import { connection } from "next/server";
import { Suspense } from "react";
import { loggUt } from "./actions";
import { Lister } from "@/components/lister";
import { OppgaveLapper } from "@/components/oppgave-lapper";
import { hentForslag, hentLister, hentOppgaver } from "@/lib/data";
import { lagSupabaseServer } from "@/lib/supabase/server";

async function Innhold() {
  // Innholdet er personlig og avhenger av klokka («i dag»), så det hentes ved hver forespørsel.
  await connection();
  const [oppgaver, forslag, lister] = await Promise.all([hentOppgaver(), hentForslag(), hentLister()]);
  return (
    <>
      <OppgaveLapper oppgaver={oppgaver} forslag={forslag} />
      <Lister lister={lister} />
    </>
  );
}

function Laster() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-7 w-32 rounded bg-border" />
      <div className="mt-7 flex gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="size-36 shrink-0 rounded-md bg-border/60" />
        ))}
      </div>
      <div className="mt-12 h-7 w-24 rounded bg-border" />
      <div className="mt-4 h-28 rounded-2xl bg-border/60" />
    </div>
  );
}

async function Innlogget() {
  // getClaims() sjekker utløpstiden på økten mot klokka.
  await connection();
  const supabase = await lagSupabaseServer();
  const { data } = await supabase.auth.getClaims();
  return (
    <form action={loggUt} className="mt-14 flex items-center justify-between text-xs text-muted">
      <span className="truncate">Logget inn som {data?.claims?.email}</span>
      <button type="submit" className="ml-4 shrink-0 font-medium">
        Logg ut
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 overflow-x-hidden px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-12">
      <h1 className="mb-6 font-serif text-3xl font-semibold leading-tight">Hei, Emilie!</h1>
      <Suspense fallback={<Laster />}>
        <Innhold />
      </Suspense>
      <Suspense>
        <Innlogget />
      </Suspense>
    </main>
  );
}
