const omrader = [
  { emoji: "✅", tittel: "Oppgaver", tekst: "Det som skal gjøres, og når." },
  { emoji: "🎁", tittel: "Ønskelister", tekst: "Ting jeg drømmer om å få." },
  { emoji: "🌱", tittel: "Mål", tekst: "Det jeg jobber mot." },
  { emoji: "✨", tittel: "Og mer", tekst: "Det finner vi ut av sammen." },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-12">
      <p className="text-sm font-medium tracking-wide text-accent uppercase">Emilies Keeper</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight">Hei, Emilie! 👋</h1>
      <p className="mt-3 text-muted">
        Her kommer appen din. Den bygges etter kravene du skriver.
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-3">
        {omrader.map((o) => (
          <li
            key={o.tittel}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="text-2xl" aria-hidden>
              {o.emoji}
            </span>
            <h2 className="mt-3 font-serif text-lg font-semibold">{o.tittel}</h2>
            <p className="mt-1 text-sm text-muted">{o.tekst}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
