"use client";

import { useEffect } from "react";

export default function Feil({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pt-[max(4rem,env(safe-area-inset-top))]">
      <h1 className="font-serif text-3xl font-semibold">Oi, noe gikk galt</h1>
      <p className="mt-3 text-muted">Det du gjorde ble kanskje ikke lagret. Prøv igjen om litt.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 rounded-xl bg-accent px-5 py-3 font-medium text-white"
      >
        Prøv igjen
      </button>
    </main>
  );
}
