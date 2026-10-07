/**
 * Language model.
 *
 * Language is a first-class domain concept in Soro: the surface language
 * (Yoruba, Nigerian Pidgin, English) changes, but the underlying banking
 * intent does not. Every structured intent MUST carry an explicit language.
 *
 * Codes follow BCP-47-ish conventions used across the project:
 *   yo  = Yoruba
 *   pcm = Nigerian Pidgin
 *   en  = English (fallback)
 */
export const LANGUAGE_CODES = ['yo', 'pcm', 'en'] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  yo: 'Yoruba',
  pcm: 'Nigerian Pidgin',
  en: 'English',
};

export function isLanguageCode(value: unknown): value is LanguageCode {
  return (
    typeof value === 'string' &&
    (LANGUAGE_CODES as readonly string[]).includes(value)
  );
}

/** Fallback language when detection fails or is unavailable. */
export function defaultLanguage(): LanguageCode {
  return 'en';
}
