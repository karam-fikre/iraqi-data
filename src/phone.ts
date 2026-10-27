import { toLatinDigits } from "./format";

/** The three national mobile networks */
export type Carrier = "asiacell" | "zain" | "korek";

export interface MobileNumber {
  /** International format with no spaces, to store in a database: "+9647701234567" */
  readonly e164: string;
  /** As it's written in Iraq: "0770 123 4567" */
  readonly local: string;
  /** For people calling from abroad: "+964 770 123 4567" */
  readonly international: string;
  /**
   * The network the number's prefix belongs to, or null for one of the
   * smaller networks (074x, 076x…)
   */
  readonly carrier: Carrier | null;
}

export interface CarrierNames {
  readonly ar: string;
  readonly en: string;
  /** Kurdish (Sorani) */
  readonly ku: string;
}

/** The name of each carrier, to show it: carriers[number.carrier].ku */
export const carriers: Readonly<Record<Carrier, CarrierNames>> = Object.freeze({
  asiacell: Object.freeze({ ar: "آسياسيل", en: "Asiacell", ku: "ئاسیاسێڵ" }),
  zain: Object.freeze({ ar: "زين", en: "Zain", ku: "زین" }),
  korek: Object.freeze({ ar: "كورك", en: "Korek", ku: "کورەک" }),
});

// From the second and third digits of the number without the 0: 770… → "77"
const CARRIERS: Record<string, Carrier> = { "75": "korek", "77": "asiacell", "78": "zain", "79": "zain" };

// Spaces, dashes, dots and brackets, and the invisible direction marks that
// come along when a number is copied from Arabic text
const SEPARATORS = /[\s\-.()\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
// 0770…, 770…, +964 770…, 00964 770…, 964 770…, and +964 0770…, which people
// often write
const MOBILE = /^(?:\+964|00964|964)?0?(7[3-9]\d{8})$/;

/**
 * Reads an Iraqi mobile number written in any of the usual ways, and returns
 * it in standard formats with its carrier. Returns undefined for anything
 * that isn't an Iraqi mobile number, landlines included.
 */
export function parseMobile(input: string): MobileNumber | undefined {
  const digits = toLatinDigits(input).replace(SEPARATORS, "");
  const match = MOBILE.exec(digits);
  if (!match) return undefined;
  const n = match[1];
  return {
    e164: `+964${n}`,
    local: `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`,
    international: `+964 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`,
    carrier: CARRIERS[n.slice(0, 2)] ?? null,
  };
}

/** Whether the input is an Iraqi mobile number, written in any way `parseMobile` accepts */
export function isValidMobile(input: string): boolean {
  return parseMobile(input) !== undefined;
}
