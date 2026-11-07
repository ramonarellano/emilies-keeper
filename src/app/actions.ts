"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { lagSupabaseServer } from "@/lib/supabase/server";

export async function loggUt() {
  const supabase = await lagSupabaseServer();
  await supabase.auth.signOut();
  redirect("/logg-inn");
}

// Serverhandlinger kan kalles direkte, så hver av dem sjekker innloggingen.
// Radnivåsikkerheten i Supabase sørger i tillegg for at bare egne rader kan endres.
async function innloggetKlient() {
  const supabase = await lagSupabaseServer();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) throw new Error("Du er ikke logget inn.");
  return supabase;
}

function rens(tekst: string, maks: number) {
  return tekst.trim().slice(0, maks);
}

function sjekk(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// Oppgaver

export async function leggTilOppgave(tittel: string, detaljer: string) {
  const t = rens(tittel, 200);
  if (!t) return;
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("oppgaver").insert({ tittel: t, detaljer: rens(detaljer, 2000) });
  sjekk(error);
  refresh();
}

export async function settOppgaveFerdig(id: string, ferdig: boolean) {
  const supabase = await innloggetKlient();
  const { error } = await supabase
    .from("oppgaver")
    .update({ ferdig_tid: ferdig ? new Date().toISOString() : null })
    .eq("id", id);
  sjekk(error);
  refresh();
}

export async function endreOppgave(id: string, tittel: string, detaljer: string) {
  const t = rens(tittel, 200);
  if (!t) return;
  const supabase = await innloggetKlient();
  const { error } = await supabase
    .from("oppgaver")
    .update({ tittel: t, detaljer: rens(detaljer, 2000) })
    .eq("id", id);
  sjekk(error);
  refresh();
}

export async function slettOppgave(id: string) {
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("oppgaver").delete().eq("id", id);
  sjekk(error);
  refresh();
}

// Lister

export async function lagListe(navn: string, fjernAvhukede: boolean) {
  const n = rens(navn, 100);
  if (!n) return;
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("lister").insert({ navn: n, fjern_avhukede: fjernAvhukede });
  sjekk(error);
  refresh();
}

export async function endreListe(id: string, navn: string, fjernAvhukede: boolean) {
  const n = rens(navn, 100);
  if (!n) return;
  const supabase = await innloggetKlient();
  const { error } = await supabase
    .from("lister")
    .update({ navn: n, fjern_avhukede: fjernAvhukede })
    .eq("id", id);
  sjekk(error);
  if (fjernAvhukede) {
    // Ting som allerede var huket av, skal også bort.
    const { error: e } = await supabase.from("listepunkter").delete().eq("liste_id", id).eq("avhuket", true);
    sjekk(e);
  }
  refresh();
}

export async function slettListe(id: string) {
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("lister").delete().eq("id", id);
  sjekk(error);
  refresh();
}

export async function nullstillListe(id: string) {
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("listepunkter").update({ avhuket: false }).eq("liste_id", id);
  sjekk(error);
  refresh();
}

export async function leggTilListepunkt(listeId: string, tekst: string) {
  const t = rens(tekst, 200);
  if (!t) return;
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("listepunkter").insert({ liste_id: listeId, tekst: t });
  sjekk(error);
  refresh();
}

/** Huker av et punkt. På lister som fjerner avhukede ting, slettes punktet i stedet. */
export async function hukAvListepunkt(id: string, avhuket: boolean) {
  const supabase = await innloggetKlient();
  const { data: punkt, error } = await supabase
    .from("listepunkter")
    .select("lister(fjern_avhukede)")
    .eq("id", id)
    .single();
  sjekk(error);
  const fjern = avhuket && (punkt?.lister as unknown as { fjern_avhukede: boolean } | null)?.fjern_avhukede;
  const { error: e } = fjern
    ? await supabase.from("listepunkter").delete().eq("id", id)
    : await supabase.from("listepunkter").update({ avhuket }).eq("id", id);
  sjekk(e);
  refresh();
}

export async function slettAvhukede(listeId: string) {
  const supabase = await innloggetKlient();
  const { error } = await supabase.from("listepunkter").delete().eq("liste_id", listeId).eq("avhuket", true);
  sjekk(error);
  refresh();
}
