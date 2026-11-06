const PRONUNCIATIONS = new Map([
  ["آبمیوه", "آبِ میوه"],
  ["دستکش", "دَست‌کِش"],
  ["مدرسه", "مَدْرَسِه"],
  ["پرنده", "پَرَندِه"],
]);

export function normalizePersianText(text) {
  return text
    .normalize("NFKC")
    .replace(/[يى]/gu, "ی")
    .replace(/ك/gu, "ک")
    .replace(/ـ/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function pronunciationKey(word) {
  return normalizePersianText(word)
    .replace(/[\u064B-\u065F\u0670]/gu, "")
    .replace(/[\s-]/gu, "")
    .replace(/\u200c|\u200d/gu, "");
}

const pronunciationEntries = new Map(
  [...PRONUNCIATIONS].map(([word, pronunciation]) => [
    pronunciationKey(word),
    pronunciation,
  ]),
);

export function getPersianSpeechText(text) {
  return normalizePersianText(text).replace(
    /[\p{L}\p{M}\u{200C}\u{200D}]+/gu,
    (word) => pronunciationEntries.get(pronunciationKey(word)) ?? word,
  );
}
