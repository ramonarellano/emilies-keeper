"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { endreOppgave, leggTilOppgave, settOppgaveFerdig, slettOppgave } from "@/app/actions";
import type { Forslag, Oppgave } from "@/lib/data";
import { Ark, Sirkel, felt, hovedknapp } from "./ark";

type Endring =
  | { type: "ny"; oppgave: Oppgave }
  | { type: "ferdig"; id: string; ferdig: boolean }
  | { type: "endre"; id: string; tittel: string; detaljer: string }
  | { type: "slett"; id: string };

function bruk(oppgaver: Oppgave[], e: Endring): Oppgave[] {
  switch (e.type) {
    case "ny":
      return [e.oppgave, ...oppgaver];
    case "ferdig":
      return oppgaver.map((o) =>
        o.id === e.id ? { ...o, ferdig_tid: e.ferdig ? new Date().toISOString() : null } : o,
      );
    case "endre":
      return oppgaver.map((o) => (o.id === e.id ? { ...o, tittel: e.tittel, detaljer: e.detaljer } : o));
    case "slett":
      return oppgaver.filter((o) => o.id !== e.id);
  }
}

// Fargen og vinkelen følger teksten, så samme oppgave alltid får samme lapp.
function tall(tekst: string) {
  let h = 0;
  for (const c of tekst) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
const vinkler = ["-rotate-2", "-rotate-1", "rotate-1", "rotate-2", "rotate-0"];

export function OppgaveLapper({ oppgaver, forslag }: { oppgaver: Oppgave[]; forslag: Forslag[] }) {
  const [visning, endre] = useOptimistic(oppgaver, bruk);
  const [, startTransition] = useTransition();
  const [nyApen, setNyApen] = useState(false);
  const [valgtId, setValgtId] = useState<string | null>(null);

  const sortert = useMemo(
    () => [...visning.filter((o) => !o.ferdig_tid), ...visning.filter((o) => o.ferdig_tid)],
    [visning],
  );
  const valgt = visning.find((o) => o.id === valgtId) ?? null;

  function gjor(e: Endring, handling: () => Promise<void>) {
    startTransition(async () => {
      endre(e);
      await handling();
    });
  }

  const gjenstar = visning.filter((o) => !o.ferdig_tid).length;

  return (
    <section aria-labelledby="oppgaver-tittel">
      <div className="flex items-baseline justify-between">
        <h2 id="oppgaver-tittel" className="font-serif text-2xl font-semibold">
          Oppgaver
        </h2>
        <span className="text-sm text-muted">
          {gjenstar === 0 ? (visning.length ? "Alt er gjort ✨" : "") : `${gjenstar} igjen`}
        </span>
      </div>

      <ul className="uten-rullefelt -mx-5 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 py-4">
        <li className="snap-start">
          <button
            type="button"
            onClick={() => setNyApen(true)}
            aria-label="Ny oppgave"
            className="flex h-36 w-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted transition-colors active:bg-card"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-xs">Ny</span>
          </button>
        </li>
        {sortert.map((o) => {
          const h = tall(o.tittel);
          const ferdig = Boolean(o.ferdig_tid);
          // En lapp som ikke er lagret ennå, kan ikke endres før den har fått id fra databasen.
          const lagres = o.id.startsWith("ny-");
          return (
            <li key={o.id} className="snap-start">
              <div
                className={`flex size-36 flex-col gap-2 rounded-md p-3 text-[var(--lapp-tekst)] shadow-[0_6px_14px_-6px_rgb(60_40_50/0.35)] transition-opacity ${
                  vinkler[h % vinkler.length]
                } ${ferdig ? "opacity-55" : ""} ${lagres ? "pointer-events-none" : ""}`}
                style={{ background: `var(--lapp-${(h % 5) + 1})` }}
              >
                <Sirkel
                  avhuket={ferdig}
                  etikett={ferdig ? `Angre: ${o.tittel}` : `Ferdig: ${o.tittel}`}
                  onClick={() =>
                    gjor({ type: "ferdig", id: o.id, ferdig: !ferdig }, () => settOppgaveFerdig(o.id, !ferdig))
                  }
                />
                <button
                  type="button"
                  onClick={() => setValgtId(o.id)}
                  className="flex min-h-0 flex-1 flex-col items-start text-left"
                >
                  <span
                    className={`line-clamp-4 font-medium leading-snug break-words ${ferdig ? "line-through" : ""}`}
                  >
                    {o.tittel}
                  </span>
                  {o.detaljer && (
                    <span className="mt-auto text-xs opacity-60" aria-label="Har detaljer">
                      ☰ detaljer
                    </span>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Ark apen={nyApen} lukk={() => setNyApen(false)} tittel="Ny oppgave">
        <NyOppgave
          forslag={forslag}
          lagre={(tittel, detaljer) => {
            setNyApen(false);
            const midlertidig: Oppgave = {
              id: `ny-${Date.now()}`,
              tittel,
              detaljer,
              ferdig_tid: null,
              opprettet: new Date().toISOString(),
            };
            gjor({ type: "ny", oppgave: midlertidig }, () => leggTilOppgave(tittel, detaljer));
          }}
        />
      </Ark>

      <Ark apen={valgt !== null} lukk={() => setValgtId(null)} tittel="Oppgave">
        {valgt && (
          <Detaljer
            key={valgt.id}
            oppgave={valgt}
            lagre={(tittel, detaljer) =>
              gjor({ type: "endre", id: valgt.id, tittel, detaljer }, () =>
                endreOppgave(valgt.id, tittel, detaljer),
              )
            }
            slett={() => {
              setValgtId(null);
              gjor({ type: "slett", id: valgt.id }, () => slettOppgave(valgt.id));
            }}
          />
        )}
      </Ark>
    </section>
  );
}

function NyOppgave({
  forslag,
  lagre,
}: {
  forslag: Forslag[];
  lagre: (tittel: string, detaljer: string) => void;
}) {
  const [tittel, setTittel] = useState("");
  const [detaljer, setDetaljer] = useState("");
  const [visDetaljer, setVisDetaljer] = useState(false);

  const sok = tittel.trim().toLowerCase();
  const treff = forslag
    .filter((f) => f.tittel.toLowerCase().startsWith(sok) && f.tittel.toLowerCase() !== sok)
    .slice(0, sok ? 6 : 8);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (tittel.trim()) lagre(tittel.trim(), detaljer.trim());
      }}
      className="space-y-4"
    >
      <input
        data-autofokus
        aria-label="Hva skal gjøres?"
        placeholder="Hva skal gjøres?"
        value={tittel}
        onChange={(e) => setTittel(e.target.value)}
        maxLength={200}
        className={felt}
      />

      {treff.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
            {sok ? "Tidligere oppgaver" : "Bruk en tidligere oppgave"}
          </p>
          <ul className="flex flex-wrap gap-2">
            {treff.map((f) => (
              <li key={f.tittel}>
                <button
                  type="button"
                  onClick={() => {
                    setTittel(f.tittel);
                    setDetaljer(f.detaljer);
                    if (f.detaljer) setVisDetaljer(true);
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm active:border-accent"
                >
                  {f.tittel}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {visDetaljer ? (
        <textarea
          aria-label="Detaljer"
          placeholder="Detaljer, for eksempel en adresse"
          value={detaljer}
          onChange={(e) => setDetaljer(e.target.value)}
          maxLength={2000}
          rows={4}
          className={felt}
        />
      ) : (
        <button type="button" onClick={() => setVisDetaljer(true)} className="text-sm font-medium text-accent">
          + Legg til detaljer
        </button>
      )}

      <button type="submit" disabled={!tittel.trim()} className={hovedknapp}>
        Legg til
      </button>
    </form>
  );
}

function Detaljer({
  oppgave,
  lagre,
  slett,
}: {
  oppgave: Oppgave;
  lagre: (tittel: string, detaljer: string) => void;
  slett: () => void;
}) {
  const [endrer, setEndrer] = useState(false);
  const [tittel, setTittel] = useState(oppgave.tittel);
  const [detaljer, setDetaljer] = useState(oppgave.detaljer);

  if (endrer) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!tittel.trim()) return;
          lagre(tittel.trim(), detaljer.trim());
          setEndrer(false);
        }}
        className="space-y-4"
      >
        <input
          aria-label="Tittel"
          value={tittel}
          onChange={(e) => setTittel(e.target.value)}
          maxLength={200}
          className={felt}
        />
        <textarea
          aria-label="Detaljer"
          placeholder="Detaljer, for eksempel en adresse"
          value={detaljer}
          onChange={(e) => setDetaljer(e.target.value)}
          maxLength={2000}
          rows={5}
          className={felt}
        />
        <button type="submit" disabled={!tittel.trim()} className={hovedknapp}>
          Lagre
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <p className={`text-lg font-medium ${oppgave.ferdig_tid ? "line-through opacity-60" : ""}`}>
        {oppgave.tittel}
      </p>
      {oppgave.detaljer ? (
        <p className="whitespace-pre-wrap break-words text-muted">{oppgave.detaljer}</p>
      ) : (
        <p className="text-sm text-muted italic">Ingen detaljer.</p>
      )}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("Slette oppgaven?")) slett();
          }}
          className="text-sm text-muted"
        >
          Slett oppgave
        </button>
        <button type="button" onClick={() => setEndrer(true)} className="font-medium text-accent">
          Endre
        </button>
      </div>
    </div>
  );
}
