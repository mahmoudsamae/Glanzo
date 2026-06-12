import {
  SHOP_SLUG_MAX_LENGTH,
  SHOP_SLUG_MIN_LENGTH,
  SHOP_SLUG_REGEX,
} from "@/lib/validations/shop";

const TRANSLITERATION_MAP: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
  Ä: "ae",
  Ö: "oe",
  Ü: "ue",
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  á: "a",
  à: "a",
  â: "a",
  ã: "a",
  å: "a",
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  í: "i",
  ì: "i",
  î: "i",
  ï: "i",
  ó: "o",
  ò: "o",
  ô: "o",
  õ: "o",
  ú: "u",
  ù: "u",
  û: "u",
  ñ: "n",
  ø: "o",
  æ: "ae",
  // Common Arabic letters (simplified transliteration)
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ى: "a",
  ة: "h",
  ء: "",
  ئ: "y",
  ؤ: "w",
};

function transliterate(input: string): string {
  let output = "";
  for (const char of input) {
    output += TRANSLITERATION_MAP[char] ?? char;
  }
  return output;
}

/**
 * Suggest a URL slug from a shop display name.
 * Lowercase, transliterate umlauts/Turkish/Arabic, collapse dashes.
 */
export function slugify(name: string): string {
  const mapped = transliterate(name);
  const normalized = mapped
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized) {
    return "";
  }

  if (normalized.length < SHOP_SLUG_MIN_LENGTH) {
    return normalized.padEnd(SHOP_SLUG_MIN_LENGTH, "0");
  }

  if (normalized.length > SHOP_SLUG_MAX_LENGTH) {
    return normalized.slice(0, SHOP_SLUG_MAX_LENGTH).replace(/-+$/g, "");
  }

  if (!SHOP_SLUG_REGEX.test(normalized)) {
    return normalized.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
  }

  return normalized;
}
