# Krav

Her skriver Emilie (med hjelp fra Claude) ned hva appen skal kunne. **Ett krav per fil.**

## Filnavn

`NNN-kort-navn.md`, for eksempel `001-legge-til-oppgave.md`. Bruk neste ledige nummer.

## Mal

```markdown
# Kort tittel

Status: Ny
Prioritet: Høy | Middels | Lav
Område: Oppgaver | Ønskelister | Mål | Varsler | Utseende | Annet

## Hva vil jeg kunne gjøre?
Som Emilie vil jeg ... slik at ...

## Hvorfor?
Hva er problemet, eller hvorfor er dette gøy eller nyttig?

## Hvordan vet jeg at det er ferdig?
- [ ] Konkret ting jeg kan sjekke i appen
- [ ] ...

## Hvordan skal det se ut? (valgfritt)
Beskrivelse, skisse eller lenke til bilde.
```

Status endres av den som bygger: `Ny` → `Under arbeid` → `Ferdig`.

## Slik leveres et krav

1. Lag en ny gren: `krav/NNN-kort-navn`
2. Legg til filen i `docs/krav/`
3. Commit, push og lag en pull request med tittelen «Krav: Kort tittel»
