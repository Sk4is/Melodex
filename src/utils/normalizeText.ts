/**
 * Normalizes text for search matching:
 * - Case-insensitive
 * - Accent-insensitive (e.g., Beyoncé -> beyonce)
 * - Whitespace-tolerant (trims and collapses multiple spaces)
 * - Replaces punctuation/symbols with space
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
 * Strips all non-alphanumeric characters completely (e.g. "P!nk" -> "pink", "Ke$ha" -> "kesha", "Jay-Z" -> "jayz")
 */
export function squashSymbols(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Splits complex multi-artist credits into individual artist names
 * e.g., "Pitbull feat. Ke$ha" -> ["Pitbull", "Ke$ha"]
 * e.g., "David Guetta & Sia" -> ["David Guetta", "Sia"]
 */
export function extractArtistCredits(artistString: string): string[] {
  if (!artistString) return [];
  const parts = artistString.split(/(?:feat\.|ft\.|featuring|with|&|\band\b|\bx\b|\+|\/|,)/i);
  return parts.map(p => p.trim()).filter(Boolean);
}

/**
 * Extracts the primary artist from a potentially complex artist credit string
 */
export function extractPrimaryArtist(artistString: string): string {
  if (!artistString) return '';
  const credits = extractArtistCredits(artistString);
  return credits[0] || artistString.trim();
}

/**
 * Generates an expanded searchable corpus string for a song
 */
export function generateSearchCorpus(title: string, artist: string): string {
  const normTitle = normalizeText(title);
  const normArtist = normalizeText(artist);
  const squashedTitle = squashSymbols(title);
  const squashedArtist = squashSymbols(artist);
  
  const individualArtists = extractArtistCredits(artist)
    .map(a => `${normalizeText(a)} ${squashSymbols(a)}`)
    .join(' ');

  // Handle common aliases/substitutions
  let aliases = '';
  if (normArtist.includes('pink') || squashedArtist.includes('pnk')) aliases += ' p!nk pink';
  if (normArtist.includes('kesha') || squashedArtist.includes('keha')) aliases += ' ke$ha kesha';
  if (normArtist.includes('asap') || squashedArtist.includes('aap')) aliases += ' a$ap asap';
  if (normArtist.includes('nsync')) aliases += ' *nsync nsync n sync';
  if (normArtist.includes('jay z') || squashedArtist.includes('jayz')) aliases += ' jay-z jayz jay z';
  if (normArtist.includes('blink 182') || squashedArtist.includes('blink182')) aliases += ' blink-182 blink182 blink 182';
  if (normArtist.includes('pitbull') || normTitle.includes('pitbull')) aliases += ' pitbull mr worldwide';
  if (normArtist.includes('youngboy') || normArtist.includes('nba')) aliases += ' nba youngboy youngboy never broke again nba youngboy';
  if (normTitle.includes('500lbs') || normTitle.includes('500 lbs')) aliases += ' 500lbs 500 lbs 500';
  if (normTitle.includes('did it again') || normTitle.includes('do it again')) aliases += ' did it again do it again';
  if (normTitle.includes('when i was yung') || normTitle.includes('when i was young')) aliases += ' when i was yung when i was young';
  if (normTitle.includes('i know you') || normTitle.includes('i know u')) aliases += ' i know you i know u';
  if (normArtist.includes('famous dex') || normArtist.includes('dexter')) aliases += ' famous dex dexter';

  return `${normTitle} ${squashedTitle} ${normArtist} ${squashedArtist} ${individualArtists} ${aliases}`.toLowerCase();
}

/**
 * Checks if query terms match in target text (title or artist).
 * Supports fuzzy token matching (every search word must be in the search corpus).
 */
export function fuzzyMatchSong(title: string, artist: string, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const corpus = generateSearchCorpus(title, artist);
  const squashedQuery = squashSymbols(trimmed);
  
  // Direct squashed query match (e.g. "pitbull", "pink", "kesha")
  if (squashedQuery.length >= 3 && corpus.includes(squashedQuery)) {
    return true;
  }

  // Token-by-token normalized check
  const normQuery = normalizeText(trimmed);
  const queryTokens = normQuery.split(' ').filter(Boolean);

  return queryTokens.every(token => {
    const squashedToken = squashSymbols(token);
    return corpus.includes(token) || (squashedToken.length >= 2 && corpus.includes(squashedToken));
  });
}

/**
 * Normalizes artist name for strict identity comparison:
 * - Trims whitespace and converts to lower case
 * - Removes accents / diacritics
 * - Removes common English prefix "the " if present
 * - Strips punctuation/symbols
 */
export function normalizeArtistIdentity(artist: string): string {
  if (!artist) return '';
  const norm = normalizeText(artist);
  const withoutThe = norm.startsWith('the ') && norm.length > 4 ? norm.slice(4).trim() : norm;
  return squashSymbols(withoutThe);
}

/**
 * Checks if two artist strings match or share a primary/featured artist.
 * Handles:
 * - "Post Malone" vs "Post Malone"
 * - "Post Malone feat. 21 Savage" vs "Post Malone"
 * - "P!nk" vs "Pink", "Ke$ha" vs "Kesha", "JAY-Z" vs "Jay Z"
 * - "David Guetta & Sia" vs "Sia"
 * - "The Weeknd" vs "Weeknd"
 * - "Beyoncé" vs "Beyonce"
 */
export function isMatchingArtist(artistA: string, artistB: string): boolean {
  if (!artistA || !artistB) return false;

  const idA = normalizeArtistIdentity(artistA);
  const idB = normalizeArtistIdentity(artistB);

  // Exact whole-string identity match
  if (idA && idB && idA === idB) {
    return true;
  }

  // Extract separate credited artists from both strings
  const creditsA = extractArtistCredits(artistA).map(normalizeArtistIdentity).filter(c => c.length >= 2);
  const creditsB = extractArtistCredits(artistB).map(normalizeArtistIdentity).filter(c => c.length >= 2);

  // Check direct credit matching
  for (const a of creditsA) {
    for (const b of creditsB) {
      if (a === b) return true;
    }
  }

  // Also check if one full artist identity is contained as one of the credits
  if (idA.length >= 3 && creditsB.some(b => b === idA)) return true;
  if (idB.length >= 3 && creditsA.some(a => a === idB)) return true;

  return false;
}

