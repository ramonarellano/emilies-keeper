"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  endreListe,
  hukAvListepunkt,
  lagListe,
  leggTilListepunkt,
  nullstillListe,
  slettListe,
  slettAvhukede,
} from "@/app/actions";
import type { Liste, Listepunkt } from "@/lib/data";
import { Ark, Sirkel, felt, hovedknapp } from "./ark";

type Endring =
  | { type: "ny-liste"; liste: Liste }
  | { type: "endre-liste"; id: string; navn: string; fjern: boolean }
  | { type: "slett-liste"; id: string }
  | { type: "nullstill"; id: string }
  | { type: "nytt-punkt"; listeId: string; punkt: Listepunkt }
  | { type: "huk"; listeId: string; id: string; avhuket: boolean }
  | { type: "slett-avhukede"; id: string };

function bruk(lister: Liste[], e: Endring): Liste[] {
  const iListe = (id: string, f: (l: Liste) => Liste) => lister.map((l) => (l.id === id ? f(l) : l));
  switch (e.type) {
    case "ny-liste":
      return [...lister, e.liste];
    case "endre-liste":
      return iListe(e.id, (l) => ({
        ...l,
        navn: e.navn,
        fjern_avhukede: e.fjern,
        listepunkter: e.fjern ? l.listepunkter.filter((p) => !p.avhuket) : l.listepunkter,
      }));
    case "slett-liste":
      return lister.filter((l) => l.id !== e.id);
    case "nullstill":
      return iListe(e.id, (l) => ({ ...l, listepunkter: l.listepunkter.map((p) => ({ ...p, avhuket: false })) }));
    case "nytt-punkt":
      return iListe(e.listeId, (l) => ({ ...l, listepunkter: [...l.listepunkter, e.punkt] }));
    case "huk":
      return iListe(e.listeId, (l) => ({
        ...l,
        listepunkter:
          e.avhuket && l.fjern_avhukede
            ? l.listepunkter.filter((p) => p.id !== e.id)
            : l.listepunkter.map((p) => (p.id === e.id ? { ...p, avhuket: e.avhuket } : p)),
      }));
    case "slett-avhukede":
      return iListe(e.id, (l) => ({ ...l, listepunkter: l.listepunkter.filter((p) => !p.avhuket) }));
  }
}

const erMidlertidig = (id: string) => id.startsWith("ny-");

