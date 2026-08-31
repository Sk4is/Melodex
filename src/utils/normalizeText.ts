/**
 * Normalizes text for search matching:
 * - Case-insensitive
 * - Accent-insensitive (e.g., Beyoncé -> beyonce)
 * - Whitespace-tolerant (trims and collapses multiple spaces)
 * - Removes non-alphanumeric noise characters for resilient matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics/accents
    .replace(/[^\w\s]/g, ' ') // replace punctuation/symbols with space
    .replace(/\s+/g, ' ') // collapse multi-whitespace
    .trim();
}

/**
 * Checks if query terms match in target text (title or artist).
 * Supports fuzzy token matching (every search word must be in the target string).
 */
export function fuzzyMatchSong(title: string, artist: string, query: string): boolean {
  const normQuery = normalizeText(query);
  if (!normQuery) return true;

  const normCombined = normalizeText(`${title} ${artist}`);
  const queryTokens = normQuery.split(' ').filter(Boolean);

  return queryTokens.every(token => normCombined.includes(token));
}
