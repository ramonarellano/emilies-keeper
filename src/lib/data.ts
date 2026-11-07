import { lagSupabaseServer } from "@/lib/supabase/server";

export type Oppgave = {
  id: string;
  tittel: string;
  detaljer: string;
  ferdig_tid: string | null;
  opprettet: string;
};

export type Forslag = { tittel: string; detaljer: string };

export type Listepunkt = {
  id: string;
  tekst: string;
  avhuket: boolean;
  opprettet: string;
};

export type Liste = {
  id: string;
  navn: string;
  fjern_avhukede: boolean;
  listepunkter: Listepunkt[];
};

/** Midnatt i dag, norsk tid, som tidspunkt. */
function startPaDagen(): Date {
  const na = new Date();
  const norsk = new Date(na.toLocaleString("en-US", { timeZone: "Europe/Oslo" }));
  const forskyvning = na.getTime() - norsk.getTime();
  norsk.setHours(0, 0, 0, 0);
  return new Date(norsk.getTime() + forskyvning);
}

/** Oppgaver som ikke er ferdige, og de som ble ferdige i dag (de vises bakerst). */
export async function hentOppgaver(): Promise<Oppgave[]> {
  const supabase = await lagSupabaseServer();
  const { data, error } = await supabase
    .from("oppgaver")
    .select("id, tittel, detaljer, ferdig_tid, opprettet")
    .or(`ferdig_tid.is.null,ferdig_tid.gte.${startPaDagen().toISOString()}`)
    .order("opprettet", { ascending: false });
  if (error) throw new Error(`Klarte ikke å hente oppgaver: ${error.message}`);
  return data;
}

/** Tidligere oppgaver, de som er brukt oftest først. Detaljene fra siste gang blir med. */
export async function hentForslag(): Promise<Forslag[]> {
  const supabase = await lagSupabaseServer();
  const { data, error } = await supabase
    .from("oppgaver")
    .select("tittel, detaljer")
    .order("opprettet", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Klarte ikke å hente tidligere oppgaver: ${error.message}`);

  const tellinger = new Map<string, Forslag & { antall: number }>();
  for (const o of data) {
    const nokkel = o.tittel.trim().toLowerCase();
    const funnet = tellinger.get(nokkel);
    if (funnet) funnet.antall++;
    else tellinger.set(nokkel, { tittel: o.tittel.trim(), detaljer: o.detaljer, antall: 1 });
  }
  // Map beholder rekkefølgen de ble lagt inn i (nyeste først), så like antall sorteres etter hvor nylig.
  return [...tellinger.values()]
    .sort((a, b) => b.antall - a.antall)
    .slice(0, 50)
    .map(({ tittel, detaljer }) => ({ tittel, detaljer }));
}

export async function hentLister(): Promise<Liste[]> {
  const supabase = await lagSupabaseServer();
  const { data, error } = await supabase
    .from("lister")
    .select("id, navn, fjern_avhukede, listepunkter(id, tekst, avhuket, opprettet)")
    .order("opprettet", { ascending: true })
    .order("opprettet", { referencedTable: "listepunkter", ascending: true });
  if (error) throw new Error(`Klarte ikke å hente lister: ${error.message}`);
  return data;
}