export function Lister({ lister }: { lister: Liste[] }) {
  const [visning, endre] = useOptimistic(lister, bruk);
  const [, startTransition] = useTransition();
  const [nyApen, setNyApen] = useState(false);
  const [innstillingerId, setInnstillingerId] = useState<string | null>(null);
  const valgt = visning.find((l) => l.id === innstillingerId) ?? null;

  function gjor(e: Endring, handling: () => Promise<void>) {
    startTransition(async () => {
      endre(e);
      await handling();
    });
  }

  return (
    <section aria-labelledby="lister-tittel" className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 id="lister-tittel" className="font-serif text-2xl font-semibold">
          Lister
        </h2>
        <button type="button" onClick={() => setNyApen(true)} className="text-sm font-medium text-accent">
          + Ny liste
        </button>
      </div>

      {visning.length === 0 && (
        <p className="mt-3 text-sm text-muted">
          Ingen lister ennå. Lag en for handling, pakking eller hva du vil huske.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {visning.map((l) => (
          <li key={l.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-lg font-semibold break-words">{l.navn}</h3>
              <button
                type="button"
                aria-label={`Innstillinger for ${l.navn}`}
                disabled={erMidlertidig(l.id)}
                onClick={() => setInnstillingerId(l.id)}
                className="-mr-2 shrink-0 px-2 text-xl leading-none text-muted"
              >
                ···
              </button>
            </div>

            {l.listepunkter.length > 0 && (
              <ul className="mt-3 space-y-3">
                {l.listepunkter.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className={erMidlertidig(p.id) ? "pointer-events-none opacity-50" : ""}>
                      <Sirkel
                        avhuket={p.avhuket}
                        etikett={p.tekst}
                        onClick={() =>
                          gjor({ type: "huk", listeId: l.id, id: p.id, avhuket: !p.avhuket }, () =>
                            hukAvListepunkt(p.id, !p.avhuket),
                          )
                        }
                      />
                    </span>
                    <span className={`flex-1 break-words ${p.avhuket ? "text-muted line-through" : ""}`}>
                      {p.tekst}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {!erMidlertidig(l.id) && (
              <NyttPunkt
                lagre={(tekst) =>
                  gjor(
                    {
                      type: "nytt-punkt",
                      listeId: l.id,
                      punkt: { id: `ny-${Date.now()}`, tekst, avhuket: false, opprettet: new Date().toISOString() },
                    },
                    () => leggTilListepunkt(l.id, tekst),
                  )
                }
              />
            )}
          </li>
        ))}
      </ul>

      <Ark apen={nyApen} lukk={() => setNyApen(false)} tittel="Ny liste">
        <ListeSkjema
          knapp="Lag liste"
          lagre={(navn, fjern) => {
            setNyApen(false);
            gjor(
              { type: "ny-liste", liste: { id: `ny-${Date.now()}`, navn, fjern_avhukede: fjern, listepunkter: [] } },
              () => lagListe(navn, fjern),
            );
          }}
        />
      </Ark>

      <Ark apen={valgt !== null} lukk={() => setInnstillingerId(null)} tittel="Liste">
        {valgt && (
          <div className="space-y-6">
            <ListeSkjema
              key={valgt.id}
              navn={valgt.navn}
              fjern={valgt.fjern_avhukede}
              knapp="Lagre"
              lagre={(navn, fjern) => {
                setInnstillingerId(null);
                gjor({ type: "endre-liste", id: valgt.id, navn, fjern }, () => endreListe(valgt.id, navn, fjern));
              }}
            />
            <div className="space-y-3 border-t border-border pt-5 text-sm">
              {!valgt.fjern_avhukede && valgt.listepunkter.some((p) => p.avhuket) && (
                <button
                  type="button"
                  onClick={() => {
                    setInnstillingerId(null);
                    gjor({ type: "nullstill", id: valgt.id }, () => nullstillListe(valgt.id));
                  }}
                  className="block font-medium text-accent"
                >
                  Fjern alle avhukinger
                </button>
              )}
              {valgt.listepunkter.some((p) => p.avhuket) && (
                <button
                  type="button"
                  onClick={() => {
                    setInnstillingerId(null);
                    gjor({ type: "slett-avhukede", id: valgt.id }, () => slettAvhukede(valgt.id));
                  }}
                  className="block text-muted"
                >
                  Slett avhukede ting
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Slette listen «${valgt.navn}»?`)) return;
                  setInnstillingerId(null);
                  gjor({ type: "slett-liste", id: valgt.id }, () => slettListe(valgt.id));
                }}
                className="block text-muted"
              >
                Slett listen
              </button>
            </div>
          </div>
        )}
      </Ark>
    </section>
  );
}

function NyttPunkt({ lagre }: { lagre: (tekst: string) => void }) {
  const [tekst, setTekst] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tekst.trim()) return;
        lagre(tekst.trim());
        setTekst("");
      }}
      className="mt-3 flex items-center gap-3"
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-lg text-muted" aria-hidden>
        +
      </span>
      <input
        aria-label="Legg til i listen"
        placeholder="Legg til …"
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        maxLength={200}
        enterKeyHint="done"
        className="min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-muted"
      />
    </form>
  );
}

function ListeSkjema({
  navn: startNavn = "",
  fjern: startFjern = false,
  knapp,
  lagre,
}: {
  navn?: string;
  fjern?: boolean;
  knapp: string;
  lagre: (navn: string, fjern: boolean) => void;
}) {
  const [navn, setNavn] = useState(startNavn);
  const [fjern, setFjern] = useState(startFjern);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (navn.trim()) lagre(navn.trim(), fjern);
      }}
      className="space-y-4"
    >
      <input
        data-autofokus={startNavn ? undefined : true}
        aria-label="Navn på listen"
        placeholder="Navn på listen"
        value={navn}
        onChange={(e) => setNavn(e.target.value)}
        maxLength={100}
        className={felt}
      />
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={fjern}
          onChange={(e) => setFjern(e.target.checked)}
          className="mt-1 size-5 accent-[var(--accent)]"
        />
        <span>
          <span className="block">Fjern ting når de hukes av</span>
          <span className="block text-sm text-muted">
            {fjern
              ? "Fint for handlelister: det du huker av, blir borte."
              : "Fint for lister du bruker igjen: det du huker av, blir stående."}
          </span>
        </span>
      </label>
      <button type="submit" disabled={!navn.trim()} className={hovedknapp}>
        {knapp}
      </button>
    </form>
  );
}
