import governoratesList from "./governorates.json";
import districtsList from "./districts.json";

export type Region = "federal" | "kurdistan";

/** A town, with the latitude and longitude of its center */
export interface Town {
  readonly ar: string;
  readonly en: string;
  readonly lat: number;
  readonly lng: number;
}

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
  readonly capital: Town;
  /** Other spellings people use: Basrah, Arbil, Hawler */
  readonly aliases: readonly string[];
}

export interface District {
  /** Stable id to store in a database, such as "abughraib" */
  readonly id: string;
  /** Id of the governorate the district is in, such as "baghdad" */
  readonly governorateId: string;
  /**
   * OCHA P-code, or null for a district that OCHA's 2019 data doesn't list:
   * one created since, or one it counts as a sub-district (Abu Ghraib)
   */
  readonly pcode: string | null;
  readonly ar: string;
  readonly en: string;
  /** Kurdish (Sorani) */
  readonly ku: string;
  /** The town the district is run from, with the latitude and longitude of its center */
  readonly center: Town;
  /** Other spellings people use, and other names: Daghara for Akkad */
  readonly aliases: readonly string[];
}

const freezeGovernorate = (g: Governorate): Governorate =>
  Object.freeze({ ...g, capital: Object.freeze({ ...g.capital }), aliases: Object.freeze([...g.aliases]) });
const freezeDistrict = (d: District): District =>
  Object.freeze({ ...d, center: Object.freeze({ ...d.center }), aliases: Object.freeze([...d.aliases]) });

/** All 19 governorates: the 15 of federal Iraq, then the 4 of the Kurdistan Region */
export const governorates: readonly Governorate[] = Object.freeze((governoratesList as Governorate[]).map(freezeGovernorate));

/** All districts, grouped by governorate in the same order as `governorates` */
export const districts: readonly District[] = Object.freeze((districtsList as District[]).map(freezeDistrict));

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

type Named = { id: string; ar: string; en: string; ku: string; aliases: readonly string[] };

// Every name of each place, normalized. ISO codes and P-codes are left out, as
// every one starts with "IQ" and would match searches for "i" or "q".
const namesOf = (p: Named) => [...new Set([p.id, p.ar, p.en, p.ku, ...p.aliases].map(normalize))];
const governorateKeys = governorates.map(namesOf);
const districtKeys = districts.map(namesOf);

function findByName<T>(items: readonly T[], keys: string[][], query: string): T | undefined {
  const q = normalize(query);
  if (!q) return undefined;
  const index = keys.findIndex((k) => k.includes(q));
  return index === -1 ? undefined : items[index];
}

// Exact matches come first, then names that start with the query
function searchByName<T>(items: readonly T[], keys: string[][], query: string): T[] {
  const q = normalize(query);
  if (!q) return [];
  const rank = (k: string[]) => (k.includes(q) ? 0 : k.some((key) => key.startsWith(q)) ? 1 : 2);
  return items
    .map((item, i) => ({ item, k: keys[i] }))
    .filter(({ k }) => k.some((key) => key.includes(q)))
    .sort((a, b) => rank(a.k) - rank(b.k))
    .map(({ item }) => item);
}

/**
 * Finds a governorate by its id, ISO code, or name in any language, ignoring
 * spelling differences: "Basrah", "البصره" and "IQ-BA" all return Basra.
 */
export function getGovernorate(query: string): Governorate | undefined {
  const iso = query.trim().toUpperCase();
  const byIso = governorates.find((g) => g.iso === iso);
  if (byIso) return byIso;
  return findByName(governorates, governorateKeys, query);
}

/**
 * Finds every governorate whose name contains the query, for autocomplete.
 * Exact matches come first, then names that start with the query.
 */
export function searchGovernorates(query: string): Governorate[] {
  return searchByName(governorates, governorateKeys, query);
}

/** Governorates in federal Iraq or in the Kurdistan Region */
export function getGovernoratesByRegion(region: Region): Governorate[] {
  return governorates.filter((g) => g.region === region);
}

/**
 * Finds a district by its id, P-code, or name in any language, ignoring
 * spelling differences: "Abu Ghraib", "ابو غريب" and "abughraib" all return
 * Abu Ghraib.
 */
export function getDistrict(query: string): District | undefined {
  const pcode = query.trim().toUpperCase();
  const byPcode = districts.find((d) => d.pcode === pcode);
  if (byPcode) return byPcode;
  return findByName(districts, districtKeys, query);
}

/**
 * Finds every district whose name contains the query, for autocomplete.
 * Exact matches come first, then names that start with the query. Pass a
 * governorate (any query `getGovernorate` accepts) to search only its districts.
 */
export function searchDistricts(query: string, options: { governorate?: string } = {}): District[] {
  const found = searchByName(districts, districtKeys, query);
  if (options.governorate === undefined) return found;
  const id = getGovernorate(options.governorate)?.id;
  return found.filter((d) => d.governorateId === id);
}

/** The districts of a governorate, found by any query `getGovernorate` accepts */
export function getDistrictsByGovernorate(governorate: string): District[] {
  const id = getGovernorate(governorate)?.id;
  return districts.filter((d) => d.governorateId === id);
}

const RAD = Math.PI / 180;

// Distance in km between two points along the Earth's surface (haversine)
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const a =
    Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(((lng2 - lng1) * RAD) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

/**
 * The district whose center is closest to a point, such as the location a
 * phone reports. It's the closest center, not the district the point is in,
 * so it can be wrong near a border. Pass `maxDistance` in km to get undefined
 * for a point farther than that from every center, such as one outside Iraq.
 */
export function getNearestDistrict(lat: number, lng: number, options: { maxDistance?: number } = {}): District | undefined {
  if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) throw new RangeError(`Not a location: ${lat}, ${lng}`);
  let nearest: District | undefined;
  let min = options.maxDistance ?? Infinity;
  for (const d of districts) {
    const km = distanceKm(lat, lng, d.center.lat, d.center.lng);
    if (km < min) {
      nearest = d;
      min = km;
    }
  }
  return nearest;
}

/**
 * The governorate of the nearest district (see `getNearestDistrict`), which
 * is closer to the truth than the nearest capital, as governorates like Anbar
 * are far bigger than others.
 */
export function getNearestGovernorate(lat: number, lng: number, options: { maxDistance?: number } = {}): Governorate | undefined {
  const id = getNearestDistrict(lat, lng, options)?.governorateId;
  return governorates.find((g) => g.id === id);
}

export { parseMobile, isValidMobile, carriers } from "./phone";
export type { Carrier, CarrierNames, MobileNumber } from "./phone";
export { toLatinDigits, toArabicDigits, formatIQD } from "./format";
