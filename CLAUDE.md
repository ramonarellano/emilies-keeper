@AGENTS.md

# Emilies Keeper

Personlig app (installerbar web-app / PWA) for Emilie: oppgaver, ønskelister, mål og annet. Next.js 16, Tailwind 4, Vercel. Supabase til data og innlogging. Se `docs/arkitektur.md` før du gjør tekniske valg.

To personer jobber i repoet:
- **Emilie** skriver krav. Hvis du hjelper Emilie: still oppfølgingsspørsmål til kravet er tydelig, skriv det etter malen i `docs/krav/README.md`, og lever det som en pull request. Ikke endre kode når du hjelper med krav.
- **Pappa (Ramon)** og Claude bygger. Krav i `docs/krav/` er utgangspunktet for funksjoner.

Regler:
- Repoet er offentlig. Aldri sjekk inn hemmeligheter. De hører hjemme i `.env.local` og i Vercel.
- Alt brukeren ser skal være på norsk bokmål.
- Jobb på egen gren og lever via pull request. Aldri push direkte til `main`.
- Kjør `npm run lint` og `npm run build` før du lager en pull request.
