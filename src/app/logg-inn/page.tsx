"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lagSupabaseKlient } from "@/lib/supabase/client";

// Innlogging med engangskode på e-post. Koden skrives inn i appen, slik at
// innloggingen havner i den installerte appen og ikke i Safari.
export default function LoggInn() {
  const router = useRouter();
  const [epost, setEpost] = useState("");
  const [kode, setKode] = useState("");
  const [steg, setSteg] = useState<"epost" | "kode">("epost");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, setVenter] = useState(false);

  async function sendKode(e: React.FormEvent) {
    e.preventDefault();
    setVenter(true);
    setFeil(null);
    const { error } = await lagSupabaseKlient().auth.signInWithOtp({
      email: epost.trim(),
      options: { shouldCreateUser: false },
    });
    setVenter(false);
    if (error) {
      setFeil("Fant ingen bruker med den e-postadressen, eller noe gikk galt. Prøv igjen.");
      return;
    }
    setSteg("kode");
  }

  async function bekreftKode(e: React.FormEvent) {
    e.preventDefault();
    setVenter(true);
    setFeil(null);
    const { error } = await lagSupabaseKlient().auth.verifyOtp({
      email: epost.trim(),
      token: kode.trim(),
      type: "email",
    });
    setVenter(false);
    if (error) {
      setFeil("Koden stemmer ikke, eller den er utløpt.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  const felt =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-accent";
  const knapp =
    "w-full rounded-xl bg-accent px-4 py-3 font-medium text-white disabled:opacity-60";

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-5 pt-[max(4rem,env(safe-area-inset-top))]">
      <p className="text-sm font-medium tracking-wide text-accent uppercase">Emilies Keeper</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Logg inn</h1>

      {steg === "epost" ? (
        <form onSubmit={sendKode} className="mt-8 space-y-3">
          <label className="block text-sm text-muted" htmlFor="epost">
            E-postadresse
          </label>
          <input
            id="epost"
            type="email"
            autoComplete="email"
            required
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            className={felt}
          />
          <button type="submit" disabled={venter} className={knapp}>
            {venter ? "Sender …" : "Send meg en kode"}
          </button>
        </form>
      ) : (
        <form onSubmit={bekreftKode} className="mt-8 space-y-3">
          <p className="text-muted">
            Vi har sendt en kode til <strong className="text-foreground">{epost}</strong>.
          </p>
          <label className="block text-sm text-muted" htmlFor="kode">
            Kode fra e-posten
          </label>
          <input
            id="kode"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,8}"
            required
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className={`${felt} tracking-[0.3em]`}
          />
          <button type="submit" disabled={venter} className={knapp}>
            {venter ? "Sjekker …" : "Logg inn"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSteg("epost");
              setKode("");
              setFeil(null);
            }}
            className="w-full py-2 text-sm text-muted"
          >
            Bruk en annen e-postadresse
          </button>
        </form>
      )}

      {feil && <p className="mt-4 text-sm text-accent">{feil}</p>}
    </main>
  );
}
