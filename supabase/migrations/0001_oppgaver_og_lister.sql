-- Oppgaver (post-it-lappene) og lister. Kjøres i Supabase: SQL Editor → lim inn → Run.
-- Hver bruker ser og endrer bare sine egne rader (radnivåsikkerhet).

create table public.oppgaver (
  id uuid primary key default gen_random_uuid(),
  bruker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tittel text not null check (char_length(tittel) between 1 and 200),
  detaljer text not null default '' check (char_length(detaljer) <= 2000),
  ferdig_tid timestamptz,
  opprettet timestamptz not null default now()
);

create index oppgaver_bruker_idx on public.oppgaver (bruker_id, opprettet desc);

create table public.lister (
  id uuid primary key default gen_random_uuid(),
  bruker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  navn text not null check (char_length(navn) between 1 and 100),
  fjern_avhukede boolean not null default false,
  opprettet timestamptz not null default now()
);

create table public.listepunkter (
  id uuid primary key default gen_random_uuid(),
  liste_id uuid not null references public.lister (id) on delete cascade,
  bruker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tekst text not null check (char_length(tekst) between 1 and 200),
  avhuket boolean not null default false,
  opprettet timestamptz not null default now()
);

create index listepunkter_liste_idx on public.listepunkter (liste_id, opprettet);

alter table public.oppgaver enable row level security;
alter table public.lister enable row level security;
alter table public.listepunkter enable row level security;

create policy "Egne oppgaver" on public.oppgaver
  for all to authenticated
  using ((select auth.uid()) = bruker_id)
  with check ((select auth.uid()) = bruker_id);

create policy "Egne lister" on public.lister
  for all to authenticated
  using ((select auth.uid()) = bruker_id)
  with check ((select auth.uid()) = bruker_id);

-- Et listepunkt må høre til en liste brukeren eier.
create policy "Egne listepunkter" on public.listepunkter
  for all to authenticated
  using ((select auth.uid()) = bruker_id)
  with check (
    (select auth.uid()) = bruker_id
    and exists (select 1 from public.lister l where l.id = liste_id and l.bruker_id = (select auth.uid()))
  );
