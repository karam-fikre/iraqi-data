// The digits of Arabic and Kurdish (٠-٩), and the other form of them (۰-۹)
// that some keyboards type. Both sets start at a multiple of 16 (U+0660,
// U+06F0), so code % 16 is the digit.
const EASTERN_DIGITS = /[٠-٩۰-۹]/g;
const LATIN_DIGITS = /[0-9]/g;
// The Arabic decimal point and thousands separator, which only appear in numbers
const SEPARATORS: Record<string, string> = { "٫": ".", "٬": "," };

/**
 * Turns Arabic and Kurdish digits (٠-٩, or ۰-۹) into 0-9, and the Arabic
 * decimal point and thousands separator into "." and ",". The rest of
 * the text is kept: "٠٧٧٠ ١٢٣" → "0770 123", "١٢٫٥" → "12.5".
 */
export function toLatinDigits(text: string): string {
  return text
    .replace(EASTERN_DIGITS, (d) => String(d.charCodeAt(0) % 16))
    .replace(/[٫٬]/g, (c) => SEPARATORS[c]);
}

/** Turns 0-9 into the digits used in Arabic and Kurdish text: "0770" → "٠٧٧٠" */
export function toArabicDigits(text: string): string {
  return text.replace(LATIN_DIGITS, (d) => String.fromCharCode(0x660 + Number(d)));
}

// Arabic and Kurdish write the dinar the same way
const CURRENCY = { ar: "د.ع", ku: "د.ع", en: "IQD" };

/**
 * Formats an amount of Iraqi dinars the way prices are written in Iraq,
 * rounded to whole dinars: 25000 → "25,000 IQD", or "25,000 د.ع" in Arabic
 * and Kurdish.
 */
export function formatIQD(amount: number, options: { lang?: "ar" | "ku" | "en" } = {}): string {
  if (!Number.isFinite(amount)) throw new RangeError(`Not an amount: ${amount}`);
  const dinars = Math.round(amount);
  const grouped = String(Math.abs(dinars)).replace(/\B(?=(\d{3})+$)/g, ",");
  return `${dinars < 0 ? "-" : ""}${grouped} ${CURRENCY[options.lang ?? "en"]}`;
}
