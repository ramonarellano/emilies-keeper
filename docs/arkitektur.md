# Arkitektur og teknologivalg

Sist oppdatert: 12. oktober 2026 (innlogging lagt til)

## Hva vi bygger

En personlig app for Emilie til oppgaver, ønskelister, mål og annet. Emilie eier kravene (se [krav/](krav/)). Pappa og Claude eier arkitekturen.

Viktigst: et pent og estetisk brukergrensesnitt, at data lagres trygt, og varsler på telefonen. Ingen integrasjoner foreløpig, men vi holder døren åpen for det.

## Beslutning: installerbar web-app (PWA), ikke en ekte iPhone-app

Vi lager en web-app som legges til på hjemskjermen på iPhone («Del → Legg til på Hjem-skjerm»). Da får den eget ikon, åpner i fullskjerm og kan få push-varsler (iOS 16.4 og nyere).

Hvorfor:
- En ekte iPhone-app krever Apples utviklerprogram (ca. 1 100 kr i året). Uten det slutter appen å virke etter 7 dager og kan ikke få push-varsler.
- Endringer er ute med en gang når de flettes inn på GitHub. Vi slipper bygging og installasjon på telefonen.
- Hver pull request får sin egen test-URL på Vercel, så Emilie kan prøve endringer på telefonen før de tas inn.

Hvis vi senere vil ha en ekte app, kan web-appen pakkes inn med Capacitor, eller vi kan skrive en Expo-app som gjenbruker logikken.

## Teknologier

| Del | Valg | Kommentar |
|---|---|---|
| Rammeverk | Next.js 16 (React, TypeScript) | Frontend og backend (Server Actions og Route Handlers) i samme prosjekt |
| Styling | Tailwind CSS 4 | Fargene ligger som variabler i `src/app/globals.css`, med lyst og mørkt tema |
| Komponenter | shadcn/ui og Framer Motion | Legges til når vi trenger dem |
| Hosting | Vercel (gratisplan) | Rulles ut automatisk fra `main`, med test-URL per pull request |
| Database og innlogging | Supabase (Postgres og Auth), EU-region (Stockholm) | Radnivåsikkerhet (RLS) så hver bruker bare ser sine egne data. Tabeller lages etter hvert som kravene kommer |
| Varsler | Web Push (VAPID) via service worker (`public/sw.js`) | Abonnementer lagres i Supabase |
| Planlagte varsler | Tidsplanlegging i Supabase (pg_cron) eller Upstash QStash | Vercel-cron på gratisplanen kjører bare én gang i døgnet |

## Sikkerhet

- Repoet er **offentlig**. Hemmeligheter (API-nøkler, databasepassord, VAPID-nøkler) ligger bare i miljøvariabler i Vercel og Supabase og i lokale `.env.local`-filer, som aldri sjekkes inn.
- Appen krever innlogging. Data ligger i EU.

## Innlogging

- Innlogging med **e-post og passord**. iPhone kan lagre passordet i nøkkelringen og fylle det inn med Face ID.
- Vi bruker ikke engangskode eller lenke på e-post. Supabases innebygde e-posttjeneste sender bare til medlemmer av Supabase-teamet, og egne e-postmaler krever eget SMTP-oppsett. Med en lenke ville innloggingen dessuten havnet i Safari og ikke i den installerte appen.
- **Brukere opprettes manuelt i Supabase.** Registrering av nye brukere er slått av.
- `src/proxy.ts` fornyer økten og sender den som ikke er logget inn til `/logg-inn`. Ikoner, manifest og service worker er tilgjengelige uten innlogging.

## Struktur

```
docs/arkitektur.md     dette dokumentet
docs/krav/             Emilies krav, ett per fil
public/sw.js           service worker (installering og push-varsler)
src/app/               sider, layout, manifest og ikoner
src/components/        gjenbrukbare komponenter
src/lib/               hjelpefunksjoner
src/lib/supabase/      Supabase-klienter for nettleser og server
src/proxy.ts           innloggingssjekk på hver forespørsel
```

## Arbeidsflyt

All endring skjer på egen gren og flettes inn via pull request. `main` skal alltid kunne rulles ut.
