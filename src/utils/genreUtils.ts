import { GenreFilter } from '../types/game';

/**
 * Melodex Canonical Genre Taxonomy:
 * Valid single genres: 'pop' | 'hiphop' | 'rock' | 'rnb' | 'electronic' | 'latin' | 'indie' | 'metal' | 'dance'
 */
export const CANONICAL_GENRES: GenreFilter[] = [
  'pop',
  'hiphop',
  'rock',
  'rnb',
  'electronic',
  'latin',
  'indie',
  'metal',
  'dance',
];

/**
 * Computes canonical Melodex normalized genres from raw provider genre strings and track title/album context.
 * FAIL-CLOSED: If no known genre matches, returns an empty array [] so the song only appears in 'all'.
 */
export function computeNormalizedGenres(
  rawGenre?: string,
  _artist = '',
  _title = '',
  _album = ''
): GenreFilter[] {
  if (!rawGenre || typeof rawGenre !== 'string') return [];

  const g = rawGenre.toLowerCase().trim();
  const set = new Set<GenreFilter>();

  // 1. Hip-Hop / Rap
  if (
    g.includes('hip-hop') ||
    g.includes('rap') ||
    g.includes('trap') ||
    g.includes('drill') ||
    g.includes('boom bap') ||
    g.includes('cloud rap') ||
    g.includes('gangsta')
  ) {
    set.add('hiphop');
    if (g.includes('pop rap') || g.includes('dance')) {
      set.add('pop');
    }
  }

  // 2. Pop
  if (
    g.includes('pop') ||
    g.includes('teen pop') ||
    g.includes('dance-pop') ||
    g.includes('dance pop') ||
    g.includes('synthpop') ||
    g.includes('synth-pop') ||
    g.includes('electropop') ||
    g.includes('k-pop') ||
    g.includes('adult contemporary') ||
    g.includes('chanson') ||
    g.includes('vocal')
  ) {
    set.add('pop');
  }

  // 3. Rock
  if (
    g.includes('rock') ||
    g.includes('grunge') ||
    g.includes('punk') ||
    g.includes('pop punk') ||
    g.includes('post-punk') ||
    g.includes('psychedelic') ||
    g.includes('garage') ||
    g.includes('glam') ||
    g.includes('southern rock') ||
    g.includes('arena rock')
  ) {
    set.add('rock');
  }

  // 4. Metal
  if (
    g.includes('metal') ||
    g.includes('heavy metal') ||
    g.includes('nu metal') ||
    g.includes('metalcore') ||
    g.includes('death metal') ||
    g.includes('thrash metal') ||
    g.includes('hard rock') ||
    g.includes('power metal') ||
    g.includes('black metal') ||
    g.includes('doom metal')
  ) {
    set.add('metal');
    if (g.includes('hard rock') || g.includes('nu metal') || g.includes('metalcore')) {
      set.add('rock');
    }
  }

  // 5. R&B / Soul
  if (
    g.includes('r&b') ||
    g.includes('soul') ||
    g.includes('funk') ||
    g.includes('motown') ||
    g.includes('neo-soul') ||
    g.includes('quiet storm') ||
    g.includes('doo wop') ||
    g.includes('contemporary r&b')
  ) {
    set.add('rnb');
  }

  // 6. Dance / Electronic
  if (
    g.includes('dance') ||
    g.includes('electronic') ||
    g.includes('house') ||
    g.includes('techno') ||
    g.includes('trance') ||
    g.includes('edm') ||
    g.includes('club') ||
    g.includes('eurodance') ||
    g.includes('electro') ||
    g.includes('dubstep') ||
    g.includes('drum and bass') ||
    g.includes('drum & bass') ||
    g.includes('electronica') ||
    g.includes('synthwave') ||
    g.includes('disco')
  ) {
    set.add('electronic');
    set.add('dance');
    if (g.includes('dance pop') || g.includes('disco') || g.includes('electropop')) {
      set.add('pop');
    }
  }

  // 7. Latin
  if (
    g.includes('latin') ||
    g.includes('urbano') ||
    g.includes('reggaeton') ||
    g.includes('bachata') ||
    g.includes('salsa') ||
    g.includes('cumbia') ||
    g.includes('mexicana') ||
    g.includes('mexican') ||
    g.includes('corridos') ||
    g.includes('ranchera') ||
    g.includes('tropical') ||
    g.includes('merengue') ||
    g.includes('tango') ||
    g.includes('bossa nova') ||
    g.includes('samba')
  ) {
    set.add('latin');
    if (g.includes('pop latino') || g.includes('latin pop')) {
      set.add('pop');
    }
    if (g.includes('urbano') || g.includes('reggaeton') || g.includes('trap latino')) {
      set.add('hiphop');
    }
  }

  // 8. Indie / Alternative
  if (
    g.includes('indie') ||
    g.includes('alternative') ||
    g.includes('singer/songwriter') ||
    g.includes('singer-songwriter') ||
    g.includes('folk') ||
    g.includes('contemporary folk') ||
    g.includes('indie pop') ||
    g.includes('indie rock') ||
    g.includes('shoegaze') ||
    g.includes('dream pop') ||
    g.includes('bedroom pop') ||
    g.includes('lo-fi') ||
    g.includes('americana')
  ) {
    set.add('indie');
    if (g.includes('alternative') || g.includes('indie rock') || g.includes('folk rock')) {
      set.add('rock');
    }
    if (g.includes('indie pop') || g.includes('dream pop') || g.includes('bedroom pop')) {
      set.add('pop');
    }
  }

  // 9. Country / Americana
  if (g.includes('country') || g.includes('bluegrass')) {
    set.add('pop'); // Country pop crossover in Melodex
  }

  // 10. Soundtracks & Musicals
  if (g.includes('soundtrack') || g.includes('musical') || g.includes('score')) {
    set.add('pop');
  }

  return Array.from(set);
}

/**
 * Strict song-level genre matching.
 * FAIL-CLOSED: A song matches a single genre filter if and only if its normalizedGenres contains that genre.
 * NEVER uses broad artist genre inference at round time.
 */
export function matchSongToSingleGenre(
  songNormalizedGenres: GenreFilter[] | undefined,
  genre: GenreFilter
): boolean {
  if (genre === 'all') return true;
  if (!songNormalizedGenres || !Array.isArray(songNormalizedGenres) || songNormalizedGenres.length === 0) {
    return false; // Fail closed: unclassified tracks never leak into specific genres
  }
  return songNormalizedGenres.includes(genre);
}

/**
 * Strict multi-genre matching (OR logic).
 * A song matches if ANY selected genre is in its normalizedGenres.
 */
export function matchSongToSelectedGenres(
  songNormalizedGenres: GenreFilter[] | undefined,
  selectedGenres: GenreFilter[]
): boolean {
  if (!selectedGenres || selectedGenres.length === 0 || selectedGenres.includes('all')) {
    return true;
  }
  if (!songNormalizedGenres || !Array.isArray(songNormalizedGenres) || songNormalizedGenres.length === 0) {
    return false;
  }
  return selectedGenres.some((g) => songNormalizedGenres.includes(g));
}
