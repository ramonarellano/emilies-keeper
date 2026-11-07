"use client";

import { useEffect, useRef } from "react";

/** Et ark som glir opp fra bunnen. Lukkes med «Lukk», Esc eller trykk utenfor. */
export function Ark({
  apen,
  lukk,
  tittel,
  children,
}: {
  apen: boolean;
  lukk: () => void;
  tittel: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (apen && !d.open) {
      d.showModal();
      // showModal flytter fokus til første knapp. Vi vil heller rett i tekstfeltet.
      d.querySelector<HTMLElement>("[data-autofokus]")?.focus();
    }
    if (!apen && d.open) d.close();
  }, [apen]);

  return (
    <dialog
      ref={ref}
      className="ark"
      onClose={lukk}
      onClick={(e) => {
        if (e.target === e.currentTarget) lukk();
      }}
    >
      {apen && (
        <div className="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-semibold">{tittel}</h2>
            <button type="button" onClick={lukk} className="text-sm text-muted">
              Lukk
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** Runden man trykker på for å huke av. */
export function Sirkel({
  avhuket,
  onClick,
  etikett,
}: {
  avhuket: boolean;
  onClick: () => void;
  etikett: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={avhuket}
      aria-label={etikett}
      onClick={onClick}
      className="-m-2 shrink-0 p-2"
    >
      <span
        className={`flex size-6 items-center justify-center rounded-full border-2 transition-colors ${
          avhuket ? "border-accent bg-accent text-white" : "border-current opacity-60"
        }`}
      >
        {avhuket && (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export const felt =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-accent";

export const hovedknapp =
  "w-full rounded-xl bg-accent px-4 py-3 font-medium text-white disabled:opacity-50";
