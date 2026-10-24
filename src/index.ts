import governoratesList from "./governorates.json";

export type Region = "federal" | "kurdistan";

export interface Governorate {
  /** Stable id to store in a database, such as "baghdad" */
  readonly id: string;
  /** ISO 3166-2 code, or null for a governorate that doesn't have one yet (Halabja) */
  readonly iso: string | null;
  readonly ar: string;
  readonly en: string;
  /** Kurdish (Sorani) */
  readonly ku: string;
  /** Federal Iraq or the Kurdistan Region */
  readonly region: Region;
  /** The governorate's capital city, with the latitude and longitude of its center */
  readonly capital: { readonly ar: string; readonly en: string; readonly lat: number; readonly lng: number };
  /** Other spellings people use: Basrah, Arbil, Hawler */
  readonly aliases: readonly string[];
}

const freeze = (g: Governorate): Governorate =>
  Object.freeze({ ...g, capital: Object.freeze({ ...g.capital }), aliases: Object.freeze([...g.aliases]) });

/** All 19 governorates: the 15 of federal Iraq, then the 4 of the Kurdistan Region */
export const governorates: readonly Governorate[] = Object.freeze((governoratesList as Governorate[]).map(freeze));

// Tashkeel, dagger alef and tatweel, which don't change a name
const MARKS = /[ؐ-ًؚ-ٰٟـ]/g;
// Letters people type interchangeably, including Kurdish letters typed on an
// Arabic keyboard and the other way around
const LETTERS: Record<string, string> = {
  أ: "ا", إ: "ا", آ: "ا", ٱ: "ا", ة: "ه", ى: "ي", ی: "ي", ک: "ك", ە: "ه",
  ێ: "ي", ۆ: "و", ڵ: "ل", ڕ: "ر",
};
const LETTER_VARIANTS = new RegExp(`[${Object.keys(LETTERS).join("")}]`, "g");
// The article at the start of a word: البصرة, Al-Qadisiyyah, As Sulaymaniyah
const ARABIC_ARTICLE = /(^|\s)ال/g;
const LATIN_ARTICLE = /(^|[\s-])a[ldnrstz][\s-]+/g;
// Keeps Latin letters, digits and Arabic-script letters; drops spaces and punctuation
const NOT_LETTER = /[^a-z0-9ؠ-ي٠-٩ٮ-ۓە]/g;

/** Reduces a name to the form used for comparing: "Al-Basrah" → "basrah", "البَصرة" → "بصره" */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(MARKS, "")
    .replace(LETTER_VARIANTS, (c) => LETTERS[c])
    .replace(ARABIC_ARTICLE, "$1")
    .replace(LATIN_ARTICLE, "$1")
    .replace(NOT_LETTER, "");
}

// Every name of each governorate, normalized. ISO codes are left out, as every
// one starts with "IQ" and would match searches for "i" or "q".
const keys = governorates.map((g) => [...new Set([g.id, g.ar, g.en, g.ku, ...g.aliases].map(normalize))]);

/**
 * Finds a governorate by its id, ISO code, or name in any language, ignoring
 * spelling differences: "Basrah", "البصره" and "IQ-BA" all return Basra.
 */
export function getGovernorate(query: string): Governorate | undefined {
  const iso = query.trim().toUpperCase();
  const byIso = governorates.find((g) => g.iso === iso);
  if (byIso) return byIso;
  const q = normalize(query);
  if (!q) return undefined;
  const index = keys.findIndex((k) => k.includes(q));
  return index === -1 ? undefined : governorates[index];
}

/**
 * Finds every governorate whose name contains the query, for autocomplete.
 * Exact matches come first, then names that start with the query.
 */
export function searchGovernorates(query: string): Governorate[] {
  const q = normalize(query);
  if (!q) return [];
  const rank = (k: string[]) => (k.includes(q) ? 0 : k.some((key) => key.startsWith(q)) ? 1 : 2);
  return governorates
    .map((g, i) => ({ g, k: keys[i] }))
    .filter(({ k }) => k.some((key) => key.includes(q)))
    .sort((a, b) => rank(a.k) - rank(b.k))
    .map(({ g }) => g);
}

/** Governorates in federal Iraq or in the Kurdistan Region */
export function getGovernoratesByRegion(region: Region): Governorate[] {
  return governorates.filter((g) => g.region === region);
}
