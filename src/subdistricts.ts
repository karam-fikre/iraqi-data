import subdistrictsList from "./subdistricts.json";
import { getDistrict, getGovernorate } from "./index";
import type { Town } from "./index";
import { distanceKm, findByName, namesOf, searchByName } from "./lookup";

export interface Subdistrict {
  /** Stable id to store in a database, such as "bashiqa" or "mosulcenter" */
  readonly id: string;
  /** Id of the district it's in, such as "mosul" */
  readonly districtId: string;
  /** Id of the governorate it's in, such as "nineveh" */
  readonly governorateId: string;
  /** OCHA P-code, or null for one that OCHA's 2019 data doesn't list */
  readonly pcode: string | null;
  readonly ar: string;
  readonly en: string;
  /** Kurdish (Sorani) */
  readonly ku: string;
  /** Whether this is the area around the district's own seat (مركز القضاء) rather than a ناحية */
  readonly isCenter: boolean;
  /** Its town, or the middle of its area, with latitude and longitude. Null if no reliable location is known. */
  readonly center: Town | null;
  /** Other spellings people use, and other names: Ashnouna for Buhriz */
  readonly aliases: readonly string[];
}

const freezeSubdistrict = (s: Subdistrict): Subdistrict =>
  Object.freeze({ ...s, center: s.center && Object.freeze({ ...s.center }), aliases: Object.freeze([...s.aliases]) });

/** All sub-districts, in the same order as `districts`, each district's center first */
export const subdistricts: readonly Subdistrict[] = Object.freeze((subdistrictsList as Subdistrict[]).map(freezeSubdistrict));

const subdistrictKeys = subdistricts.map(namesOf);

const inDistrict = (district: string) => {
  const id = getDistrict(district)?.id;
  return (s: Subdistrict) => s.districtId === id;
};

/**
 * Finds a sub-district by its id, P-code, or name in any language, ignoring
 * spelling differences. Some names are used in more than one district, such as
 * السلام, so pass a district (any query `getDistrict` accepts) to pick one.
 */
export function getSubdistrict(query: string, options: { district?: string } = {}): Subdistrict | undefined {
  const pcode = query.trim().toUpperCase();
  const byPcode = subdistricts.find((s) => s.pcode === pcode);
  if (byPcode) return byPcode;
  if (options.district === undefined) return findByName(subdistricts, subdistrictKeys, query);
  const matches = inDistrict(options.district);
  return findByName(subdistricts, subdistrictKeys.map((k, i) => (matches(subdistricts[i]) ? k : [])), query);
}

/**
 * Finds every sub-district whose name contains the query, for autocomplete.
 * Exact matches come first, then names that start with the query. Pass a
 * district or a governorate to search only inside it.
 */
export function searchSubdistricts(query: string, options: { district?: string; governorate?: string } = {}): Subdistrict[] {
  let found = searchByName(subdistricts, subdistrictKeys, query);
  if (options.district !== undefined) found = found.filter(inDistrict(options.district));
  if (options.governorate !== undefined) {
    const id = getGovernorate(options.governorate)?.id;
    found = found.filter((s) => s.governorateId === id);
  }
  return found;
}

/** The sub-districts of a district, found by any query `getDistrict` accepts */
export function getSubdistrictsByDistrict(district: string): Subdistrict[] {
  return subdistricts.filter(inDistrict(district));
}

/**
 * The sub-district whose center is closest to a point, skipping those with no
 * known location. It's the closest center, not the sub-district the point is
 * in, so it can be wrong near a border. Pass `maxDistance` in km to get
 * undefined for a point farther than that from every center.
 */
export function getNearestSubdistrict(lat: number, lng: number, options: { maxDistance?: number } = {}): Subdistrict | undefined {
  if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) throw new RangeError(`Not a location: ${lat}, ${lng}`);
  let nearest: Subdistrict | undefined;
  let min = options.maxDistance ?? Infinity;
  for (const s of subdistricts) {
    if (!s.center) continue;
    const km = distanceKm(lat, lng, s.center.lat, s.center.lng);
    if (km < min) {
      nearest = s;
      min = km;
    }
  }
  return nearest;
}
