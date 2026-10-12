"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lagSupabaseKlient } from "@/lib/supabase/client";

// Innlogging med e-post og passord. Brukere opprettes i Supabase, registrering er slått av.
export default function LoggInn() {
  const router = useRouter();
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, setVenter] = useState(false);

  async function loggInn(e: React.FormEvent) {
    e.preventDefault();
    setVenter(true);
    setFeil(null);
    const { error } = await lagSupabaseKlient().auth.signInWithPassword({
      email: epost.trim(),
      password: passord,
    });
    setVenter(false);
    if (error) {
      setFeil("Feil e-post eller passord. Prøv igjen.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  const felt =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-accent";

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-5 pt-[max(4rem,env(safe-area-inset-top))]">
      <p className="text-sm font-medium tracking-wide text-accent uppercase">Emilies Keeper</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Logg inn</h1>

      <form onSubmit={loggInn} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm text-muted" htmlFor="epost">
            E-postadresse
          </label>
          <input
            id="epost"
            type="email"
            autoComplete="username"
            required
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            className={felt}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-muted" htmlFor="passord">
            Passord
          </label>
          <input
            id="passord"
            type="password"
            autoComplete="current-password"
            required
            value={passord}
            onChange={(e) => setPassord(e.target.value)}
            className={felt}
          />
        </div>
        <button
          type="submit"
          disabled={venter}
          className="w-full rounded-xl bg-accent px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {venter ? "Logger inn …" : "Logg inn"}
        </button>
      </form>

      {feil && <p className="mt-4 text-sm text-accent">{feil}</p>}
    </main>
  );
}
