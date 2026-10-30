// Tashkeel, dagger alef and tatweel, which don't change a name
const MARKS = /[ؐ-ًؚ-ٰٟـ]/g;
// Letters people type interchangeably, including Kurdish letters typed on an
// Arabic keyboard and the other way around
const LETTERS: Record<string, string> = {
  أ: "ا", إ: "ا", آ: "ا", ٱ: "ا", ة: "ه", ى: "ي", ی: "ي", ک: "ك", ە: "ه", ھ: "ه",
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

export type Named = { id: string; ar: string; en: string; ku: string; aliases: readonly string[] };

// Every name of each place, normalized. ISO codes and P-codes are left out, as
// every one starts with "IQ" and would match searches for "i" or "q".
export const namesOf = (p: Named) => [...new Set([p.id, p.ar, p.en, p.ku, ...p.aliases].map(normalize))];
export function findByName<T>(items: readonly T[], keys: string[][], query: string): T | undefined {
  const q = normalize(query);
  if (!q) return undefined;
  const index = keys.findIndex((k) => k.includes(q));
  return index === -1 ? undefined : items[index];
}

// Exact matches come first, then names that start with the query
export function searchByName<T>(items: readonly T[], keys: string[][], query: string): T[] {
  const q = normalize(query);
  if (!q) return [];
  const rank = (k: string[]) => (k.includes(q) ? 0 : k.some((key) => key.startsWith(q)) ? 1 : 2);
  return items
    .map((item, i) => ({ item, k: keys[i] }))
    .filter(({ k }) => k.some((key) => key.includes(q)))
    .sort((a, b) => rank(a.k) - rank(b.k))
    .map(({ item }) => item);
}

const RAD = Math.PI / 180;

// Distance in km between two points along the Earth's surface (haversine)
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const a =
    Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(((lng2 - lng1) * RAD) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}
